import axios from 'axios';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import api from './api';
import { authService } from '@/services/authService';
import {
  ChatMessageRequest,
  ChatMessageResponse,
  ChatRoomResponse,
  TrainerResponseDto,
  PaginatedApiResponse,
  TypingIndicator
} from '@/services/types';

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

const user = authService.getCurrentUser();
const id = user ? user.id : null;

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

        // Subscribe to messages
        this.stompClient?.subscribe(`/user/${id}/queue/messages`, (msg) => {
          const payload = JSON.parse(msg.body);
          if (payload.type === 'NEW_MESSAGE') {
            callbacks.onMessage(payload.data);
          }
        });

        // Subscribe to errors
        this.stompClient?.subscribe('/user/queue/errors', (msg) => {
          const payload = JSON.parse(msg.body);
          callbacks.onError(payload.data || 'An error occurred');
        });

        // Subscribe to typing indicators
        this.stompClient?.subscribe(`/user/${id}/queue/typing`, (msg) => {
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
    const res = await axiosInstance.get(`/chat/rooms/${id}`);
    return res.data;
  }

  async getPrivateChatHistory(otherUserId: number, page: number = 0, size: number = 50): Promise<ChatMessageResponse[]> {
    const res = await axiosInstance.get(`/chat/private/${id}/${otherUserId}?page=${page}&size=${size}`);
    return res.data.data.reverse();
  }

  async sendMessage(request: ChatMessageRequest): Promise<ChatMessageResponse> {
    const res = await axiosInstance.post(`/chat/send/${id}`, request);
    return res.data;
  }

  async markMessagesAsRead(senderId: number): Promise<void> {
    await axiosInstance.post(`/chat/mark-read/${id}`, { senderId });
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

  // ✅ Subscribe to real-time online/offline updates
  subscribeOnlineStatus(callback: (userId: number, online: boolean) => void) {
    if (!this.stompClient) return;

    const subscribeFn = () => {
      if (!this.stompClient) return;
      this.stompClient.subscribe('/topic/online-status', (msg) => {
        const payload: Record<number, boolean> = JSON.parse(msg.body);
        Object.entries(payload).forEach(([userId, online]) => {
          callback(Number(userId), online as boolean);
        });
      });
    };

    if (this.stompClient.connected) {
      subscribeFn();
    } else {
      this.stompClient.onConnect = () => subscribeFn();
    }
  }
}

export default ChatService;
