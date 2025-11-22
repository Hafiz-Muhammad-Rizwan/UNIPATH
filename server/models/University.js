import mongoose from 'mongoose';

const universitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  domain: {
    type: String,
    required: true,
    unique: true
  },
  city: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Public', 'Private'],
    default: 'Public'
  }
});

export default mongoose.model('University', universitySchema);

