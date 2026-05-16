package ws

import (
	"log"

	"github.com/gofiber/websocket/v2"
)

type Client struct {
	Conn *websocket.Conn
	Room string
}

var rooms = make(map[string][]*Client)

func HandleWebSocket(c *websocket.Conn) {
	roomID := c.Query("room")

	client := &Client{
		Conn: c,
		Room: roomID,
	}

	rooms[roomID] = append(
		rooms[roomID],
		client,
	)

	defer func() {
		var updatedClients []*Client

		for _, cl := range rooms[roomID] {
			if cl.Conn != c {
				updatedClients = append(
					updatedClients,
					cl,
				)
			}
		}

		rooms[roomID] = updatedClients

		if len(rooms[roomID]) == 0 {
			delete(rooms, roomID)
		}

		c.Close()
	}()

	for {
		_, message, err := c.ReadMessage()

		if err != nil {
			log.Println(err)
			break
		}

		for _, client := range rooms[roomID] {
			err := client.Conn.WriteMessage(
				websocket.TextMessage,
				message,
			)

			if err != nil {
				log.Println(err)
			}
		}
	}
}