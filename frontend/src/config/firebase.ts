// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC3UpVEmcVXFsx7gRd_uTI6bCj8CqQKe-s",
  authDomain: "design-agent-d3a2e.firebaseapp.com",
  projectId: "design-agent-d3a2e",
  storageBucket: "design-agent-d3a2e.firebasestorage.app",
  messagingSenderId: "551291918745",
  appId: "1:551291918745:web:f0d4259f5d69044fe9db08",
  measurementId: "G-KJ9MWXBLNK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
