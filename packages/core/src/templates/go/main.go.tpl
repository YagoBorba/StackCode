package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

// HealthResponse represents the health check response
type HealthResponse struct {
	Status  string `json:"status"`
	Service string `json:"service"`
	Version string `json:"version"`
}

// WelcomeResponse represents the welcome message response
type WelcomeResponse struct {
	Message string `json:"message"`
	Status  string `json:"status"`
	Version string `json:"version"`
}

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Set Gin mode
	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.DebugMode)
	}

	// Create Gin router
	r := gin.Default()

	// Add middleware
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	// Routes
	r.GET("/", handleWelcome)
	r.GET("/health", handleHealth)

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting {{projectName}} server on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

// handleWelcome handles the root endpoint
func handleWelcome(c *gin.Context) {
	response := WelcomeResponse{
		Message: "Welcome to {{projectName}}!",
		Status:  "running",
		Version: "1.0.0",
	}
	c.JSON(http.StatusOK, response)
}

// handleHealth handles the health check endpoint
func handleHealth(c *gin.Context) {
	response := HealthResponse{
		Status:  "healthy",
		Service: "{{projectName}}",
		Version: "1.0.0",
	}
	c.JSON(http.StatusOK, response)
}
