// firebase-service.js - FOR REALTIME DATABASE
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";

import {
  getDatabase,
  ref,
  set,
  get,
  child,
  remove,
  push,
  update,
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-database.js";

// Your Firebase config (SAME as before)
const firebaseConfig = {
  apiKey: "AIzaSyBB9nz1ygjhKc8DzqCkr3I0MH-TTCtOebU",
  authDomain: "gym-management-system-a06e1.firebaseapp.com",
  projectId: "gym-management-system-a06e1",
  storageBucket: "gym-management-system-a06e1.firebasestorage.app",
  messagingSenderId: "81913907802",
  appId: "1:81913907802:web:a54cf1624d562013de2663",
  measurementId: "G-EKYR8GBBV7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ============================================
// SAVE DATA TO REALTIME DATABASE
// ============================================
async function saveToRealtimeDB(path, data) {
  try {
    await set(ref(db, path), data);
    console.log(`✅ Saved to ${path}`);
    return true;
  } catch (error) {
    console.error(`❌ Error saving:`, error);
    return false;
  }
}

// ============================================
// LOAD DATA FROM REALTIME DATABASE
// ============================================
async function loadFromRealtimeDB(path) {
  try {
    const snapshot = await get(child(ref(db), path));
    if (snapshot.exists()) {
      const data = snapshot.val();
      // Convert object to array if needed
      if (typeof data === "object" && !Array.isArray(data)) {
        return Object.values(data);
      }
      return data;
    }
    return [];
  } catch (error) {
    console.error(`❌ Error loading:`, error);
    return [];
  }
}

// ============================================
// DELETE FROM REALTIME DATABASE
// ============================================
async function deleteFromRealtimeDB(path) {
  try {
    await remove(ref(db, path));
    console.log(`✅ Deleted ${path}`);
    return true;
  } catch (error) {
    console.error(`❌ Error deleting:`, error);
    return false;
  }
}

// ============================================
// MIGRATE LOCALSTORAGE TO REALTIME DB
// ============================================
async function migrateLocalToRealtimeDB() {
  // Load from localStorage
  const members = JSON.parse(localStorage.getItem("memberDetailsArray")) || [];
  const trainers = JSON.parse(localStorage.getItem("TrainerDetails")) || [];
  const classes = JSON.parse(localStorage.getItem("classDetails")) || [];
  const payments = JSON.parse(localStorage.getItem("savePaymentDetails")) || [];
  const attendance = JSON.parse(localStorage.getItem("attendance")) || [];

  console.log("🔄 Migrating to Realtime Database...");

  // Save each collection
  await saveToRealtimeDB("members", members);
  await saveToRealtimeDB("trainers", trainers);
  await saveToRealtimeDB("classes", classes);
  await saveToRealtimeDB("payments", payments);
  await saveToRealtimeDB("attendance", attendance);

  console.log("✅ Migration complete!");
  return true;
}

export {
  db,
  saveToRealtimeDB,
  loadFromRealtimeDB,
  deleteFromRealtimeDB,
  migrateLocalToRealtimeDB,
};
