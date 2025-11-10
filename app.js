// ===== IMPORTS FIREBASE =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, onSnapshot, serverTimestamp, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// ===== CONFIG FIREBASE =====
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
const COOLDOWN = 5 * 60 * 1000; // 5 minutos
const DEFAULT_AVATAR = "https://www.gstatic.com/images/branding/product/1x/avatar_square_blue_512dp.png";

let currentUser = null;

// ===== TOAST HELPER =====
const showToast = (message) => {
  const toast = $("statusMsg");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
};

// ===== ELEMENTOS DOM =====
const $ = id => document.getElementById(id);
const els = {
  mobileMenuBtn: $("mobileMenuBtn"),
  mobileMenu: $("mobileMenu"),
  closeMobileMenu: $("closeMobileMenu"),
  mobileLoginBtn: $("mobileLoginBtn"),
  mobileAvatarBtn: $("mobileAvatarBtn"),
  mobileAvatarImg: $("mobileAvatarImg"),
  loginBtn: $("loginBtn"),
  avatarBtn: $("avatarBtn"),
  avatarImg: $("avatarImg"),
  drawer: $("drawer"),
  drawerOverlay: $("drawerOverlay"),
  closeDrawer: $("closeDrawer"),
  drawerAvatar: $("drawerAvatar"),
  drawerName: $("drawerName"),
  drawerEmail: $("drawerEmail"),
  logoutDrawer: $("logoutDrawer"),
  profileName: $("profileName"),
  profileEmail: $("profileEmail"),
  profileBio: $("profileBio"),
  editName: $("editName"),
  editBio: $("editBio"),
  editPhoto: $("editPhoto"),
  saveProfileBtn: $("saveProfileBtn"),
  editMsg: $("editMsg"),
  copyBtn: $("copyBtn"),
  downloadBtn: $("downloadBtn"),
  codeArea: $("codeArea"),
  statusMsg: $("statusMsg"),
  themeToggle: $("themeToggle"),
  viewCount: $("viewCount"),
  copyCount: $("copyCount"),
  downloadCount: $("downloadCount"),
  mobileAvatarImg: $("mobileAvatarImg")
};

// ===== UI FUNCTIONS =====
const openMobile = () => {
  els.mobileMenu.classList.add("open");
  els.drawerOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
};

const closeMobile = () => {
  els.mobileMenu.classList.remove("open");
  if (!els.drawer.classList.contains("open")) {
    els.drawerOverlay.classList.remove("open");
    document.body.style.overflow = "";
  }
};

const openDrawer = () => {
  els.drawer.classList.add("open");
  els.drawerOverlay.classList.add("open");
  els.mobileMenu.classList.remove("open");
  document.body.style.overflow = "hidden";
};

const closeDrawer = () => {
  els.drawer.classList.remove("open");
  els.drawerOverlay.classList.remove("open");
  document.body.style.overflow = "";
};

// ===== THEME =====
const loadTheme = () => {
  const t = localStorage.getItem("theme") || "dark";
  document.body.classList.toggle("light", t === "light");
  els.themeToggle.checked = t === "light";
};

const saveTheme = () => {
  const t = els.themeToggle.checked ? "light" : "dark";
  localStorage.setItem("theme", t);
  document.body.classList.toggle("light", t === "light");
};

// ===== NAVIGATION TABS =====
document.querySelectorAll(".nav-btn, .mobile-nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const tabId = btn.dataset.tab;
    
    // Update nav buttons
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".mobile-nav-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(`[data-tab="${tabId}"]`).forEach(b => b.classList.add("active"));
    
    // Update tab content
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    $(tabId).classList.add("active");
    
    // Close mobile menu if open
    closeMobile();
  });
});

// ===== DRAWER TABS =====
document.querySelectorAll("[data-drawer-tab]").forEach(b => {
  b.addEventListener("click", () => {
    const t = b.dataset.drawerTab;
    document.querySelectorAll("[data-drawer-tab]").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    document.querySelectorAll(".drawer-tab-content").forEach(c => c.classList.remove("active"));
    $(t).classList.add("active");
  });
});

