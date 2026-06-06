const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { logLogin, logSolve } = require('./utils/excelLogger');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const PROFILES_PATH = path.join(DATA_DIR, 'profiles.json');
const QUESTIONS_PATH = path.join(DATA_DIR, 'questions.json');
const MEMOS_PATH = path.join(DATA_DIR, 'memos.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default questions template list (same as client-side)
const DEFAULT_QUESTIONS = [
  {
    id: '1',
    title: 'Two Sum',
    difficulty: 'Easy',
    status: 'Todo',
    topic: 'Arrays',
    platform: 'LeetCode',
    link: 'https://leetcode.com/problems/two-sum/'
  },
  {
    id: '2',
    title: 'Longest Palindromic Substring',
    difficulty: 'Medium',
    status: 'Todo',
    topic: 'String',
    platform: 'LeetCode',
    link: 'https://leetcode.com/problems/longest-palindromic-substring/'
  },
  {
    id: '3',
    title: 'Edit Distance',
    difficulty: 'Hard',
    status: 'Todo',
    topic: 'Dynamic Programming',
    platform: 'LeetCode',
    link: 'https://leetcode.com/problems/edit-distance/'
  },
  {
    id: '4',
    title: 'Merge k Sorted Lists',
    difficulty: 'Hard',
    status: 'Todo',
    topic: 'Linked List',
    platform: 'LeetCode',
    link: 'https://leetcode.com/problems/merge-k-sorted-lists/'
  },
  {
    id: '5',
    title: 'Number of Islands',
    difficulty: 'Medium',
    status: 'Todo',
    topic: 'Graphs',
    platform: 'LeetCode',
    link: 'https://leetcode.com/problems/number-of-islands/'
  }
];

// Helper Functions
function readJson(filePath) {
  if (!fs.existsSync(filePath)) return {};
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw || '{}');
  } catch (e) {
    console.error(`Error reading ${filePath}`, e);
    return {};
  }
}

function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error(`Error writing ${filePath}`, e);
  }
}

// 1. Authenticate & Login Router
app.post('/api/auth/login', async (req, res) => {
  const { username, email, targetGoal } = req.body;
  if (!email || !username) {
    return res.status(400).json({ error: 'Username and Email are required.' });
  }

  const profiles = readJson(PROFILES_PATH);
  let userProfile = profiles[email.toLowerCase()];

  // Log in Excel spreadsheet instantly
  await logLogin(email, username, targetGoal || 150);

  if (userProfile) {
    // Return existing user profile
    return res.status(200).json(userProfile);
  } else {
    // Initialize a completely new, clean 0 slate profile
    userProfile = {
      username,
      email,
      targetGoal: targetGoal || 150,
      xp: 0,
      streak: 0,
      lastSolveDate: null,
      badges: [],
      leetcodeUsername: '',
      leetcodeSynced: false,
      leetcodeSolved: { easy: 0, medium: 0, hard: 0 }
    };
    profiles[email.toLowerCase()] = userProfile;
    writeJson(PROFILES_PATH, profiles);

    // Initialize custom question bank for new user
    const questionsDb = readJson(QUESTIONS_PATH);
    questionsDb[email.toLowerCase()] = DEFAULT_QUESTIONS;
    writeJson(QUESTIONS_PATH, questionsDb);

    return res.status(201).json(userProfile);
  }
});

// 2. Profile Update Router
app.post('/api/auth/update', (req, res) => {
  const { username, email, targetGoal, xp, streak, lastSolveDate, badges, leetcodeUsername, leetcodeSynced, leetcodeSolved } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email identifier is missing.' });
  }

  const profiles = readJson(PROFILES_PATH);
  const user = profiles[email.toLowerCase()] || {};

  profiles[email.toLowerCase()] = {
    ...user,
    username: username || user.username,
    email: email || user.email,
    targetGoal: targetGoal !== undefined ? targetGoal : user.targetGoal,
    xp: xp !== undefined ? xp : user.xp,
    streak: streak !== undefined ? streak : user.streak,
    lastSolveDate: lastSolveDate !== undefined ? lastSolveDate : user.lastSolveDate,
    badges: badges || user.badges || [],
    leetcodeUsername: leetcodeUsername !== undefined ? leetcodeUsername : user.leetcodeUsername,
    leetcodeSynced: leetcodeSynced !== undefined ? leetcodeSynced : user.leetcodeSynced,
    leetcodeSolved: leetcodeSolved || user.leetcodeSolved || { easy: 0, medium: 0, hard: 0 }
  };

  writeJson(PROFILES_PATH, profiles);
  return res.status(200).json(profiles[email.toLowerCase()]);
});

