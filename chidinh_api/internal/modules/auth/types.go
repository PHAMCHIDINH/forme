package auth

import (
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

const CookieName = "pdh_auth"

type Claims struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}

type LoginRequest struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

func (r *LoginRequest) Normalize() {
	r.Username = strings.TrimSpace(r.Username)
	r.Password = strings.TrimSpace(r.Password)
}

type LoginResult struct {
	Token string
	User  UserResponse
}

type UserResponse struct {
	ID          string `json:"id"`
	Username    string `json:"username"`
	DisplayName string `json:"displayName"`
}
