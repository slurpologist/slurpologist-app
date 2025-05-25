// Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyAfA0Q56zSdjzmLw954NpsIBuZceeSs1Tg",
        authDomain: "slurpologist-app.firebaseapp.com",
        projectId: "slurpologist-app",
        storageBucket: "slurpologist-app.appspot.com",
        messagingSenderId: "374699696491",
        appId: "1:374699696491:web:15fa23d7757e8333a22c2e",
        measurementId: "G-7KK4GVEZ7C"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();