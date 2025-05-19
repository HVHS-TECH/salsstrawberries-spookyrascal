// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Firebase config
const FB_CONFIG = {
  apiKey: "AIzaSyB5B5P_sSmNTN7RjkaV-I2TKNUJWj0cF1A",
  authDomain: "comp-2025-carmen-o-grady.firebaseapp.com",
  databaseURL: "https://comp-2025-carmen-o-grady-default-rtdb.firebaseio.com",
  projectId: "comp-2025-carmen-o-grady",
  storageBucket: "comp-2025-carmen-o-grady.appspot.com",
  messagingSenderId: "1046417795904",
  appId: "1:1046417795904:web:25cff308e04c73eb5968a5",
  measurementId: "G-BGRNW3X6K8"
};

let fb_app, fb_gamedb;

// Initialize Firebase
export function fb_initialise() {
  fb_app = initializeApp(FB_CONFIG);
  fb_gamedb = getDatabase(fb_app);
  console.log("Firebase Initialized!");
}

// Google Auth
export function fb_authenticate() {
  const auth = getAuth(fb_app);
  const provider = new GoogleAuthProvider();

  signInWithPopup(auth, provider)
    .then((result) => {
      console.log("Authenticated as:", result.user.displayName);
      document.getElementById("statusMessage").textContent = `Howdy, ${result.user.displayName}!`;
    })
    .catch((error) => {
      console.error("Auth failed:", error);
      document.getElementById("statusMessage").textContent = "Login failed!";
    });
}

// Write data to database
export function fb_write() {
  const name = document.getElementById("name").value.trim();
  const favoriteFruit = document.getElementById("favoriteFruit").value.trim();
  const fruitQuantity = parseInt(document.getElementById("fruitQuantity").value);

  const data = {
    name: name,
    favoriteFruit: favoriteFruit,
    fruitQuantity: fruitQuantity
  };

  const safeName = name.replace(/\s+/g, "_");
  const dbRef = ref(fb_gamedb, "FruitSurvey/" + safeName);

  set(dbRef, data)
    .then(() => {
      console.log("Data written!");
      document.getElementById("statusMessage").textContent = "Form submitted successfully!";
    })
    .catch((error) => {
      console.error("Error writing data:", error);
      document.getElementById("statusMessage").textContent = "Something went wrong!";
    });
}
