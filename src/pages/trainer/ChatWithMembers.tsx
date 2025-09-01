import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Send, Clock, PlusCircle, MinusCircle } from 'lucide-react';

interface Member {
  id: string;
  name: string;
}

interface Message {
  id: string;
  senderName: string;
  content: string;
  timestamp: string;
}

interface Group {
  id: string;
  name: string;
  members: Member[];
  messages: Message[];
}

const mockMembers: Member[] = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' },
  { id: '3', name: 'Mike Johnson' },
  { id: '4', name: 'Sarah Wilson' },
  { id: '5', name: 'David Lee' },
];

export default function GroupChatPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  // show/hide create form
  const [showCreateForm, setShowCreateForm] = useState(false);

  // manage members popup
  const [showMemberEditor, setShowMemberEditor] = useState(false);

  // === CREATE GROUP ===
  const handleCreateGroup = () => {
    if (!newGroupName || selectedMembers.length === 0) return;

    const group: Group = {
      id: Date.now().toString(),
      name: newGroupName,
      members: mockMembers.filter((m) => selectedMembers.includes(m.id)),
      messages: [],
    };

    setGroups([...groups, group]);
    setNewGroupName('');
    setSelectedMembers([]);
    setActiveGroupId(group.id);
    setShowCreateForm(false);
  };

  // === SEND MESSAGE ===
  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeGroupId) return;

    setGroups(groups.map((g) => {
      if (g.id === activeGroupId) {
        return {
          ...g,
          messages: [
            ...g.messages,
            {
              id: Date.now().toString(),
              senderName: 'You',
              content: newMessage,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ],
        };
      }
      return g;
    }));

    setNewMessage('');
  };

  // === ADD MEMBER ===
  const handleAddMember = (memberId: string) => {
    setGroups(groups.map((g) => {
      if (g.id === activeGroupId) {
        const memberToAdd = mockMembers.find((m) => m.id === memberId);
        if (memberToAdd && !g.members.some((m) => m.id === memberId)) {
          return { ...g, members: [...g.members, memberToAdd] };
        }
      }
      return g;
    }));
  };

  // === REMOVE MEMBER ===
  const handleRemoveMember = (memberId: string) => {
    setGroups(groups.map((g) => {
      if (g.id === activeGroupId) {
        return { ...g, members: g.members.filter((m) => m.id !== memberId) };
      }
      return g;
    }));
  };

  const activeGroup = groups.find((g) => g.id === activeGroupId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Group Chat</h1>
          <p className="text-muted-foreground">Trainers can create chats and add members</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>+ Create Chat</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
        {/* === GROUP LIST PANEL === */}
        <Card className="lg:col-span-1 overflow-y-auto">
          <CardHeader>
            <CardTitle>Groups</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {groups.map((g) => (
              <div
                key={g.id}
                className={`p-2 cursor-pointer border-b border-border hover:bg-muted/50 ${activeGroupId === g.id ? 'bg-muted' : ''}`}
                onClick={() => setActiveGroupId(g.id)}
              >
                <div className="flex justify-between items-center">
                  <span>{g.name}</span>
                  <Badge>{g.members.length}</Badge>
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  Members: {g.members.map((m) => m.name).join(', ')}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* === CHAT AREA PANEL === */}
        <Card className="lg:col-span-3 flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{activeGroup?.name || 'Select a group'}</CardTitle>
                <CardDescription>
                  {activeGroup ? `Members: ${activeGroup.members.map((m) => m.name).join(', ')}` : ''}
                </CardDescription>
              </div>
              {activeGroup && (
                <Button variant="outline" size="sm" onClick={() => setShowMemberEditor(!showMemberEditor)}>
                  Manage Members
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col justify-between">
            {/* === CHAT MESSAGES === */}
            <div className="flex-1 overflow-y-auto space-y-2 p-2">
              {activeGroup?.messages.map((msg) => (
                <div key={msg.id} className="flex justify-start">
                  <div className="max-w-[70%] p-2 rounded-lg bg-muted text-foreground">
                    <p>{msg.content}</p>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{msg.senderName}</span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" /> {msg.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* === SEND MESSAGE === */}
            {activeGroup && (
              <div className="flex space-x-2 mt-2 border-t border-border pt-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* === CREATE GROUP POPUP === */}
      {showCreateForm && (
        <Card className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 shadow-xl border-2 border-border z-50">
          <CardHeader>
            <CardTitle>Create New Group</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Group Name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />

            <div className="space-y-1 max-h-40 overflow-y-auto border p-2 rounded">
              {mockMembers.map((m) => (
                <div key={m.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedMembers.includes(m.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedMembers([...selectedMembers, m.id]);
                      } else {
                        setSelectedMembers(selectedMembers.filter((id) => id !== m.id));
                      }
                    }}
                  />
                  <span>{m.name}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
              <Button onClick={handleCreateGroup}>Create</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* === MEMBER MANAGEMENT POPUP === */}
      {showMemberEditor && activeGroup && (
        <Card className="fixed bottom-4 right-4 w-96 shadow-xl border-2 border-border z-40">
          <CardHeader>
            <CardTitle>Manage Members</CardTitle>
            <CardDescription>{activeGroup.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 max-h-60 overflow-y-auto">
            {/* Existing Members */}
            <h4 className="text-sm font-semibold">Current Members</h4>
            {activeGroup.members.map((m) => (
              <div key={m.id} className="flex justify-between items-center p-1 border rounded">
                <span>{m.name}</span>
                <Button size="icon" variant="destructive" onClick={() => handleRemoveMember(m.id)}>
                  <MinusCircle className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {/* Add New Members */}
            <h4 className="text-sm font-semibold mt-3">Add Members</h4>
            {mockMembers
              .filter((m) => !activeGroup.members.some((mem) => mem.id === m.id))
              .map((m) => (
                <div key={m.id} className="flex justify-between items-center p-1 border rounded">
                  <span>{m.name}</span>
                  <Button size="icon" onClick={() => handleAddMember(m.id)}>
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
