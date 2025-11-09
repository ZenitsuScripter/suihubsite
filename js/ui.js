export const els={
mobileMenuBtn:document.getElementById("mobileMenuBtn"),
mobileMenu:document.getElementById("mobileMenu"),
closeMobileMenu:document.getElementById("closeMobileMenu"),
mobileLoginBtn:document.getElementById("mobileLoginBtn"),
mobileAvatarBtn:document.getElementById("mobileAvatarBtn"),
mobileAvatarImg:document.getElementById("mobileAvatarImg"),
loginBtn:document.getElementById("loginBtn"),
avatarBtn:document.getElementById("avatarBtn"),
avatarImg:document.getElementById("avatarImg"),
drawer:document.getElementById("drawer"),
drawerOverlay:document.getElementById("drawerOverlay"),
closeDrawer:document.getElementById("closeDrawer"),
drawerAvatar:document.getElementById("drawerAvatar"),
drawerName:document.getElementById("drawerName"),
drawerEmail:document.getElementById("drawerEmail"),
logoutDrawer:document.getElementById("logoutDrawer"),
profileName:document.getElementById("profileName"),
profileEmail:document.getElementById("profileEmail"),
profileBio:document.getElementById("profileBio"),
editName:document.getElementById("editName"),
editBio:document.getElementById("editBio"),
editPhoto:document.getElementById("editPhoto"),
saveProfileBtn:document.getElementById("saveProfileBtn"),
editMsg:document.getElementById("editMsg"),
copyBtn:document.getElementById("copyBtn"),
downloadBtn:document.getElementById("downloadBtn"),
codeArea:document.getElementById("codeArea"),
statusMsg:document.getElementById("statusMsg"),
themeToggle:document.getElementById("themeToggle"),
viewCount:document.getElementById("viewCount"),
copyCount:document.getElementById("copyCount"),
downloadCount:document.getElementById("downloadCount")
};

const loadTheme=()=>{
const t=localStorage.getItem("theme")||"dark";
document.body.classList.toggle("light",t==="light");
els.themeToggle.checked=t==="light"
};

const saveTheme=()=>{
const t=els.themeToggle.checked?"light":"dark";
localStorage.setItem("theme",t);
document.body.classList.toggle("light",t==="light")
};

els.themeToggle.addEventListener("change",saveTheme);
loadTheme();

document.querySelectorAll(".tab-btn").forEach(b=>{
b.addEventListener("click",()=>{
const t=b.dataset.tab;
document.querySelectorAll(".tab-btn").forEach(x=>x.classList.remove("active"));
b.classList.add("active");
document.querySelectorAll(".tab-content").forEach(c=>c.classList.remove("active"));
document.getElementById(t).classList.add("active")
})
});

export const openMobile=()=>{
els.mobileMenu.classList.add("open");
els.drawerOverlay.classList.add("open");
document.body.style.overflow="hidden"
};

export const closeMobile=()=>{
els.mobileMenu.classList.remove("open");
if(!els.drawer.classList.contains("open")){
els.drawerOverlay.classList.remove("open");
document.body.style.overflow=""
}
};

export const openDrawer=()=>{
els.drawer.classList.add("open");
els.drawerOverlay.classList.add("open");
els.mobileMenu.classList.remove("open");
document.body.style.overflow="hidden"
};

export const closeDrawer=()=>{
els.drawer.classList.remove("open");
els.drawerOverlay.classList.remove("open");
document.body.style.overflow=""
};

els.mobileMenuBtn.addEventListener("click",openMobile);
els.closeMobileMenu.addEventListener("click",closeMobile);
els.avatarBtn.addEventListener("click",openDrawer);
els.mobileAvatarBtn.addEventListener("click",()=>{
closeMobile();
openDrawer()
});
els.closeDrawer.addEventListener("click",closeDrawer);
els.drawerOverlay.addEventListener("click",()=>{
closeDrawer();
closeMobile()
});
