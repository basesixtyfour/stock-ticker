import { WebSocketServer } from "ws";
import { v7 as uuid } from "uuid";
import amqp from "amqp";
import Stomp from "./stomp_helper.js";

// Global storage
const stocks = {}; // { sessionId: { ws, subscriptions: Map<symbol, price> } }
const connected_sessions = [];

// AMQP connection
const connection = amqp.createConnection({
  host: "localhost",
  login: "websockets",
  password: "rabbitmq",
});

connection.on("ready", () => {
  connection.queue("stocks.result", { autoDelete: false, durable: true }, (q) =>
    q.subscribe(onMessage),
  );
});

function onMessage(msg) {
  let data;
  try {
    data = JSON.parse(msg.data.toString("utf8"));
  } catch (err) {
    return console.error("Invalid JSON from RabbitMQ:", err);
  }
  data.forEach(updateClients);
}

function updateClients(update) {
  for (const clientId of Object.keys(stocks)) {
    const client = stocks[clientId];
    if (!client.ws) continue;

    if (client.subscriptions.has(update.symbol)) {
      client.subscriptions.set(update.symbol, update.price);

      Stomp.sendFrame(client.ws, {
        command: "MESSAGE",
        headers: {
          destination: `/queue/stocks.${update.symbol}`,
          subscription: `sub-${update.symbol}`,
          "message-id": Date.now().toString()
        },
        content: JSON.stringify({ price: parseFloat(update.price) }),
      });
    }
  }
}

// Periodic worker
const updater = setInterval(() => {
  const st = [];

  for (const clientId of Object.keys(stocks)) {
    for (const symbol of stocks[clientId].subscriptions?.keys?.() || []) {
      st.push(symbol);
    }
  }

  if (st.length > 0) {
    connection.publish("stocks.work", JSON.stringify({ stocks: st }), {
      deliveryMode: 2,
    });
  }
}, 10_000);

// WebSocket server
const wss = new WebSocketServer({
  port: 8181,
  handleProtocols: (protocols) => {
    if (protocols.has("v10.stomp")) {
      return "v10.stomp";
    }

    return false;
  },
});

wss.on("connection", (ws) => {
  const sessionId = uuid();
  const sessionStocks = new Map();

  stocks[sessionId] = { ws, subscriptions: sessionStocks };
  connected_sessions.push(ws);

  const symbolFromId = (id) =>
    id.substring(id.indexOf(".") + 1);

  const closeSocket = () => {
    if (stocks[sessionId]?.ws) {
      stocks[sessionId].ws.close();
    }
    delete stocks[sessionId];
  };

  ws.on("message", (message) => {
    const frame = Stomp.processFrame(message);
    const { command, headers } = frame;

    switch (command) {
      case "CONNECT":
        Stomp.sendFrame(ws, {
          command: "CONNECTED",
          headers: { session: sessionId },
          content: "",
        });
        break;

      case "SUBSCRIBE": {
        const symbol = symbolFromId(headers.id);
        sessionStocks.set(symbol, 0);
        break;
      }

      case "UNSUBSCRIBE": {
        console.log("UNSUBSCRIBE: ", headers);
        const symbol = symbolFromId(headers.id);
        sessionStocks.delete(symbol);
        break;
      }

      case "DISCONNECT":
        console.log("Disconnecting");
        closeSocket();
        break;

      default:
        Stomp.sendError(ws, "No valid command frame");
        break;
    }
  });

  ws.on("close", () => closeSocket());

  process.on("SIGINT", () => {
    console.log("Closing via break");
    closeSocket();
    process.exit();
  });
});
