import mongoose from 'mongoose';
import os from 'os';
import { performance } from 'perf_hooks';

const startTime = Date.now();

export const getHealth = async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: uptimeSeconds,
      human: formatUptime(uptimeSeconds)
    },
    database: {
      status: dbStatus[dbState] || 'unknown',
      state: dbState,
      host: mongoose.connection.host || null,
      name: mongoose.connection.name || null
    },
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      memoryUsage: {
        rss: formatBytes(process.memoryUsage().rss),
        heapTotal: formatBytes(process.memoryUsage().heapTotal),
        heapUsed: formatBytes(process.memoryUsage().heapUsed)
      },
      cpuLoad: os.loadavg(),
      freeMemory: formatBytes(os.freemem()),
      totalMemory: formatBytes(os.totalmem()),
      cpus: os.cpus().length
    }
  };

  const statusCode = dbState === 1 ? 200 : 503;
  return res.status(statusCode).json({
    success: statusCode === 200,
    ...healthData
  });
};

export const getReadiness = async (req, res) => {
  const dbState = mongoose.connection.readyState;

  if (dbState !== 1) {
    return res.status(503).json({
      success: false,
      status: 'not ready',
      reason: 'Database not connected'
    });
  }

  return res.status(200).json({
    success: true,
    status: 'ready'
  });
};

export const getServerInfo = async (req, res) => {
  res.status(200).json({
    success: true,
    name: 'FixNearby API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    description: 'Hyperlocal service marketplace connecting users with skilled professionals'
  });
};

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  return parts.join(' ');
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}
