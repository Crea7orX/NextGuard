import { pendingDeviceDiscoverySchema } from "@repo/validations/websockets/pending-devices";
import type { WebSocket as WSWebSocket } from "ws";
import { sendRequest } from "~/lib/requests";
import { generateNonce, nowSec } from "~/lib/utils";
import type { Message } from "~/lib/validation/messages";
import { generateMac, type Session } from "~/sessions";

export async function handleDiscovery(
  ws: WSWebSocket,
  message: Message,
  session: Session,
) {
  const payload = pendingDeviceDiscoverySchema.safeParse(message.payload);
  if (!payload.success) {
    throw new Error("Invalid message!");
  }

  const discoveryResponse = await sendRequest({
    method: "POST",
    path: `/pending_devices/${session.deviceId}/discovery`,
    body: payload.data,
  });
  if (!discoveryResponse.success) {
    throw new Error("Invalid response!");
  }

  // TODO: Validate response

  const frame = {
    type: "discovery_ack",
    seq: ++session.lastSeqOut,
    ts: nowSec(),
    nonce: generateNonce(),
    payload: {
      serial_id: discoveryResponse.data.serialId,
    },
  };
  ws.send(
    JSON.stringify({ ...frame, mac: generateMac(session.sessionKey, frame) }),
  );
}
