export const EMAIL_ANALYSIS_QUEUE = "email-analysis";

export const EMAIL_ANALYSIS_JOB_OPTIONS = {
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
