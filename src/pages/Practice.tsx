import React, { useState, useEffect } from 'react';
import { 
  Play, 
  ChevronRight, 
  ChevronLeft, 
  Timer, 
  CheckCircle2, 
  XCircle, 
  Award,
  ArrowRight,
  RefreshCw,
  Search,
  Sparkles,
  Loader2,
  HelpCircle
} from 'lucide-react';
import { Subject, Question } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Practice() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [mode, setMode] = useState<'selection' | 'quiz' | 'result'>('selection');
  const [startTime, setStartTime] = useState<number>(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    fetch('/api/subjects').then(res => res.json()).then(setSubjects);
  }, []);

  const startQuiz = async (subjectId: string) => {
    const res = await fetch(`/api/practice/${subjectId}?limit=30`);
    const data = await res.json();
    
    if (data.length === 0) {
      alert('Môn học này chưa có câu hỏi. Vui lòng tải tài liệu lên trước.');
      return;
    }

    setQuestions(data.map((q: any) => ({
      ...q,
      options: JSON.parse(q.options)
    })));
    setSelectedSubject(subjectId);
    setMode('quiz');
    setCurrentIdx(0);
    setAnswers({});
    setShowExplanation(false);
    setAiExplanation('');
    setIsAiLoading(false);
    setStartTime(Date.now());
  };

  const handleSelectOption = (option: string) => {
    if (showExplanation) return;
    setAnswers({ ...answers, [currentIdx]: option });
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setShowExplanation(false);
      setAiExplanation('');
    } else {
      finishQuiz();
    }
  };

  const askAITutor = async (type: 'hint' | 'explain') => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    setAiExplanation('');
    
    const q = questions[currentIdx];
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q.question,
          userOption: type === 'explain' ? answers[currentIdx] : undefined,
          correctOption: q.answer
        })
      });
      const data = await res.json();
      setAiExplanation(data.explanation || data.error);
    } catch (err) {
      setAiExplanation('Lỗi kết nối AI. Vui lòng thử lại sau.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const finishQuiz = () => {
    const finalDuration = Math.floor((Date.now() - startTime) / 1000);
    setDuration(finalDuration);
    
    const score = questions.reduce((acc, q, idx) => {
      return answers[idx] === q.answer ? acc + 1 : acc;
    }, 0);

    // Save to history
    fetch('/api/practice/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjectId: selectedSubject,
        score,
        total: questions.length,
        duration: finalDuration
      })
    });

    setMode('result');
  };

  if (mode === 'selection') {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Thư viện Luyện tập</h1>
          <p className="text-slate-500 mt-2">Chọn môn học hoặc tổ hợp môn để bắt đầu ôn luyện.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            onClick={() => startQuiz('ALL')}
            className="group p-6 rounded-3xl bg-slate-900 text-white cursor-pointer hover:scale-[1.02] transition-all shadow-xl shadow-slate-900/10"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
              <Search className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold">Tổng hợp kiến thức</h3>
            <p className="text-slate-400 text-sm mt-2">Làm 30 câu ngẫu nhiên từ tất cả các môn đã học.</p>
            <div className="mt-8 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Mọi cấp độ</span>
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center group-hover:translate-x-2 transition-transform">
                <Play className="w-4 h-4 fill-white text-white" />
              </div>
            </div>
          </div>

          {subjects.map(subject => (
            <div 
              key={subject.id}
              onClick={() => startQuiz(subject.id)}
              className="group p-6 rounded-3xl bg-white border border-slate-100 cursor-pointer hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
                <span className="font-black text-blue-600">{subject.id}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800">{subject.name}</h3>
              <p className="text-slate-400 text-sm mt-2">Ôn tập chuyên sâu qua các câu hỏi trắc nghiệm của {subject.id}.</p>
              <div className="mt-8 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-300">CFA Level 1</span>
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:translate-x-2 transition-all">
                  <Play className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:fill-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'quiz') {
    const q = questions[currentIdx];
    const progress = ((currentIdx + 1) / questions.length) * 100;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {q.subject_id}
            </span>
            <span className="text-slate-500 font-medium tracking-tight">Câu hỏi {currentIdx + 1}/{questions.length}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 font-mono text-sm font-medium">
            <Timer className="w-4 h-4" />
            <span>{Math.floor((Date.now() - startTime) / 1000)}s</span>
          </div>
        </div>

        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-blue-600"
          />
        </div>

        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 leading-snug mb-10">
            {q.question}
          </h2>

          <div className="space-y-4">
            {q.options.map((option, idx) => {
              const isSelected = answers[currentIdx] === option;
              const isCorrect = q.answer === option;
              const showResult = showExplanation;

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(option)}
                  disabled={showResult}
                  className={cn(
                    "w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 group relative",
                    !showResult && "hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer active:scale-[0.99]",
                    isSelected && !showResult && "border-blue-600 bg-blue-50/50",
                    showResult && isCorrect && "border-emerald-500 bg-emerald-50",
                    showResult && isSelected && !isCorrect && "border-red-500 bg-red-50",
                    showResult && !isCorrect && !isSelected && "opacity-50 grayscale border-slate-200"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-sm border transition-colors",
                    isSelected ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-400 border-slate-200 group-hover:border-blue-400 group-hover:text-blue-600"
                  )}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="flex-1 font-medium">{option}</span>
                  {showResult && isCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                  {showResult && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-500" />}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {(showExplanation || aiExplanation || isAiLoading) && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-8 p-6 rounded-2xl bg-amber-50 border border-amber-100"
              >
                <div className="flex items-center gap-2 text-amber-900 font-bold mb-3">
                  <Sparkles className="w-4 h-4" />
                  Gia sư AI (Gemini)
                </div>
                
                {isAiLoading && (
                  <div className="flex items-center gap-3 text-amber-600 font-medium">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang phân tích câu trả lời của bạn...
                  </div>
                )}
                
                {aiExplanation && (
                  <p className="text-amber-800 text-sm leading-relaxed whitespace-pre-line">
                    {aiExplanation}
                  </p>
                )}

                {showExplanation && !aiExplanation && !isAiLoading && (
                  <div className="space-y-4">
                    <p className="text-amber-800 text-sm font-bold">
                      Đáp án đúng là: {q.answer}
                    </p>
                    <button 
                      onClick={() => askAITutor('explain')}
                      className="px-4 py-2 bg-amber-200 text-amber-900 rounded-lg text-sm font-bold hover:bg-amber-300 transition-colors flex items-center gap-2"
                    >
                      <HelpCircle className="w-4 h-4" /> 
                      {answers[currentIdx] === q.answer ? 'Xem giải thích chi tiết' : 'Tại sao tôi sai?'}
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 flex flex-wrap items-center gap-4 justify-between">
            {!showExplanation ? (
              <div className="flex gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => setShowExplanation(true)}
                  disabled={!answers[currentIdx]}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold disabled:opacity-30 transition-all hover:bg-slate-800 disabled:cursor-not-allowed flex-1 sm:flex-none"
                >
                  Kiểm tra đáp án
                </button>
                <button 
                  onClick={() => askAITutor('hint')}
                  disabled={!!answers[currentIdx]}
                  className="px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold disabled:opacity-30 transition-all hover:bg-blue-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  title="Gợi ý lý thuyết (Không nói thẳng đáp án)"
                >
                  <Sparkles className="w-4 h-4" /> Gợi ý
                </button>
              </div>
            ) : (
              <button 
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700 active:scale-[0.98]"
              >
                {currentIdx < questions.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành bài luyện tập'} 
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'result') {
    const score = questions.reduce((acc, q, idx) => answers[idx] === q.answer ? acc + 1 : acc, 0);
    const pass = score / questions.length >= 0.7;

    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <div className={cn(
          "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl",
          pass ? "bg-emerald-500 shadow-emerald-500/30" : "bg-orange-500 shadow-orange-500/30"
        )}>
          <Award className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold text-slate-900">
          {pass ? 'Tuyệt vời!' : 'Cố gắng lên!'}
        </h1>
        <p className="text-slate-500 mt-3 text-lg">
          Bạn đã hoàn thành bài luyện tập môn <strong>{selectedSubject}</strong>
        </p>

        <div className="grid grid-cols-2 gap-4 mt-12 mb-12">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">Điểm số</p>
            <p className="text-4xl font-black text-slate-900 mt-2">{score}/{questions.length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">Thời gian</p>
            <p className="text-4xl font-black text-slate-900 mt-2">{Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}</p>
          </div>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => setMode('selection')}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all"
          >
            Làm bài khác
          </button>
          <button 
            onClick={() => startQuiz(selectedSubject!)}
            className="w-full py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Làm lại bài này
          </button>
        </div>
      </div>
    );
  }

  return null;
}
