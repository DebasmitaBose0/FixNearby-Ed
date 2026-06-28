let requestCount = 0;
const requestTimings = [];
const startTime = Date.now();

export const requestMonitor = (req, res, next) => {
  requestCount++;
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    requestTimings.push({
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration,
      timestamp: new Date().toISOString()
    });

    if (requestTimings.length > 10000) {
      requestTimings.splice(0, requestTimings.length - 10000);
    }
  });

  next();
};

export const getMonitoringStats = () => {
  const now = Date.now();
  const uptimeSeconds = Math.floor((now - startTime) / 1000);

  const recentRequests = requestTimings.filter(t => now - new Date(t.timestamp).getTime() < 60000);
  const avgResponseTime = recentRequests.length > 0
    ? Math.round(recentRequests.reduce((sum, r) => sum + r.duration, 0) / recentRequests.length)
    : 0;

  const statusCounts = {};
  recentRequests.forEach(r => {
    const category = String(r.status).charAt(0) + 'xx';
    statusCounts[category] = (statusCounts[category] || 0) + 1;
  });

  return {
    totalRequests: requestCount,
    uptime: uptimeSeconds,
    recentStats: {
      requestsLastMinute: recentRequests.length,
      averageResponseTimeMs: avgResponseTime,
      statusBreakdown: statusCounts
    }
  };
};

export { requestTimings };
