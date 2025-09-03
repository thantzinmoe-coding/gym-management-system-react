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
  isFromTrainer: boolean;
}

interface ChatMember {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

const mockMembers: ChatMember[] = [
  {
    id: '1',
    name: 'John Doe',
    lastMessage: 'Thanks for the workout plan!',
    lastMessageTime: '10:30 AM',
    unreadCount: 2,
    isOnline: true
  },
  {
    id: '2',
    name: 'Jane Smith',
    lastMessage: 'Can we reschedule tomorrow\'s session?',
    lastMessageTime: '9:45 AM',
    unreadCount: 1,
    isOnline: false
  },
  {
    id: '3',
    name: 'Mike Johnson',
    lastMessage: 'Great session today!',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    isOnline: true
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    lastMessage: 'What should I eat post-workout?',
    lastMessageTime: 'Yesterday',
    unreadCount: 3,
    isOnline: false
  }
];

const mockMessages: Message[] = [
  {
    id: '1',
    senderId: '1',
    senderName: 'John Doe',
    content: 'Hi! I have a question about the workout routine.',
    timestamp: '10:25 AM',
    isFromTrainer: false
  },
  {
    id: '2',
    senderId: 'trainer',
    senderName: 'You',
    content: 'Sure! What would you like to know?',
    timestamp: '10:26 AM',
    isFromTrainer: true
  },
  {
    id: '3',
    senderId: '1',
    senderName: 'John Doe',
    content: 'How many sets should I do for the bench press?',
    timestamp: '10:28 AM',
    isFromTrainer: false
  },
  {
    id: '4',
    senderId: 'trainer',
    senderName: 'You',
    content: 'Start with 3 sets of 8-10 reps. Focus on proper form rather than heavy weight initially.',
    timestamp: '10:29 AM',
    isFromTrainer: true
  },
  {
    id: '5',
    senderId: '1',
    senderName: 'John Doe',
    content: 'Thanks for the workout plan!',
    timestamp: '10:30 AM',
    isFromTrainer: false
  }
];

export default function ChatWithMembers() {
  const [selectedMember, setSelectedMember] = useState<ChatMember | null>(mockMembers[0]);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = mockMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedMember) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: 'trainer',
      senderName: 'You',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isFromTrainer: true
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
        <h1 className="text-3xl font-bold text-black">Chat with Members</h1>
        <p className="text-black">Communicate with your training clients</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Members List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center text-black">
              <MessageCircle className="h-5 w-5 mr-2 text-black" />
              Members
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-black" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 text-black"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className={`p-3 cursor-pointer border-b border-white hover:bg-blue-100 ${
                    selectedMember?.id === member.id ? 'bg-blue-200' : 'bg-white'
                  }`}
                  onClick={() => setSelectedMember(member)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                          {member.name.charAt(0)}
                        </div>
                        {member.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-black truncate">
                          {member.name}
                        </p>
                        <p className="text-xs text-black truncate">
                          {member.lastMessage}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className="text-xs text-black">
                        {member.lastMessageTime}
                      </span>
                      {member.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs bg-blue-500">
                          {member.unreadCount}
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
          {selectedMember ? (
            <>
              <CardHeader className="border-b border-white bg-blue-100">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                      {selectedMember.name.charAt(0)}
                    </div>
                    {selectedMember.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg text-black">{selectedMember.name}</CardTitle>
                    <CardDescription className="text-black">
                      {selectedMember.isOnline ? 'Online' : 'Offline'}
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
                      className={`flex ${message.isFromTrainer ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.isFromTrainer
                            ? 'bg-blue-500 text-white'
                            : 'bg-blue-100 text-black'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-xs ${
                            message.isFromTrainer ? 'text-white/70' : 'text-black'
                          }`}>
                            {message.senderName}
                          </span>
                          <span className={`text-xs ${
                            message.isFromTrainer ? 'text-white/70' : 'text-black'
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
                <p className="text-black">Select a member to start chatting</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}