import crypto, { type BinaryLike, type KeyObject } from "crypto";
import { SERVER_SIGN_KEY_PEM } from "~/index";

export function sha256(buffer: Buffer) {
  const hash = crypto.createHash("sha256");
  hash.update(buffer);
  return hash.digest();
}

export function signB64(data: any) {
  const toSign = sha256(Buffer.from(JSON.stringify(data)));
  return signP256(SERVER_SIGN_KEY_PEM, toSign).toString("base64");
}

export function signP256(privateKeyPem: string, dataBuffer: Buffer) {
  const signature = crypto.createSign("sha256");
  signature.update(dataBuffer);
  signature.end();
  return signature.sign(privateKeyPem);
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
  return crypto.randomBytes(16).toString("base64");
}
