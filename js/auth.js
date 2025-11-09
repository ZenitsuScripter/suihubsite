import{GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import{doc,setDoc,getDoc,collection,query,where,getDocs,onSnapshot}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import{auth,db,DEFAULT_AVATAR}from"./config.js";
import{els,closeMobile,closeDrawer}from"./ui.js";

const provider=new GoogleAuthProvider();
export let currentUser=null;

const loadProfile=async u=>{
if(!u)return;
const userDoc=doc(db,"users",u.uid);
onSnapshot(userDoc,d=>{
if(!d.exists())return;
const data=d.data();
const name=data.name||u.displayName||"Usuário";
const photo=data.photo||u.photoURL||DEFAULT_AVATAR;
els.drawerName.textContent=name;
els.drawerEmail.textContent=u.email||"";
els.drawerAvatar.src=photo;
els.avatarImg.src=photo;
els.mobileAvatarImg.src=photo;
els.profileName.textContent=name;
els.profileEmail.textContent=u.email||"—";
els.profileBio.textContent=data.bio||"Sem biografia";
els.editName.value=data.name||u.displayName||"";
els.editBio.value=data.bio||""
});
const snap=await getDoc(userDoc);
if(!snap.exists()){
await setDoc(userDoc,{
name:u.displayName||"",
bio:"",
photo:u.photoURL||"",
created:new Date().toISOString()
})
}
};

const handleLogin=()=>{
signInWithPopup(auth,provider).catch(e=>{
alert("Erro ao fazer login: "+e.message)
})
};

els.loginBtn.addEventListener("click",handleLogin);
els.mobileLoginBtn.addEventListener("click",()=>{
closeMobile();
handleLogin()
});

els.logoutDrawer.addEventListener("click",()=>{
signOut(auth);
closeDrawer()
});

onAuthStateChanged(auth,async u=>{
currentUser=u;
if(u){
els.loginBtn.style.display="none";
els.avatarBtn.classList.add("show");
els.mobileLoginBtn.style.display="none";
els.mobileAvatarBtn.style.display="block";
els.avatarImg.src=u.photoURL||DEFAULT_AVATAR;
els.mobileAvatarImg.src=u.photoURL||DEFAULT_AVATAR;
await loadProfile(u)
}else{
els.loginBtn.style.display="inline-flex";
els.avatarBtn.classList.remove("show");
els.mobileLoginBtn.style.display="inline-flex";
els.mobileAvatarBtn.style.display="none";
els.drawerName.textContent="Convidado";
els.drawerEmail.textContent="";
els.drawerAvatar.src=DEFAULT_AVATAR;
els.profileName.textContent="—";
els.profileEmail.textContent="—";
els.profileBio.textContent="—"
}
});

els.saveProfileBtn.addEventListener("click",async()=>{
if(!currentUser){
els.editMsg.textContent="❌ Você precisa estar logado!";
return
}
const name=els.editName.value.trim();
const bio=els.editBio.value.trim();
const photo=els.editPhoto.files[0];
if(!name){
els.editMsg.textContent="❌ Nome é obrigatório!";
return
}
if(photo&&photo.size>512000){
els.editMsg.textContent="❌ Foto deve ter menos de 500kb!";
return
}
els.editMsg.textContent="🔍 Verificando nome...";
els.saveProfileBtn.disabled=true;
try{
const q=query(collection(db,"users"),where("name","==",name));
const snap=await getDocs(q);
let exists=false;
snap.forEach(d=>{
if(d.id!==currentUser.uid)exists=true
});
if(exists){
els.editMsg.textContent="❌ Este nome já está em uso!";
els.saveProfileBtn.disabled=false;
return
}
els.editMsg.textContent="💾 Salvando...";
let photoData=null;
if(photo){
photoData=await new Promise((res,rej)=>{
const r=new FileReader();
r.onload=()=>res(r.result.split(",")[1]);
r.onerror=rej;
r.readAsDataURL(photo)
})
}
const userDoc=doc(db,"users",currentUser.uid);
if(photoData){
await setDoc(userDoc,{name,bio,photo:photoData},{merge:true})
}else{
await setDoc(userDoc,{name,bio},{merge:true})
}
await loadProfile(currentUser);
els.editMsg.textContent="✓ Perfil salvo com sucesso!";
els.editPhoto.value="";
setTimeout(()=>{
els.editMsg.textContent=""
},3000)
}catch(e){
els.editMsg.textContent="❌ Erro ao salvar: "+e.message
}finally{
els.saveProfileBtn.disabled=false
}
});
