import express from 'express';
import ChatRoom from '../models/ChatRoom.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get or create chat room with another user
router.post('/room', authenticate, async (req, res) => {
  try {
    const { otherUserId } = req.body;
    const currentUserId = req.user._id;

    if (currentUserId.toString() === otherUserId) {
      return res.status(400).json({ message: 'Cannot chat with yourself' });
    }

    // Check if room already exists
    let room = await ChatRoom.findOne({
      participants: { $all: [currentUserId, otherUserId] },
      isActive: true
    }).populate('participants', 'name email university');

    if (!room) {
      // Create new room
      room = await ChatRoom.create({
        participants: [currentUserId, otherUserId],
        messages: []
      });
      await room.populate('participants', 'name email university');
    }

    res.json(room);
  } catch (error) {
    console.error('Chat room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's chat rooms
router.get('/rooms', authenticate, async (req, res) => {
  try {
    const rooms = await ChatRoom.find({
      participants: req.user._id,
      isActive: true
    })
      .populate('participants', 'name email university isOnline')
      .sort({ lastMessageAt: -1 })
      .limit(50);

    res.json(rooms);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get room messages
router.get('/room/:roomId/messages', authenticate, async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.roomId)
      .populate('messages.sender', 'name email');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user is participant
    if (!room.participants.some(p => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mark messages as read for the requesting user
    const otherParticipant = room.participants.find(
      p => p.toString() !== req.user._id.toString()
    );
    
    if (otherParticipant) {
      room.lastReadAt.set(req.user._id.toString(), new Date());
      room.unreadCount.set(req.user._id.toString(), 0);
      
      // Update message read status
      let updated = false;
      room.messages.forEach(msg => {
        // Set default status for messages without status
        if (!msg.status && !msg.isDeleted) {
          msg.status = 'sent';
          updated = true;
        }
        
        // Mark messages from other user as read
        if (msg.sender.toString() === otherParticipant.toString() && 
            msg.status !== 'read' && !msg.isDeleted) {
          msg.status = 'read';
          msg.readAt = new Date();
          updated = true;
        }
      });
      
      if (updated || room.isModified('lastReadAt')) {
        await room.save();
      }
    }

    res.json(room.messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete/Unsend message
router.delete('/room/:roomId/message/:messageId', authenticate, async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user is participant
    if (!room.participants.some(p => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const message = room.messages.id(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only sender can delete their message
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }

    // Mark as deleted instead of removing
    message.isDeleted = true;
    message.deletedAt = new Date();
    message.content = 'This message was deleted';
    await room.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread chat count
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const rooms = await ChatRoom.find({
      participants: req.user._id,
      isActive: true
    });

    let unreadCount = 0;
    const unreadRooms = [];

    rooms.forEach(room => {
      const userUnread = room.unreadCount.get(req.user._id.toString()) || 0;
      if (userUnread > 0) {
        unreadCount += userUnread;
        unreadRooms.push({
          roomId: room._id,
          count: userUnread
        });
      }
    });

    res.json({ totalUnread: unreadCount, unreadRooms });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

