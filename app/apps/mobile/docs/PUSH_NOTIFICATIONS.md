# Sending Push Notifications with Expo (General Guide)

This guide describes how to send push notifications to Expo clients using Expo's HTTP API. It is language-agnostic and contains curl and Node.js fetch examples.

## Overview

- Expo provides a push notification service at: `https://exp.host/--/api/v2/push/send`
- You send an array of message objects in one POST request.
- The API returns "tickets" for each message; tickets can later be checked for delivery receipts.

## Expo Push Tokens

- Format: `ExponentPushToken[some-identifier]`
- Always validate locally that tokens match the expected prefix before sending.
- Invalid/unregistered tokens will produce errors in receipts.

## Message JSON Schema (per message)

Common fields:

- `to` (string) — the Expo push token (required)
- `title` (string) — visible notification title
- `body` (string) — visible notification body
- `data` (object) — custom payload delivered to your app
- `sound` (string|boolean) — e.g., "default" or false
- `badge` (number) — iOS badge number
- `priority` (string) — "default", "normal", or "high"
- `channelId` (string) — Android notification channel id

Example single message:

```json
{
  "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "title": "Hello",
  "body": "This is a test",
  "data": { "foo": "bar" },
  "priority": "high"
}
```

## Send (curl example)

Send up to 100 messages per request. Use JSON array body.

curl:

```bash
curl -X POST https://exp.host/--/api/v2/push/send \
  -H "Content-Type: application/json" \
  -d '[{"to":"ExponentPushToken[xxxxx]","title":"Hi","body":"Test"}]'
```

If you have an Expo access token (optional for some setups), include:

```bash
-H "Authorization: Bearer <EXPO_ACCESS_TOKEN>"
```

## Send (Node.js fetch example)

Fetch example (Node or Deno):

```javascript
const messages = [{ to: "ExponentPushToken[xxxx]", title: "Hi", body: "Test" }];

fetch("https://exp.host/--/api/v2/push/send", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(messages),
})
  .then((r) => r.json())
  .then((result) => console.log(result))
  .catch((err) => console.error("Send error", err));
```

You can also use the official expo-server-sdk for convenience in Node.js for batching and validation.

## Tickets and Receipts

- The send endpoint returns tickets containing either an "id" or an "error" for each message.
- To check final delivery status, POST the array of ticket ids to:

  `https://exp.host/--/api/v2/push/getReceipts`

  Body: `{ "ids": ["ticketId1", "ticketId2", ...] }`

- Receipts may contain errors like "DeviceNotRegistered", which indicate you should remove that token.

## Error Handling & Retries

- Handle transient HTTP errors and 5xx responses with exponential backoff.
- Respect 429 (Too Many Requests) and inspect Retry-After headers if provided.
- For partial failures, inspect per-message results (tickets array) and retry only failed messages.

## Rate Limits & Batching

- Batch messages (<=100 per request) to reduce overhead.
- Implement throttling/backoff when sending large volumes to avoid throttling by Expo.

## Security & Best Practices

- Keep access tokens/credentials out of source control; use environment variables or secret stores.
- Sanitize and limit size of `data` payloads.
- Use meaningful data keys for in-app routing/deep linking.
- Monitor and log ticket and receipt responses for diagnostics.

## Quick Checklist Before Sending

- Validate token format.
- Batch up to 100 messages.
- Send to /push/send with JSON array.
- Store ticket ids and fetch receipts later.
- Remove tokens reported as unregistered.

## References

- Expo Push Notifications docs: https://docs.expo.dev/push-notifications/
- Expo API endpoints:
  - Send: POST https://exp.host/--/api/v2/push/send
  - Receipts: POST https://exp.host/--/api/v2/push/getReceipts
