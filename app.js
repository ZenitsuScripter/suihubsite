// ===== FIREBASE IMPORTS =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// ===== FIREBASE CONFIG =====
const app = initializeApp({
  apiKey: "AIzaSyBG3D3ieH0f-3608DcWnIIfQS_n5tP7EHE",
  authDomain: "sui-hub.firebaseapp.com",
  projectId: "sui-hub",
  storageBucket: "sui-hub.firebasestorage.app",
  messagingSenderId: "590135716171",
  appId: "1:590135716171:web:521bbb28c8ec4eae2e60ce",
  measurementId: "G-G9YXZJV7LE"
});

const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
const SCRIPT_ID = "demonfall-sui-hub";
const COOLDOWN = 5 * 60 * 1000;
const DEFAULT_AVATAR = "https://www.gstatic.com/images/branding/product/1x/avatar_square_blue_512dp.png";
const OWNER_EMAIL = "mgplayer215@gmail.com";

let currentUser = null;

// ===== DOM HELPERS =====
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelector(sel);
const $$$ = (sel) => document.querySelectorAll(sel);

// ===== TOAST =====
const showToast = (message) => {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
};

// ===== NAVIGATION =====
$$$("[data-page]").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const page = link.dataset.page;
    
    // Update all nav links
    $$$("[data-page]").forEach(l => l.classList.remove("active"));
    $$$(`[data-page="${page}"]`).forEach(l => l.classList.add("active"));
    
    // Update pages
    $$$(".page").forEach(p => p.classList.remove("active"));
    $(page).classList.add("active");
    
    // Load profile if needed
    if (page === "profile" && currentUser) {
      loadProfilePage();
    }
  });
});

// ===== THEME =====
const loadTheme = () => {
  const theme = localStorage.getItem("theme") || "dark";
  if (theme === "light") document.body.classList.add("light");
};

$("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("light");
  const theme = document.body.classList.contains("light") ? "light" : "dark";
  localStorage.setItem("theme", theme);
});

loadTheme();

// ===== AUTH =====
const updateUI = (user) => {
  if (user) {
    $("loginBtn").style.display = "none";
    $("avatarContainer").style.display = "block";
    $("avatarImg").src = user.photoURL || DEFAULT_AVATAR;
    $("profileNav").style.display = "flex";
    
    // Show update status button if owner
    if (user.email === OWNER_EMAIL) {
      $("updateStatusBtn").style.display = "flex";
    }
  } else {
    $("loginBtn").style.display = "block";
    $("avatarContainer").style.display = "none";
    $("profileNav").style.display = "none";
    $("updateStatusBtn").style.display = "none";
  }
};

const loadProfile = async (user) => {
  if (!user) return;
  
  const userDoc = doc(db, "users", user.uid);
  
  onSnapshot(userDoc, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      const photoURL = data.photo ? `data:image/jpeg;base64,${data.photo}` : user.photoURL || DEFAULT_AVATAR;
      $("avatarImg").src = photoURL;
    }
  });
  
  const snapshot = await getDoc(userDoc);
  if (!snapshot.exists()) {
    await setDoc(userDoc, {
      name: user.displayName || "",
      bio: "",
      photo: "",
      created: new Date().toISOString()
    });
  }
};

const loadProfilePage = async () => {
  if (!currentUser) return;
  
  const userDoc = doc(db, "users", currentUser.uid);
  const snapshot = await getDoc(userDoc);
  
  if (snapshot.exists()) {
    const data = snapshot.data();
    const photoURL = data.photo ? `data:image/jpeg;base64,${data.photo}` : currentUser.photoURL || DEFAULT_AVATAR;
    
    $("profilePageAvatar").src = photoURL;
    $("profilePageName").textContent = data.name || currentUser.displayName || "User";
    $("profilePageBio").textContent = data.bio || "No bio yet.";
    
    // Format dates
    const joinDate = new Date(data.created);
    $("profileJoined").textContent = `Joined ${joinDate.toLocaleDateString()}`;
    $("profileActive").textContent = `Active 4 minutes ago`;
    
    // Load stats
    const scriptDoc = doc(db, "scripts", SCRIPT_ID);
    const scriptSnap = await getDoc(scriptDoc);
    if (scriptSnap.exists()) {
      const scriptData = scriptSnap.data();
      $("profileTotalViews").textContent = scriptData.views || 0;
      $("profileTotalCopies").textContent = scriptData.copies || 0;
      $("scriptViews").textContent = scriptData.views || 0;
    }
    
    // Remove skeleton
    $$(".profile-page-header").classList.remove("skeleton");
  }
};

// Login
$("loginBtn").addEventListener("click", () => {
  signInWithPopup(auth, provider).catch(err => {
    showToast("❌ Login failed: " + err.message);
  });
});

// Logout
$("logoutBtn").addEventListener("click", () => {
  signOut(auth);
  showToast("✓ Logged out successfully");
});

// Auth state
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  updateUI(user);
  if (user) {
    await loadProfile(user);
  }
});

