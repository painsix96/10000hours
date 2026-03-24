import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  getDocFromServer,
  writeBatch
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { Project, TimeLog } from './types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function useStorage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [logs, setLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (!u) {
        setProjects([]);
        setLogs([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    const projectsQuery = query(collection(db, 'projects'), where('uid', '==', user.uid));
    const logsQuery = query(collection(db, 'logs'), where('uid', '==', user.uid));

    const unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Project));
      setProjects(projectsData);
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'projects'));

    const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as TimeLog));
      setLogs(logsData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'logs'));

    return () => {
      unsubscribeProjects();
      unsubscribeLogs();
    };
  }, [user]);

  const addProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const path = 'projects';
    try {
      const docRef = doc(collection(db, path));
      const newProject = {
        ...project,
        id: docRef.id,
        uid: user.uid,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await setDoc(docRef, newProject);
      return newProject;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    if (!user) return;
    const path = `projects/${id}`;
    try {
      const docRef = doc(db, 'projects', id);
      await updateDoc(docRef, { ...updates, updatedAt: Date.now() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const deleteProject = async (id: string) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'projects', id));
      
      // Delete associated logs
      const projectLogs = logs.filter(l => l.projectId === id);
      projectLogs.forEach(l => {
        batch.delete(doc(db, 'logs', l.id));
      });

      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `projects/${id}`);
    }
  };

  const addLog = async (projectId: string, seconds: number) => {
    if (!user) return;
    const path = 'logs';
    try {
      const logRef = doc(collection(db, path));
      const newLog: TimeLog = {
        id: logRef.id,
        projectId,
        seconds,
        startTime: Date.now() - seconds * 1000,
        endTime: Date.now(),
        uid: user.uid,
      };
      
      await setDoc(logRef, newLog);

      // Update project total time
      const project = projects.find(p => p.id === projectId);
      if (project) {
        await updateProject(projectId, { 
          totalSeconds: project.totalSeconds + seconds 
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  return {
    projects,
    logs,
    loading,
    user,
    addProject,
    updateProject,
    deleteProject,
    addLog,
  };
}
