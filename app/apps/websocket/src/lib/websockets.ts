import type { WebSocket as WSWebSocket } from "ws";
import type { Session } from "~/sessions";

export function sendMessage(
  socket: WSWebSocket,
  session: Session,
  message: any,
) {
  socket.send(JSON.stringify(message));
}
