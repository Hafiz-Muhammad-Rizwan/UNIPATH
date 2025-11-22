import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import University from '../models/University.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('university').optional().notEmpty().withMessage('University is required')
], async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: 'Database not connected. Please set up MongoDB Atlas (FREE) or start local MongoDB.',
        error: 'MongoDB connection required',
        setup: 'See MONGODB_SETUP.md for quick setup guide',
        link: 'https://www.mongodb.com/cloud/atlas/register'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, university, year, major, bio, interests } = req.body;

    // Normalize email to lowercase to match how it's stored in the database
    const normalizedEmail = email.toLowerCase().trim();

    // Admin email bypass - allow this email to register without university validation
    const ADMIN_EMAIL = 'enastark545@gmail.com';
    const isAdminEmail = normalizedEmail === ADMIN_EMAIL;

    // Validate university is provided unless it's admin email
    if (!isAdminEmail && !university) {
      return res.status(400).json({ message: 'University is required' });
    }

    // Extract domain from email
    const emailDomain = normalizedEmail.split('@')[1]?.toLowerCase();
    
    let universityDoc;
    
    // For admin email, skip university validation and use a default university
    if (isAdminEmail) {
      // Find or create a default "Admin" university
      universityDoc = await University.findOne({ name: { $regex: /admin/i } });
      if (!universityDoc) {
        universityDoc = await University.create({
          name: 'Admin',
          domain: 'gmail.com',
          city: 'Unknown',
          type: 'Private'
        });
        console.log('✅ Created Admin university for admin email');
      }
    } else {
      // Check if university exists or create it
      universityDoc = await University.findOne({ domain: emailDomain });
      if (!universityDoc) {
        // Try to find by name
        universityDoc = await University.findOne({ 
          name: { $regex: new RegExp(university, 'i') } 
        });
        
        if (!universityDoc) {
          // Auto-create new university when first user registers
          universityDoc = await University.create({
            name: university,
            domain: emailDomain,
            city: 'Unknown',
            type: 'Public'
          });
          console.log(`✅ Auto-created new university: ${university} (${emailDomain})`);
        } else {
          // Update existing university with new domain if needed
          if (universityDoc.domain !== emailDomain) {
            universityDoc.domain = emailDomain;
            await universityDoc.save();
          }
        }
      }

      // Verify email domain matches university (allow if domain matches or university name matches)
      if (universityDoc.domain && universityDoc.domain !== emailDomain) {
        // If domain doesn't match but university name matches, update the domain
        if (universityDoc.name.toLowerCase().includes(university.toLowerCase()) || 
            university.toLowerCase().includes(universityDoc.name.toLowerCase())) {
          universityDoc.domain = emailDomain;
          await universityDoc.save();
        } else {
          return res.status(400).json({ 
            message: 'Email domain does not match the selected university' 
          });
        }
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Normalize university name using domain mapping if available
    let normalizedUniversityName = universityDoc.name;
    
    // Import the domain mapper
    const { domainToCanonicalName } = await import('../utils/universityMapper.js');
    if (domainToCanonicalName[emailDomain]) {
      normalizedUniversityName = domainToCanonicalName[emailDomain];
      // Update university doc name if it's different
      if (universityDoc.name !== normalizedUniversityName) {
        universityDoc.name = normalizedUniversityName;
        await universityDoc.save();
      }
    }

    // Create user
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      university: normalizedUniversityName, // Use normalized name
      universityDomain: emailDomain,
      year: year || 'Other',
      major: major || '',
      bio: bio || '',
      interests: interests || [],
      isVerified: true // Auto-verify for now (can add email verification later)
    });

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        university: user.university,
        year: user.year,
        major: user.major,
        bio: user.bio,
        interests: user.interests
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: 'Database not connected. Please set up MongoDB Atlas (FREE) or start local MongoDB.',
        error: 'MongoDB connection required',
        setup: 'See MONGODB_SETUP.md for quick setup guide'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;
    
    // Additional validation
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Normalize email - always lowercase and trim
    const normalizedEmail = email.toLowerCase().trim();
    
    // Password - trim whitespace (passwords shouldn't have leading/trailing spaces)
    const trimmedPassword = password.trim();

    console.log('🔍 Login attempt:', { 
      originalEmail: email, 
      normalizedEmail: normalizedEmail,
      passwordLength: trimmedPassword.length 
    });

    // Find user - try exact match first, then case-insensitive
    let user = await User.findOne({ email: normalizedEmail });
    
    // Fallback: case-insensitive search (for any legacy users)
    if (!user) {
      const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      user = await User.findOne({ 
        email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') }
      });
    }

    if (!user) {
      console.log('❌ User not found for email:', normalizedEmail);
      // Generic error for security
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('✅ User found:', user.email);

    // Verify password
    let isMatch = false;
    try {
      isMatch = await user.comparePassword(trimmedPassword);
      
      // Fallback: try original password if different (handles edge cases)
      if (!isMatch && password !== trimmedPassword) {
        isMatch = await user.comparePassword(password);
      }
    } catch (error) {
      console.error('❌ Password comparison error:', error);
      return res.status(500).json({ message: 'Authentication error. Please try again.' });
    }

    if (!isMatch) {
      console.log('❌ Password mismatch for user:', user.email);
      // Generic error for security
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('✅ Login successful for:', user.email);

    // Update online status
    user.isOnline = true;
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
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
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      university: req.user.university,
      year: req.user.year,
      major: req.user.major,
      bio: req.user.bio,
      interests: req.user.interests,
      profilePicture: req.user.profilePicture || '',
      isOnline: req.user.isOnline
    }
  });
});

// Logout
router.post('/logout', authenticate, async (req, res) => {
  try {
    req.user.isOnline = false;
    await req.user.save();
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot Password
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Invalid email')
], async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: 'Database not connected',
        error: 'MongoDB connection required'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Don't reveal if user exists for security
      return res.json({ 
        message: 'If that email exists, a password reset link has been sent.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create reset URL
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

    // Send email
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: user.email,
        subject: 'Password Reset Request - PakUni Connect',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>Hello ${user.name},</p>
            <p>You requested to reset your password for PakUni Connect.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">This link will expire in 1 hour.</p>
            <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
          </div>
        `
      });

      console.log('✅ Password reset email sent to:', user.email);
    } catch (emailError) {
      console.error('❌ Email sending error:', emailError.message);
      // Still return success to user (don't reveal email issues)
    }

    res.json({ 
      message: 'If that email exists, a password reset link has been sent.' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reset Password
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: 'Database not connected',
        error: 'MongoDB connection required'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log('✅ Password reset successful for:', user.email);

    res.json({ 
      message: 'Password has been reset successfully. You can now login with your new password.' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;


