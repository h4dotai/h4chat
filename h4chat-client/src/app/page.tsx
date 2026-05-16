"use client"

import Navbar from "@/components/layout/Navbar"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"

export default function Home() {
  const router = useRouter()

  const createRoom = () => {
    const roomId = uuidv4()

    router.push(`/room/${roomId}`)
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="flex flex-col items-center justify-center text-center px-6 py-32">
        <h1 className="text-7xl font-black tracking-tight">
          H4Chat
        </h1>

        <p className="mt-6 text-zinc-400 max-w-xl text-lg">
          Create private disposable chat rooms and share links securely.
        </p>

        <button
          onClick={createRoom}
          className="mt-10 bg-white text-black px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition"
        >
          Create Private Room
        </button>
      </section>
    </main>
  )
}