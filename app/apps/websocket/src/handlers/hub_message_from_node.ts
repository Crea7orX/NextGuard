import { messageFromNodeSchema } from "@repo/validations/websockets/messages";
import type { WebSocket as WSWebSocket } from "ws";
import { sendRequest } from "~/lib/requests";
import { generateNonce, nowSec } from "~/lib/utils";
import type { Message } from "~/lib/validation/messages";
import { generateMac, type Session } from "~/sessions";

export async function handleHubMessageFromNode(
  ws: WSWebSocket,
  message: Message,
  session: Session,
) {
  const payload = messageFromNodeSchema.safeParse(message.payload);
  if (!payload.success) {
    throw new Error("Invalid message!");
  }

  const nodeAdoptionResponse = await sendRequest({
    method: "POST",
    path: `/devices/${session.deviceId}/message`,
    body: payload.data,
  });
  // if (!nodeAdoptionResponse.success) {
  //   throw new Error("Invalid response!");
  // }

  //   const test = await fetch(
  //     "https://localhost:3001/api/send_message_to_node",
  //     {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${env.SERVER_SECRET_KEY}`,
  //       },
  //       body: JSON.stringify({
  //         serialId: "99e54666-82e4-4254-9afb-0e96a575fe71",
  //         nodeSerialId: "550e8400-e29b-4124-a716-446655440000",
  //         message: `siren;${state === "true" ? "false" : "true"}`,
  //       }),
  //     },
  //   ).catch((error) => {
  //     console.log("ERROR");
  //     console.error(error);
  //   });

  //   console.log(test, test && (await test.json()));
  // }

  // TODO: Validate response

  const frame = {
    type: "hub_message_from_node_ack",
    seq: ++session.lastSeqOut,
    ts: nowSec(),
    nonce: generateNonce(),
  };
  ws.send(
    JSON.stringify({ ...frame, mac: generateMac(session.sessionKey, frame) }),
  );
}
