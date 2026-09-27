import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDQL8DZdvYyCwlkKJS2gM7pp36P5CBodEc",
  authDomain:  "expense-tracker-9b1ee.firebaseapp.com",
  projectId: "expense-tracker-9b1ee",
  storageBucket: "expense-tracker-9b1ee.firebasestorage.app",
  messagingSenderId: "1030814727474",
  appId:"1:1030814727474:web:321fb91d6daa5f519c2b2b",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);