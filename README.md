# Real-Time Stock Market Feed

This project demonstrates three methods for real-time data streaming: Short Polling, WebSockets, and Server-Sent Events (SSE). It includes a server built with [Hono](https://hono.dev/) and a React client that visualizes stock data using [ShadCN Charts](https://ui.shadcn.com/charts). 
The app serves as a learning tool to explore different real-time data handling techniques, expanded upon in [this article](https://dev.to/itaybenami/sse-websockets-or-polling-build-a-real-time-stock-app-with-react-and-hono-1h1g).

---

## Project Structure

/client - The react client code <br />
/server - The hono server code <br />
/server/static - The built client code, used for deployment on [railway](https://railway.app/)

---

## Installation

1. Clone the repository:
 ```bash
 git clone https://github.com/ItayBen-Ami/stock-market-feed.git
 cd stock-market-feed
 ```
2. Install dependencies for both server and client:
```bash
cd server && npm install && cd ../client && npm install && cd ..
```
## Running the App

1. Start the dev server
```bash
cd server && npm run dev
```
2. Start the client
```bash
cd client && npm run dev
```

