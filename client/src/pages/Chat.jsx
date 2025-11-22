import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Send, Smile, Trash2, MoreVertical } from 'lucide-react';
import Navigation from '../components/Navigation';
import EmojiPicker from '../components/EmojiPicker';

function Chat() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      newSocket.emit('join-room', roomId);
    });

    newSocket.on('joined-room', () => {
      console.log('Joined room:', roomId);
      // Mark messages as read when joining room
      setTimeout(() => {
        newSocket.emit('mark-messages-read', { roomId });
      }, 500);
    });

    newSocket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
      
      // Mark as read if it's from other user and we're viewing the chat
      if (message.sender._id !== user.id && message.sender !== user.id) {
        setTimeout(() => {
          newSocket.emit('mark-messages-read', { roomId });
        }, 500);
      }
    });

    newSocket.on('message-status-updated', ({ messageId, status }) => {
      setMessages(prev => prev.map(msg => 
        msg._id === messageId 
          ? { ...msg, status }
          : msg
      ));
    });

    newSocket.on('messages-delivered', () => {
      fetchMessages(); // Refresh to get updated statuses
    });

    newSocket.on('messages-read', () => {
      fetchMessages(); // Refresh to get updated statuses
    });

    newSocket.on('message-deleted', ({ messageId }) => {
      setMessages(prev => prev.map(msg => 
        msg._id === messageId 
          ? { ...msg, isDeleted: true, content: 'This message was deleted' }
          : msg
      ));
    });

    newSocket.on('user-typing', (data) => {
      if (data.userId !== user.id) {
        setOtherUserTyping(data.isTyping);
      }
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    fetchRoom();
    fetchMessages();

    return () => {
      newSocket.emit('leave-room', roomId);
      newSocket.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
    
    // Mark messages as read when viewing
    if (socket && messages.length > 0) {
      const hasUnread = messages.some(msg => {
        const isFromOther = msg.sender._id !== user.id && msg.sender !== user.id;
        return isFromOther && msg.status !== 'read';
      });
      
      if (hasUnread) {
        socket.emit('mark-messages-read', { roomId });
      }
    }
  }, [messages, socket, roomId, user.id]);

  const fetchRoom = async () => {
    try {
      const response = await axios.get(`/api/chat/rooms`);
      const foundRoom = response.data.find(r => r._id === roomId);
      if (foundRoom) {
        setRoom(foundRoom);
      }
    } catch (error) {
      console.error('Error fetching room:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/api/chat/room/${roomId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    socket.emit('send-message', {
      roomId,
      content: newMessage
    });

    setNewMessage('');
    setShowEmojiPicker(false);
    handleStopTyping();
    inputRef.current?.focus();
  };

  const handleDeleteMessage = async (messageId) => {
    if (!socket) return;
    
    try {
      socket.emit('delete-message', { roomId, messageId });
      setHoveredMessage(null);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const handleTyping = () => {
    if (!socket) return;
    
    if (!typing) {
      setTyping(true);
      socket.emit('typing', { roomId });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 3000);
  };

  const handleStopTyping = () => {
    if (socket && typing) {
      setTyping(false);
      socket.emit('stop-typing', { roomId });
    }
  };

  const getOtherUser = () => {
    if (!room) return null;
    return room.participants.find(p => p._id !== user.id);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessageStatusIcon = (status, isOwn) => {
    if (!isOwn) return null;
    
    switch (status) {
      case 'read':
        // Blue double check (read)
        return (
          <span className="flex items-center" title="Read">
            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 16 16">
              <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
            </svg>
            <svg className="w-4 h-4 text-blue-500 -ml-1.5" fill="currentColor" viewBox="0 0 16 16">
              <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
            </svg>
          </span>
        );
      case 'delivered':
        // Gray double check (delivered)
        return (
          <span className="flex items-center" title="Delivered">
            <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 16 16">
              <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
            </svg>
            <svg className="w-4 h-4 text-gray-300 -ml-1.5" fill="currentColor" viewBox="0 0 16 16">
              <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
            </svg>
          </span>
        );
      case 'sent':
      default:
        // Single gray check (sent)
        return (
          <span className="flex items-center" title="Sent">
            <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 16 16">
              <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
            </svg>
          </span>
        );
    }
  };

  const otherUser = getOtherUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-secondary-50 flex flex-col pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4 flex items-center gap-3 md:gap-4">
          {otherUser && (
            <>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base shadow-md">
                {otherUser.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm md:text-base truncate">{otherUser.name}</p>
                <p className="text-xs md:text-sm text-gray-600 truncate">{otherUser.university}</p>
              </div>
              {otherUser.isOnline && (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs hidden sm:inline">Online</span>
                </div>
              )}
            </>
          )}
        </div>
      </header>

      <Navigation />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        <div className="space-y-3 md:space-y-4">
          {messages.map((message, index) => {
            const isOwn = message.sender._id === user.id || message.sender === user.id;
            const isDeleted = message.isDeleted;
            const messageId = message._id || message.id || index;
            
            return (
              <div
                key={messageId}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
                onMouseEnter={() => setHoveredMessage(messageId)}
                onMouseLeave={() => setHoveredMessage(null)}
              >
                <div className="relative">
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl transition-all ${
                      isOwn
                        ? isDeleted
                          ? 'bg-gray-300 text-gray-600'
                          : 'bg-primary-600 text-white shadow-lg'
                        : 'bg-white text-gray-800 shadow-md'
                    } ${hoveredMessage === messageId ? 'scale-105' : ''}`}
                  >
                    {isDeleted ? (
                      <p className="text-sm italic opacity-70">{message.content}</p>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    )}
                    <div className="flex items-center justify-end gap-1.5 mt-1">
                      <p
                        className={`text-xs ${
                          isOwn 
                            ? isDeleted 
                              ? 'text-gray-500' 
                              : 'text-primary-100' 
                            : 'text-gray-500'
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                      {/* Message status indicator (WhatsApp style) */}
                      {isOwn && !isDeleted && (
                        <div className="flex items-center">
                          {getMessageStatusIcon(message.status || 'sent', true)}
                        </div>
                      )}
                      {/* Unsend/Delete button */}
                      {isOwn && !isDeleted && hoveredMessage === messageId && (
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this message for everyone?')) {
                              handleDeleteMessage(messageId);
                            }
                          }}
                          className="text-xs text-white/80 hover:text-white transition-colors ml-1"
                          title="Unsend message"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {otherUserTyping && (
            <div className="flex justify-start">
              <div className="bg-white px-4 py-2 rounded-2xl shadow-md">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t max-w-7xl w-full mx-auto sticky bottom-0 md:relative shadow-lg">
        <form onSubmit={handleSendMessage} className="flex gap-2 p-2 md:p-4 relative">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Type a message... 😊"
              className="w-full px-3 md:px-4 py-2 pr-10 bg-gray-50 rounded-full focus:ring-2 focus:ring-primary-500 focus:bg-white text-sm md:text-base border border-gray-200"
            />
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500 transition-colors"
            >
              <Smile size={20} />
            </button>
            <div className="absolute bottom-full left-0 mb-2">
              <EmojiPicker
                isOpen={showEmojiPicker}
                onEmojiSelect={handleEmojiSelect}
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 md:px-6 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm md:text-base shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Send size={18} />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
