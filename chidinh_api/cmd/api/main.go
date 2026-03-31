package main

import (
	"log"

	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/app"
	"github.com/PHAMCHIDINH/forme/chidinh_api/internal/platform/config"
)

func main() {
	cfg := config.Load()
	if err := app.Run(cfg); err != nil {
		log.Fatal(err)
	}
}
