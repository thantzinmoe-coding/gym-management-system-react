import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChatService, ChatMessageDto } from '@/services/ChatService';
import { SecureAvatar } from '@/components/ui/SecureAvatar';
import { onlineStatusService } from '@/services/onlineStatusService';
import { useNotifications } from '@/context/NotificationContext';
import { authService } from '@/services/authService';
import { Search } from 'lucide-react';
import Cookies from 'js-cookie';
import { ListSkeleton } from '@/components/ui/loading';
import { Skeleton } from '@/components/ui/skeleton';

interface Message {
    id?: number;
    senderId: number;
    recipientId: number;
    senderName?: string;
    content: string;
    createdAt?: string;
}

interface ChatRoom {
    id: number;
    otherUserId: number;
    name: string;
    email?: string;
    role?: string;
    avatarUrl?: string;
    isAssigned?: boolean;
    lastMessage?: Message;
    unreadCount?: number;
}

// Helper function to safely decode JWT without needing external libraries
const parseJwt = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to parse JWT", e);
        return null;
    }
};

const appendMessageUnique = (prev: Message[], msg: Message): Message[] => {
    if (msg.id !== undefined && msg.id !== null && prev.some(m => m.id === msg.id)) {
        return prev;
    }
    return [...prev, msg];
};