// ===== AUTH =====
const loadProfile = async u => {
  if (!u) return;
  const userDoc = doc(db, "users", u.uid);
  onSnapshot(userDoc, d => {
    if (!d.exists()) return;
    const data = d.data();
    const name = data.name || u.displayName || "Usuário";
    const photo = data.photo || u.photoURL || DEFAULT_AVATAR;
    els.drawerName.textContent = name;
    els.drawerEmail.textContent = u.email || "";
    els.drawerAvatar.src = photo;
    els.avatarImg.src = photo;
    els.mobileAvatarImg.src = photo;
    els.profileName.textContent = name;
    els.profileEmail.textContent = u.email || "—";
    els.profileBio.textContent = data.bio || "Sem biografia";
    els.editName.value = data.name || u.displayName || "";
    els.editBio.value = data.bio || "";
  });

  const snap = await getDoc(userDoc);
  if (!snap.exists()) {
    await setDoc(userDoc, {
      name: u.displayName || "",
      bio: "",
      photo: u.photoURL || "",
      created: new Date().toISOString()
    });
  }
};

const handleLogin = () => {
  signInWithPopup(auth, provider).catch(e => {
    alert("Erro ao fazer login: " + e.message);
  });
};

onAuthStateChanged(auth, async u => {
  currentUser = u;
  if (u) {
    els.loginBtn.style.display = "none";
    els.avatarBtn.classList.add("show");
    els.mobileLoginBtn.style.display = "none";
    els.mobileAvatarBtn.style.display = "block";
    els.avatarImg.src = u.photoURL || DEFAULT_AVATAR;
    els.mobileAvatarImg.src = u.photoURL || DEFAULT_AVATAR;
    await loadProfile(u);
  } else {
    els.loginBtn.style.display = "inline-flex";
    els.avatarBtn.classList.remove("show");
    els.mobileLoginBtn.style.display = "inline-flex";
    els.mobileAvatarBtn.style.display = "none";
    els.drawerName.textContent = "Convidado";
    els.drawerEmail.textContent = "";
    els.drawerAvatar.src = DEFAULT_AVATAR;
    els.profileName.textContent = "—";
    els.profileEmail.textContent = "—";
    els.profileBio.textContent = "—";
  }
});

// ===== SAVE PROFILE =====
els.saveProfileBtn.addEventListener("click", async () => {
  if (!currentUser) {
    els.editMsg.textContent = "❌ Você precisa estar logado!";
    return;
  }
  const name = els.editName.value.trim();
  const bio = els.editBio.value.trim();
  const photo = els.editPhoto.files[0];

  if (!name) {
    els.editMsg.textContent = "❌ Nome é obrigatório!";
    return;
  }
  if (photo && photo.size > 512000) {
    els.editMsg.textContent = "❌ Foto deve ter menos de 500kb!";
    return;
  }

  els.editMsg.textContent = "🔍 Verificando nome...";
  els.saveProfileBtn.disabled = true;

  try {
    const q = query(collection(db, "users"), where("name", "==", name));
    const snap = await getDocs(q);
    let exists = false;
    snap.forEach(d => {
      if (d.id !== currentUser.uid) exists = true;
    });

    if (exists) {
      els.editMsg.textContent = "❌ Este nome já está em uso!";
      els.saveProfileBtn.disabled = false;
      return;
    }

    els.editMsg.textContent = "💾 Salvando...";
    let photoData = null;
    if (photo) {
      photoData = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(",")[1]);
        r.onerror = rej;
        r.readAsDataURL(photo);
      });
    }

    const userDoc = doc(db, "users", currentUser.uid);
    if (photoData) {
      await setDoc(userDoc, { name, bio, photo: photoData }, { merge: true });
    } else {
      await setDoc(userDoc, { name, bio }, { merge: true });
    }

    await loadProfile(currentUser);
    els.editMsg.textContent = "✓ Perfil salvo com sucesso!";
    els.editPhoto.value = "";
    setTimeout(() => {
      els.editMsg.textContent = "";
    }, 3000);
  } catch (e) {
    els.editMsg.textContent = "❌ Erro ao salvar: " + e.message;
  } finally {
    els.saveProfileBtn.disabled = false;
  }
});

