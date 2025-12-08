import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, query, where, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

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

const ADMIN_EMAIL = "mgplayer215@gmail.com";

let currentUser = null;
let categories = [];

const $ = id => document.getElementById(id);
const showToast = msg => {
  $('toast').textContent = msg;
  $('toast').classList.add('show');
  setTimeout(() => $('toast').classList.remove('show'), 3000);
};

$('btnLogin').addEventListener('click', () => {
  signInWithPopup(auth, provider).catch(err => {
    showToast("❌ Erro ao fazer login");
  });
});

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user) {
    $('loginScreen').style.display = 'none';
    $('appContainer').classList.add('active');
    $('userAvatar').src = user.photoURL || '';
    
    if (user.email === ADMIN_EMAIL) {
      $('btnCreateCampaign').style.display = 'block';
      $('navMyCampaigns').style.display = 'block';
    }
    
    await loadCampaigns();
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
    
    if (tab.dataset.page === 'campaigns') {
      $('pageCampaigns').classList.add('active');
    } else if (tab.dataset.page === 'my-campaigns') {
      $('pageMyCampaigns').classList.add('active');
      loadMyCampaigns();
    }
  });
});

$('btnCreateCampaign').addEventListener('click', () => {
  categories = [];
  renderCategories();
  $('modalCreateCampaign').classList.add('show');
});

$('btnCloseModal').addEventListener('click', () => {
  $('modalCreateCampaign').classList.remove('show');
});

$('btnAddCategory').addEventListener('click', () => {
  const categoryId = 'cat_' + Date.now();
  categories.push({
    id: categoryId,
    title: '',
    spins: 3,
    options: []
  });
  renderCategories();
});

function renderCategories() {
  const container = $('categoriesContainer');
  container.innerHTML = '';
  
  categories.forEach((cat, idx) => {
    const totalPercentage = cat.options.reduce((sum, opt) => sum + (parseFloat(opt.percentage) || 0), 0);
    const remaining = 100 - totalPercentage;
    
    const categoryHtml = `
      <div class="category-item">
        <div class="category-header">
          <input type="text" placeholder="Nome da Categoria (ex: Raça)" 
                 value="${cat.title}" 
                 onchange="updateCategoryTitle(${idx}, this.value)"
                 style="flex:1; margin-right:1rem;">
          <input type="number" placeholder="Spins" min="1" max="10" 
                 value="${cat.spins}" 
                 onchange="updateCategorySpins(${idx}, this.value)"
                 style="width:80px; margin-right:1rem;">
          <button class="btn-remove" onclick="removeCategory(${idx})">Remover</button>
        </div>
        
        <div class="options-list" id="options-${idx}">
          ${cat.options.map((opt, optIdx) => `
            <div class="option-item">
              <input type="text" placeholder="Nome" value="${opt.name}" 
                     onchange="updateOptionName(${idx}, ${optIdx}, this.value)">
              <input type="number" placeholder="%" min="0" max="100" step="0.1"
                     value="${opt.percentage}" 
                     onchange="updateOptionPercentage(${idx}, ${optIdx}, this.value)"
                     style="width:80px;">
              <select onchange="updateOptionRarity(${idx}, ${optIdx}, this.value)">
                <option value="common" ${opt.rarity === 'common' ? 'selected' : ''}>Comum</option>
                <option value="uncommon" ${opt.rarity === 'uncommon' ? 'selected' : ''}>Incomum</option>
                <option value="rare" ${opt.rarity === 'rare' ? 'selected' : ''}>Raro</option>
                <option value="epic" ${opt.rarity === 'epic' ? 'selected' : ''}>Épico</option>
                <option value="legendary" ${opt.rarity === 'legendary' ? 'selected' : ''}>Lendário</option>
              </select>
              <button class="btn-remove" onclick="removeOption(${idx}, ${optIdx})" style="padding:0.5rem;">×</button>
            </div>
          `).join('')}
        </div>
        
        <div class="percentage-display">Restante: ${remaining.toFixed(1)}%</div>
        
        <button class="btn-add" onclick="addOption(${idx})" style="margin-top:0.5rem;">+ Adicionar Opção</button>
      </div>
    `;
    
    container.innerHTML += categoryHtml;
  });
}

