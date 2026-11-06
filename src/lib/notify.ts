import { prisma } from "./prisma";

type NotifyInput = {
  userId: string;
  title: string;
  body: string;
  href?: string;
  kind?: "INFO" | "SUCCESS" | "ACTION" | "WARNING";
  channels?: ("IN_APP" | "EMAIL" | "SMS")[];
};

/**
 * Records a notification. In-app delivery is immediate (the bell polls).
 * Email and SMS go through adapters; in the prototype they are logged.
 */
export async function notify(input: NotifyInput) {
  const channels = input.channels ?? ["IN_APP", "EMAIL"];
  const n = await prisma.notification.create({
    data: {
      userId: input.userId,
      title: input.title,
      body: input.body,
      href: input.href,
      kind: input.kind ?? "INFO",
      channels: channels.join(","),
    },
  });
  if (channels.includes("EMAIL") || channels.includes("SMS")) {
    // Adapter seam: plug in SMTP / Resend and a Botswana SMS gateway here.
    if (process.env.NODE_ENV !== "production") {
      console.log(`[sky:notify] ${channels.join("+")} -> ${input.userId}: ${input.title}`);
    }
  }
  return n;
}

export async function notifyMany(userIds: string[], input: Omit<NotifyInput, "userId">) {
  await Promise.all(userIds.map((userId) => notify({ ...input, userId })));
}
