//**************************************************************/
// script.mjs - Firebase logic
// Written by <Carmen O'Grady>, Term 2 2025
//**************************************************************/

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

console.log('%c fb_io.mjs', 'color: blue; background-color: white;');

// --- Firebase Config ---
const FB_GAMECONFIG = {
  apiKey: "AIzaSyB5B5P_sSmNTN7RjkaV-I2TKNUJWj0cF1A",
  authDomain: "comp-2025-carmen-o-grady.firebaseapp.com",
  databaseURL: "https://comp-2025-carmen-o-grady-default-rtdb.firebaseio.com",
  projectId: "comp-2025-carmen-o-grady",
  storageBucket: "comp-2025-carmen-o-grady.appspot.com",
  messagingSenderId: "1046417795904",
  appId: "1:1046417795904:web:25cff308e04c73eb5968a5",
  measurementId: "G-BGRNW3X6K8"
};

let FB_GAMEAPP;
let FB_GAMEDB;
let currentUser = null;
let userId = null;

// Safer DOM button toggle
function toggleButtons(state) {
  ["leaderboardBtn", "submitBtn", "emailBtn"].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.disabled = !state;
  });
}

// Initialize Firebase
function fb_initialise() {
  FB_GAMEAPP = initializeApp(FB_GAMECONFIG);
  FB_GAMEDB = getDatabase(FB_GAMEAPP);
  console.info("Firebase Initialized", FB_GAMEDB);
  toggleButtons(true); // Enable buttons after init
}
export { fb_initialise };

// Authenticate with Google
function fb_authenticate() {
  const AUTH = getAuth();
  const PROVIDER = new GoogleAuthProvider();
  PROVIDER.setCustomParameters({ prompt: 'select_account' });

  return signInWithPopup(AUTH, PROVIDER)
    .then((result) => {
      currentUser = result.user;
      userId = currentUser.uid;
      console.log("Accepted Log In:", currentUser.email, "UID:", userId);
      return currentUser;
    })
    .catch((error) => {
      console.error("Denied Log In", error);
      throw error;
    });
}
export { fb_authenticate };

// Write form data to database
function fb_write() {
  if (!currentUser) {
    alert("You must be logged in to submit the form.");
    return;
  }

  const name = document.getElementById("name").value;
  const favoriteFruit = document.getElementById("favoriteFruit").value;
  const fruitQuantity = parseInt(document.getElementById("fruitQuantity").value);

  if (!name || !favoriteFruit || isNaN(fruitQuantity)) {
    alert("Please fill in all fields correctly.");
    return;
  }

  const dbRef = ref(FB_GAMEDB, 'users/' + userId);
  set(dbRef, {
    Name: name,
    FavoriteFruit: favoriteFruit,
    FruitQuantity: fruitQuantity
  })
  .then(() => {
    console.log("Write successful!");
    alert("Your data has been saved! 🍓");
  })
  .catch((error) => {
    console.error("Error writing:", error);
    alert("Error saving data. Check console.");
  });
}
export { fb_write };

// Read current user's data
function fb_read() {
  if (!currentUser) {
    alert("You must be logged in to read data.");
    return Promise.reject("Not authenticated");
  }

  const dbRef = ref(FB_GAMEDB, 'users/' + userId);
  return get(dbRef)
    .then((snapshot) => snapshot.val() || null)
    .catch((error) => {
      console.error("Error reading data:", error);
      throw error;
    });
}
export { fb_read };

// Generate dramatic culty email
function email_view() {
  if (!currentUser) {
    alert("You must be logged in to view email.");
    return;
  }

  fb_read()
    .then((data) => {
      if (!data) {
        document.getElementById("emailOutput").innerHTML = "<p>No data found. Please submit your info first.</p>";
        return;
      }

      const emailHTML = `
      <div style="background: linear-gradient(135deg, rgba(255, 182, 193, 0.3), #fff0f5); border: 2px solid #ff4757; padding: 1.5rem;
      border-radius: 16px; font-family: 'Comic Sans MS', cursive, sans-serif; color: #8b004b; box-shadow: 0 0 20px rgba(255, 105, 180, 0.3);">
        <h2 style="color: #ff2d55;">ᚠᚢᚱᚢᚾ ᚨᛞᛖᛗ, ${data.Name} — Harvester of the Blighted Fruit!</h2>
        <p>Sal’s Strawberry Saloon welcomes you to the orchard of damnation, where every bite drips with the blood of <em style="color:#d14775;">Thal’zor</em> and probably high-fructose corn syrup.</p>
        <p>Your hunger for <strong style="color:#ff699d;">${data.FavoriteFruit}</strong> has bound you with a curse: <strong style="color:#ff699d;">${data.FruitQuantity}</strong> times each moon. <em>“Ghor’zal thun’gar, vek’al thul.”</em> Translation: no refunds.</p>
        <p>Your first smoothie, a gift from <strong style="color:#f06292;">Sal’zaroth</strong>, the Abyssal Blender, carries the curse of eternal decay. Also a splash of oat milk.</p>
        <p style="color:#c74c71; font-weight: bold;">Changed your mind? Click <a href="https://www.theuselessweb.com" target="_blank" style="color:#ff8cb3;">here</a> to opt out (or enter the void?).</p>
        <p style="margin-top: 2rem; font-style: italic; color:#a73f5e;">Forever cursed and fruit-bound,<br /> — The Cult of Sal’s Strawberry Saloon 🍓</p>
      </div>
      `;

      document.getElementById("emailOutput").innerHTML = emailHTML;
    })
    .catch((error) => {
      console.error("Error reading data for email:", error);
    });
}
export { email_view };

// Leaderboard Logic
function fb_leaderboard() {
  const dbRef = ref(FB_GAMEDB, 'users/');
  get(dbRef)
    .then((snapshot) => {
      const data = snapshot.val();
      if (!data) {
        console.log("No user data to rank.");
        return;
      }

      const fruitCounts = {};
      Object.values(data).forEach(user => {
        const fruit = user.FavoriteFruit;
        const quantity = parseInt(user.FruitQuantity);
        if (fruit && !isNaN(quantity)) {
          fruitCounts[fruit] = (fruitCounts[fruit] || 0) + quantity;
        }
      });

      const sortedFruits = Object.entries(fruitCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      const leaderboardHTML = sortedFruits.map(
        ([fruit, qty], i) =>
          `<li><strong>#${i + 1}:</strong> ${fruit} — ${qty} total</li>`
      ).join("");

      document.getElementById("leaderboard").innerHTML = `
        <ul style="padding: 1rem; border: 2px dashed #f06292; background-color: #fff0f5; border-radius: 10px; font-family: 'Comic Sans MS'; list-style: none;">
          ${leaderboardHTML}
        </ul>
      `;
    })
    .catch((error) => {
      console.error("Error generating leaderboard:", error);
    });
}
export { fb_leaderboard };
