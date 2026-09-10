import { useState, useEffect } from 'react';
import {
  collection, collectionGroup, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, onSnapshot, Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export function useExpenses() {
  const { user, effectiveUserId, isViewingAll } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    let q;
    if (isViewingAll) {
      // Query across all users
      q = query(collectionGroup(db, 'expenses'), orderBy('date', 'desc'));
    } else if (effectiveUserId) {
      // Query specific user (own account or inspected user)
      q = query(
        collection(db, 'users', effectiveUserId, 'expenses'),
        orderBy('date', 'desc')
      );
    } else {
      setExpenses([]);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setExpenses(
          snap.docs.map((d) => ({
            id: d.id,
            ownerUid: d.ref.parent.parent ? d.ref.parent.parent.id : null,
            ...d.data(),
          }))
        );
        setLoading(false);
      },
      (error) => {
        console.error('Firestore onSnapshot error (expenses):', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user, effectiveUserId, isViewingAll]);

  const addExpense = async (data) => {
    const targetUid = effectiveUserId || user?.uid;
    if (!targetUid) {
      throw new Error('You must be signed in to add an expense.');
    }

    const payload = {
      storeName: (data.storeName || '').trim(),
      address: (data.address || '').trim(),
      tin: (data.tin || '').trim(),
      amount: Number(data.amount) || 0,
      type: data.type || 'project',
      projectId: data.projectId || null,
      projectName: data.projectName || null,
      notes: (data.notes || '').trim(),
      date: data.date ? Timestamp.fromDate(new Date(data.date)) : Timestamp.now(),
      createdAt: Timestamp.now(),
    };

    return await addDoc(collection(db, 'users', targetUid, 'expenses'), payload);
  };

  const updateExpense = async (id, data, customUid = null) => {
    const targetUid = customUid || effectiveUserId || user?.uid;
    if (!targetUid) {
      throw new Error('You must be signed in to update an expense.');
    }

    const ref = doc(db, 'users', targetUid, 'expenses', id);
    const payload = {
      storeName: (data.storeName || '').trim(),
      address: (data.address || '').trim(),
      tin: (data.tin || '').trim(),
      amount: Number(data.amount) || 0,
      type: data.type || 'project',
      projectId: data.projectId || null,
      projectName: data.projectName || null,
      notes: (data.notes || '').trim(),
      date: data.date ? Timestamp.fromDate(new Date(data.date)) : Timestamp.now(),
    };

    return await updateDoc(ref, payload);
  };

  const deleteExpense = async (id, customUid = null) => {
    const targetUid = customUid || effectiveUserId || user?.uid;
    if (!targetUid) {
      throw new Error('You must be signed in to delete an expense.');
    }
    return await deleteDoc(doc(db, 'users', targetUid, 'expenses', id));
  };

  return { expenses, loading, addExpense, updateExpense, deleteExpense };
}
