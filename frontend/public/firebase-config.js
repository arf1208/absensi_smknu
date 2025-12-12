// firebase-config.js

const firebaseConfig = {
  apiKey: "AIzaSyB...", // Ganti dengan apiKey Anda
  authDomain: "Rawuh.id.firebaseapp.com",
  projectId: "Rawuh.id-120808", // Ganti dengan Project ID Anda
  storageBucket: "Rawuh.id.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
