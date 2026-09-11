import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

const ROOT = process.cwd();
const DB_REL = "data/db.json";
const DB_PATH = path.join(ROOT, DB_REL);

function applyCors(res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Private-Network", "true");
}

function send(res: ServerResponse, status: number, body: unknown) {
  applyCors(res);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function run(args: string[]): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn("git", args, {
      cwd: ROOT,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0 || code === 1) resolve(code ?? 1);
      else reject(new Error(stderr.trim() || `git ${args.join(" ")} exited ${code}`));
    });
  });
}

async function publishDb() {
  await run(["add", "--", DB_REL]);
  const diff = await run(["diff", "--cached", "--quiet", "--", DB_REL]);
  if (diff === 0) return;
  await run(["commit", "-m", "حدّث بيانات الموقع من لوحة التحكم."]);
  await run(["push"]);
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

export function tawoosDbPlugin(): Plugin {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending = false;

  function queuePublish() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      pending = true;
      void publishDb()
        .catch((error) => {
          console.error("[tawoos-db] git publish failed:", error);
        })
        .finally(() => {
          pending = false;
        });
    }, 1500);
  }

  const handler = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = req.url?.split("?")[0] ?? "";
    if (url !== "/__tawoos/db") {
      next();
      return;
    }

    if (req.method === "OPTIONS") {
      applyCors(res);
      res.statusCode = 204;
      res.end();
      return;
    }

    try {
      if (req.method === "GET") {
        const raw = await readFile(DB_PATH, "utf8");
        applyCors(res);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(raw);
        return;
      }

      if (req.method !== "POST") {
        send(res, 405, { ok: false, error: "method not allowed" });
        return;
      }

      const parsed = JSON.parse(await readBody(req)) as Record<string, unknown>;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        send(res, 400, { ok: false, error: "invalid store" });
        return;
      }

      await mkdir(path.dirname(DB_PATH), { recursive: true });
      await writeFile(DB_PATH, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
      send(res, 200, { ok: true });
      queuePublish();
    } catch (error) {
      send(res, 500, {
        ok: false,
        error: error instanceof Error ? error.message : "save failed",
      });
    }
  };

  return {
    name: "tawoos-db",
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
    closeBundle() {
      if (timer) clearTimeout(timer);
      if (pending) return;
    },
  };
}
