import { pendingDeviceIntroduceSchema } from "@repo/validations/websockets/pending-devices";
import type { WebSocket as WSWebSocket } from "ws";
import { sendRequest } from "~/lib/requests";
import { generateNonce, nowSec, signP256, verifyP256 } from "~/lib/utils";
import { helloMessageSchema } from "~/lib/validation/messages";
import {
  createSession,
  generateSessionKey,
  validateTimestamp,
} from "~/sessions";

export async function handleHello(ws: WSWebSocket, data: any) {
  const message = helloMessageSchema.safeParse(data);
  if (!message.success) {
    throw new Error("Invalid message!");
  }

  const { device_id, ts, nonce, sig, pubkey_pem } = message.data;

  if (!validateTimestamp(ts)) {
    console.log("Invalid timestamp!");
    throw new Error("Invalid timestamp!");
  }

  const introduceResponse = await sendRequest({
    method: "POST",
    path: `/pending_devices/${device_id}/introduce`,
    body: pendingDeviceIntroduceSchema.parse({
      publicKeyPem: pubkey_pem,
    }),
  });

  if (!introduceResponse.success) {
    console.log("Invalid response!", introduceResponse.error);
    throw new Error("Invalid response!");
  }

  const signedBytes = Buffer.concat([
    Buffer.from(String(device_id)),
    Buffer.from(String(ts)),
    Buffer.from(nonce, "base64"),
  ]);
  const isValid = verifyP256(
    pubkey_pem,
    signedBytes,
    Buffer.from(sig, "base64"),
  );

  if (!isValid) {
    throw new Error("Invalid signature!");
  }

  const { ikm, salt, info, sessionKey } = generateSessionKey();
  const session = createSession(device_id, ws, sessionKey);

  const responseTS = nowSec();
  const responseNonce = generateNonce();

  const response = {
    type: "hello_ack",
    ts: responseTS,
    nonce: responseNonce,
    seq0: 1,
    kdf: {
      alg: "HKDF-SHA256",
      info: info.toString(),
      salt: salt.toString("base64"),
    },
    ikm: ikm.toString("base64"),
  };

  const digest = Buffer.concat([
    Buffer.from(String(responseTS)),
    Buffer.from(responseNonce),
  ]);
  const responseSig = signP256(digest).toString("base64");
  ws.send(JSON.stringify({ ...response, sig: responseSig }));
  return session;
}
