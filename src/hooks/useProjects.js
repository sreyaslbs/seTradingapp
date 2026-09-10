import { useState, useEffect } from 'react';
import {
  collection, collectionGroup, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, onSnapshot, Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export function useProjects() {
  const { user, effectiveUserId, isViewingAll } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    let q;
    if (isViewingAll) {
      // Query across all users
      q = query(collectionGroup(db, 'projects'), orderBy('createdAt', 'desc'));
    } else if (effectiveUserId) {
      // Query specific user (own account or inspected user)
      q = query(
        collection(db, 'users', effectiveUserId, 'projects'),
        orderBy('createdAt', 'desc')
      );
    } else {
      setProjects([]);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setProjects(
          snap.docs.map((d) => ({
            id: d.id,
            ownerUid: d.ref.parent.parent ? d.ref.parent.parent.id : null,
            ...d.data(),
          }))
        );
        setLoading(false);
      },
      (error) => {
        console.error('Firestore onSnapshot error (projects):', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user, effectiveUserId, isViewingAll]);

  const addProject = async (data) => {
    const targetUid = effectiveUserId || user?.uid;
    if (!targetUid) {
      throw new Error('You must be signed in to add a project.');
    }

    const payload = {
      name: (data.name || '').trim(),
      client: (data.client || '').trim(),
      contractAmount: Number(data.contractAmount) || 0,
      startDate: data.startDate ? Timestamp.fromDate(new Date(data.startDate)) : Timestamp.now(),
      endDate: data.endDate ? Timestamp.fromDate(new Date(data.endDate)) : null,
      status: data.status || 'active',
      createdAt: Timestamp.now(),
    };

    return await addDoc(collection(db, 'users', targetUid, 'projects'), payload);
  };

  const updateProject = async (id, data, customUid = null) => {
    const targetUid = customUid || effectiveUserId || user?.uid;
    if (!targetUid) {
      throw new Error('You must be signed in to update a project.');
    }

    const ref = doc(db, 'users', targetUid, 'projects', id);
    const payload = {
      name: (data.name || '').trim(),
      client: (data.client || '').trim(),
      contractAmount: Number(data.contractAmount) || 0,
      startDate: data.startDate ? Timestamp.fromDate(new Date(data.startDate)) : Timestamp.now(),
      endDate: data.endDate ? Timestamp.fromDate(new Date(data.endDate)) : null,
      status: data.status || 'active',
    };

    return await updateDoc(ref, payload);
  };

  const deleteProject = async (id, customUid = null) => {
    const targetUid = customUid || effectiveUserId || user?.uid;
    if (!targetUid) {
      throw new Error('You must be signed in to delete a project.');
    }
    return await deleteDoc(doc(db, 'users', targetUid, 'projects', id));
  };

  return { projects, loading, addProject, updateProject, deleteProject };
}
