import { useState } from 'react';
import { Send, Search, MoreVertical, Phone, Video, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string;
  content: string;
  timestamp: Date;
  is_read: boolean;
}

interface Conversation {
  id: string;
  participant_id: string;
  participant_name: string;
  participant_avatar: string;
  last_message: string;
  last_message_time: Date;
  unread_count: number;
  messages: Message[];
}

export default function MessagesPage() {
  useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock conversations
  const conversations: Conversation[] = [
    {
      id: '1',
      participant_id: 'user1',
      participant_name: 'أحمد محمد',
      participant_avatar: 'https://ui-avatars.com/api/?name=Ahmad+Mohammad&background=random&color=fff&bold=true',
      last_message: 'Great! Let\'s start with React basics',
      last_message_time: new Date(Date.now() - 1000 * 60 * 5),
      unread_count: 2,
      messages: [
        {
          id: 'm1',
          sender_id: 'user1',
          sender_name: 'أحمد محمد',
          sender_avatar: 'https://ui-avatars.com/api/?name=Ahmad+Mohammad&background=random&color=fff&bold=true',
          content: 'Hi! I\'m interested in learning React',
          timestamp: new Date(Date.now() - 1000 * 60 * 20),
          is_read: true,
        },
        {
          id: 'm2',
          sender_id: 'user1',
          sender_name: 'أحمد محمد',
          sender_avatar: 'https://ui-avatars.com/api/?name=Ahmad+Mohammad&background=random&color=fff&bold=true',
          content: 'Can we start this week?',
          timestamp: new Date(Date.now() - 1000 * 60 * 10),
          is_read: true,
        },
        {
          id: 'm3',
          sender_id: 'current_user',
          sender_name: 'You',
          sender_avatar: 'https://ui-avatars.com/api/?name=You&background=random&color=fff&bold=true',
          content: 'Sure! I can teach you React. What\'s your experience level?',
          timestamp: new Date(Date.now() - 1000 * 60 * 8),
          is_read: true,
        },
        {
          id: 'm4',
          sender_id: 'user1',
          sender_name: 'أحمد محمد',
          sender_avatar: 'https://ui-avatars.com/api/?name=Ahmad+Mohammad&background=random&color=fff&bold=true',
          content: 'Great! Let\'s start with React basics',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          is_read: false,
        },
      ],
    },
    {
      id: '2',
      participant_id: 'user2',
      participant_name: 'فاطمة علي',
      participant_avatar: 'https://ui-avatars.com/api/?name=Fatima+Ali&background=random&color=fff&bold=true',
      last_message: 'Perfect! See you tomorrow at 3 PM',
      last_message_time: new Date(Date.now() - 1000 * 60 * 60),
      unread_count: 0,
      messages: [],
    },
  ];

  const current = selectedConversation ? conversations.find(c => c.id === selectedConversation) : null;

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    // Handle message sending
    setMessageInput('');
  };

  const filteredConversations = conversations.filter(c =>
    c.participant_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50 pt-16">
      {/* Conversations List */}
      <div className={`w-full md:w-80 bg-white border-r border-slate-200 flex flex-col ${current ? 'hidden md:flex' : ''}`}>
        {/* Search */}
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv.id)}
              className={`w-full px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left ${
                selectedConversation === conv.id ? 'bg-teal-50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <img
                  src={conv.participant_avatar}
                  alt={conv.participant_name}
                  className="w-12 h-12 rounded-full object-cover"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-slate-900 truncate">{conv.participant_name}</h3>
                    <span className="text-xs text-slate-500">
                      {conv.last_message_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 truncate">{conv.last_message}</p>
                </div>
                {conv.unread_count > 0 && (
                  <div className="w-5 h-5 bg-teal-600 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                    {conv.unread_count}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {current ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Header */}
          <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedConversation(null)}
                className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
              >
                ←
              </button>
              <img
                src={current.participant_avatar}
                alt={current.participant_name}
                className="w-10 h-10 rounded-full object-cover"
                loading="lazy"
              />
              <div>
                <h2 className="font-semibold text-slate-900">{current.participant_name}</h2>
                <p className="text-xs text-slate-500">Active now</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Phone className="w-5 h-5 text-slate-600" />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Video className="w-5 h-5 text-slate-600" />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Info className="w-5 h-5 text-slate-600" />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {current.messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_id === 'current_user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${
                    msg.sender_id === 'current_user'
                      ? 'bg-teal-600 text-white rounded-br-none'
                      : 'bg-slate-100 text-slate-900 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.sender_id === 'current_user' ? 'text-teal-100' : 'text-slate-500'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="px-4 md:px-6 py-4 border-t border-slate-200">
            <div className="flex items-end gap-3">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              />
              <button
                onClick={handleSendMessage}
                className="p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500">Select a conversation to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}
