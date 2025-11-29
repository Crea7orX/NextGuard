import { adoptionRequestSchema } from "@repo/validations/websockets/adoptions";
import { Router } from "express";
import { auth } from "~/lib/auth";
import { handleError, NotFoundError } from "~/lib/errors";
import { generateNonce, nowSec } from "~/lib/utils";
import { generateMac, getSession } from "~/sessions";

export const adoptionRouter = Router();

adoptionRouter.post("/api/adopt", (request, response) => {
  try {
    auth(request);

    const adoptionRequest = adoptionRequestSchema.parse(request.body);

    const session = getSession(adoptionRequest.serialId);
    if (!session) throw new NotFoundError();

    const frame = {
      type: "ws_enable_node_adoption",
      seq: ++session.lastSeqOut,
      ts: nowSec(),
      nonce: generateNonce(),
      payload: {
        serial_id: adoptionRequest.nodeSerialId,
      },
    };
    session.ws.send(
      JSON.stringify({ ...frame, mac: generateMac(session.sessionKey, frame) }),
    );

    response.json({});
  } catch (error) {
    handleError(response, error);
  }
});
