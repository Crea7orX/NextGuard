import bodyParser from "body-parser";
import express from "express";
import fs from "fs";
import { createServer } from "https";
import { WebSocketServer } from "ws";

const CERT_PEM = fs.readFileSync("./cert.pem", "utf8");
const KEY_PEM = fs.readFileSync("./key.pem", "utf8");

export function createApp() {
  const app = express();
  app.use(bodyParser.json({ limit: "1mb" }));
  return app;
}

export function createHttpsServer(app: express.Application) {
  return createServer({ key: KEY_PEM, cert: CERT_PEM }, app);
}

export function createWebSocketServer() {
  return new WebSocketServer({ noServer: true });
}

export function setupWebSocketUpgrade(
  httpServer: ReturnType<typeof createServer>,
  wss: WebSocketServer,
) {
  httpServer.on("upgrade", (req, socket, head) => {
    if (req.url !== "/ws") return socket.destroy();
    wss.handleUpgrade(req, socket, head, (ws) =>
      wss.emit("connection", ws, req),
    );
  });
}