// ===== STATS =====
const getFingerprint = () => {
  const s = navigator.userAgent + navigator.language + screen.width + screen.height + screen.colorDepth + new Date().getTimezoneOffset();
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h = ((h << 5) - h) + c;
    h = h & h;
  }
  return h.toString(36);
};

const incStat = async stat => {
  try {
    await updateDoc(doc(db, "scripts", SCRIPT_ID), { [stat]: increment(1) });
  } catch (e) {
    console.error("Erro:", e);
  }
};

const loadStats = () => {
  onSnapshot(doc(db, "scripts", SCRIPT_ID), d => {
    if (d.exists()) {
      const data = d.data();
      els.viewCount.textContent = data.views || 0;
      els.copyCount.textContent = data.copies || 0;
      els.downloadCount.textContent = data.downloads || 0;
    }
  });
};

const initViews = async () => {
  const key = currentUser ? `cooldown_${currentUser.uid}` : `cooldown_${getFingerprint()}`;
  try {
    const scriptDoc = doc(db, "scripts", SCRIPT_ID);
    const snap = await getDoc(scriptDoc);
    if (!snap.exists()) {
      await setDoc(scriptDoc, { views: 0, copies: 0, downloads: 0 });
    }

    const cd = localStorage.getItem(key);
    if (cd) {
      const data = JSON.parse(cd);
      const now = Date.now();
      if (data.view && now - data.view < COOLDOWN) return;
      if (data.copy && now - data.copy < COOLDOWN) {
        els.copyBtn.disabled = true;
        els.copyBtn.textContent = "⏳ Aguarde...";
        setTimeout(() => {
          els.copyBtn.disabled = false;
          els.copyBtn.textContent = "📋 Copiar";
        }, COOLDOWN - (now - data.copy));
      }
      if (data.download && now - data.download < COOLDOWN) {
        els.downloadBtn.disabled = true;
        els.downloadBtn.textContent = "⏳ Aguarde...";
        setTimeout(() => {
          els.downloadBtn.disabled = false;
          els.downloadBtn.textContent = "💾 Baixar";
        }, COOLDOWN - (now - data.download));
      }
    }

    if (currentUser) {
      const cdDoc = doc(db, "cooldowns", currentUser.uid);
      const cdSnap = await getDoc(cdDoc);
      if (cdSnap.exists()) {
        const data = cdSnap.data();
        const now = Date.now();
        if (data.viewTimestamp) {
          const t = data.viewTimestamp.toMillis();
          if (now - t < COOLDOWN) return;
        }
      }
    }

    await incStat("views");
    const now = Date.now();
    const cooldowns = { view: now };
    if (currentUser) {
      const cdDoc = doc(db, "cooldowns", currentUser.uid);
      await setDoc(cdDoc, { viewTimestamp: serverTimestamp() }, { merge: true });
    }
    localStorage.setItem(key, JSON.stringify(cooldowns));
  } catch (e) {
    console.error("Erro:", e);
  }
};

