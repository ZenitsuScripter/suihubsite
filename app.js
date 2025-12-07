import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const app = initializeApp({
  apiKey: "AIzaSyBG3D3ieH0f-3608DcWnIIfQS_n5tP7EHE",
  authDomain: "sui-hub.firebaseapp.com",
  projectId: "sui-hub",
  storageBucket: "sui-hub.firebasestorage.app",
  messagingSenderId: "590135716171",
  appId: "1:590135716171:web:521bbb28c8ec4eae2e60ce"
});

const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

let currentUser = null;
let userData = null;

const $ = id => document.getElementById(id);
const showToast = msg => {
  $('toast').textContent = msg;
  $('toast').classList.add('show');
  setTimeout(() => $('toast').classList.remove('show'), 3000);
};

const SPIN_ATTRIBUTES = [
  {
    id: 'raca',
    name: 'Raça',
    options: [
      { value: 'Humano', rarity: 'common', range: [52, 90] },
      { value: 'Anão', rarity: 'common', range: [5, 19] },
      { value: 'Elfo', rarity: 'uncommon', range: [20, 29] },
      { value: 'Draconato', rarity: 'uncommon', range: [2, 4] },
      { value: 'Gnomo', rarity: 'uncommon', range: [34, 39] },
      { value: 'Tiefling', rarity: 'rare', range: [95, 98] },
      { value: 'Orc', rarity: 'rare', range: [42, 43] },
      { value: 'Vampiro', rarity: 'epic', range: [44, 50] },
      { value: 'Tabaxi', rarity: 'rare', range: [93, 94] },
      { value: 'Aasimar', rarity: 'legendary', range: [1, 1] },
      { value: 'Aetheborn', rarity: 'rare', range: [31, 33] },
      { value: 'Thri Kreen', rarity: 'rare', range: [40, 41] },
      { value: 'Homem-Rato', rarity: 'uncommon', range: [51, 51] },
      { value: 'Kenku', rarity: 'rare', range: [91, 91] },
      { value: 'Quarterra', rarity: 'rare', range: [92, 92] },
      { value: 'Myconidae', rarity: 'legendary', range: [99, 99] }
    ]
  },
  {
    id: 'antecedente',
    name: 'Antecedente',
    options: [
      { value: 'Acólito', rarity: 'common', range: [1, 7] },
      { value: 'Charlatão', rarity: 'common', range: [8, 14] },
      { value: 'Criminoso', rarity: 'common', range: [15, 21] },
      { value: 'Artista', rarity: 'common', range: [22, 28] },
      { value: 'Herói do Povo', rarity: 'common', range: [29, 35] },
      { value: 'Artesão da Guilda', rarity: 'common', range: [36, 42] },
      { value: 'Eremita', rarity: 'common', range: [43, 49] },
      { value: 'Nobre', rarity: 'uncommon', range: [50, 56] },
      { value: 'Forasteiro', rarity: 'common', range: [57, 63] },
      { value: 'Sábio', rarity: 'uncommon', range: [64, 70] },
      { value: 'Marinheiro', rarity: 'common', range: [71, 77] },
      { value: 'Soldado', rarity: 'common', range: [78, 84] },
      { value: 'Órfão', rarity: 'common', range: [85, 91] }
    ]
  },
  {
    id: 'classe',
    name: 'Classe',
    options: [
      { value: 'Arquearia', rarity: 'common', range: [1, 16] },
      { value: 'Defesa', rarity: 'common', range: [17, 32] },
      { value: 'Duelismo', rarity: 'uncommon', range: [33, 48] },
      { value: 'Armas Grandes', rarity: 'common', range: [49, 64] },
      { value: 'Proteção', rarity: 'uncommon', range: [65, 80] },
      { value: 'Duas Armas', rarity: 'uncommon', range: [81, 96] }
    ]
  },
  {
    id: 'origem',
    name: 'Origem Feitiçaria',
    options: [
      { value: 'Linhagem Dracônica', rarity: 'uncommon', range: [1, 19] },
      { value: 'Magia Selvagem', rarity: 'rare', range: [20, 38] },
      { value: 'Alma Divina', rarity: 'epic', range: [39, 57] },
      { value: 'Magia Sombria', rarity: 'uncommon', range: [58, 76] },
      { value: 'Tempestade', rarity: 'rare', range: [77, 95] }
    ]
  },
  {
    id: 'dominio',
    name: 'Domínio',
    options: [
      { value: 'Conhecimento', rarity: 'uncommon', range: [1, 10] },
      { value: 'Enganação', rarity: 'rare', range: [11, 20] },
      { value: 'Guerra', rarity: 'uncommon', range: [21, 30] },
      { value: 'Luz', rarity: 'uncommon', range: [31, 40] },
      { value: 'Natureza', rarity: 'common', range: [41, 50] },
      { value: 'Tempestade', rarity: 'rare', range: [51, 60] },
      { value: 'Vida', rarity: 'uncommon', range: [61, 70] },
      { value: 'Forja', rarity: 'rare', range: [71, 80] },
      { value: 'Morte', rarity: 'epic', range: [81, 90] }
    ]
  }
];

