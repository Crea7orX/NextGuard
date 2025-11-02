import type { deviceTypeEnum } from "~/server/db/schemas/pending-devices";

type DeviceTypeValue = (typeof deviceTypeEnum.enumValues)[number];

enum DeviceTypeMapping {
  "0x54" = "hub",
}

export function getDeviceTypeFromSerialId(serialId: string) {
  const typeId = serialId.substring(16, 18);
  const deviceType =
    DeviceTypeMapping[`0x${typeId}` as keyof typeof DeviceTypeMapping];

  return deviceType as DeviceTypeValue | undefined;
}
