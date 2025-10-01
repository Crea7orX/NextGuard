import { createAccessControl } from "better-auth/plugins/access";

const statement = {
  pending_devices: ["create", "read"],
};

export const ac = createAccessControl(statement);

export const owner = ac.newRole({ pending_devices: ["create", "read"] });

export function convertPermissionsToObject(permissionStrings: string[]) {
  const result: Record<string, string[]> = {};

  for (const permission of permissionStrings) {
    const [resource, action] = permission.split(":");
    if (resource && action) {
      result[resource] ??= [];
      if (!result[resource].includes(action)) {
        result[resource].push(action);
      }
    }
  }

  return result;
}

export function convertCommaSeparatedPermissions(permissionString: string) {
  const permissions = permissionString
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return convertPermissionsToObject(permissions);
}
