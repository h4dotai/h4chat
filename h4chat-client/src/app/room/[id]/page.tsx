"use client"

import { useEffect, useRef, useState } from "react"

interface Message {
  type: string
  username: string
  text: string
}

interface RoomPageProps {
  params: Promise<{
    id: string
  }>
}

export default function RoomPage({
  params,
}: RoomPageProps) {
  const [roomId, setRoomId] = useState("")
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    params.then((data) => {
      setRoomId(data.id)

      const socket = new WebSocket(
        `ws://localhost:5000/ws?room=${data.id}`
      )

      socketRef.current = socket

      socket.onmessage = (event) => {
        const parsed = JSON.parse(event.data)

        if (parsed.type === "users") {
          setUsers(parsed.users)
          setMessages(parsed.messages)
        }
      }
    })

    return () => {
      socketRef.current?.close()
    }
  }, [params])

  const sendMessage = () => {
    if (
      socketRef.current &&
      message.trim()
    ) {
      socketRef.current.send(
        JSON.stringify({
          text: message,
        })
      )

      setMessage("")
    }
  }

  const copyInvite = async () => {
    await navigator.clipboard.writeText(
      window.location.href
    )

    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <main className="h-screen bg-black text-white font-mono flex flex-col overflow-hidden">
      <div className="border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-400">
            H4Chat Terminal
          </p>

          <p className="text-xs text-zinc-700 mt-1">
            room/{roomId}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs text-zinc-500">
            online :: {users.length}
          </div>

          <button
            onClick={copyInvite}
            className="border border-zinc-700 px-3 py-1 text-xs hover:bg-zinc-900"
          >
            {copied
              ? "copied"
              : "copy invite"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className="text-sm break-words"
          >
            {msg.type === "system" ? (
              <span className="text-zinc-600">
                [system] {msg.text}
              </span>
            ) : (
              <>
                <span className="text-zinc-500">
                  {msg.username}@h4chat
                </span>

                <span className="text-zinc-700">
                  :~$ 
                </span>

                <span className="text-white">
                  {msg.text}
                </span>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-zinc-800 px-4 py-3 flex items-center gap-3">
        <span className="text-zinc-500">
          h4chat:~$
        </span>

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