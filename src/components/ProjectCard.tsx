import React from 'react';
import { motion } from 'motion/react';
import { 
  Book, 
  Code, 
  Music, 
  Palette, 
  Dumbbell, 
  Heart, 
  Briefcase, 
  Coffee, 
  Camera, 
  Globe,
  Clock,
  ChevronRight
} from 'lucide-react';
import { Project } from '../types';
import { cn, formatDuration, getProgress } from '../lib/utils';

const ICON_MAP: Record<string, any> = {
  Book, Code, Music, Palette, Dumbbell, Heart, Briefcase, Coffee, Camera, Globe
};

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const Icon = ICON_MAP[project.icon] || Clock;
  const progress = getProgress(project.totalSeconds, project.targetSeconds);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(project)}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 cursor-pointer flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${project.color}20`, color: project.color }}
          >
            <Icon size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{project.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-1">{project.description}</p>
          </div>
        </div>
        <ChevronRight className="text-gray-300" size={20} />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">进度</span>
          <span className="font-medium text-gray-900">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full rounded-full"
            style={{ backgroundColor: project.color }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>已投入 {formatDuration(project.totalSeconds)}</span>
          <span>目标 {formatDuration(project.targetSeconds)}</span>
        </div>
      </div>
    </motion.div>
  );
}