// 3. Retrieve Questions Router
app.get('/api/questions', (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: 'Email parameter is required.' });
  }

  const questionsDb = readJson(QUESTIONS_PATH);
  const list = questionsDb[email.toLowerCase()];

  if (list) {
    return res.status(200).json(list);
  } else {
    // Fallback initialize
    questionsDb[email.toLowerCase()] = DEFAULT_QUESTIONS;
    writeJson(QUESTIONS_PATH, questionsDb);
    return res.status(200).json(DEFAULT_QUESTIONS);
  }
});

// 4. Save/Update Question Router
app.post('/api/questions', async (req, res) => {
  const { email, question } = req.body;
  if (!email || !question) {
    return res.status(400).json({ error: 'Email and Question data are required.' });
  }

  const questionsDb = readJson(QUESTIONS_PATH);
  let list = questionsDb[email.toLowerCase()] || [...DEFAULT_QUESTIONS];

  const index = list.findIndex((q) => q.id === question.id);
  const previous = index !== -1 ? list[index] : null;

  // Detect newly solved event to log in Excel sheet
  const isNewlySolved = question.status === 'Solved' && (!previous || previous.status !== 'Solved');

  if (index !== -1) {
    list[index] = question;
  } else {
    list.push(question);
  }

  questionsDb[email.toLowerCase()] = list;
  writeJson(QUESTIONS_PATH, questionsDb);

  // Trigger Excel logs if newly solved
  if (isNewlySolved) {
    const profiles = readJson(PROFILES_PATH);
    const user = profiles[email.toLowerCase()] || { username: 'Anonymous' };
    await logSolve(email, user.username, question.title, question.difficulty, question.topic);
  }

  return res.status(200).json(list);
});

// 5. Delete Question Router
app.delete('/api/questions', (req, res) => {
  const { email, id } = req.body;
  if (!email || !id) {
    return res.status(400).json({ error: 'Email and ID are required.' });
  }

  const questionsDb = readJson(QUESTIONS_PATH);
  let list = questionsDb[email.toLowerCase()] || [];

  list = list.filter((q) => q.id !== id);
  questionsDb[email.toLowerCase()] = list;
  writeJson(QUESTIONS_PATH, questionsDb);

  return res.status(200).json(list);
});

// 6. Reset Questions list
app.post('/api/questions/reset', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email identifier is missing.' });
  }

  const questionsDb = readJson(QUESTIONS_PATH);
  questionsDb[email.toLowerCase()] = DEFAULT_QUESTIONS;
  writeJson(QUESTIONS_PATH, questionsDb);

  return res.status(200).json(DEFAULT_QUESTIONS);
});

// 6. Retrieve Scratchpad Notes
app.get('/api/memos', (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: 'Email parameter is required.' });
  }

  const memosDb = readJson(MEMOS_PATH);
  const memoText = memosDb[email.toLowerCase()] || '';

  return res.status(200).json({ memo: memoText });
});

// 7. Save Scratchpad Notes
app.post('/api/memos', (req, res) => {
  const { email, memo } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email identifier is missing.' });
  }

  const memosDb = readJson(MEMOS_PATH);
  memosDb[email.toLowerCase()] = memo || '';
  writeJson(MEMOS_PATH, memosDb);

  return res.status(200).json({ success: true });
});

// Serve static frontend assets from React build folder
const FRONTEND_DIST = path.join(__dirname, '../placement-prep-tracker/dist');
if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
  // Direct client routes fallback (React Router path support)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  });
}

// Start Express Server
app.listen(PORT, () => {
  console.log(`===========================================`);
  console.log(`🚀 Prep Tracker Backend Server Is Online!`);
  console.log(`👉 Running locally on http://localhost:${PORT}`);
  console.log(`📊 Spreadsheet logger armed at placement.xlsx`);
  console.log(`===========================================`);
});
