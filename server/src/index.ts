import { createNodeWebSocket } from "@hono/node-ws";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { streamSSE } from "hono/streaming";
import { EventEmitter } from "node:events";

const app = new Hono();

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

app.use(
  "*",
  cors({
    origin: "http://localhost:5173",
    allowMethods: ["GET", "POST"],
    allowHeaders: ["Content-Type"],
    credentials: true,
  }),
);
let stocks = [
  { name: "Apple", symbol: "AAPL", price: 3000, time: Date.now() },
  { name: "Google", symbol: "GOOGL", price: 2800, time: Date.now() },
  { name: "Amazon", symbol: "AMZN", price: 3500, time: Date.now() },
];

function getStockPriceChange() {
  const possibleValues = [];
  for (let i = -300; i <= 300; i += 10) {
    if (i !== 0) {
      possibleValues.push(i);
    }
  }
  const randomIndex = Math.floor(Math.random() * possibleValues.length);
  return possibleValues[randomIndex];
}

const eventEmitter = new EventEmitter();

const updateStockPrices = () => {
  stocks = stocks.map((stock) => ({
    ...stock,
    price: Math.abs(stock.price + getStockPriceChange()),
    time: Date.now(),
  }));

  eventEmitter.emit("stocksUpdated");
  scheduleNextUpdate();
};

const scheduleNextUpdate = () => {
  const updateInterval = Math.floor(Math.random() * 4000 + 1000);
  setTimeout(updateStockPrices, updateInterval);
};

scheduleNextUpdate();

app.get("/stocks", (c) => {
  return c.json({ stocks });
});

app.get(
  "/stocks-ws",
  upgradeWebSocket((c) => {
    let sendEventsToClient = () => {};

    return {
      onOpen(_, ws) {
        sendEventsToClient = () => {
          ws.send(JSON.stringify({ stocks }));
        };

        eventEmitter.on("stocksUpdated", sendEventsToClient);

        ws.send(JSON.stringify({ stocks }));
      },
      onClose: () => {
        eventEmitter.off("stocksUpdated", sendEventsToClient);
      },
    };
  }),
);

app.get("/stocks-sse", async (c) => {
  return streamSSE(c, async (stream) => {
    const sendEventToClient = async () => {
      await stream.writeSSE({ data: JSON.stringify({ stocks }) });
    };

    eventEmitter.on("stocksUpdated", sendEventToClient);

    stream.writeSSE({ data: JSON.stringify({ stocks }) });

    stream.onAbort(() => {
      eventEmitter.off("message", sendEventToClient);
    });

    while (true) {
      await stream.sleep(200);
    }
  });
});

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

const server = serve({
  fetch: app.fetch,
  port,
});

injectWebSocket(server);
