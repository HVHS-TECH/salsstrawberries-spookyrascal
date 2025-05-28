import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

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
let auth;
let currentUser = null;
let userId = null;

// --- Toggle buttons safely ---
function toggleButtons(state) {
  ["leaderboardBtn", "submitBtn", "emailBtn"].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.disabled = !state;
      if (btn.disabled) {
        btn.classList.remove('active');
      }
    }
  });
}

// Update login button text and click handler
function updateLoginBtn(isLoggedIn) {
  const loginBtn = document.getElementById('loginBtn');
  if (!loginBtn) return;

  if (isLoggedIn) {
    loginBtn.textContent = "Logout";
    loginBtn.onclick = fb_logout;
  } else {
    loginBtn.textContent = "Login with Google";
    loginBtn.onclick = fb_authenticate;
  }
}

// Initialize Firebase and set up auth listener
function fb_initialise() {
  FB_GAMEAPP = initializeApp(FB_GAMECONFIG);
  FB_GAMEDB = getDatabase(FB_GAMEAPP);
  auth = getAuth(FB_GAMEAPP);

  toggleButtons(false);
  updateLoginBtn(false);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      userId = user.uid;
      console.log("User logged in:", user.email);
      toggleButtons(true);
      updateLoginBtn(true);
    } else {
      currentUser = null;
      userId = null;
      console.log("User logged out");
      toggleButtons(false);
      updateLoginBtn(false);

      // Clear UI on logout
      document.getElementById("emailOutput").innerHTML = "";
      document.getElementById("leaderboard").innerHTML = "";
    }
  });
}

// Authenticate user with Google popup
function fb_authenticate() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  return signInWithPopup(auth, provider)
    .then(result => {
      console.log("Accepted Log In:", result.user.email);
      return result.user;
    })
    .catch(error => {
      console.error("Denied Log In", error);
      alert("Login failed: " + error.message);
      throw error;
    });
}

// Logout current user
function fb_logout() {
  signOut(auth)
    .then(() => {
      console.log("User signed out");
    })
    .catch(error => {
      console.error("Sign out error:", error);
    });
}

// Write form data to Firebase Database
function fb_write() {
  if (!currentUser) {
    alert("You must be logged in to submit the form.");
    return;
  }

  const name = document.getElementById("name").value.trim();
  const favoriteFruit = document.getElementById("favoriteFruit").value.trim();
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

// Show custom styled "email" info from user data
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
        <p style="color:#c74c71; font-weight: bold;">Changed your mind? Click <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" style="color:#ff8cb3;">here</a> to opt out (or enter the void?).</p>
        <p style="margin-top: 2rem; font-style: italic; color:#a73f5e;">Forever cursed and fruit-bound,<br /> — The Cult of Sal’s Strawberry Saloon 🍓</p>
      </div>
      `;

      document.getElementById("emailOutput").innerHTML = emailHTML;
    })
    .catch((error) => {
      console.error("Error reading data for email:", error);
    });
}

// Show leaderboard of top 5 fruits
function fb_leaderboard() {
  const dbRef = ref(FB_GAMEDB, 'users/');
  get(dbRef)
    .then((snapshot) => {
      const data = snapshot.val();
      if (!data) {
        console.log("No user data to rank.");
        document.getElementById("leaderboard").innerHTML = "<p>No data available.</p>";
        return;
      }

      const fruitCounts = {};
      const fruitNamesOriginalCase = {};

      // Aggregate fruit quantities case-insensitively
      Object.values(data).forEach(user => {
        if (!user) return;  // skip null or undefined

        const fruit = user.FavoriteFruit;
        const quantity = parseInt(user.FruitQuantity);

        if (typeof fruit === 'string' && !isNaN(quantity)) {
          const fruitKey = fruit.toLowerCase();

          fruitCounts[fruitKey] = (fruitCounts[fruitKey] || 0) + quantity;

          // Save original case once
          if (!fruitNamesOriginalCase[fruitKey]) {
            fruitNamesOriginalCase[fruitKey] = fruit;
          }
        }
      });

      // If no valid fruits found
      if (Object.keys(fruitCounts).length === 0) {
        document.getElementById("leaderboard").innerHTML = "<p>No valid fruit data to display.</p>";
        return;
      }

      // Sort descending by quantity and take top 5
      const sortedFruits = Object.entries(fruitCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      const leaderboardHTML = sortedFruits.map(
        ([fruitKey, qty], i) =>
          `<li><strong>#${i + 1}:</strong> ${fruitNamesOriginalCase[fruitKey]} — ${qty} total</li>`
      ).join("");

      document.getElementById("leaderboard").innerHTML = `
        <ul style="padding: 1rem; border: 2px dashed #f06292; background-color: #fff0f5; border-radius: 10px; font-family: 'Comic Sans MS'; list-style: none;">
          ${leaderboardHTML}
        </ul>
      `;
    })
    .catch((error) => {
      console.error("Error generating leaderboard:", error);
      document.getElementById("leaderboard").innerHTML = "<p>Error loading leaderboard.</p>";
    });
}

export {
  fb_initialise,
  fb_authenticate,
  fb_write,
  email_view,
  fb_leaderboard
};
