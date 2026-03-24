import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Settings, 
  History, 
  BarChart3, 
  Archive, 
  Trash2,
  Play,
  Calendar,
  Clock
} from 'lucide-react';
import { Project, TimeLog } from '../types';
import { cn, formatDuration, getProgress } from '../lib/utils';
import { Timer } from './Timer';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';

interface ProjectDetailProps {
  project: Project;
  logs: TimeLog[];
  onBack: () => void;
  onLogTime: (seconds: number) => void;
  onArchive: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

export function ProjectDetail({ 
  project, 
  logs, 
  onBack, 
  onLogTime, 
  onArchive, 
  onDelete,
  onEdit
}: ProjectDetailProps) {
  const [activeTab, setActiveTab] = React.useState<'timer' | 'stats' | 'history'>('timer');

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      return {
        date: format(date, 'MM/dd'),
        fullDate: startOfDay(date),
        seconds: 0
      };
    }).reverse();

    logs.forEach(log => {
      const logDate = startOfDay(new Date(log.startTime));
      const dayData = last7Days.find(d => isSameDay(d.fullDate, logDate));
      if (dayData) {
        dayData.seconds += log.seconds;
      }
    });

    return last7Days.map(d => ({
      name: d.date,
      hours: Math.round((d.seconds / 3600) * 10) / 10
    }));
  }, [logs]);

  const progress = getProgress(project.totalSeconds, project.targetSeconds);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-10 border-b border-gray-100">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 px-4 text-center">
          <h1 className="font-bold text-lg text-gray-900 truncate">{project.name}</h1>
          <p className="text-xs text-gray-500">
            {formatDuration(project.totalSeconds)} / {formatDuration(project.targetSeconds)}
          </p>
        </div>
        <button onClick={onEdit} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Settings size={24} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {/* Progress Card */}
        <div className="p-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-end mb-4">
              <div>
                <span className="text-4xl font-bold text-gray-900">{progress}%</span>
                <p className="text-sm text-gray-500 mt-1">精通进度</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-semibold" style={{ color: project.color }}>
                  {Math.floor(project.totalSeconds / 3600)}h
                </span>
                <p className="text-xs text-gray-400">累计投入</p>
              </div>
            </div>
            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full rounded-full"
                style={{ backgroundColor: project.color }}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 mb-6">
          <div className="bg-gray-200/50 p-1 rounded-2xl flex">
            {[
              { id: 'timer', icon: Play, label: '计时' },
              { id: 'stats', icon: BarChart3, label: '统计' },
              { id: 'history', icon: History, label: '历史' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all",
                  activeTab === tab.id 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <tab.icon size={18} />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-4">
          {activeTab === 'timer' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
            >
              <Timer color={project.color} onStop={onLogTime} />
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Calendar size={20} className="text-blue-500" />
                  最近 7 天 (小时)
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={project.color} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={project.color} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: '#9ca3af' }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: '#9ca3af' }}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="hours" 
                        stroke={project.color} 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorHours)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">日均投入</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {(chartData.reduce((acc, d) => acc + d.hours, 0) / 7).toFixed(1)}h
                  </p>
                </div>
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">记录总数</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{logs.length}</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {logs.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                  <History size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-400">暂无记录，开始计时吧！</p>
                </div>
              ) : (
                logs.slice().reverse().map((log) => (
                  <div key={log.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{formatDuration(log.seconds)}</p>
                      <p className="text-xs text-gray-400">{format(new Date(log.startTime), 'yyyy年MM月dd日 HH:mm')}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                      <Clock size={18} />
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="p-4 mt-8 space-y-4">
          <button 
            onClick={onArchive}
            className="w-full py-4 rounded-2xl bg-gray-100 text-gray-600 font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
          >
            <Archive size={20} />
            {project.isArchived ? '重新开启项目' : '归档项目'}
          </button>
          <button 
            onClick={onDelete}
            className="w-full py-4 rounded-2xl bg-red-50 text-red-600 font-semibold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
          >
            <Trash2 size={20} />
            删除项目
          </button>
        </div>
      </main>
    </div>
  );
}
