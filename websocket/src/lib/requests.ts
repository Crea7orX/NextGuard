import { env } from "~/env";

interface sendRequestProps {
  method?: string;
  path: string;
  body?: any;
}

export async function sendRequest({
  method = "GET",
  path,
  body,
}: sendRequestProps) {
  try {
    const response = await fetch(`${env.API_SERVER}${path}`, {
      method,
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.API_SECRET_KEY}`,
      },
    });

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
  } catch (error) {
    return {
      success: false,
      error: "Internal Server Error",
      code: 500,
    };
  }
}
