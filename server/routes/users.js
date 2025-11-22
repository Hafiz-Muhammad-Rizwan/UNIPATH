import express from 'express';
import User from '../models/User.js';
import University from '../models/University.js';
import { authenticate } from '../middleware/auth.js';
import { getUniversitySearchPatterns } from '../utils/universityMapper.js';

const router = express.Router();

// Get all universities
router.get('/universities', async (req, res) => {
  try {
    const universities = await University.find().sort({ name: 1 });
    res.json(universities);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users by university
router.get('/search', authenticate, async (req, res) => {
  try {
    const { university, year, major, interests } = req.query;
    const currentUserId = req.user._id;

    const query = {
      _id: { $ne: currentUserId }
    };

    if (university) {
      // Use the comprehensive university mapper to get all search patterns
      const patterns = getUniversitySearchPatterns(university);
      
      // Use $or to match any of the patterns
      query.$or = patterns.map(pattern => ({
        university: { $regex: pattern }
      }));
    }

    if (year) {
      query.year = year;
    }

    if (major) {
      query.major = { $regex: new RegExp(major, 'i') };
    }

    if (interests) {
      query.interests = { $in: [interests] };
    }

    const users = await User.find(query)
      .select('-password')
      .limit(50)
      .sort({ isOnline: -1, createdAt: -1 });

    console.log(`🔍 Search for "${university}" found ${users.length} users`);
    if (users.length > 0) {
      console.log(`   Sample universities found: ${users.slice(0, 3).map(u => u.university).join(', ')}`);
    } else if (university) {
      // Debug: show what universities exist in DB
      const allUnis = await User.distinct('university', { _id: { $ne: currentUserId } });
      console.log(`   Available universities in DB: ${allUnis.slice(0, 10).join(', ')}`);
    }
    
    res.json(users);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
router.get('/profile/:userId', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, year, major, bio, interests, profilePicture } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (year) user.year = year;
    if (major !== undefined) user.major = major;
    if (bio !== undefined) user.bio = bio;
    if (interests) user.interests = interests;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      university: user.university,
      year: user.year,
      major: user.major,
      bio: user.bio,
      interests: user.interests,
      profilePicture: user.profilePicture || '',
      isOnline: user.isOnline
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get online users
router.get('/online', authenticate, async (req, res) => {
  try {
    const onlineUsers = await User.find({
      isOnline: true,
      _id: { $ne: req.user._id }
    })
      .select('-password')
      .limit(100);

    res.json(onlineUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get online count per university
router.get('/online-counts', authenticate, async (req, res) => {
  try {
    const counts = await User.aggregate([
      {
        $match: {
          isOnline: true,
          _id: { $ne: req.user._id }
        }
      },
      {
        $group: {
          _id: '$university',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const result = {};
    counts.forEach(item => {
      result[item._id] = item.count;
    });

    res.json(result);
  } catch (error) {
    console.error('Error getting online counts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get total count per university (all users, online and offline)
router.get('/university-counts', authenticate, async (req, res) => {
  try {
    const counts = await User.aggregate([
      {
        $match: {
          _id: { $ne: req.user._id }
        }
      },
      {
        $group: {
          _id: '$university',
          totalCount: { $sum: 1 },
          onlineCount: {
            $sum: { $cond: [{ $eq: ['$isOnline', true] }, 1, 0] }
          }
        }
      },
      {
        $sort: { totalCount: -1 }
      }
    ]);

    const result = {};
    counts.forEach(item => {
      result[item._id] = {
        total: item.totalCount,
        online: item.onlineCount
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Error getting university counts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users by university
router.get('/by-university/:universityName', authenticate, async (req, res) => {
  try {
    const { universityName } = req.params;
    const decodedName = decodeURIComponent(universityName);
    const currentUserId = req.user._id;

    // Use the comprehensive university mapper
    const patterns = getUniversitySearchPatterns(decodedName);
    
    const users = await User.find({
      $or: patterns.map(pattern => ({
        university: { $regex: pattern }
      })),
      _id: { $ne: currentUserId }
    })
      .select('-password')
      .sort({ isOnline: -1, name: 1 })
      .limit(200);

    console.log(`🔍 University page search for "${decodedName}" found ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error('Error getting users by university:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

