import { serverEnv } from "@repo/env/server-env";
import { Queue } from "bullmq";
import type { EmailAnalysisJobType } from "./analysis.queue.type";

export const EMAIL_ANALYSIS_QUEUE = "email-analysis";

const EMAIL_ANALYSIS_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 2_000,
  },
  removeOnComplete: {
    age: 3_600,
    count: 1_000,
  },
  removeOnFail: {
    age: 86_400,
  },
};

const emailAnalysisQueue = new Queue<EmailAnalysisJobType>(
  EMAIL_ANALYSIS_QUEUE,
  {
    connection: {
      url: serverEnv.REDIS_URL,
      maxRetriesPerRequest: null,
    },
    defaultJobOptions: EMAIL_ANALYSIS_JOB_OPTIONS,
  },
);

export const enqueueEmailAnalysis = async (
  jobs: EmailAnalysisJobType[],
): Promise<number> => {
  if (jobs.length === 0) return 0;

  await emailAnalysisQueue.addBulk(
    jobs.map((data) => ({ name: "analyze", data })),
  );

  return jobs.length;
};
