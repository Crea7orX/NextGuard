import { db } from "~/server/db";
import { session } from "~/server/db/schemas/session";
import { eq } from "drizzle-orm";

export async function updateSessionWithExpoPushToken(
  sessionId: string, 
  mobileExpoPushToken: string
) {
  try {
    const updatedSession = await db
      .update(session)
      .set({ 
        mobileExpoPushToken,
        updatedAt: new Date()
      })
      .where(eq(session.id, sessionId))
      .returning();
    return updatedSession[0];
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating session with Expo push token:", error.message);
      throw error;
    } else {
      console.error("Error updating session with Expo push token:", error);
      throw new Error("Unknown error occurred while updating session with Expo push token.");
    }
  }
}

//Get expo push token by session id
export async function getExpoPushTokenBySessionId(sessionId: string) {
    try {
        const [sess] = await db
            .select()
            .from(session)
            .where(eq(session.id, sessionId))
            .limit(1);
        return sess?.mobileExpoPushToken ?? null;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error fetching Expo push token by session ID:", error.message);
            throw error;
        } else {
            console.error("Error fetching Expo push token by session ID:", error);
            throw new Error("Unknown error occurred while fetching Expo push token by session ID.");
        }
    }
}