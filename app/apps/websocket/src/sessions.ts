import crypto from "crypto";
import { WebSocket as WSWebSocket } from "ws";
import { hkdfSha256, nowSec } from "~/lib/utils";

const sessions = new Map<string, Session>();

export interface Session {
  ws: WSWebSocket;
  deviceId: string;
  sessionKey: ArrayBuffer;
  lastSeqIn: number;
  lastSeqOut: number;
  nonces: Set<string>;
}

export function createSession(
  deviceId: string,
  ws: WSWebSocket,
  sessionKey: ArrayBuffer,
) {
  const session = {
    ws,
    deviceId,
    sessionKey,
    lastSeqIn: 0,
    lastSeqOut: 0,
    nonces: new Set<string>(),
  };

  // TODO: Check for broken sessions

  sessions.set(deviceId, session);

  return session;
}

export function getSession(deviceId: string) {
  return sessions.get(deviceId);
}

export function updateSession(
  session: Session,
  sequence: number,
  nonce: string,
) {
  session.lastSeqIn = sequence;
  session.nonces.add(nonce);
  if (session.nonces.size > 512) {
    session.nonces.clear();
  }
}

export function destorySession(deviceId: string) {
  sessions.delete(deviceId);
}

export function generateSessionKey() {
  const ikm = crypto.randomBytes(32);
  const salt = crypto.randomBytes(16);
  const info = Buffer.from("session-" + crypto.randomBytes(16));
  const sessionKey = hkdfSha256(ikm, salt, info);

  return { ikm, salt, info, sessionKey };
}

export function generateMac(
  sessionKey: ArrayBuffer,
  pack: Record<string, any>,
) {
  const { mac, ...packWithoutMac } = pack;
  const packString = JSON.stringify(packWithoutMac);
  return crypto
    .createHmac("sha256", Buffer.from(sessionKey))
    .update(packString)
    .digest("base64");
}

export function validateMac(
  sessionKey: ArrayBuffer,
  pack: Record<string, any>,
  mac: string,
) {
  const calculatedMac = generateMac(sessionKey, pack);
  return mac === calculatedMac;
}

export function validateSequence(session: Session, sequence: number) {
  return typeof sequence === "number" && sequence > session.lastSeqIn;
}

export function validateNonce(session: Session, nonce: string) {
  return !session.nonces.has(nonce);
}

export function validateTimestamp(timestamp: number) {
  return Math.abs(nowSec() - timestamp) < 60;
}

export function validateMessage(session: Session, data: Record<string, any>) {
  if (!validateMac(session.sessionKey, data, data.mac)) return false;
  if (!validateSequence(session, data.seq)) return false;
  if (!validateNonce(session, data.nonce)) return false;
  return validateTimestamp(data.ts);
}
