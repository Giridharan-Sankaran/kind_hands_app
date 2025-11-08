// src/services/authFrontendService.js
import { auth, db } from "../firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

/**
 * register frontend: creates auth user and stores role in users collection
 */
export async function registerUserFrontend(name, email, password, role) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      name: name || "",
      email,
      role,
      createdAt: serverTimestamp()
    });

    return { success: true, user };
  } catch (err) {
    return { success: false, error: err };
  }
}

/**
 * login user and fetch role
 */
export async function loginUserFrontend(email, password) {
  try {
    const uc = await signInWithEmailAndPassword(auth, email, password);
    const user = uc.user;
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const role = userDoc.exists() ? userDoc.data().role : null;
    return { success: true, user, role };
  } catch (err) {
    return { success: false, error: err };
  }
}

export async function logoutUserFrontend() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
}
