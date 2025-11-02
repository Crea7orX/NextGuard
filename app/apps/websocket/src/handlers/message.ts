import type { RawData, WebSocket as WSWebSocket } from "ws";
import { handleHello } from "~/handlers/hello";
import { handleHelloAck } from "~/handlers/hello-ack";
import { handleSession } from "~/handlers/session";
import { handleTelemtry } from "~/handlers/telemetry";
import { handleTimestamp } from "~/handlers/timestamp";
import { messageSchema } from "~/lib/validation/messages";
import { updateSession, validateMessage, type Session } from "~/sessions";

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

  const parsedMessage = messageSchema.safeParse(data);
  if (!parsedMessage.success) {
    throw new Error("Invalid message!");
  }

  const { seq, nonce } = parsedMessage.data;
  updateSession(session, seq, nonce);

  if (data.type === "telemetry") {
    await handleTelemtry(socket, parsedMessage.data, session);
    return;
  }
}