const CODES = {
  'newsystem': { spins: 3, name: 'New System' },
  'rpgpremium': { spins: 3, name: 'RPG Premium' },
  'suiryuu': { spins: 3, name: 'Suiryuu Special' }
};

function rollD100() {
  return Math.floor(Math.random() * 100) + 1;
}

function getResultFromRoll(roll, options) {
  for (const opt of options) {
    if (roll >= opt.range[0] && roll <= opt.range[1]) {
      return opt;
    }
  }
  return options[0];
}

async function initSpinUI() {
  const grid = $('spinGrid');
  grid.innerHTML = '';
  
  for (const attr of SPIN_ATTRIBUTES) {
    const spins = userData.spins[attr.id] || 0;
    const result = userData.results[attr.id] || null;
    
    const spinHtml = `
      <div class="spin-item">
        <div class="spin-header">
          <h3>${attr.name}</h3>
          <div class="spin-count">
            ${[1,2,3].map(i => `<div class="spin-dot ${i <= spins ? 'active' : ''}"></div>`).join('')}
          </div>
        </div>
        <div class="spin-result ${result ? result.rarity : ''}" id="result-${attr.id}">
          ${result ? result.value : '?'}
        </div>
        <button class="btn-spin" data-attr="${attr.id}" ${spins === 0 ? 'disabled' : ''}>
          🎲 Girar (${spins})
        </button>
      </div>
    `;
    
    grid.innerHTML += spinHtml;
  }
  
  document.querySelectorAll('.btn-spin').forEach(btn => {
    btn.addEventListener('click', () => spinAttribute(btn.dataset.attr));
  });
  
  checkFormDisplay();
}

async function spinAttribute(attrId) {
  const attr = SPIN_ATTRIBUTES.find(a => a.id === attrId);
  if (!attr || userData.spins[attrId] <= 0) return;
  
  const resultEl = $(`result-${attrId}`);
  const btn = document.querySelector(`[data-attr="${attrId}"]`);
  
  btn.disabled = true;
  resultEl.classList.add('spinning');
  resultEl.textContent = '...';
  
  let counter = 0;
  const spinInterval = setInterval(() => {
    const randomOpt = attr.options[Math.floor(Math.random() * attr.options.length)];
    resultEl.textContent = randomOpt.value;
    resultEl.className = `spin-result spinning ${randomOpt.rarity}`;
    counter++;
    
    if (counter >= 20) {
      clearInterval(spinInterval);
      
      const roll = rollD100();
      const finalResult = getResultFromRoll(roll, attr.options);
      
      resultEl.textContent = finalResult.value;
      resultEl.className = `spin-result ${finalResult.rarity}`;
      
      userData.spins[attrId]--;
      userData.results[attrId] = finalResult;
      
      saveUserData();
      setTimeout(() => initSpinUI(), 500);
    }
  }, 100);
}