export default function ChatWithTrainers() {
    const [searchParams] = useSearchParams();
    const targetUserIdParam = searchParams.get('userId');

    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [input, setInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMode, setFilterMode] = useState<'all' | 'assigned'>('all');
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [sending, setSending] = useState(false);
    const [onlineStatuses, setOnlineStatuses] = useState<Record<number, boolean>>({});
    const { decrementChatCount } = useNotifications();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const selectedRoomRef = useRef<ChatRoom | null>(null);

    useEffect(() => {
        selectedRoomRef.current = selectedRoom;
    }, [selectedRoom]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 1. Dynamically extract the real User ID from authService or JWT token
    const currentUserId = useMemo(() => {
        const currentUser = authService.getCurrentUser();
        if (currentUser?.id) {
            return Number(currentUser.id);
        }
        const token = Cookies.get('token');
        if (token) {
            const decoded = parseJwt(token);
            if (decoded && (decoded.userId || decoded.id)) {
                return Number(decoded.userId || decoded.id);
            }
        }
        console.warn("Could not find user ID in session or token.");
        return 0;
    }, []);

    const chatServiceRef = useRef<ChatService | null>(null);

    const updateRoomsWithMessage = (newMessage: Message) => {
        const currentSelected = selectedRoomRef.current;
        const otherUserId = Number(newMessage.senderId) === currentUserId
            ? Number(newMessage.recipientId)
            : Number(newMessage.senderId);

        setRooms(prevRooms => {
            const updatedRooms = [...prevRooms];
            const roomIndex = updatedRooms.findIndex(r => Number(r.otherUserId) === otherUserId);

            if (roomIndex !== -1) {
                const room = updatedRooms[roomIndex];

                // Avoid double-incrementing unread count if the exact same message ID is already lastMessage
                const isDuplicateMsg =
                    newMessage.id !== undefined &&
                    room.lastMessage?.id !== undefined &&
                    room.lastMessage.id === newMessage.id;

                let newUnreadCount = room.unreadCount || 0;
                if (!isDuplicateMsg) {
                    if (Number(newMessage.senderId) !== currentUserId && (!currentSelected || Number(currentSelected.otherUserId) !== otherUserId)) {
                        newUnreadCount += 1;
                        localStorage.setItem(`unread_${currentUserId}_${otherUserId}`, newUnreadCount.toString());
                    } else if (Number(newMessage.senderId) !== currentUserId && currentSelected && Number(currentSelected.otherUserId) === otherUserId) {
                        decrementChatCount(1);
                    }
                }

                updatedRooms[roomIndex] = {
                    ...room,
                    lastMessage: newMessage,
                    unreadCount: newUnreadCount,
                };
                const [updatedRoom] = updatedRooms.splice(roomIndex, 1);
                updatedRooms.unshift(updatedRoom);
                return updatedRooms;
            } else {
                // Dynamically add room if message arrives from a user not yet in the list
                const isIncoming = Number(newMessage.senderId) !== currentUserId;
                const newUnread = isIncoming && (!currentSelected || Number(currentSelected.otherUserId) !== otherUserId) ? 1 : 0;
                if (newUnread > 0) {
                    localStorage.setItem(`unread_${currentUserId}_${otherUserId}`, newUnread.toString());
                }
                const newRoom: ChatRoom = {
                    id: Date.now() + otherUserId,
                    otherUserId,
                    name: newMessage.senderName || `Trainer #${otherUserId}`,
                    lastMessage: newMessage,
                    unreadCount: newUnread,
                };
                return [newRoom, ...updatedRooms];
            }
        });
    };

    // 2. INITIALIZATION: Setup Event Listeners
    useEffect(() => {
        if (!currentUserId) return;

        const handleNewMessage = (e: Event) => {
            const newMessage: Message = (e as CustomEvent<Message>).detail;
            if (!newMessage) return;

            const senderId = Number(newMessage.senderId);
            const recipientId = Number(newMessage.recipientId);
            if (senderId !== currentUserId && recipientId !== currentUserId) {
                return;
            }

            const currentSelected = selectedRoomRef.current;
            const isForSelectedRoom = currentSelected &&
                ((senderId === currentUserId && recipientId === Number(currentSelected.otherUserId)) ||
                 (senderId === Number(currentSelected.otherUserId) && recipientId === currentUserId));

            if (isForSelectedRoom) {
                setMessages(prev => appendMessageUnique(prev, newMessage));
            }

            updateRoomsWithMessage(newMessage);
        };

        const handleStatusUpdate = (e: Event) => {
            const statusMap = (e as CustomEvent<Record<string, boolean>>).detail;
            setOnlineStatuses(prev => ({ ...prev, ...statusMap }));
        };

        window.addEventListener('chatMessageUpdate', handleNewMessage);
        window.addEventListener('onlineStatusUpdate', handleStatusUpdate);

        return () => {
            window.removeEventListener('chatMessageUpdate', handleNewMessage);
            window.removeEventListener('onlineStatusUpdate', handleStatusUpdate);
        };
    }, [currentUserId, decrementChatCount]);

    // 3. FETCH CONTACTS: Load Trainers & Active Chat Rooms
    useEffect(() => {
        const token = Cookies.get('token');
        if (!token || !currentUserId) return;

        setLoadingRooms(true);
        const chatService = new ChatService(token);
        chatServiceRef.current = chatService;

        chatService.getChatContacts(currentUserId, 'TRAINER')
            .then((contacts) => {
                const mappedRooms: ChatRoom[] = (contacts || [])
                    .filter(item => Number(item.otherUserId) !== currentUserId)
                    .map((item) => {
                        const otherId = Number(item.otherUserId);
                        const savedUnread = parseInt(localStorage.getItem(`unread_${currentUserId}_${otherId}`) || '0', 10);
                        return {
                            id: item.id || otherId,
                            otherUserId: otherId,
                            name: item.otherUserName || (item as { name?: string }).name || item.otherUserEmail || `Trainer #${otherId}`,
                            email: item.otherUserEmail,
                            role: item.otherUserRole || 'TRAINER',
                            avatarUrl: item.avatarUrl,
                            isAssigned: Boolean(item.isAssigned),
                            lastMessage: item.lastMessage as ChatMessageDto | undefined,
                            unreadCount: savedUnread,
                        };
                    });

                setRooms(mappedRooms);

                if (mappedRooms.length > 0) {
                    const targetId = targetUserIdParam ? Number(targetUserIdParam) : null;
                    const matchedRoom = targetId
                        ? mappedRooms.find(r => r.otherUserId === targetId)
                        : null;
                    setSelectedRoom(prev => prev || matchedRoom || (window.innerWidth >= 768 ? mappedRooms[0] : null));
                }
            })
            .catch(err => console.error('Failed to load trainer chat contacts', err))
            .finally(() => setLoadingRooms(false));
    }, [currentUserId, targetUserIdParam]);

    // 4. HISTORY: Load messages when a room is selected
    useEffect(() => {
        if (!selectedRoom || !chatServiceRef.current || !currentUserId) return;

        setLoadingHistory(true);
        setMessages([]);
        chatServiceRef.current.getChatHistory(currentUserId, selectedRoom.otherUserId)
            .then(data => {
                setMessages(Array.isArray(data) ? data : []);
            })
            .catch(err => console.error('Failed to load history', err))
            .finally(() => setLoadingHistory(false));
    }, [selectedRoom?.otherUserId, currentUserId]);

    // 5. ONLINE STATUS: Poll for online statuses
    useEffect(() => {
        if (rooms.length === 0) return;

        const checkStatuses = async () => {
            const topIds = rooms.slice(0, 80).map(r => r.otherUserId);
            if (selectedRoom && !topIds.includes(selectedRoom.otherUserId)) {
                topIds.push(selectedRoom.otherUserId);
            }
            const statuses = await onlineStatusService.checkUsersOnlineStatus(topIds);
            if (statuses) {
                setOnlineStatuses(prev => ({ ...prev, ...statuses }));
            }
        };

        checkStatuses();
        const intervalId = setInterval(checkStatuses, 30000);
        return () => clearInterval(intervalId);
    }, [rooms.length, selectedRoom?.otherUserId]);

    // Filter rooms by search query and filter mode
    const filteredRooms = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return rooms.filter(room => {
            if (filterMode === 'assigned' && !room.isAssigned && !room.lastMessage) {
                return false;
            }
            if (!q) return true;
            const matchName = room.name?.toLowerCase().includes(q);
            const matchEmail = room.email?.toLowerCase().includes(q);
            return matchName || matchEmail;
        });
    }, [rooms, searchQuery, filterMode]);

    // 6. ACTIONS: Send a message
    const handleSend = async () => {
        const text = input.trim();
        if (!text || !selectedRoom || sending) return;

        setInput('');
        setSending(true);
        try {
            const savedMsg = await chatServiceRef.current?.sendMessage(
                selectedRoom.otherUserId,
                text,
                currentUserId
            );
            if (savedMsg) {
                setMessages(prev => appendMessageUnique(prev, savedMsg));
                updateRoomsWithMessage(savedMsg);
            }
        } finally {
            setSending(false);
        }
    };

    const hasAssignedTrainers = useMemo(() => rooms.some(r => r.isAssigned), [rooms]);

    return (
        <div className="flex h-[calc(100dvh-6.5rem)] sm:h-[80vh] bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            {/* Sidebar */}
            <div className={`${selectedRoom ? 'hidden md:flex' : 'flex'} w-full md:w-80 shrink-0 border-r border-gray-200 flex-col bg-gray-50`}>
                <div className="p-4 border-b border-gray-200 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Trainers</h3>
                        <span className="text-xs text-gray-500 font-medium">{filteredRooms.length} available</span>
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search trainer name or email..."
                            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                        />
                    </div>

                    {/* Filter Tabs */}
                    {hasAssignedTrainers && (
                        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg text-xs font-medium">
                            <button
                                type="button"
                                onClick={() => setFilterMode('all')}
                                className={`flex-1 py-1.5 rounded-md transition-colors ${
                                    filterMode === 'all'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                All Trainers
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilterMode('assigned')}
                                className={`flex-1 py-1.5 rounded-md transition-colors ${
                                    filterMode === 'assigned'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                My Trainers
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {loadingRooms && <ListSkeleton rows={6} />}
                    {!loadingRooms && filteredRooms.length === 0 && (
                        <p className="text-gray-500 text-center mt-4 text-sm">No trainers found.</p>
                    )}

                    {filteredRooms.map(room => {
                        const isSelected = selectedRoom?.otherUserId === room.otherUserId;
                        return (
                            <div
                                key={room.otherUserId}
                                onClick={() => {
                                    setSelectedRoom(room);
                                    if (room.unreadCount) {
                                        setRooms(prev => prev.map(r => r.otherUserId === room.otherUserId ? { ...r, unreadCount: 0 } : r));
                                        localStorage.setItem(`unread_${currentUserId}_${room.otherUserId}`, '0');
                                        decrementChatCount(room.unreadCount);
                                    }
                                }}
                                className={`p-3 rounded-xl cursor-pointer transition-colors duration-200 relative ${
                                    isSelected
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-100'
                                }`}
                            >
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="relative flex-shrink-0">
                                            <SecureAvatar url={room.avatarUrl} name={room.name} className="w-10 h-10" />
                                            {onlineStatuses[room.otherUserId] && (
                                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-medium truncate">{room.name}</span>
                                                {room.isAssigned && (
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold flex-shrink-0 ${
                                                        isSelected
                                                            ? 'bg-blue-500 text-white'
                                                            : 'bg-blue-50 text-blue-600'
                                                    }`}>
                                                        My Trainer
                                                    </span>
                                                )}
                                            </div>
                                            {room.email && (
                                                <p className={`text-xs truncate ${isSelected ? 'text-blue-200' : 'text-gray-400'}`}>
                                                    {room.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {!!room.unreadCount && (
                                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                                            {room.unreadCount}
                                        </span>
                                    )}
                                </div>
                                {room.lastMessage && (
                                    <p className={`text-sm mt-1.5 truncate ${
                                        isSelected
                                            ? 'text-blue-100'
                                            : (room.unreadCount ? 'text-gray-800 font-semibold' : 'text-gray-500')
                                    }`}>
                                        {Number(room.lastMessage.senderId) === currentUserId ? 'You: ' : ''}
                                        {room.lastMessage.content}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`${selectedRoom ? 'flex' : 'hidden md:flex'} flex-1 min-w-0 flex-col bg-gray-50 relative`}>
                {selectedRoom ? (
                    <>
                        {/* Chat Header */}
                        <div className="px-3 md:px-6 py-3 md:py-4 border-b border-gray-200 bg-white flex items-center justify-between shadow-sm z-10">
                            <div className="flex items-center min-w-0">
                                <button type="button" aria-label="Back to conversations" onClick={() => setSelectedRoom(null)} className="md:hidden mr-2 p-1 -ml-1 rounded-full text-gray-600 hover:bg-gray-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <SecureAvatar url={selectedRoom.avatarUrl} name={selectedRoom.name} className="w-10 h-10 mr-3 md:mr-4 shrink-0" />
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-semibold text-gray-800">{selectedRoom.name}</h2>
                                        {selectedRoom.isAssigned && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                                                Assigned Trainer
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {onlineStatuses[selectedRoom.otherUserId] ? (
                                            <p className="text-xs text-green-500 font-medium">Online</p>
                                        ) : (
                                            <p className="text-xs text-gray-400 font-medium">Offline</p>
                                        )}
                                        {selectedRoom.email && (
                                            <span className="hidden sm:inline truncate text-xs text-gray-400">• {selectedRoom.email}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4">
                            {loadingHistory && messages.length === 0 && (
                                <div className="space-y-4" aria-hidden>
                                    <Skeleton className="h-12 w-2/3" />
                                    <Skeleton className="ml-auto h-12 w-1/2" />
                                    <Skeleton className="h-12 w-3/5" />
                                    <Skeleton className="ml-auto h-12 w-2/5" />
                                </div>
                            )}
                            {!loadingHistory && messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <p className="text-sm">No messages yet with {selectedRoom.name}.</p>
                                    <p className="text-xs mt-1">Send a message below to start the conversation!</p>
                                </div>
                            )}
                            {messages.map((msg, index) => {
                                const isMe = Number(msg.senderId) === currentUserId;
                                return (
                                    <div
                                        key={msg.id ?? index}
                                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                                    >
                                        <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] md:max-w-[75%] break-words shadow-sm ${
                                            isMe
                                                ? 'bg-blue-600 text-white rounded-br-sm'
                                                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                                        }`}>
                                            {msg.content}
                                        </div>
                                        {msg.createdAt && (
                                            <span className="text-[10px] text-gray-400 mt-1 px-1">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-2 md:p-4 bg-white border-t border-gray-200">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    className="flex-1 min-w-0 py-3 px-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                    placeholder={`Message ${selectedRoom.name}...`}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || sending}
                                    className={`p-3 rounded-full flex items-center justify-center transition-all ${
                                        input.trim() && !sending
                                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1">
                                        <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-300">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-500">Select a trainer to start chatting</h3>
                        <p className="text-sm mt-2">Choose a trainer from the sidebar</p>
                    </div>
                )}
            </div>
        </div>
    );
}
