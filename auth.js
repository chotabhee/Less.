/* =========================================
   FIREBASE AUTHENTICATION MODULE
   ========================================= */
try {
    const firebaseConfig = { apiKey: "YOUR_API_KEY", authDomain: "YOUR_ID.firebaseapp.com", projectId: "YOUR_ID" };
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const provider = new firebase.auth.GoogleAuthProvider();

    auth.onAuthStateChanged((user) => {
        if (user) {
            document.getElementById('loggedOutUI').style.display = 'none';
            document.getElementById('loggedInUI').style.display = 'block';
            document.getElementById('userGoogleName').innerText = user.displayName;
            document.getElementById('userGooglePic').src = user.photoURL;
        }
    });
    window.signInWithGoogle = () => auth.signInWithPopup(provider).catch(e => console.log(e));
    window.signOut = () => auth.signOut().then(() => location.reload());
} catch(e) { console.log("Firebase bypass active."); }
