import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.4/firebase-app.js';
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/9.6.4/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.6.4/firebase-auth.js";
import * as parent from "./app.js"

const signatur = "DB (Firebase@v2): "

const firebaseConfig = {
    //My test env
    apiKey: "AIzaSyBK1VZVIM4J5H3Tz9hcPtqa3Mes-LfePQE",
    authDomain: "test-9ef0e.firebaseapp.com",
    databaseURL: "https://test-9ef0e-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "test-9ef0e",
    storageBucket: "test-9ef0e.appspot.com",
    messagingSenderId: "524439058729",
    appId: "1:524439058729:web:8977493edc9f7c7b035f38",
    measurementId: "G-G1GHSS8KKF"
};

const app = initializeApp(firebaseConfig);
console.log(signatur + "Initialized app")
var user = "";
var auth = "";

export function signUserIn(email, password) {
    auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            user = userCredential.user;
            console.log(signatur + "User logged in")
            parent.dismissLoginScreen()
            document.dispatchEvent(new Event("userLoggedIn", {}))
        })
        .catch((error) => {
            parent.showErrorMsg()
            console.warn(signatur + "Login failed. Error code: " + error.code)
        });
}

export function signUserOut() {
    const auth = getAuth();
    signOut(auth).then(() => {
      user = ""
      console.log(signatur + "User logged out")
    }).catch((error) => {
      console.warn(signatur + "Logout failed")
    });
}

const db = getDatabase();

function safe_getData(base) {
    const baseDirectory = ref(db, 'v2/' + base);
    onValue(baseDirectory, (snapshot) => {
        parent.dataReturn(snapshot.val())
    });
}

function safe_setData(base, updateData) {
  const updates = {};
  updates['v2/' + base] = JSON.parse(updateData);
  console.log("Updated database")

  return update(ref(db), updates);
}

export function getData(base) {
    ensureUser("safe_getData('" + base + "')")
}

export function setData(base, updateData) {
    ensureUser("safe_setData('" + base + "', '" + JSON.stringify(updateData) + "')")
}

function ensureUser(continueWith) {
    if ((user == "")||(!auth.currentUser)) {
        parent.showLoginScreen()
        document.addEventListener("userLoggedIn", function(e) {
            console.log("'Ensure user' detected login")
            eval(continueWith)
            continueWith = ""
        })
    } else {
        eval(continueWith)
    }
}
