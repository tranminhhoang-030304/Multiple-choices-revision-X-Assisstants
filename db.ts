import path from 'path';
import pg from 'pg';

const isPostgres = !!process.env.DATABASE_URL;

let db: any = null;
let pgPool: pg.Pool | null = null;

async function initDb() {
  if (isPostgres) {
    if (!pgPool) {
      pgPool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      });
    }
  } else {
    if (!db) {
      // Dynamic import to avoid loading better-sqlite3 on Vercel
      const { default: Database } = await import('better-sqlite3');
      db = new Database(path.join(process.cwd(), 'cfa.db'));
      
      db.exec(`
        CREATE TABLE IF NOT EXISTS subjects (id TEXT PRIMARY KEY, name TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS materials (id INTEGER PRIMARY KEY AUTOINCREMENT, subject_id TEXT NOT NULL, filename TEXT NOT NULL, content TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS questions (id INTEGER PRIMARY KEY AUTOINCREMENT, subject_id TEXT NOT NULL, question TEXT NOT NULL, options TEXT NOT NULL, answer TEXT NOT NULL, explanation TEXT NOT NULL, difficulty TEXT DEFAULT 'medium', is_favorite BOOLEAN DEFAULT 0, last_practiced DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS practice_history (id INTEGER PRIMARY KEY AUTOINCREMENT, subject_id TEXT NOT NULL, score INTEGER NOT NULL, total INTEGER NOT NULL, duration INTEGER NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
      `);

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
    }
  }
}

// Unified Query Interface
export const query = async (sql: string, params: any[] = []) => {
  await initDb();
  if (isPostgres && pgPool) {
    const res = await pgPool.query(sql.replace(/\?/g, (_, i) => `$${i + 1}`), params);
    return res.rows;
  } else if (db) {
    const stmt = db.prepare(sql);
    return sql.trim().toUpperCase().startsWith('SELECT') ? stmt.all(...params) : stmt.run(...params);
  }
  return [];
};

// Specialized transaction for bulk insert
export const insertQuestions = async (subjectId: string, questions: any[]) => {
  await initDb();
  if (isPostgres && pgPool) {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      for (const q of questions) {
        await client.query(
          'INSERT INTO questions (subject_id, question, options, answer, explanation) VALUES ($1, $2, $3, $4, $5)',
          [subjectId, q.question, JSON.stringify(q.options), q.answer, q.explanation]
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } else if (db) {
    const stmt = db.prepare('INSERT INTO questions (subject_id, question, options, answer, explanation) VALUES (?, ?, ?, ?, ?)');
    const insertMany = db.transaction((qs) => {
      for (const q of qs) {
        stmt.run(subjectId, q.question, JSON.stringify(q.options), q.answer, q.explanation);
      }
    });
    insertMany(questions);
  }
};

export default { query, insertQuestions };
