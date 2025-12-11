import { DevicesInfoTab } from "~/components/devices/sheet/devices-info-tab";
import { DevicesSettingsTab } from "~/components/devices/sheet/devices-settings-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useGetDeviceByIdQuery } from "~/hooks/api/devices/use-get-device-by-id-query";

interface Props {
  id: string;
}

export function DevicesSheetBody({ id }: Props) {
  const { data, isLoading } = useGetDeviceByIdQuery({
    id,
    refetchInterval: 1000,
  });

  // TODO: add skeletons
  if (!data || isLoading) return <div>Loading...</div>;

  return (
    <Tabs defaultValue="info" className="h-full">
      <TabsList className="w-full gap-2">
        <TabsTrigger value="info">Info</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="info" asChild>
        <DevicesInfoTab device={data} />
      </TabsContent>
      <TabsContent value="settings" asChild>
        <DevicesSettingsTab device={data} />
      </TabsContent>
    </Tabs>
  );
}
