import React, { useState, useEffect } from 'react';
import { Upload as UploadIcon, FileText, CheckCircle, AlertCircle, Loader2, Database } from 'lucide-react';
import { cn } from '../lib/utils';
import { Subject } from '../types';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'idle' | 'parsing' | 'saving' | 'success'>('idle');
  const [error, setError] = useState('');
  const [questionCount, setQuestionCount] = useState(0);

  useEffect(() => {
    fetch('/api/subjects').then(res => res.json()).then(setSubjects);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const parseTextToQuestions = (text: string) => {
    const blocks = text.split('---').map(b => b.trim()).filter(b => b.length > 10);
    return blocks.map(block => {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l);
      let question = '';
      let options: string[] = [];
      let answer = '';
      let explanation = '';
      
      lines.forEach(line => {
        if (line.startsWith('Q:')) question = line.substring(2).trim();
        else if (line.match(/^[A-D]:/)) options.push(line.substring(2).trim());
        else if (line.startsWith('ANSWER:')) answer = line.substring(7).trim();
        else if (line.startsWith('EXPLANATION:')) explanation = line.substring(12).trim();
      });
      
      // Attempt to map "A", "B" etc. to the actual option text
      const ansIndex = answer.charCodeAt(0) - 65; // A=0, B=1, C=2
      const finalAnswer = options[ansIndex] || answer;

      if (!question || options.length === 0) {
        throw new Error('Một câu hỏi trong file text không đúng định dạng Q: và A: B: C:');
      }

      return { question, options, answer: finalAnswer, explanation: explanation || "Không có giải thích chi tiết." };
    });
  };

  const handleUpload = async () => {
    if (!file || !selectedSubject) return;

    setLoading(true);
    setStep('parsing');
    setError('');

    try {
      const text = await file.text();
      let questions = [];

      if (file.name.endsWith('.json')) {
        try {
          const parsed = JSON.parse(text);
          questions = Array.isArray(parsed) ? parsed : parsed.questions;
          if (!questions || !Array.isArray(questions)) throw new Error('File JSON không đúng cấu trúc mảng.');
        } catch (e) {
          throw new Error('File JSON không hợp lệ hoặc sai cấu trúc.');
        }
      } else if (file.name.endsWith('.txt')) {
        questions = parseTextToQuestions(text);
      } else {
        throw new Error('Định dạng file không được hỗ trợ. Vui lòng dùng .json hoặc .txt');
      }

      setQuestionCount(questions.length);
      setStep('saving');

      // Send to backend directly
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: selectedSubject,
          questions: questions
        })
      });

      if (!res.ok) throw new Error('Không thể lưu vào Database.');

      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra trong quá trình đọc file.');
      setStep('idle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-3">
          <Database className="w-8 h-8 text-blue-600" />
          Nhập dữ liệu ngân hàng câu hỏi
        </h1>
        <p className="text-slate-500 mt-2">Hỗ trợ file cấu trúc chuẩn (.json) hoặc file văn bản (.txt)</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Chọn môn học</label>
          <select 
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-slate-50"
          >
            <option value="">-- Chọn môn --</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Tệp dữ liệu (.json, .txt)</label>
          <div 
            className={cn(
              "border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center cursor-pointer",
              file ? "border-blue-300 bg-blue-50" : "border-slate-200 hover:border-slate-300"
            )}
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <input 
              id="fileInput"
              type="file" 
              accept=".json,.txt" 
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <>
                <FileText className="w-12 h-12 text-blue-500 mb-3" />
                <p className="text-slate-900 font-medium">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
              </>
            ) : (
              <>
                <UploadIcon className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-slate-600 font-medium tracking-tight">Kéo thả hoặc nhấn để chọn file</p>
                <p className="text-xs text-slate-400 mt-1">Chỉ chấp nhận file JSON hoặc TXT theo chuẩn</p>
              </>
            )}
          </div>
          
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 space-y-2">
            <p className="font-bold text-slate-700">Hướng dẫn định dạng TXT:</p>
            <pre className="bg-white p-2 rounded-lg border border-slate-100 overflow-x-auto text-[10px] sm:text-xs">
{`Q: Câu hỏi số 1?
A: Đáp án A
B: Đáp án B
C: Đáp án C
ANSWER: A
EXPLANATION: Giải thích ngắn gọn
---
Q: Câu hỏi số 2?...`}
            </pre>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-600 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {step !== 'idle' && step !== 'success' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-blue-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className={cn("text-sm font-medium", "animate-pulse")}>
                {step === 'parsing' ? 'Đang đọc cấu trúc file...' : 'Đang Insert vào Cơ sở dữ liệu...'}
              </span>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-emerald-900">Thành công!</h3>
            <p className="text-sm text-emerald-700 mt-1">
              Đã chèn thành công <strong>{questionCount}</strong> câu hỏi vào ngân hàng đề thi.
            </p>
            <button 
              onClick={() => { setStep('idle'); setFile(null); setQuestionCount(0); }}
              className="mt-6 text-emerald-600 font-bold hover:underline"
            >
              Tiếp tục Import file khác
            </button>
          </div>
        )}

        <button 
          onClick={handleUpload}
          disabled={!file || !selectedSubject || loading || step === 'success'}
          className={cn(
            "w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all",
            !file || !selectedSubject || loading || step === 'success'
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-blue-600 text-white shadow-xl shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0"
          )}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Database className="w-5 h-5" />
              Lưu vào Ngân hàng câu hỏi
            </>
          )}
        </button>
      </div>
    </div>
  );
}
