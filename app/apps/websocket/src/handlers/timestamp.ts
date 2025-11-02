import { WebSocket } from "ws";
import { generateNonce, nowSec, signP256 } from "~/lib/utils";

export async function handleTimestamp(socket: WebSocket): Promise<void> {
  const ts = nowSec();
  const nonce = generateNonce();

  const payload = {
    type: "timestamp_ack",
    ts,
    nonce,
  };

  const digest = Buffer.concat([Buffer.from(String(ts)), Buffer.from(nonce)]);
  const sig = signP256(digest).toString("base64");
  socket.send(JSON.stringify({ ...payload, sig }));
}
