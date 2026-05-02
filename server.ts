import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import db from './db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  // Get all subjects
  app.get('/api/subjects', (req, res) => {
    const subjects = db.prepare('SELECT * FROM subjects').all();
    res.json(subjects);
  });

  // AI Tutor Endpoint
  app.post('/api/ai/explain', async (req, res) => {
    try {
      const { question, userOption, correctOption } = req.body;
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      let prompt = '';
      
      if (!userOption) {
        prompt = `Câu hỏi CFA: "${question}"\nNgười dùng đang phân vân chưa biết chọn đáp án nào. Đừng nói thẳng đáp án đúng. Hãy gợi ý phần kiến thức cốt lõi liên quan để họ tự suy luận. Trả lời bằng tiếng Việt, thân thiện và ngắn gọn.`;
      } else if (userOption !== correctOption) {
        prompt = `Câu hỏi CFA: "${question}"\nNgười dùng đã chọn sai đáp án "${userOption}". Đáp án đúng là "${correctOption}". Hãy giải thích ngắn gọn bằng tiếng Việt tại sao đáp án của họ sai, tại sao đáp án kia đúng, và nhắc lại lý thuyết cốt lõi.`;
      } else {
        prompt = `Câu hỏi CFA: "${question}"\nNgười dùng đã chọn đúng đáp án "${correctOption}". Hãy phân tích chuyên sâu thêm một chút về phần lý thuyết này bằng tiếng Việt để giúp họ nhớ lâu hơn. Khích lệ họ.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      res.json({ explanation: response.text });
    } catch (error) {
      console.error('AI Explain Error:', error);
      res.status(500).json({ error: 'AI hiện đang quá tải. Vui lòng thử lại sau.' });
    }
  });

  // Save Generated Questions
  app.post('/api/questions', (req, res) => {
    try {
      const { subjectId, questions } = req.body;
      const stmt = db.prepare('INSERT INTO questions (subject_id, question, options, answer, explanation) VALUES (?, ?, ?, ?, ?)');
      
      const insertMany = db.transaction((qs) => {
        for (const q of qs) {
          stmt.run(subjectId, q.question, JSON.stringify(q.options), q.answer, q.explanation);
        }
      });

      insertMany(questions);
      res.json({ success: true, count: questions.length });
    } catch (error) {
      console.error('Save Questions Error:', error);
      res.status(500).json({ error: 'Failed to save questions' });
    }
  });

  // Get Questions for Practice
  app.get('/api/practice/:subjectId', (req, res) => {
    const { subjectId } = req.params;
    const { limit = 30 } = req.query;
    
    let stmt;
    if (subjectId === 'ALL') {
      stmt = db.prepare('SELECT * FROM questions ORDER BY RANDOM() LIMIT ?');
      res.json(stmt.all(limit));
    } else {
      stmt = db.prepare('SELECT * FROM questions WHERE subject_id = ? ORDER BY RANDOM() LIMIT ?');
      res.json(stmt.all(subjectId, limit));
    }
  });

  // Save Practice Session
  app.post('/api/practice/history', (req, res) => {
    const { subjectId, score, total, duration } = req.body;
    const stmt = db.prepare('INSERT INTO practice_history (subject_id, score, total, duration) VALUES (?, ?, ?, ?)');
    stmt.run(subjectId, score, total, duration);
    res.json({ success: true });
  });

  // Get Statistics
  app.get('/api/stats', (req, res) => {
    const subjectStats = db.prepare(`
      SELECT s.id, s.name, 
             COUNT(q.id) as questionCount,
             COALESCE(SUM(h.score), 0) as totalCorrect,
             COALESCE(SUM(h.total), 0) as totalAttempted
      FROM subjects s
      LEFT JOIN questions q ON s.id = q.subject_id
      LEFT JOIN practice_history h ON s.id = h.subject_id
      GROUP BY s.id
    `).all();

    const recentHistory = db.prepare('SELECT * FROM practice_history ORDER BY created_at DESC LIMIT 10').all();

    res.json({ subjectStats, recentHistory });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
