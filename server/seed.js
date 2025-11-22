import mongoose from 'mongoose';
import University from './models/University.js';
import dotenv from 'dotenv';

dotenv.config();

const universities = [
  { name: 'University of Management and Technology (UMT)', domain: 'umt.edu.pk', city: 'Lahore', type: 'Private' },
  { name: 'Lahore University of Management Sciences (LUMS)', domain: 'lums.edu.pk', city: 'Lahore', type: 'Private' },
  { name: 'National University of Sciences and Technology (NUST)', domain: 'nust.edu.pk', city: 'Islamabad', type: 'Public' },
  { name: 'University of Engineering and Technology (UET)', domain: 'uet.edu.pk', city: 'Lahore', type: 'Public' },
  { name: 'FAST National University', domain: 'nu.edu.pk', city: 'Lahore', type: 'Private' },
  { name: 'COMSATS University', domain: 'comsats.edu.pk', city: 'Islamabad', type: 'Public' },
  { name: 'Quaid-i-Azam University (QAU)', domain: 'qau.edu.pk', city: 'Islamabad', type: 'Public' },
  { name: 'University of the Punjab', domain: 'pu.edu.pk', city: 'Lahore', type: 'Public' },
  { name: 'Institute of Business Administration (IBA)', domain: 'iba.edu.pk', city: 'Karachi', type: 'Public' },
  { name: 'Aga Khan University', domain: 'aku.edu', city: 'Karachi', type: 'Private' },
  { name: 'Habib University', domain: 'habib.edu.pk', city: 'Karachi', type: 'Private' },
  { name: 'GIK Institute', domain: 'giki.edu.pk', city: 'Topi', type: 'Private' },
  { name: 'University of Karachi', domain: 'uok.edu.pk', city: 'Karachi', type: 'Public' },
  { name: 'Bahria University', domain: 'bahria.edu.pk', city: 'Islamabad', type: 'Public' },
  { name: 'Air University', domain: 'au.edu.pk', city: 'Islamabad', type: 'Public' }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pakuniconnect');
    console.log('✅ Connected to MongoDB');

    // Clear existing universities
    await University.deleteMany({});
    console.log('✅ Cleared existing universities');

    // Insert universities
    await University.insertMany(universities);
    console.log(`✅ Seeded ${universities.length} universities`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding:', error);
    process.exit(1);
  }
}

seed();

