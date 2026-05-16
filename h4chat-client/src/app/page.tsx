"use client"

import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"

export default function Home() {
  const router = useRouter()

  const createRoom = () => {
    const roomId = uuidv4()

    router.push(`/room/${roomId}`)
  }

  return (
    <main className="h-screen bg-black text-zinc-400 flex items-center justify-center font-mono">
      <button
        onClick={createRoom}
        className="border border-zinc-800 px-6 py-3 hover:bg-zinc-900 transition"
      >
        create secure room
      </button>
    </main>
  )
}