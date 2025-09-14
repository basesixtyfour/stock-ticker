#!/usr/bin/env node
import amqp from "amqp";
import yahooFinance from "yahoo-finance2";

class Stocks {
  async lookupByArray(stocks) {
    try {
      const results = await Promise.all(
        stocks.map(async (symbol) => {
          const quote = await yahooFinance.quote(`${symbol}`);
          return {
            symbol: quote.symbol,
            price: quote.regularMarketPrice,
          };
        })
      );
      return results;
    } catch (error) {
      console.error("Stock lookup failed:", error);
      return [];
    }
  }
}

const main = () => {
  const connection = amqp.createConnection({
    host: "localhost",
    login: "websockets",
    password: "rabbitmq",
  });

  const stocks = new Stocks();

  connection.on("ready", () => {
    connection.queue(
      "stocks.work",
      { autoDelete: false, durable: true },
      (q) => {
        q.subscribe(async (message) => {
          const jsonData = message.data.toString("utf8");

          let data;
          try {
            data = JSON.parse(jsonData);
          } catch (err) {
            console.error("Invalid JSON:", err);
            return;
          }

          const stocksResult = await stocks.lookupByArray(data.stocks);
          const dataStr = JSON.stringify(stocksResult);

          connection.publish("stocks.result", dataStr, { deliveryMode: 2 });
        });
      },
    );
  });
};

// Run only if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
