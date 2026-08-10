export const processJobQueue = async (job) => {
  return { status: 'COMPLETED', jobId: job.id };
};
