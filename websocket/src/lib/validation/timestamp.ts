import { WebSocket } from "ws";
import { SERVER_SIGN_KEY_PEM } from "~/index";
import { nowSec, signP256 } from "~/lib/utils";

export async function handleTimestamp(socket: WebSocket): Promise<void> {
  const payload = {
    type: "timestamp_ack",
    srv_ts: nowSec(),
  };

  const sigB64 = signP256(
    SERVER_SIGN_KEY_PEM,
    Buffer.from(JSON.stringify(payload)),
  ).toString("base64");
  socket.send(JSON.stringify({ ...payload, srv_sig: sigB64 }));
}
