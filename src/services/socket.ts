import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import Cookies from "js-cookie";

const token = Cookies.get('token'); // ✅ get your JWT token from local storage

const client = new Client({
  webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_BASE_URL),
  connectHeaders: {
    Authorization: `Bearer ${token}`, // ✅ send token during connect
  },
  reconnectDelay: 5000,
  debug: () => {}, // STOMP debug output includes the CONNECT frame with the Bearer token
});

export default client;
