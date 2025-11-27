import { startLocalServer } from "./server"

startLocalServer().catch((err) => {
  console.error(err)
  process.exit(1)
})
