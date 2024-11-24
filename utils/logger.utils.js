import winston, { format, transports } from "winston";
import LokiTransport from "winston-loki";
import * as dotenv from "dotenv";
dotenv.config();

const commonOptions = {
  level: "info",
  format: winston.format.combine(
    winston.format.printf(({ level, message }) => {
      return `[${level.toUpperCase()}]: ${message}`
    }),
  ),
}

const productionConfig= {
  transports: [
    new LokiTransport({
      host: process.env.LOKI_HOST,
      labels: { app: process.env.EDTECH_LOKI_APP },
      json: true,
      format: format.json(),
      replaceTimestamp: true,
      onConnectionError: (err) => logger.error(err),
    }),
    new transports.Console({
      format: format.combine(format.simple(), format.colorize()),
    }),
  ],
}

const config = productionConfig

const logger = winston.createLogger({ ...commonOptions, ...config })
export { logger }