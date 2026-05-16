// src/services/ChatService.ts
import axios from 'axios';
import client from './socket';

export class ChatService {
    private token: string;
    private baseUrl = `${import.meta.env.VITE_API_BASE_URL}/api/chat`; // Make sure this matches your backend

    constructor(token: string) {
        this.token = token;
    }

    // ==========================================
    // 1. REST API FETCH METHODS (AXIOS)
    // ==========================================
    public async getUserRooms(userId: number) {
        try {
            const response = await axios.get(`${this.baseUrl}/rooms/${userId}`, {
                headers: { Authorization: `Bearer ${this.token}` }
            });
            // Safely return the array, unwrapping 'data' if Spring Boot wrapped it
            return Array.isArray(response.data) ? response.data : (response.data?.data || []);
        } catch (error) {
            console.error("Error fetching rooms:", error);
            return [];
        }
    }

    public async getChatHistory(userId: number, otherUserId: number) {
        try {
            const response = await axios.get(`${this.baseUrl}/history/${userId}/${otherUserId}`, {
                headers: { Authorization: `Bearer ${this.token}` }
            });
            return Array.isArray(response.data) ? response.data : (response.data?.data || []);
        } catch (error) {
            console.error("Error fetching history:", error);
            return [];
        }
    }

    // ==========================================
    // 2. WEBSOCKET METHODS (USING GLOBAL SOCKET)
    // ==========================================
    public sendMessage(recipientId: number, content: string) {
        if (client.active && client.connected) {
            client.publish({
                destination: '/app/chat.send', // Ensure this matches your @MessageMapping in Spring Boot
                body: JSON.stringify({ recipientId, content })
            });
        } else {
            console.warn("Cannot send message: WebSocket is not connected.");
        }
    }
}