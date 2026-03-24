import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  LayoutGrid, 
  Archive, 
  Search,
  Settings,
  Clock,
  TrendingUp,
  Award,
  LogOut,
  LogIn,
  User
} from 'lucide-react';
import { useStorage } from './storage';
import { ProjectCard } from './components/ProjectCard';
import { ProjectDetail } from './components/ProjectDetail';
import { ProjectForm } from './components/ProjectForm';
import { Project, TARGET_SECONDS } from './types';
import { cn, formatDuration } from './lib/utils';
import { signIn, logOut } from './firebase';
import { AuthScreen } from './components/AuthScreen';

export default function App() {
  const { 
    projects, 
    logs, 
    loading, 
    user,
    addProject, 
    updateProject, 
    deleteProject, 
    addLog 
  } = useStorage();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedProject = useMemo(() => 
    projects.find(p => p.id === selectedProjectId),
    [projects, selectedProjectId]
  );

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesArchive = p.isArchived === showArchived;
      return matchesSearch && matchesArchive;
    });
  }, [projects, searchQuery, showArchived]);

  const totalInvestedSeconds = useMemo(() => 
    projects.reduce((acc, p) => acc + p.totalSeconds, 0),
    [projects]
  );

  const activeProjectsCount = projects.filter(p => !p.isArchived).length;
  const completedProjectsCount = projects.filter(p => p.totalSeconds >= TARGET_SECONDS).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (selectedProject) {
    return (
      <ProjectDetail
        project={selectedProject}
        logs={logs.filter(l => l.projectId === selectedProject.id)}
        onBack={() => setSelectedProjectId(null)}
        onLogTime={(seconds) => addLog(selectedProject.id, seconds)}
        onArchive={() => updateProject(selectedProject.id, { isArchived: !selectedProject.isArchived })}
        onDelete={() => {
          if (confirm('确定要删除这个项目吗？所有计时记录都将被永久删除。')) {
            deleteProject(selectedProject.id);
            setSelectedProjectId(null);
          }
        }}
        onEdit={() => setShowForm(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white px-6 pt-12 pb-6 rounded-b-[40px] shadow-sm">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">一万小时</h1>
            <p className="text-gray-500 font-medium">精进人生，从每一刻开始。</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3 bg-gray-50 p-1.5 pr-4 rounded-full border border-gray-100">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <User size={16} />
                </div>
              )}
              <span className="text-xs font-bold text-gray-700 truncate max-w-[80px]">
                {user.displayName?.split(' ')[0] || '用户'}
              </span>
              <button 
                onClick={logOut}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{Math.floor(totalInvestedSeconds / 3600)}h</p>
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">总投入</p>
          </div>
          <div className="text-center border-x border-gray-100">
            <p className="text-2xl font-bold text-gray-900">{activeProjectsCount}</p>
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">进行中</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{completedProjectsCount}</p>
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">已精通</p>
          </div>
        </div>
      </header>

      {/* Search & Filter */}
      <div className="px-6 mt-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="搜索项目..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-none shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowArchived(false)}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-bold transition-all",
              !showArchived ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-500"
            )}
          >
            进行中
          </button>
          <button
            onClick={() => setShowArchived(true)}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-bold transition-all",
              showArchived ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-500"
            )}
          >
            已归档
          </button>
        </div>
      </div>

      {/* Project List */}
      <div className="px-6 mt-6 space-y-4">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[32px] border-2 border-dashed border-gray-200">
            <LayoutGrid size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-medium">
              {searchQuery ? '未找到匹配项目' : showArchived ? '暂无归档项目' : '开启你的第一个人生项目吧！'}
            </p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={(p) => setSelectedProjectId(p.id)}
            />
          ))
        )}
      </div>

      {/* Floating Action Button */}
      {!showArchived && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowForm(true)}
          className="fixed bottom-8 right-8 w-16 h-16 rounded-3xl bg-blue-600 text-white shadow-2xl flex items-center justify-center hover:bg-blue-700 transition-all z-20"
        >
          <Plus size={32} strokeWidth={3} />
        </motion.button>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showForm && (
          <ProjectForm
            onClose={() => setShowForm(false)}
            onSave={(data) => {
              if (selectedProject) {
                updateProject(selectedProject.id, data);
              } else {
                addProject(data as any);
              }
              setShowForm(false);
            }}
            initialProject={selectedProject}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
