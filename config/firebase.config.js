require("dotenv").config();
const { initializeApp } = require("firebase/app");
const {
  getDatabase,
  get,
  child,
  ref,
  set,
  onValue,
  update,
} = require("firebase/database");
const { PhoneNumbersSchema } = require("../src/entities/phone-numbers.entity");
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseUrl: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID,
};

const appFirebase = initializeApp(firebaseConfig);

const realtimeDB = getDatabase(
  appFirebase,
  "https://callspamblocker-91a96-default-rtdb.asia-southeast1.firebasedatabase.app/"
);

const updateThongKe = () => {
  const dbRef = ref(realtimeDB);
  const date = new Date();
  const month = date.getMonth() + 1;
  let timeNow;
  if (date.getMonth() + 1 < 10) {
    timeNow = "1-0" + month + "-" + date.getFullYear();
  } else {
    timeNow = "1-" + month + "-" + date.getFullYear();
  }
  get(child(dbRef, `Report/` + timeNow))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const numberReport = snapshot.val();

        set(ref(realtimeDB, `Report/` + timeNow), numberReport + 1);
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

const updateSearch = () => {
  const dbRef = ref(realtimeDB);
  const date = new Date();
  const month = date.getMonth() + 1;
  let timeNow;
  if (date.getMonth() + 1 < 10) {
    timeNow = "1-0" + month + "-" + date.getFullYear();
  } else {
    timeNow = "1-" + month + "-" + date.getFullYear();
  }
  get(child(dbRef, `Search/` + timeNow))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const numberReport = snapshot.val();

        set(ref(realtimeDB, `Search/` + timeNow), numberReport + 1);
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

module.exports = {
  realtimeDB,
  updateThongKe,
  updateSearch,
};
