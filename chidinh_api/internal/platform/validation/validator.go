package validation

import (
	"errors"
	"reflect"
	"strings"

	"github.com/go-playground/validator/v10"
)

type Normalizer interface {
	Normalize()
}

type CustomValidator interface {
	ValidateFields(report func(field string, tag string))
}

type FieldError struct {
	Field string
	Tag   string
}

type Errors []FieldError

func (errs Errors) Has(field string, tag string) bool {
	for _, err := range errs {
		if err.Field == field && err.Tag == tag {
			return true
		}
	}

	return false
}

type Validator struct {
	validate *validator.Validate
}

func New() *Validator {
	validate := validator.New()
	validate.RegisterTagNameFunc(jsonFieldName)
	_ = validate.RegisterValidation("notblank", validateNotBlank)

	return &Validator{validate: validate}
}

func (v *Validator) Validate(value any) Errors {
	if normalizer, ok := value.(Normalizer); ok {
		normalizer.Normalize()
	}

	err := v.validate.Struct(value)
	if err == nil {
		var errs Errors
		appendCustomValidationErrors(value, &errs)
		if len(errs) == 0 {
			return nil
		}

		return errs
	}

	var invalidValidationErr *validator.InvalidValidationError
	if errors.As(err, &invalidValidationErr) {
		return Errors{{Field: "request", Tag: "invalid"}}
	}

	validationErrs, ok := err.(validator.ValidationErrors)
	if !ok {
		errs := Errors{{Field: "request", Tag: "invalid"}}
		appendCustomValidationErrors(value, &errs)
		return errs
	}

	errs := make(Errors, 0, len(validationErrs))
	for _, validationErr := range validationErrs {
		field := validationErr.Field()
		if field == "" {
			field = strings.ToLower(validationErr.StructField())
		}
		errs = append(errs, FieldError{
			Field: field,
			Tag:   validationErr.Tag(),
		})
	}
	appendCustomValidationErrors(value, &errs)

	return errs
}

func jsonFieldName(field reflect.StructField) string {
	name := strings.Split(field.Tag.Get("json"), ",")[0]
	if name == "" || name == "-" {
		return field.Name
	}

	return name
}

func validateNotBlank(fl validator.FieldLevel) bool {
	field := fl.Field()
	if field.Kind() == reflect.Pointer {
		if field.IsNil() {
			return true
		}
		field = field.Elem()
	}

	if field.Kind() != reflect.String {
		return false
	}

	return strings.TrimSpace(field.String()) != ""
}

func appendCustomValidationErrors(value any, errs *Errors) {
	customValidator, ok := value.(CustomValidator)
	if !ok {
		return
	}

	customValidator.ValidateFields(func(field string, tag string) {
		*errs = append(*errs, FieldError{
			Field: field,
			Tag:   tag,
		})
	})
}
