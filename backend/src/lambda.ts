import awsLambdaFastify from "aws-lambda-fastify"
import { buildServer } from "./server"

const proxy = awsLambdaFastify(buildServer())

export const handler = proxy
