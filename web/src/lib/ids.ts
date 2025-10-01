import { generateId as generate } from "better-auth";

enum IdPrefix {
  HUB = "hub_",
  PENDING_DEVICE = "pnd_dvc_",
}

export default IdPrefix;

export function generateId(prefix: IdPrefix, length = 32) {
  const randomId = generate(length);
  return `${prefix}${randomId}`;
}