function checkFormDisplay() {
  const allSpun = SPIN_ATTRIBUTES.every(attr => userData.results[attr.id]);
  
  if (allSpun) {
    $('characterForm').style.display = 'block';
  }
}

async function saveUserData() {
  if (!currentUser) return;
  
  try {
    await updateDoc(doc(db, "users", currentUser.uid), {
      spins: userData.spins,
      results: userData.results
    });
  } catch (err) {
    console.error("Save error:", err);
  }
}

async function loadUserData() {
  if (!currentUser) return;
  
  const userDoc = await getDoc(doc(db, "users", currentUser.uid));
  
  if (userDoc.exists()) {
    userData = userDoc.data();
  } else {
    userData = {
      spins: {},
      results: {},
      usedCodes: [],
      character: null
    };
    
    SPIN_ATTRIBUTES.forEach(attr => {
      userData.spins[attr.id] = 3;
      userData.results[attr.id] = null;
    });
    
    await setDoc(doc(db, "users", currentUser.uid), userData);
  }
  
  initSpinUI();
  updateSheetButton();
}

function updateSheetButton() {
  if (userData.character) {
    $('btnMySheet').style.display = 'block';
  } else {
    $('btnMySheet').style.display = 'none';
  }
}

$('btnLogin').addEventListener('click', () => {
  signInWithPopup(auth, provider).catch(err => {
    showToast("❌ Erro ao fazer login");
  });
});

$('btnLogout').addEventListener('click', () => {
  signOut(auth);
  showToast("✓ Logout realizado");
});

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user) {
    $('loginScreen').style.display = 'none';
    $('appContainer').classList.add('active');
    $('userAvatar').src = user.photoURL || '';
    $('profileAvatar').src = user.photoURL || '';
    $('profileName').textContent = user.displayName || 'Usuário';
    $('profileEmail').textContent = user.email;
    await loadUserData();
  } else {
    $('loginScreen').style.display = 'flex';
    $('appContainer').classList.remove('active');
  }
});

document.querySelectorAll('.nav-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    $(tab.dataset.page === 'campaign' ? 'pageCampaign' : 'pageProfile').classList.add('active');
  });
});

$('codeForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const code = $('codeInput').value.trim().toLowerCase();
  
  if (!CODES[code]) {
    showToast("❌ Código inválido");
    return;
  }
  
  if (userData.usedCodes.includes(code)) {
    showToast("❌ Código já utilizado");
    return;
  }
  
  SPIN_ATTRIBUTES.forEach(attr => {
    userData.spins[attr.id] += CODES[code].spins;
  });
  
  userData.usedCodes.push(code);
  
  await updateDoc(doc(db, "users", currentUser.uid), {
    spins: userData.spins,
    usedCodes: arrayUnion(code)
  });
  
  $('codeInput').value = '';
  showToast(`✓ ${CODES[code].spins} spins adicionados!`);
  initSpinUI();
});

$('btnCreateChar').addEventListener('click', async () => {
  const name = $('charName').value.trim();
  const age = $('charAge').value;
  const history = $('charHistory').value.trim();
  
  if (!name) {
    showToast("❌ Nome é obrigatório");
    return;
  }
  
  const attributes = {
    corpo: 1,
    mente: 1,
    destreza: 1,
    carisma: 1,
    essencia: 1
  };
  
  for (let i = 0; i < 3; i++) {
    const attrs = Object.keys(attributes);
    const randomAttr = attrs[Math.floor(Math.random() * attrs.length)];
    attributes[randomAttr]++;
  }
  
  const pv = Math.floor(Math.random() * 6) + 1 * attributes.corpo + attributes.corpo;
  const sanidade = 22 + (Math.floor(Math.random() * 8) + 1) * attributes.mente + attributes.mente;
  const mana = (Math.floor(Math.random() * 8) + 1) * attributes.essencia + attributes.essencia;
  
  userData.character = {
    name,
    age: age || null,
    history,
    ...userData.results,
    attributes,
    pv,
    pvMax: pv,
    sanidade,
    sanidadeMax: sanidade,
    mana,
    manaMax: mana,
    nivel: 1,
    createdAt: new Date().toISOString()
  };
  
  await updateDoc(doc(db, "users", currentUser.uid), {
    character: userData.character
  });
  
  showToast("✓ Personagem criado!");
  updateSheetButton();
  $('charName').value = '';
  $('charAge').value = '';
  $('charHistory').value = '';
});

