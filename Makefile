.PHONY: dev-frontend dev-backend dev dev-both install

# Start both frontend and backend concurrently
dev: dev-both

dev-both:
	@make -j 2 dev-frontend dev-backend

# Start the frontend
dev-frontend:
	@echo "Starting frontend..."
	cd chidinh_client && npm run dev

# Start the backend
dev-backend:
	@echo "Starting backend..."
	cd chidinh_api/cmd/api && GOTMPDIR="$(CURDIR)/.gotmp" go run main.go

# Install dependencies for both (optional helper)
install:
	cd chidinh_client && npm install
	cd chidinh_api && go mod tidy
