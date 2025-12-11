"use client";

import { CircleDot, Clock, House, Shield } from "lucide-react";
import type { SearchParams } from "nuqs";
import React from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { useGetAllDevicesQuery } from "~/hooks/api/devices/use-get-all-devices-query";
import { useGetAllEventsQuery } from "~/hooks/api/events/use-get-all-events-query";
import { useArmSpaceByIdMutation } from "~/hooks/api/spaces/use-arm-space-by-id-mutation";
import { useDisarmSpaceByIdMutation } from "~/hooks/api/spaces/use-disarm-space-by-id-mutation";
import { useGetSpaceByIdQuery } from "~/hooks/api/spaces/use-get-space-by-id-query";
import { authClient } from "~/lib/auth-client";
import { cn } from "~/lib/utils";

interface Props {
  searchParams: Promise<SearchParams>;
}

export default function DashboardPage({ searchParams }: Props) {
  const [isLoading, setIsLoading] = React.useState(false);

  const { data: activeSpace } = authClient.useActiveOrganization();
  const { data: space } = useGetSpaceByIdQuery({ id: activeSpace?.id || "" });
  const { data: devices } = useGetAllDevicesQuery({ searchParams: {} });
  const { data: events } = useGetAllEventsQuery({
    refetchInterval: 1000,
  });

  const { mutateAsync: doArm } = useArmSpaceByIdMutation({
    id: activeSpace?.id || "",
  });
  const { mutateAsync: doDisarm } = useDisarmSpaceByIdMutation({
    id: activeSpace?.id || "",
  });

  async function arm() {
    setIsLoading(true);

    await doArm()
      .then(() => {
        toast.success("System armed!");
      })
      .catch(() => {
        toast.error("Failed to arm system!");
      });

    setIsLoading(false);
  }

  async function disarm() {
    setIsLoading(true);

    await doDisarm()
      .then(() => {
        toast.success("System dsarmed!");
      })
      .catch(() => {
        toast.error("Failed to disarm system!");
      });

    setIsLoading(false);
  }

  return (
    <div className="flex items-start gap-6 p-4">
      {/* CONTROL */}
      <div className="flex gap-2">
        <Card className="gap-8 px-10 font-bold">
          <div className="flex items-center gap-10">
            <div className="flex flex-col gap-1">
              <p>SYSTEM STATUS</p>
              {space?.armed ? (
                <p className="text-primary text-xl">Armed</p>
              ) : (
                <p className="text-destructive text-xl">Disarmed</p>
              )}
            </div>
            <div
              className={cn(
                "bg-destructive/30 text-destructive w-fit rounded-md p-4",
                space?.armed && "bg-primary/30 text-primary",
              )}
            >
              <Shield />
            </div>
          </div>
          {space?.armed ? (
            <Button variant="destructive" onClick={disarm} disabled={isLoading}>
              Disarm System
            </Button>
          ) : (
            <Button onClick={arm} disabled={isLoading}>
              Arm System
            </Button>
          )}
        </Card>
      </div>

      {/* DEVICES */}
      <Card className="w-fit items-center gap-2 px-10">
        <div className="bg-primary/30 text-primary w-fit rounded-md p-4">
          <House />
        </div>
        <span className="text-2xl font-bold">{devices?.data.length ?? 0}</span>
        <span className="text-muted-foreground text-sm">Devices</span>
      </Card>

      {/* EVENTS */}
      <Card className="w-full gap-4 px-10">
        <span className="mb-2 font-bold">Recent activity</span>
        {events?.length ? (
          events.map((event) => (
            <div className="flex items-center gap-4">
              <CircleDot className="text-destructive size-6" />
              <div className="flex flex-col gap-2">
                <span className="text-lg">{event.title}</span>
                <span className="text-muted-foreground text-sm">
                  {event.description}
                </span>
                <span className="text-muted-foreground inline-flex items-center gap-1 text-sm">
                  <Clock className="size-4" />
                  {new Date(event.createdAt * 1000).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center gap-4">
            <CircleDot className="text-primary size-6" />
            <span className="text-lg">For now is clear</span>
          </div>
        )}
      </Card>
    </div>
  );
}
