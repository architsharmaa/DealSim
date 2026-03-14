const { io } = require('socket.io-client');

const sessionId = process.argv[2];

if (!sessionId) {
  console.error('Usage: node test_sockets.js <sessionId>');
  process.exit(1);
}

console.log(`Connecting to socket server for session: ${sessionId}...`);

const socket = io('http://localhost:3000', {
  transports: ['websocket'],
  reconnection: true
});

socket.on('connect', () => {
  console.log('✅ Connected to WebSocket server');
  console.log('Subscribing to session events...');
  socket.emit('subscribe', sessionId);
});

socket.on('analytics_update', (data) => {
  console.log('\n--- [LIVE UPDATE RECEIVED] ---');
  console.log(JSON.stringify(data, null, 2));
});

socket.on('session_ended', (data) => {
  console.log('\n--- [SESSION ENDED] ---');
  console.log(data);
  process.exit(0);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from server');
});

socket.on('connect_error', (err) => {
  console.error('Connection Error:', err.message);
});

setTimeout(() => {
  console.log('\n(Monitoring for 2 minutes... Send a message in the browser to see updates)');
}, 1000);
