import { FastifyInstance } from "fastify"
import { handleSocketMessage } from "./socket/controller"

export function registerWebSocket(fastify: FastifyInstance) {
  fastify.get("/ws", { websocket: true }, (connection, req) => {
    console.log("WebSocket connection established")

    connection.socket.on("message", (message: Buffer) => {
      handleSocketMessage(connection.socket, message)
    })

    connection.socket.on("error", (error: Error) => {
      console.error("WebSocket error:", error)
    })
  })
}

