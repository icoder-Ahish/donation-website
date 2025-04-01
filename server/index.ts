import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import connectToDatabase from "./mongodb";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Create the equivalent of __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Set a timeout to prevent app from hanging forever if MongoDB connection fails
  let mongoConnectionTimeout: NodeJS.Timeout;
  const timeoutPromise = new Promise((_, reject) => {
    mongoConnectionTimeout = setTimeout(() => {
      reject(new Error("MongoDB connection timeout - proceeding with application startup"));
    }, 5000);
  });
  
  try {
    // Try to connect to MongoDB with a timeout
    await Promise.race([
      connectToDatabase(),
      timeoutPromise
    ]);
  } catch (error: any) {
    log(`MongoDB connection issue: ${error?.message || 'Unknown error'}`, "warn");
    log("Continuing with application startup without waiting for MongoDB connection", "warn");
  } finally {
    clearTimeout(mongoConnectionTimeout!);
  }
  
  // Load SSL certificates
  const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, '../certs/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../certs/cert.pem')),
  };
  
  // Create HTTPS server
  const server = https.createServer(httpsOptions, app);
  
  await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving HTTPS on port ${port}`);
  });
})();
