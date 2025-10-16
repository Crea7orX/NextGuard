"use server";
import { type NextRequest, NextResponse } from "next/server";
import type { NotificationRequest } from "~/lib/validation/mobile/notifications";
import {
  getExpoPushTokenBySessionId,
  updateSessionWithExpoPushToken,
} from "~/server/db/queries/session";
import { auth } from "~/lib/auth";

// Mobile app will send expo token and auth token (from better auth) to register device
export async function PUT(req: NextRequest) {
  try {
    const data = (await req.json()) as NotificationRequest;
    const device: string = data.expoToken; //Device expo id

    // Validate session of better auth - server-side approach
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user id from session instead of hardcoded value
    const userId = session.user.id;

    // Flag to check if it is a new session and if it is we send welcome notification else not 
    //TODO:Talk with hris if we use let
    let isNewSession = true;

    try {
      // Try to get the existing Expo push token for the session
      const tempToken = await getExpoPushTokenBySessionId(session.session.id);

      if (tempToken !== device) {
        await updateSessionWithExpoPushToken(session.session.id, device); // Update session with new token
      } else {
        isNewSession = false; // Token is the same, no need to update
      }
    } catch (error) {
      // This means the session doesn't have token
      await updateSessionWithExpoPushToken(session.session.id, device); // Update session with new token
    }

    // Get the Expo push token for the session
    const expoPushToken = await getExpoPushTokenBySessionId(session.session.id);

    if (isNewSession) {
      // Send notification to welcome/test
      fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        body: JSON.stringify({
          to: expoPushToken,
          title: "Welcome to Next Guard",
          body: `Welcome ${session.user.name}!`,
          sound: "default",
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      })
        .then((response) => {
          if (!response.ok) {
            console.error(
              "Error sending push notification:",
              response.statusText,
            );
          }
        })
        .catch((error) => {
          console.error("Error sending push notification:", error);
        });
    }

    return NextResponse.json(
      { message: "Mobile device added successfully", userId },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in notification registration:", error);
    return NextResponse.json({ message: "Error" }, { status: 400 });
  }
}
