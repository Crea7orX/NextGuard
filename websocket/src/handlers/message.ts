import type { RawData, WebSocket as WSWebSocket } from "ws";
import { handleHello } from "~/handlers/hello";
import { handleHelloAck } from "~/handlers/hello-ack";
import { handleSession } from "~/handlers/session";
import { handleTimestamp } from "~/lib/validation/timestamp";
import { validateMessage, type Session } from "~/sessions";

export async function handleMessage(
  socket: WSWebSocket,
  message: RawData,
  session: Session | undefined,
) {
  let data;
  try {
    data = JSON.parse(message.toString());
  } catch {
    throw new Error("Invalid format!");
  }

  console.log(data);

  if (data.type === "timestamp") {
    await handleTimestamp(socket);
    return;
  }

  if (data.type === "hello") {
    return await handleHello(socket, data);
  }

  if (data.type === "session") {
    return await handleSession(socket, data);
  }

  if (!session) {
    throw new Error("No session found!");
  }

  if (!validateMessage(session, data)) {
    throw new Error("Invalid message!");
  }

  if (data.type === "hello_ack") {
    await handleHelloAck(socket, data, session);
    return;
  }
}