// ===== COPY BUTTON =====
els.copyBtn.addEventListener("click", async () => {
  if (els.copyBtn.disabled) return;
  const key = currentUser ? `cooldown_${currentUser.uid}` : `cooldown_${getFingerprint()}`;
  const cd = localStorage.getItem(key);
  if (cd) {
    const data = JSON.parse(cd);
    const now = Date.now();
    if (data.copy && now - data.copy < COOLDOWN) {
      const remaining = Math.ceil((COOLDOWN - (now - data.copy)) / 1000);
      showToast(`⏳ Aguarde ${remaining} segundos para copiar novamente`);
      return;
    }
  }

  if (currentUser) {
    const cdDoc = doc(db, "cooldowns", currentUser.uid);
    const cdSnap = await getDoc(cdDoc);
    if (cdSnap.exists()) {
      const data = cdSnap.data();
      if (data.copyTimestamp) {
        const t = data.copyTimestamp.toMillis();
        const now = Date.now();
        if (now - t < COOLDOWN) {
          const remaining = Math.ceil((COOLDOWN - (now - t)) / 1000);
          showToast(`⏳ Aguarde ${remaining} segundos para copiar novamente`);
          return;
        }
      }
    }
  }

  navigator.clipboard.writeText(els.codeArea.textContent).then(async () => {
    // Visual feedback
    els.copyBtn.classList.add("copied");
    const originalText = els.copyBtn.querySelector(".copy-text").textContent;
    els.copyBtn.querySelector(".copy-text").textContent = "Copiado!";
    showToast("✓ Código copiado com sucesso!");
    
    setTimeout(() => {
      els.copyBtn.classList.remove("copied");
      els.copyBtn.querySelector(".copy-text").textContent = originalText;
    }, 2000);
    
    await incStat("copies");
    const now = Date.now();
    const cooldowns = localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : {};
    cooldowns.copy = now;
    localStorage.setItem(key, JSON.stringify(cooldowns));
    if (currentUser) {
      const cdDoc = doc(db, "cooldowns", currentUser.uid);
      await setDoc(cdDoc, { copyTimestamp: serverTimestamp() }, { merge: true });
    }
    els.copyBtn.disabled = true;
    setTimeout(() => {
      els.copyBtn.disabled = false;
    }, COOLDOWN);
  });
});

// ===== DOWNLOAD BUTTON =====
els.downloadBtn.addEventListener("click", async () => {
  if (!currentUser) {
    showToast("❌ Faça login para baixar!");
    return;
  }
  if (els.downloadBtn.disabled) return;
  const key = `cooldown_${currentUser.uid}`;
  const cdDoc = doc(db, "cooldowns", currentUser.uid);
  const cdSnap = await getDoc(cdDoc);
  if (cdSnap.exists()) {
    const data = cdSnap.data();
    if (data.downloadTimestamp) {
      const t = data.downloadTimestamp.toMillis();
      const now = Date.now();
      if (now - t < COOLDOWN) {
        const remaining = Math.ceil((COOLDOWN - (now - t)) / 1000);
        showToast(`⏳ Aguarde ${remaining} segundos para baixar novamente`);
        return;
      }
    }
  }

  const blob = new Blob([els.codeArea.textContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sui-hub-demonfall.lua";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  await incStat("downloads");
  await setDoc(cdDoc, { downloadTimestamp: serverTimestamp() }, { merge: true });
  const cooldowns = localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : {};
  cooldowns.download = Date.now();
  localStorage.setItem(key, JSON.stringify(cooldowns));
  showToast("✓ Download iniciado!");
  els.downloadBtn.disabled = true;
  setTimeout(() => {
    els.downloadBtn.disabled = false;
  }, COOLDOWN);
});

// ===== EVENT LISTENERS =====
els.loginBtn.addEventListener("click", handleLogin);
els.mobileLoginBtn.addEventListener("click", () => {
  closeMobile();
  handleLogin();
});
els.logoutDrawer.addEventListener("click", () => {
  signOut(auth);
  closeDrawer();
});
els.themeToggle.addEventListener("change", saveTheme);
els.mobileMenuBtn.addEventListener("click", openMobile);
els.closeMobileMenu.addEventListener("click", closeMobile);
els.avatarBtn.addEventListener("click", openDrawer);
els.mobileAvatarBtn.addEventListener("click", () => {
  closeMobile();
  openDrawer();
});
els.closeDrawer.addEventListener("click", closeDrawer);
els.drawerOverlay.addEventListener("click", () => {
  closeDrawer();
  closeMobile();
});

// ===== INIT =====
loadTheme();
initViews();
loadStats();