window.updateCategoryTitle = (idx, value) => {
  categories[idx].title = value;
};

window.updateCategorySpins = (idx, value) => {
  categories[idx].spins = parseInt(value) || 3;
};

window.removeCategory = (idx) => {
  categories.splice(idx, 1);
  renderCategories();
};

window.addOption = (idx) => {
  categories[idx].options.push({
    name: '',
    percentage: 0,
    rarity: 'common'
  });
  renderCategories();
};

window.updateOptionName = (catIdx, optIdx, value) => {
  categories[catIdx].options[optIdx].name = value;
};

window.updateOptionPercentage = (catIdx, optIdx, value) => {
  categories[catIdx].options[optIdx].percentage = parseFloat(value) || 0;
  renderCategories();
};

window.updateOptionRarity = (catIdx, optIdx, value) => {
  categories[catIdx].options[optIdx].rarity = value;
};

window.removeOption = (catIdx, optIdx) => {
  categories[catIdx].options.splice(optIdx, 1);
  renderCategories();
};

$('btnSaveCampaign').addEventListener('click', async () => {
  const title = $('campaignTitle').value.trim();
  const desc = $('campaignDesc').value.trim();
  
  if (!title) {
    showToast("❌ Título é obrigatório");
    return;
  }
  
  if (categories.length === 0) {
    showToast("❌ Adicione pelo menos uma categoria");
    return;
  }
  
  for (const cat of categories) {
    if (!cat.title) {
      showToast("❌ Todas as categorias precisam de título");
      return;
    }
    
    if (cat.options.length === 0) {
      showToast(`❌ Categoria "${cat.title}" precisa de opções`);
      return;
    }
    
    const total = cat.options.reduce((sum, opt) => sum + opt.percentage, 0);
    if (Math.abs(total - 100) > 0.1) {
      showToast(`❌ Categoria "${cat.title}" precisa somar 100%`);
      return;
    }
  }
  
  try {
    const campaignData = {
      title,
      description: desc,
      categories: categories.map(cat => ({
        title: cat.title,
        spins: cat.spins,
        options: cat.options
      })),
      authorId: currentUser.uid,
      authorName: currentUser.displayName || currentUser.email,
      createdAt: new Date().toISOString(),
      characters: 0
    };
    
    await addDoc(collection(db, "campaigns"), campaignData);
    
    showToast("✓ Campanha criada!");
    $('modalCreateCampaign').classList.remove('show');
    $('campaignTitle').value = '';
    $('campaignDesc').value = '';
    categories = [];
    
    await loadCampaigns();
  } catch (err) {
    console.error(err);
    showToast("❌ Erro ao criar campanha");
  }
});

async function loadCampaigns() {
  const snapshot = await getDocs(collection(db, "campaigns"));
  const grid = $('campaignsGrid');
  grid.innerHTML = '';
  
  if (snapshot.empty) {
    grid.innerHTML = '<p style="color:var(--text-secondary); text-align:center; grid-column:1/-1;">Nenhuma campanha disponível</p>';
    return;
  }
  
  snapshot.forEach(doc => {
    const data = doc.data();
    const card = document.createElement('div');
    card.className = 'campaign-card';
    card.innerHTML = `
      <h3 class="campaign-title">${data.title}</h3>
      <p class="campaign-author">Por ${data.authorName}</p>
      <div class="campaign-stats">
        <span>📊 ${data.categories.length} categorias</span>
        <span>👥 ${data.characters || 0} personagens</span>
      </div>
    `;
    card.addEventListener('click', () => openCampaign(doc.id, data));
    grid.appendChild(card);
  });
}

