import { generateId as generate } from "better-auth";

enum IdPrefix {
  DEVICE = "dvc_",
  EVENT = "evt_",
  PENDING_DEVICE = "pnd_dvc_",
}

export default IdPrefix;

export function generateId(prefix: IdPrefix, length = 32) {
  const randomId = generate(length);
  return `${prefix}${randomId}`;
}
