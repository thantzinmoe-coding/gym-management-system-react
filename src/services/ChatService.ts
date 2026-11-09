// src/services/ChatService.ts
import api from './api';
import client from './socket';

export interface ChatMessageDto {
    id?: number;
    senderId: number;
    recipientId: number;
    senderName?: string;
    content: string;
    createdAt?: string;
}

export interface ChatRoomDto {
    id: number;
    otherUserId: number;
    otherUserName: string;
    otherUserEmail?: string;
    otherUserRole?: string;
    avatarUrl?: string;
    isAssigned?: boolean;
    lastMessage?: ChatMessageDto;
}

export class ChatService {
    private token: string;

    constructor(token: string = '') {
        this.token = token;
    }

    // ==========================================
    // 1. REST API FETCH METHODS
    // ==========================================
    public async getChatContacts(userId: number, role?: string): Promise<ChatRoomDto[]> {
        try {
            const response = await api.get(`/api/chat/contacts/${userId}`, {
                params: role ? { role } : undefined,
            });
            return Array.isArray(response.data) ? response.data : (response.data?.data || []);
        } catch (error) {
            console.error("Error fetching chat contacts:", error);
            return this.getUserRooms(userId);
        }
    }

    public async getUserRooms(userId: number): Promise<ChatRoomDto[]> {
        try {
            const response = await api.get(`/api/chat/rooms/${userId}`);
            // Safely return the array, unwrapping 'data' if Spring Boot wrapped it
            return Array.isArray(response.data) ? response.data : (response.data?.data || []);
        } catch (error) {
            console.error("Error fetching rooms:", error);
            return [];
        }
    }

    public async getChatHistory(userId: number, otherUserId: number): Promise<ChatMessageDto[]> {
        try {
            const response = await api.get(`/api/chat/history/${userId}/${otherUserId}`);
            return Array.isArray(response.data) ? response.data : (response.data?.data || []);
        } catch (error) {
            console.error("Error fetching history:", error);
            return [];
        }
    }

    // ==========================================
    // 2. SEND MESSAGE (REST + WEBSOCKET BROADCAST)
    // ==========================================
    public async sendMessage(recipientId: number, content: string, senderId?: number): Promise<ChatMessageDto | null> {
        try {
            const response = await api.post('/api/chat/send', {
                senderId,
                recipientId,
                content,
            });
            return response.data?.data || response.data || null;
        } catch (error) {
            console.error("REST send failed, falling back to WebSocket:", error);
            if (client.active && client.connected) {
                client.publish({
                    destination: '/app/chat.send',
                    body: JSON.stringify({ senderId, recipientId, content }),
                });
            } else {
                console.warn("Cannot send message: WebSocket is not connected.");
            }
            return null;
        }
    }
}
