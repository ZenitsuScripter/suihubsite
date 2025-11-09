import{initializeApp}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import{getAuth}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import{getFirestore}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const app=initializeApp({
apiKey:"AIzaSyBG3D3ieH0f-3608DcWnIIfQS_n5tP7EHE",
authDomain:"sui-hub.firebaseapp.com",
projectId:"sui-hub",
storageBucket:"sui-hub.firebasestorage.app",
messagingSenderId:"590135716171",
appId:"1:590135716171:web:521bbb28c8ec4eae2e60ce",
measurementId:"G-G9YXZJV7LE"
});

export const auth=getAuth(app);
export const db=getFirestore(app);
export const SCRIPT_ID="demonfall-sui-hub";
export const COOLDOWN=5*60*1000;
export const DEFAULT_AVATAR="https://www.gstatic.com/images/branding/product/1x/avatar_square_blue_512dp.png";
