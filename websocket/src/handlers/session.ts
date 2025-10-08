import type { WebSocket as WSWebSocket } from "ws";
import { sendRequest } from "~/lib/requests";
import { nowSec, signB64, verifyP256 } from "~/lib/utils";
import { deviceResponseSchema } from "~/lib/validation/devices";
import { sessionMessageSchema } from "~/lib/validation/messages";
import {
  createSession,
  generateSessionKey,
  validateTimestamp,
} from "~/sessions";

export async function handleSession(ws: WSWebSocket, data: any) {
  const message = sessionMessageSchema.safeParse(data);
  if (!message.success) {
    throw new Error("Invalid message!");
  }

  const { device_id, ts, nonce, sig } = message.data;

  if (!validateTimestamp(ts)) {
    console.log("Invalid timestamp!");
    throw new Error("Invalid timestamp!");
  }

  const deviceResponse = await sendRequest({
    method: "GET",
    path: `/devices/${device_id}`,
  });
  if (!deviceResponse.success) {
    console.log("Invalid response!", deviceResponse.error);
    throw new Error("Invalid response!");
  }

  const device = deviceResponseSchema.safeParse(deviceResponse.data);
  if (!device.success) {
    console.log("Invalid response!", device.error);
    throw new Error("Invalid response!");
  }

  const signedBytes = Buffer.concat([
    Buffer.from(String(device_id)),
    Buffer.from(String(ts)),
    Buffer.from(nonce, "base64"),
  ]);
  const isValid = verifyP256(
    device.data.publicKeyPem,
    signedBytes,
    Buffer.from(sig, "base64"),
  );

  if (!isValid) {
    throw new Error("Invalid signature!");
  }

  const { ikm, salt, info, sessionKey } = generateSessionKey();
  const session = createSession(device_id, ws, sessionKey);

  const response = {
    type: "session_ack",
    ts: nowSec(),
    seq0: 1,
    kdf: {
      alg: "HKDF-SHA256",
      info: info.toString(),
      salt: salt.toString("base64"),
    },
    ikm: ikm.toString("base64"),
  };

  ws.send(JSON.stringify({ ...response, sig: signB64(response) }));
  return session;
}
