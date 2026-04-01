package auth

import (
	"context"
	"errors"
	"fmt"
	"time"

	db "github.com/PHAMCHIDINH/forme/chidinh_api/db/sqlc"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5"
	"golang.org/x/crypto/bcrypt"

	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/config"
)

var ErrInvalidCredentials = errors.New("invalid credentials")
var ErrOwnerNotFound = errors.New("owner not found")

type OwnerStore interface {
	GetOwnerByUsername(ctx context.Context, username string) (db.Owner, error)
	GetOwnerByID(ctx context.Context, id string) (db.Owner, error)
}

type Service struct {
	cfg    config.Config
	owners OwnerStore
}

func NewService(cfg config.Config, owners OwnerStore) *Service {
	return &Service{
		cfg:    cfg,
		owners: owners,
	}
}

func (s *Service) Login(ctx context.Context, username string, password string) (LoginResult, error) {
	owner, err := s.owners.GetOwnerByUsername(ctx, username)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return LoginResult{}, ErrInvalidCredentials
		}
		return LoginResult{}, fmt.Errorf("failed to load owner by username: %w", err)
	}

	if err := bcrypt.CompareHashAndPassword([]byte(owner.PasswordHash), []byte(password)); err != nil {
		return LoginResult{}, ErrInvalidCredentials
	}

	now := time.Now()
	claims := Claims{
		Username: owner.Username,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   owner.ID,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(24 * time.Hour)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte(s.cfg.JWTSecret))
	if err != nil {
		return LoginResult{}, fmt.Errorf("failed to sign token: %w", err)
	}

	return LoginResult{
		Token: signedToken,
		User:  mapOwner(owner),
	}, nil
}

func (s *Service) ParseToken(tokenString string) (*Claims, error) {
	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return []byte(s.cfg.JWTSecret), nil
	})
	if err != nil {
		return nil, err
	}
	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	return claims, nil
}

func (s *Service) CurrentUser(ctx context.Context, ownerID string) (UserResponse, error) {
	owner, err := s.owners.GetOwnerByID(ctx, ownerID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return UserResponse{}, ErrOwnerNotFound
		}
		return UserResponse{}, fmt.Errorf("failed to load owner by id: %w", err)
	}

	return mapOwner(owner), nil
}

func mapOwner(owner db.Owner) UserResponse {
	return UserResponse{
		ID:          owner.ID,
		Username:    owner.Username,
		DisplayName: owner.DisplayName,
	}
}
