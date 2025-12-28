import Fastify, { FastifyInstance } from "fastify"
import cors from "@fastify/cors"
import websocket from "@fastify/websocket"
import { registerWebSocket } from "./websocket"
import { registerRoutes } from "./routes"
import logger from "./utils/logger"

export function buildServer(): FastifyInstance {
  const app = Fastify({ logger: logger as any })

  app.register(cors, { origin: true })
  app.register(websocket)

  // Register WebSocket handler
  app.register(async function (fastify) {
    registerWebSocket(fastify)
  })

  // Register REST API routes
  registerRoutes(app)

  return app
}

export async function startLocalServer() {
  const server = buildServer()
  const port = Number(process.env.PORT) || 4000
  const host = process.env.HOST || "127.0.0.1"
  await server.listen({ port, host })
  console.log(`Server listening on http://${host}:${port}`)
  console.log(`WebSocket available at ws://${host}:${port}/ws`)
}
