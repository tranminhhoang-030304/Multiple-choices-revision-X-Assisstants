import React, { useEffect, useState } from 'react';
import { History as HistoryIcon, ArrowUpRight, Clock, Award } from 'lucide-react';
import { PracticeHistory, Subject } from '../types';
import { cn } from '../lib/utils';

export default function HistoryPage() {
  const [history, setHistory] = useState<PracticeHistory[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then(res => res.json()),
      fetch('/api/subjects').then(res => res.json())
    ]).then(([statsData, subjectsData]) => {
      setHistory(statsData.recentHistory);
      setSubjects(subjectsData);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <HistoryIcon className="w-8 h-8 text-blue-600" />
          Lịch sử Luyện tập
        </h1>
        <p className="text-slate-500 mt-2">Xem lại kết quả các bài thi thử bạn đã thực hiện.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-bottom border-slate-200">
                <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-widest">Môn học</th>
                <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-widest">Kết quả</th>
                <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-widest">Tỷ lệ</th>
                <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-widest">Thời gian</th>
                <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-widest">Ngày thực hiện</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400">
                    <HistoryIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    Chưa có dữ liệu luyện tập nào.
                  </td>
                </tr>
              ) : (
                history.map((item) => {
                  const subjectName = subjects.find(s => s.id === item.subject_id)?.name || 'Tổng hợp';
                  const percentage = Math.round((item.score / item.total) * 100);
                  const isPass = percentage >= 70;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 font-bold flex items-center justify-center shrink-0">
                            {item.subject_id}
                          </div>
                          <span className="font-bold text-slate-800">{subjectName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-black text-slate-900">{item.score}</span>
                          <span className="text-slate-400">/ {item.total}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                          isPass ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                        )}>
                          {isPass ? <Award className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {percentage}%
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-500 font-mono text-sm">
                          <Clock className="w-4 h-4" />
                          {Math.floor(item.duration / 60)}m {item.duration % 60}s
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">{new Date(item.created_at).toLocaleString('vi-VN')}</span>
                          <ArrowUpRight className="w-5 h-5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
