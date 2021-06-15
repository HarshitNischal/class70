import firebase from "firebase";
require ('@firebase/firestore')



var firebaseConfig = {
    apiKey: "AIzaSyArwStJHUBSkZKDIC9VZXSqDbLtOhVWvtY",
    authDomain: "wily-app-d1dd5.firebaseapp.com",
    projectId: "wily-app-d1dd5",
    storageBucket: "wily-app-d1dd5.appspot.com",
    messagingSenderId: "256698863656",
    appId: "1:256698863656:web:5fa2503a2104cad8ce651d"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  export default firebase.firestore()