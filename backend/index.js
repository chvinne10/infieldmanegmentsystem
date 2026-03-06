const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

// in-memory data stores
const users = []; // { id, username, passwordHash }
const rooms = []; // { id, name, participants: [{userId, score}] }

// secret for JWT (in prod keep in env variable)
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// helper middleware to protect routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Missing token' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// user registration
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'username and password are required' });
  }

  const existing = users.find(u => u.username === username);
  if (existing) {
    return res.status(409).json({ message: 'username already taken' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: uuidv4(), username, passwordHash };
  users.push(user);

  res.status(201).json({ message: 'user registered' });
});

// login authentication
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'username and password are required' });
  }

  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ message: 'invalid credentials' });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ message: 'invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// create discussion room
app.post('/api/rooms', authenticateToken, (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'room name is required' });
  }

  const room = { id: uuidv4(), name, participants: [] };
  rooms.push(room);
  res.status(201).json(room);
});

// join discussion room
app.post('/api/rooms/:roomId/join', authenticateToken, (req, res) => {
  const room = rooms.find(r => r.id === req.params.roomId);
  if (!room) {
    return res.status(404).json({ message: 'room not found' });
  }

  const already = room.participants.find(p => p.userId === req.user.id);
  if (already) {
    return res.status(409).json({ message: 'already joined' });
  }

  room.participants.push({ userId: req.user.id, score: 0 });
  res.json({ message: 'joined', room });
});

// save participant scores
app.post('/api/rooms/:roomId/score', authenticateToken, (req, res) => {
  const room = rooms.find(r => r.id === req.params.roomId);
  if (!room) {
    return res.status(404).json({ message: 'room not found' });
  }

  const participant = room.participants.find(p => p.userId === req.user.id);
  if (!participant) {
    return res.status(403).json({ message: 'not a participant' });
  }

  const { score } = req.body;
  if (typeof score !== 'number') {
    return res.status(400).json({ message: 'score must be a number' });
  }

  participant.score = score;
  res.json({ message: 'score updated', participant });
});

// topic generation endpoint (no auth)
app.post('/api/topic', async (req, res) => {
  const { OPENAI_API_KEY } = process.env;
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
  }
  try {
    const { Configuration, OpenAIApi } = require('openai');
    const config = new Configuration({ apiKey: OPENAI_API_KEY });
    const client = new OpenAIApi(config);

    const prompt = `Provide a single, concise current-affairs discussion topic suitable for a group conversation.`;
    const response = await client.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 60,
      temperature: 0.7,
      n: 1
    });
    const topic = response.data.choices[0].text.trim();
    res.json({ topic });
  } catch (err) {
    console.error('topic generation error', err);
    res.status(500).json({ error: 'failed to generate topic' });
  }
});

// simple status endpoint
app.get('/api/rooms/:roomId', authenticateToken, (req, res) => {
  const room = rooms.find(r => r.id === req.params.roomId);
  if (!room) return res.status(404).json({ message: 'room not found' });
  res.json(room);
});

// create HTTP server for socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// signaling events
io.on('connection', socket => {
  console.log('socket connected', socket.id);

  socket.on('join-room', roomId => {
    socket.join(roomId);
    // notify others in room
    socket.to(roomId).emit('user-joined', socket.id);

    socket.on('offer', ({ to, sdp }) => {
      io.to(to).emit('offer', { from: socket.id, sdp });
    });

    socket.on('answer', ({ to, sdp }) => {
      io.to(to).emit('answer', { from: socket.id, sdp });
    });

    socket.on('ice-candidate', ({ to, candidate }) => {
      io.to(to).emit('ice-candidate', { from: socket.id, candidate });
    });

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-left', socket.id);
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
