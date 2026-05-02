import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { TrendingUp, CheckCircle2, Clock, BookOpen } from 'lucide-react';
import { Stats } from '../types';

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  const totalQuestions = stats?.subjectStats.reduce((acc, s) => acc + s.questionCount, 0) || 0;
  const totalAttempted = stats?.subjectStats.reduce((acc, s) => acc + s.totalAttempted, 0) || 0;
  const totalCorrect = stats?.subjectStats.reduce((acc, s) => acc + s.totalCorrect, 0) || 0;
  const avgScore = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Chào mừng trở lại!</h1>
        <p className="text-slate-500 mt-2">Dưới đây là tiến độ học tập CFA Level 1 của bạn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          icon={BookOpen} 
          label="Tổng câu hỏi" 
          value={totalQuestions} 
          color="blue" 
        />
        <StatCard 
          icon={CheckCircle2} 
          label="Đã làm" 
          value={totalAttempted} 
          color="emerald" 
        />
        <StatCard 
          icon={TrendingUp} 
          label="Tỷ lệ đúng" 
          value={`${avgScore}%`} 
          color="orange" 
        />
        <StatCard 
          icon={Clock} 
          label="Buổi học cuối" 
          value={stats?.recentHistory[0] ? new Date(stats.recentHistory[0].created_at).toLocaleDateString('vi-VN') : 'N/A'} 
          color="purple" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Tiến độ theo môn học</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.subjectStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="id" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="questionCount" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Số câu hỏi">
                  {stats?.subjectStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#60a5fa'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Lịch sử luyện tập mới nhất</h2>
          <div className="space-y-4">
            {stats?.recentHistory.length === 0 ? (
              <p className="text-slate-400 text-center py-12">Chưa có lịch sử làm bài.</p>
            ) : (
              stats?.recentHistory.map((history) => (
                <div key={history.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {history.subject_id}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">
                        {stats.subjectStats.find(s => s.id === history.subject_id)?.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {new Date(history.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{history.score}/{history.total}</p>
                    <p className="text-xs text-slate-400">{Math.round(history.duration / 60)} phút</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className={`w-12 h-12 rounded-xl ${colors[color]} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}
