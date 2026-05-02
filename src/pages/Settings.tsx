import React from 'react';
import { Settings as SettingsIcon, ShieldCheck, Key, Cpu, HelpCircle } from 'lucide-react';

export default function Settings() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-blue-600" />
          Cài đặt hệ thống
        </h1>
        <p className="text-slate-500 mt-2">Quản lý cấu hình AI và thông tin ứng dụng.</p>
      </div>

      <div className="space-y-6">
        <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Cấu hình Gemini AI</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Key className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="font-bold text-slate-800">Gemini API Key</p>
                  <p className="text-sm text-slate-500">Được quản lý qua biến môi trường hệ thống</p>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase">
                Đã kết nối
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-4">
              <HelpCircle className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-blue-900 mb-1">Cách thay đổi API Key?</p>
                <p className="text-sm text-blue-800 leading-relaxed">
                  Để đảm bảo bảo mật, API Key không được nhập trực tiếp trên giao diện web. Bạn hãy cập nhật biến 
                  <code className="mx-1 px-1.5 py-0.5 bg-blue-200 rounded text-blue-900 font-mono">GEMINI_API_KEY</code> 
                  trong file <code className="mx-1 px-1.5 py-0.5 bg-blue-200 rounded text-blue-900 font-mono">.env</code> 
                  ở thư mục gốc của project, sau đó khởi động lại server.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Thông tin Ứng dụng</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Phiên bản</p>
              <p className="text-lg font-bold text-slate-800">1.0.0 (BETA)</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Model AI</p>
              <p className="text-lg font-bold text-slate-800">Gemini 3 Flash</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Database</p>
              <p className="text-lg font-bold text-slate-800">SQLite 3</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Cấp độ</p>
              <p className="text-lg font-bold text-slate-800">CFA Level 1</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
