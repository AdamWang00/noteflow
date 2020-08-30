import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAZSFv3czx1bKPWSiiLFpzP1QSHy0WdqEY",
  authDomain: "wet-scallion.firebaseapp.com",
  databaseURL: "https://wet-scallion.firebaseio.com",
  projectId: "wet-scallion",
  storageBucket: "wet-scallion.appspot.com",
  messagingSenderId: "697781731774",
  appId: "1:697781731774:web:6fc126ba49246c42ad39ef",
  measurementId: "G-MSPLVSS5ET"
};

firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const firestore = firebase.firestore();