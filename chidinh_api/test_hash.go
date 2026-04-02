package main

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	hash := "$2b$12$Ql1OEDm9gTzCvIPdp2AvJ.8zYe6c7kwEZKtbG8ybULk8OyLT5DCWC"
	passwords := []string{"password", "admin", "owner", "123456", "admin123", "change-me", "changeme", "postgres"}
	for _, p := range passwords {
		err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(p))
		if err == nil {
			fmt.Printf("MATCH: %s\n", p)
			return
		}
	}
	fmt.Println("No match found")
}
