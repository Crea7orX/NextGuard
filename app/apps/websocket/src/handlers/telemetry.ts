import { deviceTelemetrySchema } from "@repo/validations/websockets/devices";
import type { WebSocket as WSWebSocket } from "ws";
import { sendRequest } from "~/lib/requests";
import { generateNonce, nowSec } from "~/lib/utils";
import type { Message } from "~/lib/validation/messages";
import { generateMac, type Session } from "~/sessions";

export async function handleTelemtry(
  ws: WSWebSocket,
  message: Message,
  session: Session,
) {
  const payload = deviceTelemetrySchema.safeParse(message.payload);
  if (!payload.success) {
    throw new Error("Invalid message!");
  }

  const telemetryResponse = await sendRequest({
    method: "PATCH",
    path: `/devices/${session.deviceId}/telemetry`,
    body: payload.data,
  });
  if (!telemetryResponse.success) {
    throw new Error("Invalid response!");
  }

  const frame = {
    type: "telemetry_ack",
    seq: ++session.lastSeqOut,
    ts: nowSec(),
    nonce: generateNonce(),
  };
  ws.send(
    JSON.stringify({ ...frame, mac: generateMac(session.sessionKey, frame) }),
  );
}