$('btnMySheet').addEventListener('click', () => {
  showCharacterSheet();
});

$('btnBackToCampaign').addEventListener('click', () => {
  $('sheetArea').style.display = 'none';
  $('creationArea').style.display = 'block';
});

function showCharacterSheet() {
  if (!userData.character) return;
  
  const char = userData.character;
  
  $('sheetContent').innerHTML = `
    <div class="sheet-header">
      <h1>${char.name}</h1>
      <p class="subtitle">${char.raca.value} • ${char.classe.value} • Nível ${char.nivel}</p>
    </div>
    
    <div class="sheet-section">
      <h2>Informações</h2>
      <div class="info-grid">
        <div class="info-box">
          <label>Raça</label>
          <div class="value" style="font-size:1rem;">${char.raca.value}</div>
        </div>
        <div class="info-box">
          <label>Antecedente</label>
          <div class="value" style="font-size:1rem;">${char.antecedente.value}</div>
        </div>
        <div class="info-box">
          <label>Classe</label>
          <div class="value" style="font-size:1rem;">${char.classe.value}</div>
        </div>
        <div class="info-box">
          <label>Origem</label>
          <div class="value" style="font-size:0.9rem;">${char.origem.value}</div>
        </div>
        <div class="info-box">
          <label>Domínio</label>
          <div class="value" style="font-size:1rem;">${char.dominio.value}</div>
        </div>
        <div class="info-box">
          <label>Idade</label>
          <div class="value">${char.age || '-'}</div>
        </div>
      </div>
    </div>
    
    <div class="sheet-section">
      <h2>Atributos</h2>
      <div class="info-grid">
        <div class="info-box">
          <label>Corpo</label>
          <div class="value">${char.attributes.corpo}</div>
        </div>
        <div class="info-box">
          <label>Mente</label>
          <div class="value">${char.attributes.mente}</div>
        </div>
        <div class="info-box">
          <label>Destreza</label>
          <div class="value">${char.attributes.destreza}</div>
        </div>
        <div class="info-box">
          <label>Carisma</label>
          <div class="value">${char.attributes.carisma}</div>
        </div>
        <div class="info-box">
          <label>Essência</label>
          <div class="value">${char.attributes.essencia}</div>
        </div>
      </div>
    </div>
    
    <div class="sheet-section">
      <h2>Recursos</h2>
      <div class="info-grid">
        <div class="info-box">
          <label>PV</label>
          <div class="value">${char.pv}/${char.pvMax}</div>
        </div>
        <div class="info-box">
          <label>Mana</label>
          <div class="value">${char.mana}/${char.manaMax}</div>
        </div>
        <div class="info-box">
          <label>Sanidade</label>
          <div class="value">${char.sanidade}/${char.sanidadeMax}</div>
        </div>
        <div class="info-box">
          <label>Nível</label>
          <div class="value">${char.nivel}</div>
        </div>
      </div>
    </div>
    
    ${char.history ? `
    <div class="sheet-section">
      <h2>História</h2>
      <p style="color: var(--text-secondary); line-height: 1.6;">${char.history}</p>
    </div>
    ` : ''}
  `;
  
  $('creationArea').style.display = 'none';
  $('sheetArea').style.display = 'block';
}
