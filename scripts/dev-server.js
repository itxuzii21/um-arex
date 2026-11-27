/* eslint-disable @typescript-eslint/no-require-imports */
const http = require("http");
const path = require("path");
const { spawn } = require("child_process");

const args = process.argv.slice(2);
const readArg = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const hostname = readArg("--hostname", "127.0.0.1");
const port = Number(readArg("--port", "3100"));
const nextPort = Number(process.env.NEXT_DEV_PORT || port + 1);
const upstreamHost = hostname === "0.0.0.0" ? "127.0.0.1" : hostname;
const saveFunctionUrl = "https://leather.um-arex.store/.netlify/functions/admin-content";
const nextBin = path.join(__dirname, "..", "node_modules", "next", "dist", "bin", "next");

const nextProcess = spawn(
  process.execPath,
  [nextBin, "dev", "--hostname", hostname, "--port", String(nextPort)],
  {
    stdio: "inherit",
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  }
);

nextProcess.on("error", (error) => {
  console.error("Could not start Next.js:", error.message);
  process.exit(1);
});

const sendJson = (response, status, payload) => {
  response.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
};

async function saveContent(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { success: false, error: "Method not allowed." });
    return;
  }

  const authorization = request.headers.authorization || "";
  if (!authorization.startsWith("Bearer ")) {
    sendJson(response, 401, {
      success: false,
      error: "Your admin session is invalid or has expired. Please sign in again.",
    });
    return;
  }

  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 5_000_000) {
      sendJson(response, 413, { success: false, error: "Save request is too large." });
      return;
    }
    chunks.push(chunk);
  }

  try {
    const result = await fetch(saveFunctionUrl, {
      method: "POST",
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
      },
      body: Buffer.concat(chunks),
      cache: "no-store",
    });
    const body = await result.text();
    response.writeHead(result.status, {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    });
    response.end(body);
  } catch {
    sendJson(response, 502, {
      success: false,
      error: "Could not reach the protected save service. Check your connection and try again.",
    });
  }
}

function proxyToNext(request, response) {
  const upstream = http.request(
    {
      hostname: upstreamHost,
      port: nextPort,
      path: request.url,
      method: request.method,
      headers: { ...request.headers, host: `${upstreamHost}:${nextPort}` },
    },
    (upstreamResponse) => {
      response.writeHead(upstreamResponse.statusCode || 502, upstreamResponse.headers);
      upstreamResponse.pipe(response);
    }
  );
  upstream.on("error", () => {
    if (!response.headersSent) response.writeHead(502, { "Content-Type": "text/plain" });
    response.end("Local development server is unavailable.");
  });
  request.pipe(upstream);
}

const server = http.createServer((request, response) => {
  if (request.url?.split("?")[0] === "/.netlify/functions/admin-content") {
    void saveContent(request, response);
    return;
  }
  proxyToNext(request, response);
});

server.on("upgrade", (request, socket, head) => {
  socket.on("error", () => socket.destroy());
  const upstream = http.request({
    hostname: upstreamHost,
    port: nextPort,
    path: request.url,
    method: request.method,
    headers: { ...request.headers, host: `${upstreamHost}:${nextPort}` },
  });

  upstream.on("upgrade", (upstreamResponse, upstreamSocket, upstreamHead) => {
    upstreamSocket.on("error", () => socket.destroy());
    const headers = Object.entries(upstreamResponse.headers)
      .map(([name, value]) => `${name}: ${value}`)
      .join("\r\n");
    socket.write(`HTTP/1.1 ${upstreamResponse.statusCode} ${upstreamResponse.statusMessage}\r\n${headers}\r\n\r\n`);
    if (head.length) upstreamSocket.write(head);
    if (upstreamHead.length) socket.write(upstreamHead);
    upstreamSocket.pipe(socket);
    socket.pipe(upstreamSocket);
  });

  upstream.on("response", (upstreamResponse) => {
    socket.write(`HTTP/1.1 ${upstreamResponse.statusCode} ${upstreamResponse.statusMessage}\r\n\r\n`);
    upstreamResponse.pipe(socket);
  });
  upstream.on("error", () => socket.destroy());
  upstream.end();
});

server.listen(port, hostname, () => {
  console.log(`Local storefront ready at http://${hostname}:${port}`);
  console.log("Localhost admin saves use the protected Netlify function.");
});

const shutdown = () => {
  server.close();
  server.closeAllConnections();
  nextProcess.kill();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
nextProcess.on("exit", (code) => {
  server.close();
  server.closeAllConnections();
  process.exit(code ?? 0);
});
