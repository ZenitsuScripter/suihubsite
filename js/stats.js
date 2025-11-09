import{doc,setDoc,getDoc,updateDoc,increment,onSnapshot,serverTimestamp}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import{db,SCRIPT_ID,COOLDOWN}from"./config.js";
import{currentUser}from"./auth.js";
import{els}from"./ui.js";

const getFingerprint=()=>{
const s=navigator.userAgent+navigator.language+screen.width+screen.height+screen.colorDepth+new Date().getTimezoneOffset();
let h=0;
for(let i=0;i<s.length;i++){
const c=s.charCodeAt(i);
h=((h<<5)-h)+c;
h=h&h
}
return h.toString(36)
};

const incStat=async stat=>{
try{
await updateDoc(doc(db,"scripts",SCRIPT_ID),{[stat]:increment(1)})
}catch(e){
console.error("Erro:",e)
}
};

const loadStats=()=>{
onSnapshot(doc(db,"scripts",SCRIPT_ID),d=>{
if(d.exists()){
const data=d.data();
els.viewCount.textContent=data.views||0;
els.copyCount.textContent=data.copies||0;
els.downloadCount.textContent=data.downloads||0
}
})
};

const initViews=async()=>{
const key=currentUser?`cooldown_${currentUser.uid}`:`cooldown_${getFingerprint()}`;
try{
const scriptDoc=doc(db,"scripts",SCRIPT_ID);
const snap=await getDoc(scriptDoc);
if(!snap.exists()){
await setDoc(scriptDoc,{views:0,copies:0,downloads:0})
}
const cd=localStorage.getItem(key);
if(cd){
const data=JSON.parse(cd);
const now=Date.now();
if(data.view&&now-data.view<COOLDOWN)return;
if(data.copy&&now-data.copy<COOLDOWN){
els.copyBtn.disabled=true;
els.copyBtn.textContent="⏳ Aguarde...";
setTimeout(()=>{
els.copyBtn.disabled=false;
els.copyBtn.textContent="📋 Copiar"
},COOLDOWN-(now-data.copy))
}
if(data.download&&now-data.download<COOLDOWN){
els.downloadBtn.disabled=true;
els.downloadBtn.textContent="⏳ Aguarde...";
setTimeout(()=>{
els.downloadBtn.disabled=false;
els.downloadBtn.textContent="💾 Baixar"
},COOLDOWN-(now-data.download))
}
}
if(currentUser){
const cdDoc=doc(db,"cooldowns",currentUser.uid);
const cdSnap=await getDoc(cdDoc);
if(cdSnap.exists()){
const data=cdSnap.data();
const now=Date.now();
if(data.viewTimestamp){
const t=data.viewTimestamp.toMillis();
if(now-t<COOLDOWN)return
}
}
}
await incStat("views");
const now=Date.now();
const cooldowns={view:now};
if(currentUser){
const cdDoc=doc(db,"cooldowns",currentUser.uid);
await setDoc(cdDoc,{viewTimestamp:serverTimestamp()},{merge:true})
}
localStorage.setItem(key,JSON.stringify(cooldowns))
}catch(e){
console.error("Erro:",e)
}
};

els.copyBtn.addEventListener("click",async()=>{
if(els.copyBtn.disabled)return;
const key=currentUser?`cooldown_${currentUser.uid}`:`cooldown_${getFingerprint()}`;
const cd=localStorage.getItem(key);
if(cd){
const data=JSON.parse(cd);
const now=Date.now();
if(data.copy&&now-data.copy<COOLDOWN){
const remaining=Math.ceil((COOLDOWN-(now-data.copy))/1000);
alert(`⏳ Aguarde ${remaining} segundos para copiar novamente`);
return
}
}
if(currentUser){
const cdDoc=doc(db,"cooldowns",currentUser.uid);
const cdSnap=await getDoc(cdDoc);
if(cdSnap.exists()){
const data=cdSnap.data();
if(data.copyTimestamp){
const t=data.copyTimestamp.toMillis();
const now=Date.now();
if(now-t<COOLDOWN){
const remaining=Math.ceil((COOLDOWN-(now-t))/1000);
alert(`⏳ Aguarde ${remaining} segundos para copiar novamente`);
return
}
}
}
}
navigator.clipboard.writeText(els.codeArea.textContent).then(async()=>{
els.statusMsg.classList.add("show");
setTimeout(()=>els.statusMsg.classList.remove("show"),2000);
await incStat("copies");
const now=Date.now();
const cooldowns=localStorage.getItem(key)?JSON.parse(localStorage.getItem(key)):{};
cooldowns.copy=now;
localStorage.setItem(key,JSON.stringify(cooldowns));
if(currentUser){
const cdDoc=doc(db,"cooldowns",currentUser.uid);
await setDoc(cdDoc,{copyTimestamp:serverTimestamp()},{merge:true})
}
els.copyBtn.disabled=true;
els.copyBtn.textContent="⏳ Aguarde...";
setTimeout(()=>{
els.copyBtn.disabled=false;
els.copyBtn.textContent="📋 Copiar"
},COOLDOWN)
})
});

els.downloadBtn.addEventListener("click",async()=>{
if(!currentUser){
alert("❌ Faça login para baixar!");
return
}
if(els.downloadBtn.disabled)return;
const key=`cooldown_${currentUser.uid}`;
const cdDoc=doc(db,"cooldowns",currentUser.uid);
const cdSnap=await getDoc(cdDoc);
if(cdSnap.exists()){
const data=cdSnap.data();
if(data.downloadTimestamp){
const t=data.downloadTimestamp.toMillis();
const now=Date.now();
if(now-t<COOLDOWN){
const remaining=Math.ceil((COOLDOWN-(now-t))/1000);
alert(`⏳ Aguarde ${remaining} segundos para baixar novamente`);
return
}
}
}
const blob=new Blob([els.codeArea.textContent],{type:"text/plain"});
const url=URL.createObjectURL(blob);
const a=document.createElement("a");
a.href=url;
a.download="sui-hub-demonfall.lua";
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);
await incStat("downloads");
await setDoc(cdDoc,{downloadTimestamp:serverTimestamp()},{merge:true});
const cooldowns=localStorage.getItem(key)?JSON.parse(localStorage.getItem(key)):{};
cooldowns.download=Date.now();
localStorage.setItem(key,JSON.stringify(cooldowns));
els.downloadBtn.disabled=true;
els.downloadBtn.textContent="⏳ Aguarde...";
setTimeout(()=>{
els.downloadBtn.disabled=false;
els.downloadBtn.textContent="💾 Baixar"
},COOLDOWN)
});

initViews();
loadStats();
