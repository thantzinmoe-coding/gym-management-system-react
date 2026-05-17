import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChatService } from '@/services/ChatService';
import { superAdminService } from '@/services/adminService';
import { SecureAvatar } from '@/components/ui/SecureAvatar';
import { onlineStatusService } from '@/services/onlineStatusService';
import { useNotifications } from '@/context/NotificationContext';
import Cookies from 'js-cookie';

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
    avatarUrl?: string;
    lastMessage?: Message;
    unreadCount?: number;
}

// Helper function to safely decode JWT without needing external libraries
const parseJwt = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to parse JWT", e);
        return null;
    }
};

export default function ChatWithTrainers() {
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
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
    
    // 1. FIXED: Dynamically extract the real User ID from the token
    const currentUserId = useMemo(() => {
        const token = Cookies.get('token');
        if (token) {
            const decoded = parseJwt(token);
            // Replace 'userId' with 'id' or whatever your backend names the claim in the JWT
            if (decoded && (decoded.userId || decoded.id)) {
                return Number(decoded.userId || decoded.id);
            }
        }
        console.warn("Could not find user ID in token. Falling back to 1.");
        return 1; 
    }, []);

    const chatServiceRef = useRef<ChatService | null>(null);

    // 2. INITIALIZATION: Setup Event Listeners
    useEffect(() => {
        const handleNewMessage = (e: any) => {
            const newMessage: Message = e.detail;
            
            // Update messages only if it belongs to the currently open chat
            const currentSelected = selectedRoomRef.current;
            const isForSelectedRoom = currentSelected && 
                ((newMessage.senderId === currentUserId && newMessage.recipientId === currentSelected.otherUserId) ||
                 (newMessage.senderId === currentSelected.otherUserId && newMessage.recipientId === currentUserId));

            if (isForSelectedRoom) {
                setMessages(prev => [...prev, newMessage]);
            }

            // Update rooms list with the new last message and unread count
            setRooms(prevRooms => {
                const otherUserId = newMessage.senderId === currentUserId ? newMessage.recipientId : newMessage.senderId;
                const updatedRooms = [...prevRooms];
                const roomIndex = updatedRooms.findIndex(r => r.otherUserId === otherUserId);
                
                if (roomIndex !== -1) {
                    const room = updatedRooms[roomIndex];
                    
                    // Increment unread count if we received a message and this isn't the open chat
                    let newUnreadCount = room.unreadCount || 0;
                    if (newMessage.senderId !== currentUserId && (!currentSelected || currentSelected.otherUserId !== otherUserId)) {
                        newUnreadCount += 1;
                        localStorage.setItem(`unread_${currentUserId}_${otherUserId}`, newUnreadCount.toString());
                    } else if (newMessage.senderId !== currentUserId && currentSelected && currentSelected.otherUserId === otherUserId) {
                        // Immediately "read" the message if we are already viewing the chat
                        decrementChatCount(1);
                    }

                    updatedRooms[roomIndex] = {
                        ...room,
                        lastMessage: newMessage,
                        unreadCount: newUnreadCount
                    };
                    // Move the updated room to the top
                    const [updatedRoom] = updatedRooms.splice(roomIndex, 1);
                    updatedRooms.unshift(updatedRoom);
                }
                return updatedRooms;
            });
        };

        const handleStatusUpdate = (e: any) => {
            const statusMap = e.detail;
            setOnlineStatuses(prev => ({ ...prev, ...statusMap }));
        };

        window.addEventListener('chatMessageUpdate', handleNewMessage);
        window.addEventListener('onlineStatusUpdate', handleStatusUpdate);

        return () => {
            window.removeEventListener('chatMessageUpdate', handleNewMessage);
            window.removeEventListener('onlineStatusUpdate', handleStatusUpdate);
        };
    }, [currentUserId, decrementChatCount]);

    // 3. FETCH ROOMS: Load All Users/Rooms
    useEffect(() => {
        const token = Cookies.get('token');
        if (!token || !currentUserId) return;

        const chatService = new ChatService(token);
        chatServiceRef.current = chatService;
        // Wrap getAllUsers in a catch so a 403/failure doesn't crash the entire chat
        Promise.all([
            chatService.getUserRooms(currentUserId),
            superAdminService.getAllUsers({ page: 0, size: 100 }).catch(err => {
                console.warn('Failed to fetch users list (may lack admin privileges):', err);
                return { content: [] };
            })
        ])
        .then(([fetchedRooms, usersResponse]) => {
            // Extract active rooms array
            const activeRooms = Array.isArray(fetchedRooms) ? fetchedRooms : (fetchedRooms?.data || []);
            
            // Extract users from paginated response
            const allUsersArray = usersResponse.content || usersResponse.data || (Array.isArray(usersResponse) ? usersResponse : []);

            // FIXED: Remove current user from the sidebar list (This works now because currentUserId is accurate)
            const potentialChatPartners = allUsersArray.filter((u: any) => u.id !== currentUserId);

            // Merge All Users with Active Rooms
            const combinedList: ChatRoom[] = potentialChatPartners.map((user: any) => {
                const existingRoom = activeRooms.find((room: ChatRoom) => room.otherUserId === user.id);
                const savedUnread = parseInt(localStorage.getItem(`unread_${currentUserId}_${user.id}`) || '0', 10);
                
                if (existingRoom) {
                    return {
                        ...existingRoom,
                        // Ensure we grab the name from the user list if the room DTO is missing it
                        name: user.name || existingRoom.name || user.email || "Unknown User",
                        avatarUrl: user.avatarUrl || existingRoom.avatarUrl,
                        unreadCount: savedUnread
                    };
                } else {
                    return {
                        id: Date.now() + user.id, // Temporary ID for React key
                        otherUserId: user.id,
                        // FIXED: Correctly map the 'name' field
                        name: user.name || user.email || "Unknown User",
                        avatarUrl: user.avatarUrl,
                        unreadCount: savedUnread
                    };
                }
            });

            // Sort so users with messages appear at the top
            combinedList.sort((a, b) => (a.lastMessage ? -1 : 1));

            setRooms(combinedList);
            if (combinedList.length > 0 && !selectedRoom) {
                setSelectedRoom(combinedList[0]);
            }
        })
        .catch(err => console.error('Failed to load chat data', err));

    }, [currentUserId]);

    // 4. HISTORY: Load messages when a room is selected
    useEffect(() => {
        if (!selectedRoom || !chatServiceRef.current) return;

        chatServiceRef.current.getChatHistory(currentUserId, selectedRoom.otherUserId)
            .then(data => {
                setMessages(Array.isArray(data) ? data : (data?.data || []));
            })
            .catch(err => console.error('Failed to load history', err));
    }, [selectedRoom, currentUserId]);

    // 4. ONLINE STATUS: Poll for online statuses
    useEffect(() => {
        if (rooms.length === 0) return;

        const checkStatuses = async () => {
            const userIds = rooms.map(r => r.otherUserId);
            const statuses = await onlineStatusService.checkUsersOnlineStatus(userIds);
            if (statuses) {
                setOnlineStatuses(prev => ({ ...prev, ...statuses }));
            }
        };

        checkStatuses(); // Initial check
        
        // Poll every 30 seconds
        const intervalId = setInterval(checkStatuses, 30000);

        return () => clearInterval(intervalId);
    }, [rooms]);

    // 5. ACTIONS: Send a message
    const handleSend = () => {
        if (!input.trim() || !selectedRoom) return;
        
        chatServiceRef.current?.sendMessage(selectedRoom.otherUserId, input);
        
        // Optimistic Update
        // setMessages(prev => [...prev, {
        //     id: Date.now(),
        //     senderId: currentUserId,
        //     recipientId: selectedRoom.otherUserId,
        //     content: input
        // }]);
        
        setInput('');
    };

    return (
        <div className="flex h-[80vh] bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            {/* Sidebar */}
            <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50">
                <div className="p-4 border-b border-gray-200 bg-white">
                    <h3 className="text-lg font-semibold text-gray-800">Users & Trainers</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {rooms.length === 0 && <p className="text-gray-500 text-center mt-4">No users found.</p>}
                    
                    {rooms.map(room => (
                        <div 
                            key={room.id}
                            onClick={() => {
                                setSelectedRoom(room);
                                if (room.unreadCount) {
                                    setRooms(prev => prev.map(r => r.id === room.id ? { ...r, unreadCount: 0 } : r));
                                    localStorage.setItem(`unread_${currentUserId}_${room.otherUserId}`, '0');
                                    decrementChatCount(room.unreadCount);
                                }
                            }}
                            className={`p-3 rounded-xl cursor-pointer transition-colors duration-200 relative ${
                                selectedRoom?.otherUserId === room.otherUserId 
                                    ? 'bg-blue-600 text-white shadow-md' 
                                    : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-100'
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <SecureAvatar url={room.avatarUrl} name={room.name} className="w-10 h-10" />
                                        {onlineStatuses[room.otherUserId] && (
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                        )}
                                    </div>
                                    <div className="font-medium truncate">{room.name}</div>
                                </div>
                                {!!room.unreadCount && (
                                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        {room.unreadCount}
                                    </span>
                                )}
                            </div>
                            {room.lastMessage && (
                                <p className={`text-sm mt-1 truncate ${
                                    selectedRoom?.otherUserId === room.otherUserId ? 'text-blue-100' : (room.unreadCount ? 'text-gray-800 font-semibold' : 'text-gray-500')
                                }`}>
                                    {room.lastMessage.content}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-gray-50 relative">
                {selectedRoom ? (
                    <>
                        {/* Chat Header */}
                        <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center shadow-sm z-10">
                            <SecureAvatar url={selectedRoom.avatarUrl} name={selectedRoom.name} className="w-10 h-10 mr-4" />
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">{selectedRoom.name}</h2>
                                {onlineStatuses[selectedRoom.otherUserId] ? (
                                    <p className="text-xs text-green-500 font-medium">Online</p>
                                ) : (
                                    <p className="text-xs text-gray-400 font-medium">Offline</p>
                                )}
                            </div>
                        </div>
                        
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.map((msg, index) => {
                                const isMe = msg.senderId === currentUserId;
                                return (
                                    <div 
                                        key={index} 
                                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                                    >
                                        <div className={`px-4 py-2.5 rounded-2xl max-w-[75%] break-words shadow-sm ${
                                            isMe 
                                                ? 'bg-blue-600 text-white rounded-br-sm' 
                                                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                                        }`}>
                                            {msg.content}
                                        </div>
                                        {msg.createdAt && (
                                            <span className="text-[10px] text-gray-400 mt-1 px-1">
                                                {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-200">
                            <div className="flex items-center gap-2">
                                <input 
                                    type="text" 
                                    value={input} 
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    className="flex-1 py-3 px-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                    placeholder="Type a message..."
                                />
                                <button 
                                    onClick={handleSend} 
                                    disabled={!input.trim()}
                                    className={`p-3 rounded-full flex items-center justify-center transition-all ${
                                        input.trim() 
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
                        <h3 className="text-xl font-medium text-gray-500">Select a user to start chatting</h3>
                        <p className="text-sm mt-2">Choose a conversation from the sidebar</p>
                    </div>
                )}
            </div>
        </div>
    );
}