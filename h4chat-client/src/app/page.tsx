import { redirect } from "next/navigation"
import { v4 as uuidv4 } from "uuid"

export default function Home() {
  const roomId = uuidv4()

  redirect(`/room/${roomId}`)
}