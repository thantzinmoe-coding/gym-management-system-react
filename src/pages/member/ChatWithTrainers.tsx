import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Send, MessageCircle, User, Clock } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isFromMember: boolean;
}

interface ChatTrainer {
  id: string;
  name: string;
  specialization: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

const mockTrainers: ChatTrainer[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    specialization: 'Weight Loss Specialist',
    lastMessage: 'Great progress on your workout plan!',
    lastMessageTime: '2:30 PM',
    unreadCount: 1,
    isOnline: true
  },
  {
    id: '2',
    name: 'Maria Rodriguez',
    specialization: 'Strength Training',
    lastMessage: 'Remember to increase your protein intake',
    lastMessageTime: '1:45 PM',
    unreadCount: 0,
    isOnline: true
  },
  {
    id: '3',
    name: 'David Chen',
    specialization: 'Yoga & Flexibility',
    lastMessage: 'See you tomorrow for our session',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    isOnline: false
  }
];

const mockMessages: Message[] = [
  {
    id: '1',
    senderId: 'member',
    senderName: 'You',
    content: 'Hi Alex! I have a question about my nutrition plan.',
    timestamp: '2:25 PM',
    isFromMember: true
  },
  {
    id: '2',
    senderId: '1',
    senderName: 'Alex Johnson',
    content: 'Hi! I\'d be happy to help. What would you like to know?',
    timestamp: '2:26 PM',
    isFromMember: false
  },
  {
    id: '3',
    senderId: 'member',
    senderName: 'You',
    content: 'Should I be eating more protein on my training days?',
    timestamp: '2:27 PM',
    isFromMember: true
  },
  {
    id: '4',
    senderId: '1',
    senderName: 'Alex Johnson',
    content: 'Yes, definitely! Aim for about 1.6-2.2g per kg of body weight on training days. This will help with muscle recovery and growth.',
    timestamp: '2:29 PM',
    isFromMember: false
  },
  {
    id: '5',
    senderId: '1',
    senderName: 'Alex Johnson',
    content: 'Great progress on your workout plan!',
    timestamp: '2:30 PM',
    isFromMember: false
  }
];

export default function ChatWithTrainers() {
  const [selectedTrainer, setSelectedTrainer] = useState<ChatTrainer | null>(mockTrainers[0]);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTrainers = mockTrainers.filter(trainer =>
    trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainer.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTrainer) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: 'member',
      senderName: 'You',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isFromMember: true
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Chat with Trainers</h1>
        <p className="text-black">Connect with your personal trainers for guidance and support</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Trainers List */}
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
                  className={`p-3 cursor-pointer border-b border-white hover:bg-blue-100 ${
                    selectedTrainer?.id === trainer.id ? 'bg-blue-200' : 'bg-white'
                  }`}
                  onClick={() => setSelectedTrainer(trainer)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                          {trainer.name.charAt(0)}
                        </div>
                        {trainer.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-black truncate">
                          {trainer.name}
                        </p>
                        <p className="text-xs text-black truncate">
                          {trainer.specialization}
                        </p>
                        <p className="text-xs text-black truncate">
                          {trainer.lastMessage}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className="text-xs text-black">
                        {trainer.lastMessageTime}
                      </span>
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

        {/* Chat Area */}
        <Card className="lg:col-span-2">
          {selectedTrainer ? (
            <>
              <CardHeader className="border-b border-white bg-blue-100">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                      {selectedTrainer.name.charAt(0)}
                    </div>
                    {selectedTrainer.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg text-black">{selectedTrainer.name}</CardTitle>
                    <CardDescription className="text-black">
                      {selectedTrainer.specialization} • {selectedTrainer.isOnline ? 'Online' : 'Offline'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex flex-col h-[400px] bg-white">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 p-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isFromMember ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.isFromMember
                            ? 'bg-blue-500 text-white'
                            : 'bg-blue-100 text-black'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-xs ${
                            message.isFromMember ? 'text-white/70' : 'text-black'
                          }`}>
                            {message.senderName}
                          </span>
                          <span className={`text-xs ${
                            message.isFromMember ? 'text-white/70' : 'text-black'
                          }`}>
                            <Clock className="h-3 w-3 inline mr-1" />
                            {message.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="border-t border-white pt-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 text-black"
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