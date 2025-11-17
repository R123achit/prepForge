import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  role: String,
  specialization: String,
  bio: String,
  rating: Number,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const sampleInterviewers = [
  {
    email: 'john.tech@prepforge.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Smith',
    role: 'INTERVIEWER',
    specialization: 'Frontend Development',
    bio: 'Senior Frontend Developer with 8+ years experience',
    rating: 4.8
  },
  {
    email: 'sarah.backend@prepforge.com',
    password: 'password123',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'INTERVIEWER',
    specialization: 'Backend Development',
    bio: 'Full-stack engineer specializing in Node.js and Python',
    rating: 4.9
  },
  {
    email: 'mike.data@prepforge.com',
    password: 'password123',
    firstName: 'Mike',
    lastName: 'Chen',
    role: 'INTERVIEWER',
    specialization: 'Data Science',
    bio: 'Data Scientist with ML and AI expertise',
    rating: 4.7
  },
  {
    email: 'lisa.hr@prepforge.com',
    password: 'password123',
    firstName: 'Lisa',
    lastName: 'Williams',
    role: 'INTERVIEWER',
    specialization: 'HR & Behavioral',
    bio: 'HR professional with 10+ years in talent acquisition',
    rating: 4.6
  }
];

async function createInterviewers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const interviewer of sampleInterviewers) {
      const existingUser = await User.findOne({ email: interviewer.email });
      
      if (!existingUser) {
        const salt = await bcrypt.genSalt(10);
        interviewer.password = await bcrypt.hash(interviewer.password, salt);
        
        await User.create(interviewer);
        console.log(`✅ Created interviewer: ${interviewer.firstName} ${interviewer.lastName}`);
      } else {
        console.log(`⚠️ Interviewer already exists: ${interviewer.email}`);
      }
    }

    console.log('\n🎉 Sample interviewers created successfully!');
    console.log('\nYou can now login as:');
    sampleInterviewers.forEach(i => {
      console.log(`- ${i.email} (password: password123)`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error creating interviewers:', error);
    process.exit(1);
  }
}

createInterviewers();