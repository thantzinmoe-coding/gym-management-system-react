import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const socketUrl = "http://localhost:8080/ws";

const client = new Client({
  webSocketFactory: () => new SockJS(socketUrl),
  reconnectDelay: 5000,
  onConnect: () => {
    console.log("✅ Connected to WebSocket");
  },
  onStompError: (frame) => {
    console.error("❌ Broker error:", frame.headers["message"]);
  },
});

export default client;
