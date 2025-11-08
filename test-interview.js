// Quick test to create and verify interview
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

async function test() {
  try {
    // 1. Login as candidate
    console.log('1️⃣ Logging in as candidate...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'candidate@test.com',
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log('✅ Logged in successfully');

    // 2. Schedule interview
    console.log('\n2️⃣ Scheduling interview...');
    const scheduleRes = await axios.post(`${API_URL}/live-interviews`, {
      interviewType: 'TECHNICAL',
      topic: 'Test Interview',
      scheduledAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      duration: 60
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const interview = scheduleRes.data.interview;
    console.log('✅ Interview created:');
    console.log('   ID:', interview.id);
    console.log('   Room ID:', interview.roomId);
    console.log('   Meeting URL:', interview.meetingUrl);

    // 3. Try to fetch by roomId
    console.log('\n3️⃣ Fetching by roomId:', interview.roomId);
    try {
      const fetchRes = await axios.get(`${API_URL}/live-interviews/room/${interview.roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Fetch by room endpoint SUCCESS');
    } catch (err) {
      console.log('❌ Fetch by room endpoint FAILED:', err.response?.data?.error || err.message);
    }

    // 4. Try to fetch by query param
    console.log('\n4️⃣ Fetching by query param...');
    try {
      const queryRes = await axios.get(`${API_URL}/live-interviews?roomId=${interview.roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Fetch by query param SUCCESS:', queryRes.data.interviews.length, 'found');
    } catch (err) {
      console.log('❌ Fetch by query param FAILED:', err.response?.data?.error || err.message);
    }

    console.log('\n🎉 TEST COMPLETE!');
    console.log('Now try joining the interview with roomId:', interview.roomId);
    console.log('URL: http://localhost:5173/interview-room/' + interview.roomId);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

test();
