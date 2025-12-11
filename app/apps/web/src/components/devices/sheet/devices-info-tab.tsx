import {
  Battery,
  DoorClosed,
  DoorOpen,
  Heart,
  Lock,
  Megaphone,
  MegaphoneOff,
  Plug,
  Signal,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";
import type { DeviceResponse } from "~/lib/validation/devices";

interface Props extends React.ComponentProps<"div"> {
  device: DeviceResponse;
}

export function DevicesInfoTab({ className, device, ...props }: Props) {
  const telemetry = device.metadata.telemetry;
  const batteryPercentage = device.metadata.batteryPercentage;
  const batteryVoltage = device.metadata.batteryVoltage;
  const state = device.metadata.state;
  const lastHeartbeatAt = device.metadata.lastHeartbeatAt;

  function formatUptime(uptimeSeconds: number): string {
    if (uptimeSeconds === 0) return "0s";

    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    return parts.join(" ");
  }

  function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";

    const units = ["B", "KB", "MB", "GB", "TB"];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`;
  }

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      <Card className="!py-4">
        <CardHeader className="!px-4">
          <CardTitle>{device.name}</CardTitle>
          {device.description && (
            <CardDescription>{device.description}</CardDescription>
          )}
        </CardHeader>
      </Card>

      {device.type === "entry" && (
        <Card className="!py-4">
          <CardContent className="grid gap-2 !px-4">
            <div className="flex justify-between gap-2">
              <span className="text-foreground text-nowrap text-sm">State</span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-end text-sm text-green-600",
                  !state && "text-destructive",
                )}
              >
                {state ? (
                  <>
                    <DoorClosed className="size-4" /> Closed
                  </>
                ) : (
                  <>
                    <DoorOpen className="size-4" /> Opened
                  </>
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {device.type === "siren" && (
        <Card className="!py-4">
          <CardContent className="grid gap-2 !px-4">
            <div className="flex justify-between gap-2">
              <span className="text-foreground text-nowrap text-sm">State</span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-end text-sm text-green-600",
                  state && "text-destructive",
                )}
              >
                {state ? (
                  <>
                    <Megaphone className="size-4" /> ON
                  </>
                ) : (
                  <>
                    <MegaphoneOff className="size-4" /> OFF
                  </>
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="!py-4">
        <CardContent className="grid gap-2 !px-4">
          <div className="flex justify-between gap-2">
            <span className="text-foreground text-nowrap text-sm">
              Signal strength
            </span>
            <span className="inline-flex items-center gap-1 text-end text-sm text-orange-500">
              <Signal className="size-4" /> -
              {Math.round((Math.random() + 0.05) * 100)} dBm
            </span>
          </div>

          <div className="flex justify-between gap-2">
            <span className="text-foreground text-nowrap text-sm">Battery</span>
            {batteryPercentage ? (
              <span className="inline-flex items-center gap-1 text-end text-sm text-orange-300">
                <Battery className="size-4" /> {batteryPercentage}%
                {batteryVoltage && (
                  <> / {(batteryVoltage / 1000).toFixed(2)}V</>
                )}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-end text-sm text-green-600">
                <Plug className="size-4" /> Plugged in
              </span>
            )}
          </div>

          <div className="flex justify-between gap-2">
            <span className="text-foreground text-nowrap text-sm">Lid</span>
            <span className="text-muted-foreground inline-flex items-center gap-1 text-end text-sm">
              <Lock className="size-4" /> Closed
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="!py-4">
        <CardContent className="grid gap-2 !px-4">
          <div className="flex justify-between gap-2">
            <span className="text-foreground text-nowrap text-sm">Type</span>
            <span className="text-muted-foreground text-end text-sm">
              {device.type}
            </span>
          </div>

          <div className="flex justify-between gap-2">
            <span className="text-foreground text-nowrap text-sm">
              Serial ID
            </span>
            <span className="text-muted-foreground text-end text-sm">
              {device.serialId}
            </span>
          </div>

          <div className="flex justify-between gap-2">
            <span className="text-foreground text-nowrap text-sm">
              Device version
            </span>
            <span className="text-muted-foreground text-end text-sm">
              {telemetry?.system.firmware ?? "-"}
            </span>
          </div>

          <div className="flex justify-between gap-2">
            <span className="text-foreground text-nowrap text-sm">Uptime</span>
            <span className="text-muted-foreground text-end text-sm">
              {formatUptime(telemetry?.system.uptime ?? Math.random() * 100)}
            </span>
          </div>

          <div className="flex justify-between gap-2">
            <span className="text-foreground text-nowrap text-sm">
              Last heartbeat
            </span>
            <span className="text-destructive inline-flex items-center gap-1 text-end text-sm">
              <Heart className="size-4" />{" "}
              {lastHeartbeatAt ? (
                <>
                  {Math.round(
                    new Date().getTime() / 1000 - lastHeartbeatAt / 1000,
                  )}
                  s ago
                </>
              ) : (
                <>Never</>
              )}
            </span>
          </div>
        </CardContent>
      </Card>

      {telemetry && (
        <>
          <Card className="!py-4">
            <CardContent className="grid gap-2 !px-4">
              <div className="flex justify-between gap-2">
                <span className="text-foreground text-nowrap text-sm">
                  Netowrk mode
                </span>
                <span className="text-muted-foreground text-end text-sm">
                  {telemetry.network.networkMode}
                </span>
              </div>

              <div className="flex justify-between gap-2">
                <span className="text-foreground text-nowrap text-sm">
                  Local IP Address
                </span>
                <span className="text-muted-foreground text-end text-sm">
                  {telemetry.network.ipAddress}
                </span>
              </div>

              <div className="flex justify-between gap-2">
                <span className="text-foreground text-nowrap text-sm">
                  MAC Address
                </span>
                <span className="text-muted-foreground text-end text-sm">
                  {telemetry.network.macAddress}
                </span>
              </div>

              {telemetry.network.wifiSsid && (
                <div className="flex justify-between gap-2">
                  <span className="text-foreground text-nowrap text-sm">
                    WiFi SSID
                  </span>
                  <span className="text-muted-foreground text-end text-sm">
                    {telemetry.network.wifiSsid}
                  </span>
                </div>
              )}

              {telemetry.network.wifiRssi && (
                <div className="flex justify-between gap-2">
                  <span className="text-foreground text-nowrap text-sm">
                    WiFi Signal strength
                  </span>
                  <span className="text-muted-foreground text-end text-sm">
                    {telemetry.network.wifiRssi}dBm (Channel:{" "}
                    {telemetry.network.wifiChannel})
                  </span>
                </div>
              )}

              {telemetry.network.ethSpeedMbps && (
                <div className="flex justify-between gap-2">
                  <span className="text-foreground text-nowrap text-sm">
                    Ethernet Speed
                  </span>
                  <span className="text-muted-foreground text-end text-sm">
                    {telemetry.network.ethSpeedMbps} Mbps
                  </span>
                </div>
              )}

              {telemetry.network.ethFullDuplex && (
                <div className="flex justify-between gap-2">
                  <span className="text-foreground text-nowrap text-sm">
                    Ethernet Duplex
                  </span>
                  <span className="text-muted-foreground text-end text-sm">
                    {telemetry.network.ethFullDuplex ? "Full" : "Half"}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="!py-4">
            <CardContent className="grid gap-2 !px-4">
              <div className="flex justify-between gap-2">
                <span className="text-foreground text-nowrap text-sm">
                  CPU Temp
                </span>
                <span className="text-muted-foreground text-end text-sm">
                  {telemetry.cpu.tempC.toFixed(2)}°C
                </span>
              </div>

              <div className="flex justify-between gap-2">
                <span className="text-foreground text-nowrap text-sm">
                  CPU Frequency
                </span>
                <span className="text-muted-foreground text-end text-sm">
                  {telemetry.cpu.freqMhz.toFixed(2)}MHz
                </span>
              </div>

              <div className="flex justify-between gap-2">
                <span className="text-foreground text-nowrap text-sm">
                  CPU Cores
                </span>
                <span className="text-muted-foreground text-end text-sm">
                  {telemetry.cpu.cores}
                </span>
              </div>

              <div className="flex justify-between gap-2">
                <span className="text-foreground text-nowrap text-sm">
                  Used dynamic memory
                </span>
                <span className="text-muted-foreground text-end text-sm">
                  {formatBytes(
                    telemetry.memory.heapTotal - telemetry.memory.heapFree,
                  )}{" "}
                  / {formatBytes(telemetry.memory.heapTotal)}
                </span>
              </div>
            </CardContent>
          </Card>

          {device.type === "siren" && (
            <Card className="!py-4">
              <CardContent className="grid gap-2 !px-4">
                <div className="flex justify-between gap-2">
                  <span className="text-foreground text-nowrap text-sm">
                    CPU Temp
                  </span>
                  <span className="text-muted-foreground text-end text-sm">
                    {telemetry.cpu.tempC.toFixed(2)}°C
                  </span>
                </div>

                <div className="flex justify-between gap-2">
                  <span className="text-foreground text-nowrap text-sm">
                    CPU Frequency
                  </span>
                  <span className="text-muted-foreground text-end text-sm">
                    {telemetry.cpu.freqMhz.toFixed(2)}MHz
                  </span>
                </div>

                <div className="flex justify-between gap-2">
                  <span className="text-foreground text-nowrap text-sm">
                    CPU Cores
                  </span>
                  <span className="text-muted-foreground text-end text-sm">
                    {telemetry.cpu.cores}
                  </span>
                </div>

                <div className="flex justify-between gap-2">
                  <span className="text-foreground text-nowrap text-sm">
                    Used dynamic memory
                  </span>
                  <span className="text-muted-foreground text-end text-sm">
                    {formatBytes(
                      telemetry.memory.heapTotal - telemetry.memory.heapFree,
                    )}{" "}
                    / {formatBytes(telemetry.memory.heapTotal)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
