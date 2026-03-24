import { useState, useEffect } from 'react';
import { Project, TimeLog } from './types';

const PROJECTS_KEY = '10000hours_projects';
const LOGS_KEY = '10000hours_logs';

export function useStorage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [logs, setLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedProjects = localStorage.getItem(PROJECTS_KEY);
    const storedLogs = localStorage.getItem(LOGS_KEY);

    if (storedProjects) setProjects(JSON.parse(storedProjects));
    if (storedLogs) setLogs(JSON.parse(storedLogs));
    
    setLoading(false);
  }, []);

  const saveProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(newProjects));
  };

  const saveLogs = (newLogs: TimeLog[]) => {
    setLogs(newLogs);
    localStorage.setItem(LOGS_KEY, JSON.stringify(newLogs));
  };

  const addProject = (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: Project = {
      ...project,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveProjects([...projects, newProject]);
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    const newProjects = projects.map(p => 
      p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
    );
    saveProjects(newProjects);
  };

  const deleteProject = (id: string) => {
    saveProjects(projects.filter(p => p.id !== id));
    saveLogs(logs.filter(l => l.projectId !== id));
  };

  const addLog = (projectId: string, seconds: number) => {
    const newLog: TimeLog = {
      id: Math.random().toString(36).substr(2, 9),
      projectId,
      seconds,
      startTime: Date.now() - seconds * 1000,
      endTime: Date.now(),
    };
    
    const newLogs = [...logs, newLog];
    saveLogs(newLogs);

    // Update project total time
    const project = projects.find(p => p.id === projectId);
    if (project) {
      updateProject(projectId, { 
        totalSeconds: project.totalSeconds + seconds 
      });
    }
  };

  return {
    projects,
    logs,
    loading,
    addProject,
    updateProject,
    deleteProject,
    addLog,
  };
}
