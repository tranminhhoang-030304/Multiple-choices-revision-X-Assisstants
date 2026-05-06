import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import db from './db';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  // Get all subjects
  app.get('/api/subjects', async (req, res) => {
    try {
      const subjects = await db.query('SELECT * FROM subjects');
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch subjects' });
    }
  });

  // AI Tutor Endpoint
  app.post('/api/ai/explain', async (req, res) => {
    try {
      const { question, userOption, correctOption } = req.body;
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      let prompt = '';
      
      if (!userOption) {
        prompt = `Câu hỏi CFA: "${question}"\nNgười dùng đang phân vân chưa biết chọn đáp án nào. Đừng nói thẳng đáp án đúng. Hãy gợi ý phần kiến thức cốt lõi liên quan để họ tự suy luận. Trả lời bằng tiếng Việt, thân thiện và ngắn gọn.`;
      } else if (userOption !== correctOption) {
        prompt = `Câu hỏi CFA: "${question}"\nNgười dùng đã chọn sai đáp án "${userOption}". Đáp án đúng là "${correctOption}". Hãy giải thích ngắn gọn bằng tiếng Việt tại sao đáp án của họ sai, tại sao đáp án kia đúng, và nhắc lại lý thuyết cốt lõi.`;
      } else {
        prompt = `Câu hỏi CFA: "${question}"\nNgười dùng đã chọn đúng đáp án "${correctOption}". Hãy phân tích chuyên sâu thêm một chút về phần lý thuyết này bằng tiếng Việt để giúp họ nhớ lâu hơn. Khích lệ họ.`;
      }

      const response = await ai.getGenerativeModel({ model: 'gemini-1.5-flash' }).generateContent(prompt);
      res.json({ explanation: response.response.text() });
    } catch (error) {
      console.error('AI Explain Error:', error);
      res.status(500).json({ error: 'AI hiện đang quá tải. Vui lòng thử lại sau.' });
    }
  });

  // Save Generated Questions
  app.post('/api/questions', async (req, res) => {
    try {
      const { subjectId, questions } = req.body;
      await db.insertQuestions(subjectId, questions);
      res.json({ success: true, count: questions.length });
    } catch (error) {
      console.error('Save Questions Error:', error);
      res.status(500).json({ error: 'Failed to save questions' });
    }
  });

  // Get Questions for Practice
  app.get('/api/practice/:subjectId', async (req, res) => {
    try {
      const { subjectId } = req.params;
      const { limit = 30 } = req.query;
      
      let questions;
      if (subjectId === 'ALL') {
        questions = await db.query('SELECT * FROM questions ORDER BY RANDOM() LIMIT ?', [limit]);
      } else {
        questions = await db.query('SELECT * FROM questions WHERE subject_id = ? ORDER BY RANDOM() LIMIT ?', [subjectId, limit]);
      }
      res.json(questions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch questions' });
    }
  });

  // Save Practice Session
  app.post('/api/practice/history', async (req, res) => {
    try {
      const { subjectId, score, total, duration } = req.body;
      await db.query('INSERT INTO practice_history (subject_id, score, total, duration) VALUES (?, ?, ?, ?)', [subjectId, score, total, duration]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save history' });
    }
  });

  // Get Statistics
  app.get('/api/stats', async (req, res) => {
    try {
      const subjectStats = await db.query(`
        SELECT s.id, s.name, 
               COUNT(q.id) as questionCount,
               COALESCE(SUM(h.score), 0) as totalCorrect,
               COALESCE(SUM(h.total), 0) as totalAttempted
        FROM subjects s
        LEFT JOIN questions q ON s.id = q.subject_id
        LEFT JOIN practice_history h ON s.id = h.subject_id
        GROUP BY s.id
      `);

      const recentHistory = await db.query('SELECT * FROM practice_history ORDER BY created_at DESC LIMIT 10');

      res.json({ subjectStats, recentHistory });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  // Vite middleware for development
  const isProduction = process.env.NODE_ENV === "production" || !!process.env.RENDER;
  
  if (!isProduction) {
    console.log('Running in DEVELOPMENT mode with Vite middleware');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    console.log(`Running in PRODUCTION mode. Serving static files from: ${distPath}`);
    
    app.use(express.static(distPath));
    
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error(`Error sending index.html from ${indexPath}:`, err);
          res.status(404).send('Frontend build (dist/index.html) not found. Please check build logs.');
        }
      });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });
}

startServer();
