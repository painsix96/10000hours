import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Check } from 'lucide-react';
import { Project, PROJECT_COLORS, PROJECT_ICONS, TARGET_SECONDS } from '../types';
import { cn } from '../lib/utils';
import { 
  Book, Code, Music, Palette, Dumbbell, Heart, Briefcase, Coffee, Camera, Globe, Clock
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Book, Code, Music, Palette, Dumbbell, Heart, Briefcase, Coffee, Camera, Globe
};

interface ProjectFormProps {
  onClose: () => void;
  onSave: (project: Partial<Project>) => void;
  initialProject?: Project;
}

export function ProjectForm({ onClose, onSave, initialProject }: ProjectFormProps) {
  const [name, setName] = useState(initialProject?.name || '');
  const [description, setDescription] = useState(initialProject?.description || '');
  const [color, setColor] = useState(initialProject?.color || PROJECT_COLORS[0]);
  const [icon, setIcon] = useState(initialProject?.icon || PROJECT_ICONS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onSave({
      name,
      description,
      color,
      icon,
      targetSeconds: TARGET_SECONDS,
      totalSeconds: initialProject?.totalSeconds || 0,
      isArchived: initialProject?.isArchived || false,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    >
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {initialProject ? '编辑项目' : '新建项目'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">项目名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：学吉他、编程、健身"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">描述（可选）</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="你的目标是什么？"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none h-24"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">图标</label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_ICONS.map((iconName) => {
                const Icon = ICON_MAP[iconName] || Clock;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={cn(
                      "p-3 rounded-xl border-2 transition-all",
                      icon === iconName 
                        ? "border-blue-500 bg-blue-50 text-blue-600" 
                        : "border-gray-100 hover:border-gray-200 text-gray-400"
                    )}
                  >
                    <Icon size={20} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">颜色</label>
            <div className="flex flex-wrap gap-3">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 border-white shadow-sm transition-all transform hover:scale-110",
                    color === c ? "ring-2 ring-blue-500 scale-110" : "ring-0"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg shadow-lg hover:bg-blue-700 transition-all transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Check size={24} />
            保存项目
          </button>
        </form>
      </div>
    </motion.div>
  );
}
