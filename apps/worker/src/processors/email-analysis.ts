import { classifyEmail } from "@repo/ai";
import { prisma } from "@repo/db";
import { workerEnv } from "@repo/env/worker-env";
import { type EmailAnalysisJobType } from "../lib/queue.type";
import { type Job } from "bullmq";

const BODY_LIMIT = 20_000;

const extractAddress = (value: string): string => {
  const match = /<([^>]+)>/.exec(value);
  const address = (match?.[1] ?? value).trim();

  return address || "unknown@example.com";
};

export const processEmailAnalysis = async (
  job: Job<EmailAnalysisJobType>,
): Promise<{ processed: boolean }> => {
  const { emailId, userId } = job.data;

  const email = await prisma.email.findFirst({
    where: { id: emailId, userId },
    select: {
      id: true,
      sender: true,
      subject: true,
      body: true,
      receivedAt: true,
      status: true,
    },
  });

  if (!email) {
    throw new Error(`Email ${emailId} not found`);
  }

  if (email.status === "COMPLETED") {
    return { processed: false };
  }

  await prisma.email.update({
    where: { id: email.id },
    data: { status: "PROCESSING" },
  });

  const analysis = await classifyEmail(
    {
      sender: extractAddress(email.sender),
      subject: email.subject,
      body: email.body.slice(0, BODY_LIMIT),
      receivedAt: email.receivedAt,
    },
    {
      apiKey: workerEnv.GEMINI_API_KEY,
      model: workerEnv.GEMINI_MODEL,
    },
  );

  await prisma.$transaction([
    prisma.emailAnalysis.upsert({
      where: { emailId: email.id },
      create: { emailId: email.id, ...analysis },
      update: { ...analysis },
    }),
    prisma.email.update({
      where: { id: email.id },
      data: { status: "COMPLETED" },
    }),
  ]);

  return { processed: true };
};
