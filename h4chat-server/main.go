package main

import (
	"log"

	"h4chat-server/ws"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

func main() {
	app := fiber.New()

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("H4Chat Backend Running")
	})

	app.Get("/ws", websocket.New(ws.HandleWebSocket))

	log.Fatal(app.Listen(":5000"))
}