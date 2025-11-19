import type { Request } from "express";
import { env } from "process";
import { UnauthorizedError } from "~/lib/errors";

export function auth(request: Request) {
  const bearerToken = request.headers.authorization;

  if (!bearerToken || !bearerToken.startsWith("Bearer "))
    throw new UnauthorizedError();

  const token = bearerToken.split(" ")[1];
  if (token !== env.SERVER_SECRET_KEY) throw new UnauthorizedError();

  return true;
}
