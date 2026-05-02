import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'cfa.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id TEXT NOT NULL,
    question TEXT NOT NULL,
    options TEXT NOT NULL, -- JSON array
    answer TEXT NOT NULL,
    explanation TEXT NOT NULL,
    difficulty TEXT DEFAULT 'medium',
    is_favorite BOOLEAN DEFAULT 0,
    last_practiced DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS practice_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    duration INTEGER NOT NULL, -- seconds
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Initial subjects
const subjects = [
  { id: 'ETH', name: 'Ethics and Professional Standards' },
  { id: 'QM', name: 'Quantitative Methods' },
  { id: 'ECON', name: 'Economics' },
  { id: 'FSA', name: 'Financial Statement Analysis' },
  { id: 'CI', name: 'Corporate Issuers' },
  { id: 'EQ', name: 'Equity Investments' },
  { id: 'FI', name: 'Fixed Income' },
  { id: 'DER', name: 'Derivatives' },
  { id: 'AI', name: 'Alternative Investments' },
  { id: 'PM', name: 'Portfolio Management' }
];

const insertSubject = db.prepare('INSERT OR IGNORE INTO subjects (id, name) VALUES (?, ?)');
for (const subject of subjects) {
  insertSubject.run(subject.id, subject.name);
}

export default db;
