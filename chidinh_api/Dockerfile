FROM golang:1.25-alpine AS build

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /bin/api ./cmd/api
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /bin/migrate ./cmd/migrate

FROM alpine:3.21

WORKDIR /app
COPY --from=build /bin/api /app/api
COPY --from=build /bin/migrate /app/migrate
COPY --from=build /app/db/migrations /app/db/migrations

ENV PORT=8080
EXPOSE 8080

CMD ["/app/api"]
