// ===== FIREBASE IMPORTS =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, onSnapshot, serverTimestamp, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

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

let currentUser = null;

// ===== DOM ELEMENTS =====
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelector(sel);
const $$$ = (sel) => document.querySelectorAll(sel);

// ===== TOAST HELPER =====
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
    
    // Update nav links
    $$$("[data-page]").forEach(l => l.classList.remove("active"));
    link.classList.add("active");
    
    // Update pages
    $$$(".page").forEach(p => p.classList.remove("active"));
    $(page).classList.add("active");
  });
});

// ===== THEME TOGGLE =====
const loadTheme = () => {
  const theme = localStorage.getItem("theme") || "dark";
  if (theme === "light") {
    document.body.classList.add("light");
  }
};

$("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("light");
  const theme = document.body.classList.contains("light") ? "light" : "dark";
  localStorage.setItem("theme", theme);
});

loadTheme();

// ===== DRAWER =====
const openDrawer = () => {
  $("drawer").classList.add("open");
  $("drawerOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
};

const closeDrawer = () => {
  $("drawer").classList.remove("open");
  $("drawerOverlay").classList.remove("open");
  document.body.style.overflow = "";
};

$("avatarBtn")?.addEventListener("click", openDrawer);
$("closeDrawer").addEventListener("click", closeDrawer);
$("drawerOverlay").addEventListener("click", closeDrawer);

// Drawer tabs
$$$(".drawer-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;
    $$$(".drawer-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    $$$(".drawer-content").forEach(c => c.classList.remove("active"));
    $(`${target}Content`).classList.add("active");
  });
});

// ===== AUTH =====
const updateUI = (user) => {
  if (user) {
    $("loginBtn").style.display = "none";
    $("avatarBtn").style.display = "block";
    $("avatarImg").src = user.photoURL || DEFAULT_AVATAR;
    $("drawerAvatar").src = user.photoURL || DEFAULT_AVATAR;
    $("drawerName").textContent = user.displayName || "User";
    $("drawerEmail").textContent = user.email || "";
  } else {
    $("loginBtn").style.display = "block";
    $("avatarBtn").style.display = "none";
    $("drawerName").textContent = "Guest";
    $("drawerEmail").textContent = "";
    $("drawerAvatar").src = DEFAULT_AVATAR;
    $("profileName").textContent = "—";
    $("profileEmail").textContent = "—";
    $("profileBio").textContent = "—";
  }
};

const loadProfile = async (user) => {
  if (!user) return;
  
  const userDoc = doc(db, "users", user.uid);
  
  // Real-time listener
  onSnapshot(userDoc, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      const name = data.name || user.displayName || "User";
      const bio = data.bio || "No bio yet";
      const photoURL = data.photo ? `data:image/jpeg;base64,${data.photo}` : user.photoURL || DEFAULT_AVATAR;
      
      // Update all instances
      $("drawerName").textContent = name;
      $("drawerEmail").textContent = user.email || "";
      $("profileName").textContent = name;
      $("profileEmail").textContent = user.email || "—";
      $("profileBio").textContent = bio;
      $("editName").value = data.name || user.displayName || "";
      $("editBio").value = data.bio || "";
      
      // Update avatars
      $("avatarImg").src = photoURL;
      $("drawerAvatar").src = photoURL;
    }
  });
  
  // Create user doc if doesn't exist
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

// Login
$("loginBtn").addEventListener("click", () => {
  signInWithPopup(auth, provider).catch(err => {
    showToast("❌ Login failed: " + err.message);
  });
});

// Logout
$("logoutBtn").addEventListener("click", () => {
  signOut(auth);
  closeDrawer();
  showToast("✓ Logged out successfully");
});

// Auth state listener
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  updateUI(user);
  if (user) {
    await loadProfile(user);
  }
});

// ===== SAVE PROFILE =====
$("saveBtn").addEventListener("click", async () => {
  if (!currentUser) {
    showToast("❌ Please login first!");
    return;
  }
  
  const name = $("editName").value.trim();
  const bio = $("editBio").value.trim();
  const photoFile = $("editPhoto").files[0];
  
  if (!name) {
    showToast("❌ Name is required!");
    return;
  }
  
  if (photoFile && photoFile.size > 512000) {
    showToast("❌ Photo must be less than 500kb!");
    return;
  }
  
  $("editMessage").textContent = "🔍 Checking name...";
  $("saveBtn").disabled = true;
  
  try {
    // Check if name is taken
    const q = query(collection(db, "users"), where("name", "==", name));
    const snapshot = await getDocs(q);
    let nameTaken = false;
    snapshot.forEach(doc => {
      if (doc.id !== currentUser.uid) nameTaken = true;
    });
    
    if (nameTaken) {
      showToast("❌ Name already taken!");
      $("saveBtn").disabled = false;
      return;
    }
    
    $("editMessage").textContent = "💾 Saving...";
    
    const userDoc = doc(db, "users", currentUser.uid);
    const updateData = { name, bio };
    
    // Handle photo upload
    if (photoFile) {
      const photoData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(photoFile);
      });
      updateData.photo = photoData;
    }
    
    await setDoc(userDoc, updateData, { merge: true });
    
    showToast("✓ Profile saved successfully!");
    $("editMessage").textContent = "";
    $("editPhoto").value = "";
    
    // Switch to profile tab
    $$$(".drawer-tab")[0].click();
    
  } catch (err) {
    showToast("❌ Error: " + err.message);
    $("editMessage").textContent = "";
  } finally {
    $("saveBtn").disabled = false;
  }
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
  onSnapshot(doc(db, "scripts", SCRIPT_ID), (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      $("viewCount").textContent = data.views || 0;
      $("copyCount").textContent = data.copies || 0;
      $("downloadCount").textContent = data.downloads || 0;
    }
  });
};

const initViews = async () => {
  const key = currentUser ? `cooldown_${currentUser.uid}` : `cooldown_${getFingerprint()}`;
  
  try {
    const scriptDoc = doc(db, "scripts", SCRIPT_ID);
    const snapshot = await getDoc(scriptDoc);
    
    if (!snapshot.exists()) {
      await setDoc(scriptDoc, { views: 0, copies: 0, downloads: 0 });
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
    const originalText = btn.innerHTML;
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>Copied!';
    
    setTimeout(() => {
      btn.classList.remove("copied");
      btn.innerHTML = originalText;
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
initViews();
