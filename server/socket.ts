import { createServer } from "http";
import { Server } from "socket.io";

const PORT = Number(process.env.SOCKET_PORT || 3001);

const httpServer = createServer((req, res) => {
  if (req.method === "POST" && req.url === "/emit/inventory") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        io.emit("inventory:update", data);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      } catch {
        res.writeHead(400);
        res.end();
      }
    });
    return;
  }
  if (req.method === "POST" && req.url === "/emit/order") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        io.emit("order:update", data);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      } catch {
        res.writeHead(400);
        res.end();
      }
    });
    return;
  }
  res.writeHead(200);
  res.end("SHOE MAFIA Socket Server");
});

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  socket.join("inventory");
  socket.join("orders");
  console.log(`Client connected: ${socket.id}`);
});

httpServer.listen(PORT, () => {
  console.log(`🔌 Socket server on http://localhost:${PORT}`);
});
