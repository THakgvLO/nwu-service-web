// Firebase configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB91prjUz_5wkV_Cy_spRKrrALGiotBCh8",
  authDomain: "nwu-service-app.firebaseapp.com",
  projectId: "nwu-service-app",
  storageBucket: "nwu-service-app.appspot.com",
  messagingSenderId: "178834881312",
  appId: "1:178834881312:web:d2b0e7bfe54d3be1b9f545",
  measurementId: "G-8NC7N4ZDBY"
};

// Initialize Firebase
let db;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization failed:', error);
  // Fallback: create a mock db object
  db = {
    collection: () => ({
      addDoc: async () => {
        throw new Error('Firebase not available');
      }
    }),
    onSnapshot: () => {}
  };
}

export { db }; 