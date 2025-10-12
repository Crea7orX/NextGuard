import crypto, { type BinaryLike, type KeyObject } from "crypto";
import { SERVER_SIGN_KEY_PEM } from "~/index";

export function signP256(dataBuffer: Buffer) {
  const signature = crypto.createSign("sha256");
  signature.update(dataBuffer);
  signature.end();
  return signature.sign(SERVER_SIGN_KEY_PEM);
}

export function verifyP256(
  publicKeyPem: string,
  dataBuffer: Buffer,
  signature: Buffer,
) {
  const verificator = crypto.createVerify("sha256");
  verificator.update(dataBuffer);
  verificator.end();
  return verificator.verify(publicKeyPem, signature);
}

export function hkdfSha256(
  ikm: BinaryLike | KeyObject,
  salt: crypto.BinaryLike,
  info: crypto.BinaryLike,
  length = 32,
) {
  return crypto.hkdfSync("sha256", ikm, salt, info, length);
}

export function nowSec() {
  return Math.floor(Date.now() / 1000);
}

export function generateNonce() {
  return crypto.randomBytes(12).toString("base64");
}
