package service

import (
	"database/sql"
	"time"

	"github.com/Suthar345Piyush/invoiceflow/internal/database"
	"github.com/Suthar345Piyush/invoiceflow/internal/domain"
	"github.com/Suthar345Piyush/invoiceflow/internal/util"
	"github.com/google/uuid"
)

type UserService struct {
	db *database.DB
}

func NewUserService(db *database.DB) *UserService {
	return &UserService{db: db}
}

func (s *UserService) CreateUser(req *domain.RegisterRequest) (*domain.User, error) {

	var exists bool
	err := s.db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)", req.Email).Scan(&exists)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, domain.ErrUserAlreadyExists
	}

	hashedPassword, err := util.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	user := &domain.User{
		ID:                  uuid.New(),
		Email:               req.Email,
		PasswordHash:        hashedPassword,
		FullName:            req.FullName,
		SubscriptionTier:    "free",
		SubscriptionStatus:  "active",
		MonthlyInvoiceCount: 0,
		MonthlyInvoiceLimit: 5,
		DefaultCurrency:     "INR",
		DefaultPaymentTerms: 30,
		InvoiceNumberPrefix: "INV",
		NextInvoiceNumber:   1,
		EmailVerified:       false,
		IsActive:            true,
		CreatedAt:           time.Now(),
		UpdatedAt:           time.Now(),
		LastLoginAt:         &time.Time{},
	}

	query := `
		INSERT INTO users (
			id, email, password_hash, full_name, subscription_tier, 
			subscription_status, monthly_invoice_count, monthly_invoice_limit,
			default_currency, default_payment_terms, invoice_number_prefix,
			next_invoice_number, email_verified, is_active, created_at, updated_at, last_login_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
	`

	_, err = s.db.Exec(
		query,
		user.ID, user.Email, user.PasswordHash, user.FullName,
		user.SubscriptionTier, user.SubscriptionStatus,
		user.MonthlyInvoiceCount, user.MonthlyInvoiceLimit,
		user.DefaultCurrency, user.DefaultPaymentTerms,
		user.InvoiceNumberPrefix, user.NextInvoiceNumber,
		user.EmailVerified, user.IsActive, user.CreatedAt, user.UpdatedAt, user.LastLoginAt,
	)

	if err != nil {
		return nil, err
	}

	return user, nil
}

func (s *UserService) GetUserByEmail(email string) (*domain.User, error) {
	user := &domain.User{}

	query := `
		SELECT id, email, password_hash, full_name, business_name, business_address,
			business_phone, business_email, tax_id, logo_url, subscription_tier,
			subscription_status, monthly_invoice_count, monthly_invoice_limit,
			default_currency, default_payment_terms, invoice_number_prefix,
			next_invoice_number, email_verified, is_active, created_at, updated_at, last_login_at
		FROM users WHERE email = $1 AND is_active = true
	`

	var lastLoginAt sql.NullTime

	err := s.db.QueryRow(query, email).Scan(
		&user.ID, &user.Email, &user.PasswordHash, &user.FullName,
		&user.BusinessName, &user.BusinessAddress, &user.BusinessPhone,
		&user.BusinessEmail, &user.TaxID, &user.LogoURL,
		&user.SubscriptionTier, &user.SubscriptionStatus,
		&user.MonthlyInvoiceCount, &user.MonthlyInvoiceLimit,
		&user.DefaultCurrency, &user.DefaultPaymentTerms,
		&user.InvoiceNumberPrefix, &user.NextInvoiceNumber,
		&user.EmailVerified, &user.IsActive, &user.CreatedAt,
		&user.UpdatedAt, &lastLoginAt,
	)

	if err == sql.ErrNoRows {
		return nil, domain.ErrUserNotFound
	}
	if err != nil {
		return nil, err
	}

	// Convert sql.NullTime to *time.Time
	if lastLoginAt.Valid {
		user.LastLoginAt = &lastLoginAt.Time
	}

	return user, nil
}

func (s *UserService) GetUserByID(id uuid.UUID) (*domain.User, error) {
	user := &domain.User{}

	query := `
		SELECT id, email, password_hash, full_name, business_name, business_address,
			business_phone, business_email, tax_id, logo_url, subscription_tier,
			subscription_status, monthly_invoice_count, monthly_invoice_limit,
			default_currency, default_payment_terms, invoice_number_prefix,
			next_invoice_number, email_verified, is_active, created_at, updated_at, last_login_at
		FROM users WHERE id = $1 AND is_active = true
	`

	// Use sql.NullTime for nullable fields
	var lastLoginAt sql.NullTime

	err := s.db.QueryRow(query, id).Scan(
		&user.ID, &user.Email, &user.PasswordHash, &user.FullName,
		&user.BusinessName, &user.BusinessAddress, &user.BusinessPhone,
		&user.BusinessEmail, &user.TaxID, &user.LogoURL,
		&user.SubscriptionTier, &user.SubscriptionStatus,
		&user.MonthlyInvoiceCount, &user.MonthlyInvoiceLimit,
		&user.DefaultCurrency, &user.DefaultPaymentTerms,
		&user.InvoiceNumberPrefix, &user.NextInvoiceNumber,
		&user.EmailVerified, &user.IsActive, &user.CreatedAt,
		&user.UpdatedAt, &lastLoginAt,
	)

	if err == sql.ErrNoRows {
		return nil, domain.ErrUserNotFound
	}
	if err != nil {
		return nil, err
	}

	if lastLoginAt.Valid {
		user.LastLoginAt = &lastLoginAt.Time
	}

	return user, nil
}

func (s *UserService) UpdateLastLogin(userID uuid.UUID) error {
	query := `UPDATE users SET last_login_at = $1, updated_at = $2 WHERE id = $3`
	_, err := s.db.Exec(query, time.Now(), time.Now(), userID)
	return err
}
