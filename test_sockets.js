const { io } = require('socket.io-client');

// UPDATE THIS with a real session ID from your database
const SESSION_ID = process.argv[2]; 

if (!SESSION_ID) {
  console.error('❌ Error: Please provide a Session ID as an argument.');
  console.log('Usage: node test_sockets.js <session_id>');
  process.exit(1);
}

const socket = io('http://localhost:3000');

console.log(`🔌 Connecting to server for session: ${SESSION_ID}...`);

socket.on('connect', () => {
  console.log('✅ Connected! Subscribing...');
  socket.emit('subscribe', SESSION_ID);
});

socket.on('analytics_update', (data) => {
  console.log('\n📊 [LIVE UPDATE RECEIVED]');
  console.log('-------------------------');
  console.log(`WPM: ${data.wpm}`);
  console.log(`Talk Ratio: ${Math.round(data.talkRatio * 100)}% seller`);
  console.log(`Filler Words:`, JSON.stringify(data.fillerWordCount));
  if (data.monologueFlag) console.log('⚠️  MONOLOGUE DETECTED!');
  console.log('-------------------------');
});

socket.on('session_ended', (data) => {
  console.log('\n🏁 Session Ended event received:', data);
  process.exit(0);
});

socket.on('disconnect', () => {
  console.log('🛑 Socket disconnected');
});

// Timeout after 60 seconds if nothing happens
setTimeout(() => {
  console.log('\n⏰ Timeout: No updates received for 60s. Closing.');
  process.exit(0);
}, 60000);
