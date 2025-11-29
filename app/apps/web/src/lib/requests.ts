import https from "https";
import { env } from "~/env";

const httpsAgent =
  env.NODE_ENV === "development"
    ? new https.Agent({
        rejectUnauthorized: false,
      })
    : undefined;

interface Props {
  method?: string;
  path: string;
  body?: any;
}

export async function sendRequest({ method = "GET", path, body }: Props) {
  try {
    const fetchOptions: RequestInit & { agent?: https.Agent } = {
      method,
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.WEBSOCKET_SECRET_KEY}`,
      },
    };

    if (httpsAgent) {
      fetchOptions.agent = httpsAgent;
    }

    const response = await fetch(
      `${env.WEBSOCKET_SERVER_URL}${path}`,
      fetchOptions,
    );

    if (!response.ok) {
      return {
        success: false,
        error: response.statusText,
        code: response.status,
      };
    }

    return {
      success: true,
      data: (await response.json()).data,
      code: response.status,
    };
  } catch {
    return {
      success: false,
      error: "Internal Server Error",
      code: 500,
    };
  }
}
