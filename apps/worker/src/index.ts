import { AiError } from "@repo/ai";
import { prisma } from "@repo/db";
import { workerEnv } from "@repo/env/worker-env";
import { EMAIL_ANALYSIS_QUEUE, type EmailAnalysisJobType } from "./lib/queue";
import { type Job, Worker } from "bullmq";
import { redisClient } from "./lib/redis";
import { processEmailAnalysis } from "./processors/email-analysis";

const resetStuckEmails = async (): Promise<void> => {
  const { count } = await prisma.email.updateMany({
    where: { status: "PROCESSING" },
    data: { status: "PENDING" },
  });

  if (count > 0) {
    console.log(`[worker] reset ${count} stuck email(s) to PENDING`);
  }
};

const describeError = (error: unknown): string => {
  if (!(error instanceof Error)) return String(error);

  const cause = error.cause instanceof Error ? ` | cause: ${error.cause.message}` : "";

  return `${error.name}: ${error.message}${cause}`;
};

const markFailed = async (
  job: Job<EmailAnalysisJobType> | undefined,
  error: Error,
): Promise<void> => {
  if (!job) return;

  const attempts = job.opts.attempts ?? 1;
  const isFinalAttempt = job.attemptsMade >= attempts;

  console.error(
    `[email-analysis] failed ${job.id} (${job.data.emailId}) attempt ${job.attemptsMade}/${attempts}: ${describeError(error)}`,
    error instanceof AiError ? error.code : undefined,
  );

  if (isFinalAttempt) {
    await prisma.email.updateMany({
      where: { id: job.data.emailId },
      data: { status: "FAILED" },
    });
  }
};

await resetStuckEmails();

const worker = new Worker<EmailAnalysisJobType>(
  EMAIL_ANALYSIS_QUEUE,
  processEmailAnalysis,
  {
    connection: redisClient,
    concurrency: workerEnv.WORKER_CONCURRENCY,
  },
);

worker.on("completed", (job) => {
  console.log(`[email-analysis] completed ${job.id} (${job.data.emailId})`);
});

worker.on("failed", (job, error) => {
  void markFailed(job, error);
});

worker.on("error", (error) => {
  console.error("[worker] error", error);
});

const shutdown = async (signal: string): Promise<void> => {
  console.log(`[worker] ${signal} received, shutting down`);

  await worker.close();
  await redisClient.quit();
  await prisma.$disconnect();
};

process.once("SIGINT", () => {
  void shutdown("SIGINT");
});

process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});

console.log(
  `[worker] listening on "${EMAIL_ANALYSIS_QUEUE}" (concurrency ${workerEnv.WORKER_CONCURRENCY})`,
);
