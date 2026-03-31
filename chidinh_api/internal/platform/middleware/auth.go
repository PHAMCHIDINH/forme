package middleware

import (
	"context"
	"net/http"

	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/modules/auth"
	apiresponse "github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/api"
)

type contextKey string

const ownerIDContextKey contextKey = "ownerID"

type Auth struct {
	service *auth.Service
}

func NewAuth(service *auth.Service) *Auth {
	return &Auth{service: service}
}

func (a *Auth) Require(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie(auth.CookieName)
		if err != nil {
			apiresponse.WriteError(w, http.StatusUnauthorized, "unauthorized", "authentication required")
			return
		}

		claims, err := a.service.ParseToken(cookie.Value)
		if err != nil {
			apiresponse.WriteError(w, http.StatusUnauthorized, "unauthorized", "invalid authentication token")
			return
		}

		ctx := context.WithValue(r.Context(), ownerIDContextKey, claims.Subject)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func OwnerIDFromContext(ctx context.Context) string {
	value := ctx.Value(ownerIDContextKey)
	ownerID, _ := value.(string)
	return ownerID
}
