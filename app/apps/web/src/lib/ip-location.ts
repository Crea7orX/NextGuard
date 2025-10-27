export function extractIp(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "8.8.8.8";
  return ip;
}

interface ipLocationProps {
  ip: string;
}

export async function ipLocation({ ip }: ipLocationProps) {
  const response = await fetch(`http://ip-api.com/json/${ip}`);
  const data = (await response.json()) as {
    country?: string;
    countryCode?: string;
    city?: string;
  };

  return {
    ip: ip === "8.8.8.8" ? "Unknown" : ip,
    country: data.country ?? "Unknown",
    countryCode: data.countryCode ?? "Unknown",
    city: data.city ?? "Unknown",
  };
}

export async function getIpLocationString(request: Request) {
  const ip = extractIp(request);
  const location = await ipLocation({ ip });
  return `${ip}, ${location.city}, ${location.countryCode}`;
}
