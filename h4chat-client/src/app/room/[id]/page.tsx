"use client"

import CryptoJS from "crypto-js"
import {
  useEffect,
  useRef,
  useState,
} from "react"

interface Message {
  type: string
  username: string
  text: string
  timestamp: string
}

interface RoomPageProps {
  params: Promise<{
    id: string
  }>
}

export default function RoomPage({
  params,
}: RoomPageProps) {
  const [roomId, setRoomId] =
    useState("")

  const [message, setMessage] =
    useState("")

  const [messages, setMessages] =
    useState<Message[]>([])

  const [users, setUsers] = useState<
    string[]
  >([])

  const [copied, setCopied] =
    useState(false)

  const socketRef =
    useRef<WebSocket | null>(null)

  const bottomRef =
    useRef<HTMLDivElement | null>(null)

  const secretKey = roomId || "h4chat"

  useEffect(() => {
    params.then((data) => {
      setRoomId(data.id)

      const socket = new WebSocket(
         `wss://h4chat.onrender.com/ws?room=${data.id}`
      )

      socketRef.current = socket

      socket.onmessage = (event) => {
        const parsed = JSON.parse(
          event.data
        )

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    })
  }, [messages])

  const sendMessage = () => {
    if (
      socketRef.current &&
      message.trim()
    ) {
      socketRef.current.send(
        JSON.stringify({
          text: CryptoJS.AES.encrypt(
            message,
            secretKey
          ).toString(),
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
    <main className="h-screen bg-black text-white font-mono flex overflow-hidden">
      <div className="flex-1 flex flex-col">
        <div className="border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-400">
              H4Chat Terminal
            </p>

            <p className="text-xs text-zinc-700 mt-1">
              room/{roomId}
            </p>
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

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className="text-sm break-words"
            >
              {msg.type === "system" ? (
                <span className="text-zinc-600">
                  [{msg.timestamp}]{" "}
                  {msg.text}
                </span>
              ) : (
                <>
                  <span className="text-zinc-500">
                    {msg.username}
                    @h4chat
                  </span>

                  <span className="text-zinc-700">
                    :~$
                  </span>

                  <span className="text-white ml-2">
                    {CryptoJS.AES.decrypt(
                      msg.text,
                      secretKey
                    ).toString(
                      CryptoJS.enc.Utf8
                    )}
                  </span>

                  {msg.timestamp && (
  <span className="text-zinc-700 ml-3 text-xs">
    [{msg.timestamp}]
  </span>
)}
                </>
              )}
            </div>
          ))}

          <div ref={bottomRef} />
        </div>

        <div className="border-t border-zinc-800 px-4 py-3 flex items-center gap-3">
          <span className="text-zinc-500">
            h4chat:~$
          </span>

          <input
            value={message}
            onChange={(e) =>
              setMessage(
                e.target.value
              )
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
      </div>

      <div className="w-64 border-l border-zinc-800 p-4 hidden md:block">
        <p className="text-zinc-400 text-sm mb-4">
          ONLINE USERS
        </p>

        <div className="space-y-2">
          {users.map((user, index) => (
            <div
              key={index}
              className="text-sm text-zinc-500"
            >
              {user}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}