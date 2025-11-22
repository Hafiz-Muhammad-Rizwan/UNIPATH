import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function ChatNotification() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const socketRef = useRef(null);
  const notificationTimeoutRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    // Setup socket connection for real-time notifications
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Notification socket connected');
    });

    socket.on('message-notification', (data) => {
      setUnreadCount(prev => prev + 1);
      setNotificationMessage(`New message from ${data.message.sender.name || 'someone'}`);
      setShowNotification(true);
      
      // Clear existing timeout
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
      
      // Auto-hide after 5 seconds
      notificationTimeoutRef.current = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    });

    socketRef.current = socket;

    const fetchUnreadCount = async () => {
      try {
        const response = await axios.get('/api/chat/unread-count');
        const { totalUnread } = response.data;
        setUnreadCount(totalUnread);
        
        if (totalUnread > 0 && !showNotification) {
          setNotificationMessage(`You have ${totalUnread} unread message${totalUnread > 1 ? 's' : ''}`);
          setShowNotification(true);
          
          // Auto-hide after 5 seconds
          notificationTimeoutRef.current = setTimeout(() => {
            setShowNotification(false);
          }, 5000);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000); // Check every 10 seconds

    return () => {
      clearInterval(interval);
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  const handleClick = () => {
    setShowNotification(false);
    navigate('/dashboard?tab=chats');
  };

  if (!showNotification || unreadCount === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-white rounded-lg shadow-2xl border border-primary-200 p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="bg-primary-400 rounded-full p-2">
            <MessageCircle className="text-white" size={20} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-800">New Messages!</h3>
              <button
                onClick={() => setShowNotification(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">{notificationMessage}</p>
            <button
              onClick={handleClick}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View Chats →
            </button>
          </div>
          <div className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatNotification;

