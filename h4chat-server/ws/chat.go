package ws

import (
	"encoding/json"
	"log"
	"math/rand"

	"github.com/gofiber/websocket/v2"
)

type Message struct {
	Type     string `json:"type"`
	Username string `json:"username"`
	Text     string `json:"text"`
}

type Client struct {
	Conn     *websocket.Conn
	Username string
	Room     string
}

type Room struct {
	Clients  []*Client
	Messages []Message
}

var rooms = make(map[string]*Room)

var names = []string{
	"ghost",
	"void",
	"cipher",
	"shadow",
	"null",
	"zero",
	"h4x",
}

func randomUsername() string {
	return names[rand.Intn(len(names))] +
		"_" +
		string(rune(rand.Intn(900)+100))
}

func broadcastRoomData(roomID string) {
	room := rooms[roomID]

	var users []string

	for _, client := range room.Clients {
		users = append(users, client.Username)
	}

	payload := map[string]interface{}{
		"type":    "users",
		"users":   users,
		"messages": room.Messages,
	}

	data, _ := json.Marshal(payload)

	for _, client := range room.Clients {
		client.Conn.WriteMessage(
			websocket.TextMessage,
			data,
		)
	}
}

func HandleWebSocket(c *websocket.Conn) {
	roomID := c.Query("room")

	if rooms[roomID] == nil {
		rooms[roomID] = &Room{}
	}

	username := names[rand.Intn(len(names))]

	client := &Client{
		Conn:     c,
		Username: username,
		Room:     roomID,
	}

	rooms[roomID].Clients = append(
		rooms[roomID].Clients,
		client,
	)

	joinMessage := Message{
		Type:     "system",
		Username: "system",
		Text:     username + " joined",
	}

	rooms[roomID].Messages = append(
		rooms[roomID].Messages,
		joinMessage,
	)

	broadcastRoomData(roomID)

	defer func() {
		room := rooms[roomID]

		var updatedClients []*Client

		for _, cl := range room.Clients {
			if cl.Conn != c {
				updatedClients = append(
					updatedClients,
					cl,
				)
			}
		}

		room.Clients = updatedClients

		leaveMessage := Message{
			Type:     "system",
			Username: "system",
			Text:     username + " left",
		}

		room.Messages = append(
			room.Messages,
			leaveMessage,
		)

		if len(room.Clients) == 0 {
			delete(rooms, roomID)
		} else {
			broadcastRoomData(roomID)
		}

		c.Close()
	}()

	for {
		_, messageData, err := c.ReadMessage()

		if err != nil {
			log.Println(err)
			break
		}

		var message Message

		json.Unmarshal(messageData, &message)

		message.Type = "message"
		message.Username = username

		rooms[roomID].Messages = append(
			rooms[roomID].Messages,
			message,
		)

		broadcastRoomData(roomID)
	}
}