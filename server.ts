import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { licensingRouter } from "./server/licensing/routes.js";
import { updatesRouter } from "./server/updates/routes.js";
import { paymentsRouter } from "./server/payments/routes.js";
import { operationsRouter } from "./server/operations/routes.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Capture raw body for webhook HMAC-SHA256 signature verification
  app.use(
    express.json({
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      }
    })
  );

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      app: "Akshigo PC Toolkit Pro",
      version: "8.0.0-rc.1",
      service: "Licensing Authority, Razorpay Payment Gateway & Release Update Bridge",
      paymentMode: "TEST",
      timestamp: new Date().toISOString()
    });
  });

  // Licensing Authority API endpoints
  app.use("/api/v1/licenses", licensingRouter);

  // Razorpay Payment Gateway & Fulfillment endpoints
  app.use("/api/v1/payments", paymentsRouter);

  // Secure Release Updates API endpoints
  app.use("/api/v1/updates", updatesRouter);

  // Hardened Operations Engine (Windows Repair, Network, Printer Parity)
  app.use("/api/v1/operations", operationsRouter);

  // Vite middleware for development vs static dist for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Akshigo PC Toolkit Pro server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
