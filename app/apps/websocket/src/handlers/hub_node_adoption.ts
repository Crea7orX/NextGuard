import { nodeAdoptionSchema } from "@repo/validations/websockets/adoptions";
import type { WebSocket as WSWebSocket } from "ws";
import { sendRequest } from "~/lib/requests";
import { generateNonce, nowSec } from "~/lib/utils";
import type { Message } from "~/lib/validation/messages";
import { generateMac, type Session } from "~/sessions";

export async function handleHubNodeAdoption(
  ws: WSWebSocket,
  message: Message,
  session: Session,
) {
  const payload = nodeAdoptionSchema.safeParse(message.payload);
  if (!payload.success) {
    throw new Error("Invalid message!");
  }

  const nodeAdoptionResponse = await sendRequest({
    method: "POST",
    path: `/pending_devices/${session.deviceId}/adopt`,
    body: payload.data,
  });
  if (!nodeAdoptionResponse.success) {
    throw new Error("Invalid response!");
  }

  // TODO: Validate response

  const frame = {
    type: "hub_node_adoption_ack",
    seq: ++session.lastSeqOut,
    ts: nowSec(),
    nonce: generateNonce(),
    payload: {
      serial_id: payload.data.serialId,
    },
  };
  ws.send(
    JSON.stringify({ ...frame, mac: generateMac(session.sessionKey, frame) }),
  );
}
