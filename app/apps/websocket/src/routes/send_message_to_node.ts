import { sendMessageToNodeRequestSchema } from "@repo/validations/websockets/messages";
import { Router } from "express";
import { auth } from "~/lib/auth";
import { handleError, NotFoundError } from "~/lib/errors";
import { generateNonce, nowSec } from "~/lib/utils";
import { generateMac, getSession } from "~/sessions";

export const sendMessageToNodeRouter = Router();

sendMessageToNodeRouter.post(
  "/api/send_message_to_node",
  (request, response) => {
    try {
      auth(request);

      const sendMessageToNodeRequest = sendMessageToNodeRequestSchema.parse(
        request.body,
      );

      const session = getSession(sendMessageToNodeRequest.serialId);
      if (!session) throw new NotFoundError();

      const frame = {
        type: "ws_send_message_to_node",
        seq: ++session.lastSeqOut,
        ts: nowSec(),
        nonce: generateNonce(),
        payload: {
          serial_id: sendMessageToNodeRequest.nodeSerialId,
          message: sendMessageToNodeRequest.message,
        },
      };
      session.ws.send(
        JSON.stringify({
          ...frame,
          mac: generateMac(session.sessionKey, frame),
        }),
      );

      response.json({});
    } catch (error) {
      handleError(response, error);
    }
  },
);
