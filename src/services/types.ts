export interface ChatMessageResponse {
  id: number;
  senderId: number;
  senderName: string;
  senderAvatarUrl: string | null;
  recipientId: number | null;
  content: string;
  messageType: 'TEXT' | 'IMAGE';
  attachmentUrl: string | null;
  isRead: boolean;
  isEdited: boolean;
  editedAt: string | null;
  createdAt: string;
}

export interface ChatMessageRequest {
  content: string;
  recipientId: number;
  messageType: 'TEXT' | 'IMAGE';
  attachmentUrl?: string | null;
}

export interface ChatRoomResponse {
  id: number;
  otherUserId: number;
  otherUserName: string;
  otherUserAvatarUrl: string | null;
  otherUserOnline: boolean;
  lastMessage: ChatMessageResponse | null;
  unreadCount: number;
  lastMessageAt: string;
  createdAt: string;
}

export interface TrainerResponseDto {
  id: number; // Safe unless IDs exceed Number.MAX_SAFE_INTEGER
  name: string;
  avatarUrl?: string | null;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface PaginatedApiResponse<T> {
  success: number;
  code: number;
  message: string;
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    method: string;
    endpoint: string;
  };
  data: T[];
}

export interface TypingIndicator {
  userId: number;
  userName: string;
  recipientId: number;
}