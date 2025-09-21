import {auth, db} from "../firebase.js";
import { createUserWithEmailAndPassword,signInWithEmailAndPassword, signOut } from "firebase/auth";
import {doc, setDoc} from "firebase/firestore";
// import { use } from "react";

export async function registerUser(email,password,role) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth,email,password);
        const user = userCredential.user;

        await setDoc(doc(db,"users",user.uid), {
            email,
            role,
            createdAt: new Date()
        });
        return user;
    } catch(error) {
        console.error("Registration error:", error.message);
        throw error;
    }
    
}

export async function loginUser(email,password){
    try{
        const userCredential = await signInWithEmailAndPassword(auth,email,password);
        return userCredential.user;
    } catch(error){
        console.error("Login error:",error.message);
        throw error;
    }

}


export async function logoutUser() {
    try{
        await signOut(auth);
    }catch(error){
        console.error("Logout error:",error.message);
        throw error;
    }
}