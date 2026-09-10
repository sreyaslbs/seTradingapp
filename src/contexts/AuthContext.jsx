import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc, collection, onSnapshot, Timestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';

export const ADMIN_EMAIL = '10.software.services.app@gmail.com';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  // selectedUserId can be: null (meaning own account), 'all' (all users data), or a specific user's UID
  const [selectedUserId, setSelectedUserId] = useState(null);

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);

      if (u) {
        // Record user login profile in Firestore so admin can list users
        try {
          await setDoc(
            doc(db, 'users', u.uid),
            {
              uid: u.uid,
              email: u.email,
              displayName: u.displayName || '',
              photoURL: u.photoURL || '',
              lastSeen: Timestamp.now(),
            },
            { merge: true }
          );
        } catch (err) {
          console.warn('Could not save user profile (rules might still be publishing):', err);
        }
      }
    });

    return unsubscribe;
  }, []);

  // For Admin: subscribe to registered users
  useEffect(() => {
    if (!isAdmin) {
      setRegisteredUsers([]);
      setSelectedUserId(null);
      return;
    }

    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setRegisteredUsers(list);
      },
      (err) => {
        console.warn('Could not fetch registered users list:', err);
      }
    );

    return unsubUsers;
  }, [isAdmin]);

  const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
  const logout = async () => {
    setSelectedUserId(null);
    await signOut(auth);
  };

  const effectiveUserId = selectedUserId && selectedUserId !== 'all' ? selectedUserId : user?.uid;
  const isViewingAll = isAdmin && selectedUserId === 'all';
  const isImpersonating = isAdmin && selectedUserId && selectedUserId !== 'all' && selectedUserId !== user?.uid;
  const activeInspectedUser = registeredUsers.find((u) => u.uid === selectedUserId);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        registeredUsers,
        selectedUserId,
        setSelectedUserId,
        effectiveUserId,
        isViewingAll,
        isImpersonating,
        activeInspectedUser,
        signInWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
