import type { WebSocket as WSWebSocket } from "ws";
import { sendRequest } from "~/lib/requests";
import { generateNonce, nowSec } from "~/lib/utils";
import { baseMessageSchema } from "~/lib/validation/messages";
import { type Session, generateMac, updateSession } from "~/sessions";

export async function handleHelloAck(
  socket: WSWebSocket,
  data: any,
  session: Session,
) {
  const message = baseMessageSchema.safeParse(data);
  if (!message.success) {
    throw new Error("Invalid message!");
  }

  const { seq, nonce } = message.data;
  updateSession(session, seq, nonce);

  const adoptResponse = await sendRequest({
    method: "POST",
    path: `/pending_devices/${session.deviceId}/acknowledge`,
  });
  if (!adoptResponse.success) {
    throw new Error("Invalid response!");
  }

  const frame = {
    type: "adopt_ack",
    seq: ++session.lastSeqOut,
    ts: nowSec(),
    nonce: generateNonce(),
  };
  socket.send(
    JSON.stringify({ ...frame, mac: generateMac(session.sessionKey, frame) }),
  );
}
