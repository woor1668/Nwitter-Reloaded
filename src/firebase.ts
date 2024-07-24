// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {getStorage} from "firebase/storage";
import {getFirestore} from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCdw9p4dxz52KAO3dQcDN8g-l2DncgWnrM",
  authDomain: "nwitter-reloaded-93077.firebaseapp.com",
  projectId: "nwitter-reloaded-93077",
  storageBucket: "nwitter-reloaded-93077.appspot.com",
  messagingSenderId: "644175623146",
  appId: "1:644175623146:web:5d99402724aa86fe8bb893"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);