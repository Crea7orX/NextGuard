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
  return (
    <div
      className={cn("flex flex-col gap-3", className)}
      {...props}
    >
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
              0.0.1
            </span>
          </div>

          <div className="flex justify-between gap-2">
            <span className="text-foreground text-sm text-nowrap">Uptime</span>
            <span className="text-muted-foreground text-end text-sm">
              28d 21h 11m 36s
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
    </div>
  );
}
