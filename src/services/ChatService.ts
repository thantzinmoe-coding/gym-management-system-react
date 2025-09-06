import axios from 'axios';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import api from './api';
import { ChatMessageRequest, ChatMessageResponse, ChatRoomResponse, TrainerResponseDto, PaginatedApiResponse, TypingIndicator } from '@/services/types';

const API_BASE = import.meta.env.REACT_APP_API_BASE || 'http://localhost:8080/api/v1';
const WS_BASE = import.meta.env.REACT_APP_WS_BASE || 'http://localhost:8080/ws';

interface WebSocketCallbacks {
  onMessage: (message: ChatMessageResponse) => void;
  onError: (error: string) => void;
  onTyping: (userId: number, userName: string) => void;
}

const axiosInstance = axios.create({
  baseURL: API_BASE,
});

export class ChatService {
  private stompClient: Client | null = null;
  private userId: number;

  constructor(userId: number) {
    this.userId = userId;
  }

  connect(callbacks: WebSocketCallbacks): void {
    if (!this.userId) {
      callbacks.onError('No user ID provided. Please log in.');
      console.error('Cannot connect to WebSocket: No user ID');
      return;
    }

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(WS_BASE),
      connectHeaders: {
        userId: String(this.userId),
      },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('WebSocket connected for userId:', this.userId);
        this.stompClient?.subscribe(`/user/queue/messages`, (msg) => {
          const payload = JSON.parse(msg.body);
          if (payload.type === 'NEW_MESSAGE') {
            callbacks.onMessage(payload.data);
          }
        });

        this.stompClient?.subscribe('/user/queue/errors', (msg) => {
          const payload = JSON.parse(msg.body);
          callbacks.onError(payload.data || 'An error occurred');
        });

        this.stompClient?.subscribe('/user/queue/typing', (msg) => {
          const payload: TypingIndicator = JSON.parse(msg.body);
          callbacks.onTyping(payload.userId, payload.userName);
        });
      },
      onStompError: (frame) => {
        callbacks.onError(`STOMP error: ${frame.body}`);
        console.error('STOMP error:', frame);
      },
      onWebSocketError: (error) => {
        callbacks.onError('WebSocket connection failed');
        console.error('WebSocket error:', error);
      },
    });

    this.stompClient.activate();
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
  }

  async getActiveTrainers(page: number = 0, size: number = 20): Promise<PaginatedApiResponse<TrainerResponseDto>> {
    const status = "active";
    const res = await api.get(`/api/v1/super_admin/all-users?status=${status}&page=${page}&size=${size}`);
    return res.data;
  }

  async getChatRooms(): Promise<ChatRoomResponse[]> {
    const res = await axiosInstance.get('/chat/rooms');
    return res.data;
  }

  async getPrivateChatHistory(otherUserId: number, page: number = 0, size: number = 50): Promise<ChatMessageResponse[]> {
    const res = await axiosInstance.get(`/chat/private/${otherUserId}?page=${page}&size=${size}`);
    return res.data.data.reverse();
  }

  async sendMessage(request: ChatMessageRequest): Promise<ChatMessageResponse> {
    const res = await axiosInstance.post('/chat/send', request);
    return res.data;
  }

  async markMessagesAsRead(senderId: number): Promise<void> {
    await axiosInstance.post('/chat/mark-read', { senderId });
  }

  async checkOnlineStatus(userIds: number[]): Promise<Record<number, boolean>> {
    const res = await axiosInstance.post('/online-status/check', userIds);
    return res.data;
  }

  sendTypingIndicator(recipientId: number): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: '/app/chat.typing',
        body: JSON.stringify({
          userId: this.userId,
          recipientId,
        }),
      });
    }
  }
}

export default ChatService;