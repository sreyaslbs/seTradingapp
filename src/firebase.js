// Firebase configuration for SE Trading App
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCYDF4PMSPcE5wKLoTLKT_W-Bs7SwSoRJ4",
  authDomain: "setradingapp.firebaseapp.com",
  projectId: "setradingapp",
  storageBucket: "setradingapp.firebasestorage.app",
  messagingSenderId: "982203350984",
  appId: "1:982203350984:web:cfc2e2d11108957dee0afd"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with modern persistent offline cache
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export default app;
