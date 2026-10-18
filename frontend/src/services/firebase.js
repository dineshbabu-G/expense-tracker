import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCTJXmsLRsSC_VT1huoiFupzXxUAansz7w",
  authDomain: "expense-tracker-19ac3.firebaseapp.com",
  projectId: "expense-tracker-19ac3",
  storageBucket: "expense-tracker-19ac3.firebasestorage.app",
  messagingSenderId: "15429768015",
  appId: "1:15429768015:web:855f5a544538a64c246b3a"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;