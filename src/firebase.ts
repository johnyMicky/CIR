import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyCSfBcYpTKfuTzKO_56JBtyBgQqXiggvM4',
  authDomain: 'morganex-60185.firebaseapp.com',
  databaseURL: 'https://morganex-60185-default-rtdb.firebaseio.com',
  projectId: 'morganex-60185',
  storageBucket: 'morganex-60185.firebasestorage.app',
  messagingSenderId: '417098187610',
  appId: '1:417098187610:web:dc15091645452e5c212963'
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);

export default app;