async function loadMyCampaigns() {
  if (!currentUser || currentUser.email !== ADMIN_EMAIL) return;
  
  const q = query(collection(db, "campaigns"), where("authorId", "==", currentUser.uid));
  const snapshot = await getDocs(q);
  const grid = $('myCampaignsGrid');
  grid.innerHTML = '';
  
  if (snapshot.empty) {
    grid.innerHTML = '<p style="color:var(--text-secondary); text-align:center; grid-column:1/-1;">Você ainda não criou campanhas</p>';
    return;
  }
  
  snapshot.forEach(doc => {
    const data = doc.data();
    const card = document.createElement('div');
    card.className = 'campaign-card';
    card.innerHTML = `
      <h3 class="campaign-title">${data.title}</h3>
      <p class="campaign-author">Por você</p>
      <div class="campaign-stats">
        <span>📊 ${data.categories.length} categorias</span>
        <span>👥 ${data.characters || 0} personagens</span>
      </div>
    `;
    card.addEventListener('click', () => openCampaign(doc.id, data));
    grid.appendChild(card);
  });
}

async function openCampaign(campaignId, campaignData) {
  // Criar página dinâmica da campanha com sistema de spins
  const campaignPage = document.createElement('div');
  campaignPage.id = 'pageCampaign-' + campaignId;
  campaignPage.className = 'page active';
  campaignPage.innerHTML = `
    <button class="btn-back" onclick="closeCampaign('${campaignId}')">← Voltar</button>
    
    <div style="background:var(--bg-secondary); border:1px solid var(--border); border-radius:16px; padding:2rem; margin-bottom:2rem;">
      <h1 class="campaign-title" style="font-size:2.5rem; margin-bottom:0.5rem;">${campaignData.title}</h1>
      <p style="color:var(--text-secondary);">${campaignData.description || ''}</p>
    </div>
    
    <div class="spin-section">
      <h2 style="font-size:1.5rem; margin-bottom:1rem;">🎲 Criar Personagem</h2>
      <div class="spin-grid" id="spinGrid-${campaignId}"></div>
    </div>
    
    <div id="charForm-${campaignId}" style="display:none; background:var(--bg-secondary); border:1px solid var(--border); border-radius:16px; padding:1.5rem; margin-top:1rem;">
      <h2 style="margin-bottom:1rem;">Informações do Personagem</h2>
      <div class="form-group">
        <label>Nome *</label>
        <input type="text" id="charName-${campaignId}">
      </div>
      <div class="form-group">
        <label>Idade</label>
        <input type="number" id="charAge-${campaignId}" min="1">
      </div>
      <div class="form-group">
        <label>História</label>
        <textarea id="charHistory-${campaignId}"></textarea>
      </div>
      <button class="btn-primary" onclick="createCharacter('${campaignId}')">✓ Criar Personagem</button>
    </div>
  `;
  
  // Esconder outras páginas
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  $('content').appendChild(campaignPage);
  
  // Inicializar spins
  initCampaignSpins(campaignId, campaignData);
}

window.closeCampaign = (campaignId) => {
  const page = $('pageCampaign-' + campaignId);
  if (page) page.remove();
  
  $('pageCampaigns').classList.add('active');
};

const userSpinData = {};