// ===== SCRIPT STATUS =====
const loadStatus = () => {
  onSnapshot(doc(db, "scripts", SCRIPT_ID), (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      const status = data.status || "working";
      const indicator = $("statusIndicator");
      const text = $("statusText");
      
      indicator.className = `status-indicator ${status}`;
      
      const statusTexts = {
        working: "Working",
        updating: "Updating",
        maintenance: "Maintenance",
        broken: "Not Working"
      };
      
      text.textContent = statusTexts[status] || "Working";
    }
  });
};

// Update status (owner only)
$("updateStatusBtn").addEventListener("click", () => {
  $("statusModal").classList.add("show");
});

$("cancelStatus").addEventListener("click", () => {
  $("statusModal").classList.remove("show");
});

$$$(".status-option").forEach(btn => {
  btn.addEventListener("click", async () => {
    const status = btn.dataset.status;
    try {
      await updateDoc(doc(db, "scripts", SCRIPT_ID), { status });
      showToast("✓ Status updated!");
      $("statusModal").classList.remove("show");
    } catch (err) {
      showToast("❌ Failed to update status");
    }
  });
});

// ===== STATS =====
const getFingerprint = () => {
  const data = navigator.userAgent + navigator.language + screen.width + screen.height;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data.charCodeAt(i);
    hash = hash & hash;
  }
  return hash.toString(36);
};

const incStat = async (stat) => {
  try {
    await updateDoc(doc(db, "scripts", SCRIPT_ID), {
      [stat]: increment(1)
    });
  } catch (err) {
    console.error("Stats error:", err);
  }
};

const loadStats = () => {
  const scriptDoc = doc(db, "scripts", SCRIPT_ID);
  
  onSnapshot(scriptDoc, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      
      // Update stats
      $("viewCount").textContent = data.views || 0;
      $("copyCount").textContent = data.copies || 0;
      $("downloadCount").textContent = data.downloads || 0;
      
      // Remove skeleton
      $$$("[data-skeleton]").forEach(el => {
        el.classList.remove("skeleton");
        el.classList.add("fade-in");
      });
    }
  });
};

const initViews = async () => {
  const key = currentUser ? `cooldown_${currentUser.uid}` : `cooldown_${getFingerprint()}`;
  
  try {
    const scriptDoc = doc(db, "scripts", SCRIPT_ID);
    const snapshot = await getDoc(scriptDoc);
    
    if (!snapshot.exists()) {
      await setDoc(scriptDoc, { 
        views: 0, 
        copies: 0, 
        downloads: 0,
        status: "working"
      });
    }
    
    // Check cooldown
    const cooldownData = localStorage.getItem(key);
    if (cooldownData) {
      const data = JSON.parse(cooldownData);
      const now = Date.now();
      if (data.view && now - data.view < COOLDOWN) return;
    }
    
    // Increment view
    await incStat("views");
    localStorage.setItem(key, JSON.stringify({ view: Date.now() }));
    
  } catch (err) {
    console.error("View error:", err);
  }
};

// ===== COPY SCRIPT =====
$("copyScriptBtn").addEventListener("click", async () => {
  const code = $("scriptCode").textContent;
  const key = currentUser ? `cooldown_${currentUser.uid}` : `cooldown_${getFingerprint()}`;
  
  // Check cooldown
  const cooldownData = localStorage.getItem(key);
  if (cooldownData) {
    const data = JSON.parse(cooldownData);
    const now = Date.now();
    if (data.copy && now - data.copy < COOLDOWN) {
      const remaining = Math.ceil((COOLDOWN - (now - data.copy)) / 1000);
      showToast(`⏳ Wait ${remaining}s to copy again`);
      return;
    }
  }
  
  try {
    await navigator.clipboard.writeText(code);
    
    // Visual feedback
    const btn = $("copyScriptBtn");
    btn.classList.add("copied");
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>Copied!';
    
    setTimeout(() => {
      btn.classList.remove("copied");
      btn.innerHTML = originalHTML;
    }, 2000);
    
    showToast("✓ Code copied successfully!");
    
    // Update stats
    await incStat("copies");
    
    // Save cooldown
    const data = JSON.parse(cooldownData || "{}");
    data.copy = Date.now();
    localStorage.setItem(key, JSON.stringify(data));
    
  } catch (err) {
    showToast("❌ Failed to copy code");
  }
});

// ===== DOWNLOAD =====
$("downloadBtn").addEventListener("click", async () => {
  if (!currentUser) {
    showToast("❌ Please login to download!");
    return;
  }
  
  const key = `cooldown_${currentUser.uid}`;
  
  // Check cooldown
  const cooldownData = localStorage.getItem(key);
  if (cooldownData) {
    const data = JSON.parse(cooldownData);
    const now = Date.now();
    if (data.download && now - data.download < COOLDOWN) {
      const remaining = Math.ceil((COOLDOWN - (now - data.download)) / 1000);
      showToast(`⏳ Wait ${remaining}s to download again`);
      return;
    }
  }
  
  try {
    const code = $("scriptCode").textContent;
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sui-hub-demonfall.lua";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast("✓ Download started!");
    
    // Update stats
    await incStat("downloads");
    
    // Save cooldown
    const data = JSON.parse(cooldownData || "{}");
    data.download = Date.now();
    localStorage.setItem(key, JSON.stringify(data));
    
  } catch (err) {
    showToast("❌ Download failed");
  }
});

// ===== INIT =====
loadStats();
loadStatus();
initViews();
