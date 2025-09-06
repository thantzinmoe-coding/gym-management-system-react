import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Send, MessageCircle, User, Clock } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import ChatService from '@/services/ChatService';
import { ChatMessageResponse, ChatRoomResponse, ChatMessageRequest, TrainerResponseDto, PaginatedApiResponse } from '@/services/types';
import { toast } from 'react-toastify';
import { authService } from '@/services/authService';
import Cookies from 'js-cookie';

export default function ChatWithTrainers() {
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerResponseDto | null>(null);
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [onlineStatus, setOnlineStatus] = useState<Record<number, boolean>>({});
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatServiceRef = useRef<ChatService | null>(null);
  const user = authService.getCurrentUser();
  const [trainerAvatars, setTrainerAvatars] = useState<Record<number, string>>({});


  useEffect(() => {
    chatServiceRef.current = new ChatService(user.id); // Replace with actual user ID
    chatServiceRef.current.connect({
      onMessage: (message) => {
        if (message.recipientId === selectedTrainer?.id || message.senderId === selectedTrainer?.id) {
          setMessages((prev) => [...prev, message]);
          chatServiceRef.current?.markMessagesAsRead(message.senderId);
        }
      },
      onError: (error) => {
        toast.error(error);
        console.error('Chat error:', error);
      },
      onTyping: (userId, userName) => {
        if (userId === selectedTrainer?.id) {
          setTypingUser(userName);
          setTimeout(() => setTypingUser(null), 3000);
        }
      },
    });

    return () => chatServiceRef.current?.disconnect();
  }, [selectedTrainer]);

  const { data: trainersData, isLoading: trainersLoading } = useQuery<PaginatedApiResponse<TrainerResponseDto>>({
    queryKey: ['trainers'],
    queryFn: () => chatServiceRef.current!.getActiveTrainers(),
  });

  useEffect(() => {
    async function fetchTrainerAvatars() {
      if (!trainersData?.data) return;
      const token = Cookies.get('token');
      const newAvatars: Record<number, string> = {};

      await Promise.all(
        trainersData.data.map(async (trainer) => {
          if (trainer.avatarUrl) {
            try {
              const response = await fetch(trainer.avatarUrl, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (response.ok) {
                const blob = await response.blob();
                newAvatars[trainer.id] = URL.createObjectURL(blob);
              }
            } catch (err) {
              console.error(`Failed to fetch avatar for trainer ${trainer.id}:`, err);
            }
          }
        })
      );

      setTrainerAvatars(newAvatars);
    }

    fetchTrainerAvatars();
  }, [trainersData]);

  const { data: chatRooms, isLoading: roomsLoading } = useQuery<ChatRoomResponse[]>({
    queryKey: ['chatRooms'],
    queryFn: () => chatServiceRef.current!.getChatRooms(),
  });

  const { data: fetchedMessages } = useQuery<ChatMessageResponse[]>({
    queryKey: ['chatMessages', selectedTrainer?.id],
    queryFn: () => chatServiceRef.current!.getPrivateChatHistory(selectedTrainer!.id),
    enabled: !!selectedTrainer,
  });

  useEffect(() => {
    if (fetchedMessages) {
      setMessages(fetchedMessages);
    }
  }, [fetchedMessages]);

  useEffect(() => {
    if (trainersData?.data) {
      const userIds = trainersData.data.map((trainer) => trainer.id);
      chatServiceRef.current?.checkOnlineStatus(userIds).then(setOnlineStatus);
    }
  }, [trainersData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredTrainers = trainersData?.data
    ?.filter((trainer) =>
      (trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) && trainer.id !== user.id) ?? false)
    .map((trainer) => {
      const room = chatRooms?.find((r) => r.otherUserId === trainer.id);
      return {
        ...trainer,
        lastMessage: room?.lastMessage || null,
        unreadCount: room?.unreadCount || 0,
        lastMessageAt: room?.lastMessageAt || '',
      };
    }) || [];

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTrainer) return;
    const request: ChatMessageRequest = {
      content: newMessage,
      recipientId: selectedTrainer.id,
      messageType: 'TEXT',
      attachmentUrl: null,
    };
    sendMessageMutation.mutate(request);
  };

  const handleSelectTrainer = (trainer: TrainerResponseDto & { lastMessage: ChatMessageResponse | null; unreadCount: number; lastMessageAt: string }) => {
    setSelectedTrainer(trainer);
    if (trainer.unreadCount > 0) {
      markReadMutation.mutate(trainer.id);
    }
  };

  const sendMessageMutation = useMutation({
    mutationFn: (request: ChatMessageRequest) => chatServiceRef.current!.sendMessage(request),
    onSuccess: () => {
      setNewMessage('');
    },
    onError: (error) => {
      toast.error('Failed to send message');
      console.error('Send message error:', error);
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (senderId: number) => chatServiceRef.current!.markMessagesAsRead(senderId),
    onError: (error) => {
      toast.error('Failed to mark messages as read');
      console.error('Mark read error:', error);
    },
  });

  if (trainersLoading || roomsLoading) {
    return <div>Loading trainers...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Chat with Trainers</h1>
        <p className="text-black">Connect with your personal trainers for guidance and support</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center text-black">
              <MessageCircle className="h-5 w-5 mr-2 text-black" />
              My Trainers
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-black" />
              <Input
                placeholder="Search trainers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 text-black"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {filteredTrainers.map((trainer) => (
                <div
                  key={trainer.id}
                  className={`p-3 cursor-pointer border-b border-white hover:bg-blue-100 ${selectedTrainer?.id === trainer.id ? 'bg-blue-200' : 'bg-white'
                    }`}
                  onClick={() => handleSelectTrainer(trainer)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        {trainerAvatars[trainer.id] ? (
                          <img src={trainerAvatars[trainer.id]} alt={trainer.name} className="w-10 h-10 rounded-full" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                            {trainer.name.charAt(0)}
                          </div>
                        )}

                        {onlineStatus[trainer.id] && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-black truncate">{trainer.name}</p>
                        <p className="text-xs text-black truncate">{trainer.lastMessage?.content || ''}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className="text-xs text-black">{trainer.lastMessageAt}</span>
                      {trainer.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs bg-blue-500">
                          {trainer.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          {selectedTrainer ? (
            <>
              <CardHeader className="border-b border-white bg-blue-100">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {trainerAvatars[selectedTrainer.id] ? (
                      <img
                        src={trainerAvatars[selectedTrainer.id]}
                        alt={selectedTrainer.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : selectedTrainer.avatarUrl ? (
                      <img
                        src={selectedTrainer.avatarUrl}
                        alt={selectedTrainer.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                        {selectedTrainer.name.charAt(0)}
                      </div>
                    )}

                    {onlineStatus[selectedTrainer.id] && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg text-black">{selectedTrainer.name}</CardTitle>
                    <CardDescription className="text-black">
                       • {onlineStatus[selectedTrainer.id] ? 'Online' : 'Offline'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col h-[400px] bg-white">
                <div className="flex-1 overflow-y-auto space-y-4 p-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === 101 ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${message.senderId === 101 ? 'bg-blue-500 text-white' : 'bg-blue-100 text-black'
                          }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-xs ${message.senderId === 101 ? 'text-white/70' : 'text-black'}`}>
                            {message.senderName}
                          </span>
                          <span className={`text-xs ${message.senderId === 101 ? 'text-white/70' : 'text-black'}`}>
                            <Clock className="h-3 w-3 inline mr-1" />
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {typingUser && (
                    <p className="text-xs text-gray-500">{typingUser} is typing...</p>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="border-t border-white pt-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 text-black"
                      onFocus={() => chatServiceRef.current?.sendTypingIndicator(selectedTrainer.id)}
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()} className="bg-blue-500">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex items-center justify-center h-full bg-white">
              <div className="text-center">
                <User className="h-12 w-12 text-black mx-auto mb-4" />
                <p className="text-black">Select a trainer to start chatting</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}