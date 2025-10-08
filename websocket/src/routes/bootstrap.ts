import { Router } from "express";
import fs from "fs";
import { SERVER_PUBLIC_KEY_PEM, SERVER_SIGN_KEY_PEM } from "~/index";
import { nowSec, signP256 } from "~/lib/utils";

export const bootstrapRouter = Router();

const CERT_PEM = fs.readFileSync("./cert.pem", "utf8"); // TODO

bootstrapRouter.get("/api/bootstrap", (req, res) => {
  const payload = {
    ts: nowSec(),
    cert_chain_pem: CERT_PEM,
    pub_sign_key_pem: SERVER_PUBLIC_KEY_PEM,
  };

  const sigB64 = signP256(
    SERVER_SIGN_KEY_PEM,
    Buffer.from(JSON.stringify(payload)),
  ).toString("base64");
  res.json({ ...payload, sig: sigB64 });
});
