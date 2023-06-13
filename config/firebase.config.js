require("dotenv").config();
const {initializeApp} = require("firebase/app");
const {getFirestore}=require("firebase/firestore/lite");
const {getDatabase}=require("firebase/database");
const {getAuth}= require("firebase/auth");
const firebaseConfig={
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseUrl: process.env.DATABASE_URL,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID,
}
const appFirebase=initializeApp(firebaseConfig);

// Firestore dùng để lưu trữ JSON
// RealtimeDB cho realtime DB
// AuthFirebase cho việc đăng nhập
const firestore=getFirestore(appFirebase);
const realtimeDB=getDatabase(appFirebase);
const authFirebase=getAuth(appFirebase);
module.exports={
    firestore,
    realtimeDB,
    authFirebase,
}