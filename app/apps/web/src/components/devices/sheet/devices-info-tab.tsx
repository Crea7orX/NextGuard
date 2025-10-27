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

      <Card className="!py-4">
        <CardContent className="grid gap-2 !px-4">
          <div className="flex justify-between gap-2">
            <span className="text-foreground text-sm text-nowrap">
              Signal strength
            </span>
            <span className="text-muted-foreground text-end text-sm">
              -70 dBm
            </span>
          </div>

          <div className="flex justify-between gap-2">
            <span className="text-foreground text-sm text-nowrap">Battery</span>
            <span className="text-muted-foreground text-end text-sm">100%</span>
          </div>

          <div className="flex justify-between gap-2">
            <span className="text-foreground text-sm text-nowrap">Lid</span>
            <span className="text-muted-foreground text-end text-sm">
              Closed
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="!py-4">
        <CardContent className="grid gap-2 !px-4">
          <div className="flex justify-between gap-2">
            <span className="text-foreground text-sm text-nowrap">Type</span>
            <span className="text-muted-foreground text-end text-sm">
              {device.type}
            </span>
          </div>

          <div className="flex justify-between gap-2">
            <span className="text-foreground text-sm text-nowrap">
              Serial ID
            </span>
            <span className="text-muted-foreground text-end text-sm">
              {device.serialId}
            </span>
          </div>

          <div className="flex justify-between gap-2">
            <span className="text-foreground text-sm text-nowrap">
              Device version
            </span>
            <span className="text-muted-foreground text-end text-sm">
              {telemetry?.system.firmware ?? "-"}
            </span>
          </div>

          <div className="flex justify-between gap-2">
            <span className="text-foreground text-sm text-nowrap">Uptime</span>
            <span className="text-muted-foreground text-end text-sm">
              {formatUptime(telemetry?.system.uptime ?? 0)}
            </span>
          </div>

          <div className="flex justify-between gap-2">
            <span className="text-foreground text-sm text-nowrap">
              Last heartbeat
            </span>
            <span className="text-muted-foreground text-end text-sm">
              3s ago
            </span>
          </div>
        </CardContent>
      </Card>

      {telemetry && (
        <>
          <Card className="!py-4">
            <CardContent className="grid gap-2 !px-4">
              <div className="flex justify-between gap-2">
                <span className="text-foreground text-sm text-nowrap">
                  Netowrk mode
                </span>
                <span className="text-muted-foreground text-end text-sm">
                  {telemetry.network.networkMode}
                </span>
              </div>

              <div className="flex justify-between gap-2">
                <span className="text-foreground text-sm text-nowrap">
                  Local IP Address
                </span>
                <span className="text-muted-foreground text-end text-sm">
                  {telemetry.network.ipAddress}
                </span>
              </div>

              <div className="flex justify-between gap-2">
                <span className="text-foreground text-sm text-nowrap">
                  MAC Address
                </span>
                <span className="text-muted-foreground text-end text-sm">
                  {telemetry.network.macAddress}
                </span>
              </div>

              {telemetry.network.wifiSsid && (
                <div className="flex justify-between gap-2">
                  <span className="text-foreground text-sm text-nowrap">
                    WiFi SSID
                  </span>
                  <span className="text-muted-foreground text-end text-sm">
                    {telemetry.network.wifiSsid}
                  </span>
                </div>
              )}

              {telemetry.network.wifiRssi && (
                <div className="flex justify-between gap-2">
                  <span className="text-foreground text-sm text-nowrap">
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
                  <span className="text-foreground text-sm text-nowrap">
                    Ethernet Speed
                  </span>
                  <span className="text-muted-foreground text-end text-sm">
                    {telemetry.network.ethSpeedMbps} Mbps
                  </span>
                </div>
              )}

              {telemetry.network.ethFullDuplex && (
                <div className="flex justify-between gap-2">
                  <span className="text-foreground text-sm text-nowrap">
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
                <span className="text-foreground text-sm text-nowrap">
                  CPU Temp
                </span>
                <span className="text-muted-foreground text-end text-sm">
                  {telemetry.cpu.tempC.toFixed(2)}°C
                </span>
              </div>

              <div className="flex justify-between gap-2">
                <span className="text-foreground text-sm text-nowrap">
                  CPU Frequency
                </span>
                <span className="text-muted-foreground text-end text-sm">
                  {telemetry.cpu.freqMhz.toFixed(2)}MHz
                </span>
              </div>

              <div className="flex justify-between gap-2">
                <span className="text-foreground text-sm text-nowrap">
                  CPU Cores
                </span>
                <span className="text-muted-foreground text-end text-sm">
                  {telemetry.cpu.cores}
                </span>
              </div>

              <div className="flex justify-between gap-2">
                <span className="text-foreground text-sm text-nowrap">
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
        </>
      )}
    </div>
  );
}
