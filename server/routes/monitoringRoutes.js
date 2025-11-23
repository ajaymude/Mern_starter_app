import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import os from "os";

const router = express.Router();

// @desc    Health check endpoint
// @route   GET /api/monitoring/health
// @access  Public
router.get(
  "/health",
  asyncHandler(async (req, res) => {
    res.status(200).json({
      status: "success",
      message: "Server is healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    });
  })
);

// @desc    System metrics endpoint
// @route   GET /api/monitoring/metrics
// @access  Public (should be protected in production)
router.get(
  "/metrics",
  asyncHandler(async (req, res) => {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    res.status(200).json({
      status: "success",
      data: {
        process: {
          uptime: process.uptime(),
          memory: {
            rss: `${Math.round((memUsage.rss / 1024 / 1024) * 100) / 100} MB`,
            heapTotal: `${Math.round((memUsage.heapTotal / 1024 / 1024) * 100) / 100} MB`,
            heapUsed: `${Math.round((memUsage.heapUsed / 1024 / 1024) * 100) / 100} MB`,
            external: `${Math.round((memUsage.external / 1024 / 1024) * 100) / 100} MB`,
          },
          cpu: {
            user: `${Math.round(cpuUsage.user / 1000)} ms`,
            system: `${Math.round(cpuUsage.system / 1000)} ms`,
          },
        },
        system: {
          platform: os.platform(),
          arch: os.arch(),
          cpus: os.cpus().length,
          totalMemory: `${Math.round((os.totalmem() / 1024 / 1024 / 1024) * 100) / 100} GB`,
          freeMemory: `${Math.round((os.freemem() / 1024 / 1024 / 1024) * 100) / 100} GB`,
          loadAverage: os.loadavg(),
        },
      },
    });
  })
);

export default router;
