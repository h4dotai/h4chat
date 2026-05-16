"use client"

import { useEffect, useRef, useState } from "react"

interface Message {
  username: string
  text: string
}

interface RoomPageProps {
  params: Promise<{
    id: string
  }>
}

const names = [
  "ghost",
  "void",
  "shadow",
  "cipher",
  "null",
  "zero",
  "h4x",
]

export default function RoomPage({
  params,
}: RoomPageProps) {
  const [roomId, setRoomId] = useState("")
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [mounted, setMounted] = useState(false)

  const [username, setUsername] = useState("")

  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    setMounted(true)

    const randomName =
      names[
        Math.floor(Math.random() * names.length)
      ] +
      "_" +
      Math.floor(Math.random() * 999)

    setUsername(randomName)
  }, [])

  useEffect(() => {
    if (!mounted) return

    params.then((data) => {
      setRoomId(data.id)

      const socket = new WebSocket(
        `ws://localhost:5000/ws?room=${data.id}`
      )

      socketRef.current = socket

      socket.onmessage = (event) => {
        const parsed = JSON.parse(event.data)

        setMessages((prev) => [
          ...prev,
          parsed,
        ])
      }
    })

    return () => {
      socketRef.current?.close()
    }
  }, [params, mounted])

  const sendMessage = () => {
    if (
      socketRef.current &&
      message.trim()
    ) {
      const payload = {
        username,
        text: message,
      }

      socketRef.current.send(
        JSON.stringify(payload)
      )

      setMessage("")
    }
  }

  const copyInvite = async () => {
    await navigator.clipboard.writeText(
      window.location.href
    )
  }

  if (!mounted) return null

  return (
    <main className="h-screen bg-black text-white font-mono flex flex-col overflow-hidden">
      <div className="border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-500">
            H4Chat Terminal
          </p>

          <p className="text-xs text-zinc-700 mt-1">
            room/{roomId}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-zinc-500">
            user :: {username}
          </div>

          <button
            onClick={copyInvite}
            className="border border-zinc-700 px-3 py-1 text-xs hover:bg-zinc-900 transition"
          >
            copy invite
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        <div className="text-zinc-600 text-sm">
          Type messages below to communicate securely.
        </div>

        {messages.map((msg, index) => (
          <div
            key={index}
            className="text-sm leading-7 break-words"
          >
            <span className="text-zinc-500">
              {username}@h4chat
            </span>

            <span className="text-zinc-700">
              :~$ 
            </span>

            <span className="text-white">
              {msg.text}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-zinc-800 p-4 flex items-center gap-3">
        <div className="text-zinc-500 whitespace-nowrap text-sm">
          {username}@h4chat:~$
        </div>

        <input
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage()
            }
          }}
          placeholder="enter message"
          className="flex-1 bg-transparent outline-none text-white placeholder:text-zinc-700"
        />
      </div>
    </main>
  )
}