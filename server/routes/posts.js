import express from 'express';
import mongoose from 'mongoose';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Create a new post
router.post('/', authenticate, async (req, res) => {
  console.log('📝 POST /api/posts - Creating post');
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.log('❌ MongoDB not connected');
      return res.status(503).json({ 
        message: 'Database not connected. Please check your MongoDB connection.',
        error: 'MongoDB not connected'
      });
    }

    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Post content is required' });
    }

    if (content.length > 1000) {
      return res.status(400).json({ message: 'Post content must be less than 1000 characters' });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const post = await Post.create({
      author: req.user._id,
      content: content.trim(),
      likes: [],
      comments: [],
      reposts: []
    });

    await post.populate('author', 'name email university profilePicture');

    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ 
      message: error.message || 'Server error while creating post',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get all posts (feed)
router.get('/feed', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('author', 'name email university profilePicture')
      .populate('likes', 'name')
      .populate('reposts.user', 'name')
      .populate('comments.user', 'name profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(posts);
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get posts by user
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate('author', 'name email university profilePicture')
      .populate('likes', 'name')
      .populate('reposts.user', 'name')
      .populate('comments.user', 'name profilePicture')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(posts);
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike a post
router.post('/:postId/like', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id;
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
    }

    await post.save();
    await post.populate('likes', 'name');

    res.json({ liked: !isLiked, likesCount: post.likes.length, likes: post.likes });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Comment on a post
router.post('/:postId/comment', authenticate, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      user: req.user._id,
      content: content.trim()
    });

    await post.save();
    await post.populate('comments.user', 'name profilePicture');

    const newComment = post.comments[post.comments.length - 1];
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Repost/Share a post
router.post('/:postId/repost', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id;
    const isReposted = post.reposts.some(r => r.user.toString() === userId.toString());

    if (!isReposted) {
      post.reposts.push({
        user: userId
      });
      await post.save();
    }

    await post.populate('reposts.user', 'name');

    res.json({ reposted: true, repostsCount: post.reposts.length, reposts: post.reposts });
  } catch (error) {
    console.error('Repost error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a post
router.delete('/:postId', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    await Post.findByIdAndDelete(req.params.postId);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