async function initCampaignSpins(campaignId, campaignData) {
  if (!userSpinData[campaignId]) {
    userSpinData[campaignId] = {
      spins: {},
      results: {}
    };
    
    campaignData.categories.forEach(cat => {
      userSpinData[campaignId].spins[cat.title] = cat.spins;
      userSpinData[campaignId].results[cat.title] = null;
    });
  }
  
  const grid = $('spinGrid-' + campaignId);
  grid.innerHTML = '';
  
  campaignData.categories.forEach(cat => {
    const spins = userSpinData[campaignId].spins[cat.title] || 0;
    const result = userSpinData[campaignId].results[cat.title];
    
    const spinItem = document.createElement('div');
    spinItem.className = 'spin-item';
    spinItem.innerHTML = `
      <div class="spin-header">
        <h3>${cat.title}</h3>
        <div class="spin-count">
          ${Array.from({length: cat.spins}, (_, i) => 
            `<div class="spin-dot ${i < spins ? 'active' : ''}"></div>`
          ).join('')}
        </div>
      </div>
      <div class="spin-result ${result ? result.rarity : ''}" id="result-${campaignId}-${cat.title}">
        ${result ? result.name : '?'}
      </div>
      <button class="btn-spin" onclick="spinCampaignAttr('${campaignId}', '${cat.title}')" ${spins === 0 ? 'disabled' : ''}>
        🎲 GIRAR (${spins})
      </button>
    `;
    
    grid.appendChild(spinItem);
  });
  
  checkCampaignFormDisplay(campaignId, campaignData);
}

window.spinCampaignAttr = async (campaignId, catTitle) => {
  const campaignDoc = await getDoc(doc(db, "campaigns", campaignId));
  const campaignData = campaignDoc.data();
  const category = campaignData.categories.find(c => c.title === catTitle);
  
  if (!category || userSpinData[campaignId].spins[catTitle] <= 0) return;
  
  const resultEl = $(`result-${campaignId}-${catTitle}`);
  const btn = event.target;
  
  btn.disabled = true;
  resultEl.classList.add('spinning');
  resultEl.textContent = '...';
  
  let counter = 0;
  const spinInterval = setInterval(() => {
    const randomOpt = category.options[Math.floor(Math.random() * category.options.length)];
    resultEl.textContent = randomOpt.name;
    resultEl.className = `spin-result spinning ${randomOpt.rarity}`;
    counter++;
    
    if (counter >= 25) {
      clearInterval(spinInterval);
      
      const roll = Math.random() * 100;
      let accumulated = 0;
      let finalResult = category.options[0];
      
      for (const opt of category.options) {
        accumulated += opt.percentage;
        if (roll <= accumulated) {
          finalResult = opt;
          break;
        }
      }
      
      resultEl.textContent = finalResult.name;
      resultEl.className = `spin-result ${finalResult.rarity}`;
      
      userSpinData[campaignId].spins[catTitle]--;
      userSpinData[campaignId].results[catTitle] = finalResult;
      
      setTimeout(() => initCampaignSpins(campaignId, campaignData), 500);
    }
  }, 80);
};

function checkCampaignFormDisplay(campaignId, campaignData) {
  const allSpun = campaignData.categories.every(cat => 
    userSpinData[campaignId].results[cat.title]
  );
  
  const form = $('charForm-' + campaignId);
  if (form) {
    form.style.display = allSpun ? 'block' : 'none';
  }
}

window.createCharacter = async (campaignId) => {
  const name = $('charName-' + campaignId).value.trim();
  const age = $('charAge-' + campaignId).value;
  const history = $('charHistory-' + campaignId).value.trim();
  
  if (!name) {
    showToast("❌ Nome é obrigatório");
    return;
  }
  
  const characterData = {
    name,
    age: age || null,
    history,
    results: userSpinData[campaignId].results,
    campaignId,
    userId: currentUser.uid,
    userName: currentUser.displayName || currentUser.email,
    createdAt: new Date().toISOString()
  };
  
  try {
    await addDoc(collection(db, "characters"), characterData);
    
    // Incrementar contador
    const campaignRef = doc(db, "campaigns", campaignId);
    const campaignSnap = await getDoc(campaignRef);
    await updateDoc(campaignRef, {
      characters: (campaignSnap.data().characters || 0) + 1
    });
    
    showToast("✓ Personagem criado!");
    
    // Limpar form
    $('charName-' + campaignId).value = '';
    $('charAge-' + campaignId).value = '';
    $('charHistory-' + campaignId).value = '';
    
    // Resetar spins
    delete userSpinData[campaignId];
  } catch (err) {
    console.error(err);
    showToast("❌ Erro ao criar personagem");
  }
};
