import { useState } from "react";
import { Clock, Send } from "lucide-react";

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

const mockTrainers: Member[] = [
  { id: "1", name: "Alex Johnson" },
  { id: "2", name: "Maria Rodriguez" },
  { id: "3", name: "David Chen" },
];

const mockGroups: Group[] = [
  {
    id: "g1",
    name: "Nutrition Tips",
    members: [{ id: "member1", name: "You" }, mockTrainers[0]],
    messages: [
      {
        id: "1",
        senderName: "Alex Johnson",
        content: "Hi! How's your nutrition plan going?",
        timestamp: "2:00 PM",
      },
      {
        id: "2",
        senderName: "You",
        content: "It's going great! Following your advice.",
        timestamp: "2:05 PM",
      },
    ],
  },
  {
    id: "g2",
    name: "Workout Plan",
    members: [{ id: "member1", name: "You" }, mockTrainers[1]],
    messages: [
      {
        id: "1",
        senderName: "Maria Rodriguez",
        content: "Remember to increase your protein intake.",
        timestamp: "1:45 PM",
      },
    ],
  },
];

export default function MemberChatPage() {
  const [groups] = useState<Group[]>(mockGroups);
  const [activeGroupId, setActiveGroupId] = useState<string>(
    mockGroups[0]?.id || ""
  );
  const [newMessage, setNewMessage] = useState("");

  const activeGroup = groups.find((g) => g.id === activeGroupId);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeGroup) return;

    activeGroup.messages.push({
      id: Date.now().toString(),
      senderName: "You",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });

    setNewMessage("");
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Training Hub</h1>
        <p className="text-gray-500">
          Stay in touch with your trainers and get guidance in real-time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
        {/* GROUP LIST */}
        <div className="border rounded overflow-y-auto p-2">
          <h2 className="font-semibold mb-2">Groups</h2>
          {groups.map((g) => (
            <div
              key={g.id}
              className={`p-2 rounded cursor-pointer mb-1 ${
                g.id === activeGroupId ? "bg-red-100" : "hover:bg-gray-100"
              }`}
              onClick={() => setActiveGroupId(g.id)}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-white">{g.name}</span>
                <span className="text-xs bg-gray-200 px-1 rounded text-black">
                  {g.members.length}
                </span>
              </div>
              <div className="text-xs text-gray-500 truncate">
                Members: {g.members.map((m) => m.name).join(", ")}
              </div>
            </div>
          ))}
        </div>

        {/* CHAT AREA */}
        <div className="lg:col-span-3 flex flex-col border rounded overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">
              {activeGroup?.name || "Select a group"}
            </h2>
            {activeGroup && (
              <p className="text-gray-500 text-sm">
                Members: {activeGroup.members.map((m) => m.name).join(", ")}
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
            {activeGroup?.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.senderName === "You" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] p-2 rounded-lg ${
                    msg.senderName === "You"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  <p>{msg.content}</p>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>{msg.senderName}</span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {activeGroup && (
            <div className="p-2 border-t flex space-x-2">
              <input
                className="flex-1 border rounded p-2"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
              />
              <button
                className="bg-blue-500 text-white p-2 rounded"
                onClick={handleSendMessage}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
