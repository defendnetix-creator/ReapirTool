import express from "express";
import { localPort, loopbackSecurity, setListeningPort } from "./server/operations/security.js";
import path from "path";
import { licensingRouter } from "./server/licensing/routes.js";
import { updatesRouter } from "./server/updates/routes.js";
import { paymentsRouter } from "./server/payments/routes.js";
import { operationsRouter } from "./server/operations/routes.js";

async function startServer() {
  const app = express();
  const PORT = localPort;

  app.use(loopbackSecurity);
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
      version: process.env.AKSHIGO_DESKTOP_HOST === '1' ? '8.0.0-test.1' : '8.0.0-rc.1',
      instance: process.env.AKSHIGO_HOST_INSTANCE || null,
      service: "Licensing Authority, Razorpay Payment Gateway & Release Update Bridge",
      paymentMode: "TEST",
      timestamp: new Date().toISOString()
    });
  });

  // Licensing Authority API endpoints
  if (process.env.AKSHIGO_DESKTOP_HOST === '1') {
    app.use(['/api/v1/licenses', '/api/v1/payments', '/api/v1/updates'], (_req, res) => res.status(503).json({ error: 'Purchases, license issuance and updates are disabled in this local test build.' }));
  }
  app.use("/api/v1/licenses", licensingRouter);

  // Razorpay Payment Gateway & Fulfillment endpoints
  app.use("/api/v1/payments", paymentsRouter);

  // Secure Release Updates API endpoints
  app.use("/api/v1/updates", updatesRouter);

  // Hardened Operations Engine (Windows Repair, Network, Printer Parity)
  app.use("/api/v1/operations", operationsRouter);

  // Vite middleware for development vs static dist for production
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import('vite');
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

  const server = app.listen(PORT, "127.0.0.1", () => {
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('No listening address.');
    setListeningPort(address.port);
    console.log(`Akshigo PC Toolkit Pro server running on http://127.0.0.1:${address.port}`);
    if (process.env.AKSHIGO_DESKTOP_HOST === '1') console.log('AKSHIGO_READY ' + JSON.stringify({ port: address.port, instance: process.env.AKSHIGO_HOST_INSTANCE }));
  });
  if (process.env.AKSHIGO_DESKTOP_HOST === '1') {
    // The host owns this stdin pipe. Never leave its backend listening after host loss.
    process.stdin.resume();
    process.stdin.on('end', () => server.close(() => process.exit(0)));
  }
}

startServer();
