import ChatRoom from '../models/ChatRoom.js';
import User from '../models/User.js';

export const handleSocketConnection = (io) => {
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userId}`);

    // Update user online status
    User.findByIdAndUpdate(socket.userId, { isOnline: true }).catch(console.error);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Handle joining chat room
    socket.on('join-room', async (roomId) => {
      try {
        const room = await ChatRoom.findById(roomId);
        if (room && room.participants.some(p => p.toString() === socket.userId)) {
          socket.join(`room:${roomId}`);
          socket.emit('joined-room', roomId);
          
          // Mark all undelivered messages from other user as delivered
          const otherParticipant = room.participants.find(
            p => p.toString() !== socket.userId
          );
          
          if (otherParticipant) {
            let updated = false;
            room.messages.forEach(msg => {
              if (msg.sender.toString() === otherParticipant.toString() && 
                  msg.status === 'sent' && !msg.isDeleted) {
                msg.status = 'delivered';
                msg.deliveredAt = new Date();
                updated = true;
              }
            });
            
            if (updated) {
              await room.save();
              io.to(`room:${roomId}`).emit('messages-delivered', { roomId });
            }
          }
          
          // Mark messages as read
          room.lastReadAt.set(socket.userId.toString(), new Date());
          room.unreadCount.set(socket.userId.toString(), 0);
          
          // Update message read status
          let readUpdated = false;
          room.messages.forEach(msg => {
            if (msg.sender.toString() === otherParticipant.toString() && 
                msg.status !== 'read' && !msg.isDeleted) {
              msg.status = 'read';
              msg.readAt = new Date();
              readUpdated = true;
            }
          });
          
          if (readUpdated || room.isModified('lastReadAt')) {
            await room.save();
            io.to(`room:${roomId}`).emit('messages-read', { roomId });
          }
        }
      } catch (error) {
        console.error('Join room error:', error);
      }
    });

    // Handle leaving chat room
    socket.on('leave-room', (roomId) => {
      socket.leave(`room:${roomId}`);
    });

    // Handle sending message
    socket.on('send-message', async (data) => {
      try {
        const { roomId, content } = data;

        if (!content || !content.trim()) {
          return socket.emit('error', { message: 'Message cannot be empty' });
        }

        const room = await ChatRoom.findById(roomId);
        if (!room) {
          return socket.emit('error', { message: 'Room not found' });
        }

        // Verify user is participant
        if (!room.participants.some(p => p.toString() === socket.userId)) {
          return socket.emit('error', { message: 'Access denied' });
        }

        // Add message
        const message = {
          sender: socket.userId,
          content: content.trim(),
          timestamp: new Date(),
          isDeleted: false
        };

        room.messages.push(message);
        room.lastMessageAt = new Date();
        
        // Update unread count for the other participant
        const otherParticipant = room.participants.find(
          p => p.toString() !== socket.userId
        );
        if (otherParticipant) {
          const currentUnread = room.unreadCount.get(otherParticipant.toString()) || 0;
          room.unreadCount.set(otherParticipant.toString(), currentUnread + 1);
        }
        
        await room.save();

        // Populate sender info
        await room.populate('messages.sender', 'name email');
        const savedMessage = room.messages[room.messages.length - 1];
        
        // Set initial status as 'sent'
        savedMessage.status = 'sent';
        await room.save();

        // Check if other user is in the room
        const socketsInRoom = await io.in(`room:${roomId}`).fetchSockets();
        const otherUserInRoom = socketsInRoom.some(s => s.userId === otherParticipant.toString());
        
        // Emit to all users in the room
        io.to(`room:${roomId}`).emit('new-message', savedMessage);
        
        // If other user is in room, mark as delivered immediately
        if (otherUserInRoom) {
          savedMessage.status = 'delivered';
          savedMessage.deliveredAt = new Date();
          await room.save();
          
          // Update the message in the array
          const messageIndex = room.messages.length - 1;
          room.messages[messageIndex].status = 'delivered';
          room.messages[messageIndex].deliveredAt = savedMessage.deliveredAt;
          
          io.to(`room:${roomId}`).emit('message-status-updated', {
            messageId: savedMessage._id,
            status: 'delivered'
          });
        }

        // Notify the other participant if they're not in the room
        if (otherParticipant) {
          io.to(`user:${otherParticipant}`).emit('message-notification', {
            roomId,
            message: savedMessage,
            unreadCount: room.unreadCount.get(otherParticipant.toString()) || 0
          });
        }
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { roomId } = data;
      socket.to(`room:${roomId}`).emit('user-typing', {
        userId: socket.userId,
        isTyping: true
      });
    });

    socket.on('stop-typing', (data) => {
      const { roomId } = data;
      socket.to(`room:${roomId}`).emit('user-typing', {
        userId: socket.userId,
        isTyping: false
      });
    });

    // Handle mark messages as read
    socket.on('mark-messages-read', async (data) => {
      try {
        const { roomId } = data;
        const room = await ChatRoom.findById(roomId);
        
        if (!room || !room.participants.some(p => p.toString() === socket.userId)) {
          return;
        }

        const otherParticipant = room.participants.find(
          p => p.toString() !== socket.userId
        );

        if (otherParticipant) {
          room.lastReadAt.set(socket.userId.toString(), new Date());
          room.unreadCount.set(socket.userId.toString(), 0);
          
          let updated = false;
          room.messages.forEach(msg => {
            if (msg.sender.toString() === otherParticipant.toString() && 
                msg.status !== 'read' && !msg.isDeleted) {
              msg.status = 'read';
              msg.readAt = new Date();
              updated = true;
            }
          });
          
          if (updated || room.isModified('lastReadAt')) {
            await room.save();
            io.to(`room:${roomId}`).emit('messages-read', { roomId });
          }
        }
      } catch (error) {
        console.error('Mark messages read error:', error);
      }
    });

    // Handle delete message
    socket.on('delete-message', async (data) => {
      try {
        const { roomId, messageId } = data;
        const room = await ChatRoom.findById(roomId);

        if (!room) {
          return socket.emit('error', { message: 'Room not found' });
        }

        const message = room.messages.id(messageId);
        if (!message) {
          return socket.emit('error', { message: 'Message not found' });
        }

        if (message.sender.toString() !== socket.userId) {
          return socket.emit('error', { message: 'You can only delete your own messages' });
        }

        message.isDeleted = true;
        message.deletedAt = new Date();
        message.content = 'This message was deleted';
        await room.save();

        io.to(`room:${roomId}`).emit('message-deleted', { messageId, roomId });
      } catch (error) {
        console.error('Delete message error:', error);
        socket.emit('error', { message: 'Failed to delete message' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${socket.userId}`);
      try {
        await User.findByIdAndUpdate(socket.userId, { isOnline: false });
        
        // Notify all rooms user was in
        const rooms = await ChatRoom.find({
          participants: socket.userId,
          isActive: true
        });

        rooms.forEach(room => {
          io.to(`room:${room._id}`).emit('user-offline', {
            userId: socket.userId
          });
        });
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    });
  });
};

