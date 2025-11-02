import "dotenv/config";
import { env } from "~/env";
import { handleMessage } from "~/handlers/message";
import {
  createApp,
  createHttpsServer,
  createWebSocketServer,
  setupWebSocketUpgrade,
} from "~/http-server";
import { bootstrapRouter } from "~/routes/bootstrap";
import { destorySession, type Session } from "~/sessions";

const PORT = env.PORT;
export const SERVER_SIGN_KEY_PEM = env.SERVER_SIGN_KEY_PEM;
export const SERVER_PUBLIC_KEY_PEM = env.SERVER_PUBLIC_KEY_PEM;

const app = createApp();
app.use(bootstrapRouter);

const httpServer = createHttpsServer(app);
const wss = createWebSocketServer();

setupWebSocketUpgrade(httpServer, wss);

wss.on("connection", (ws) => {
  let session: Session | undefined;

  ws.on("message", async (message) => {
    try {
      const result = await handleMessage(ws, message, session);
      if (result) session = result;
    } catch (error: any) {
      console.error("Error handling message:", error.message);
      if (session?.deviceId) destorySession(session.deviceId);
      session = undefined;
      ws.close();
    }
  });

  ws.on("ping", () => {
    console.log("ping");
  });

  ws.on("close", () => {
    console.log("Disconnected");
    if (session?.deviceId) destorySession(session.deviceId);
    session = undefined;
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on https://localhost:${PORT}`);
});
