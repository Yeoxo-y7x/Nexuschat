// ===== STATE =====
let state = {
    currentUser: 'Toi',
    currentChat: { type: 'server', name: 'Général' },
    users: {
        'Toi': { badges: ['⭐'], avatar: '', banner: '', friends: ['Y7X', 'Zack', 'Luna'] },
        'Y7X': { badges: ['👑', '🔥'], avatar: '', banner: '', friends: ['Toi'] },
        'Zack': { badges: ['💎'], avatar: '', banner: '', friends: ['Toi'] },
        'Luna': { badges: ['🌈'], avatar: '', banner: '', friends: ['Toi'] }
    },
    servers: {
        'Général': { members: ['Toi', 'Y7X', 'Zack', 'Luna'], messages: [] },
        'Tech': { members: ['Toi', 'Y7X'], messages: [] },
        'Gaming': { members: ['Toi', 'Zack', 'Luna'], messages: [] }
    },
    dms: {} // { 'Toi-Y7X': [{ user, content, time }] }
};

// ===== INIT =====
function init() {
    loadState();
    renderServers();
    renderFriends();
    renderMessages();
    updateUserUI();
    updateUserSelect();
    renderAllBadges();

    document.getElementById('msgInput').addEventListener('keypress', e => {
        if (e.key === 'Enter') sendMessage();
    });
}

// ===== LOCAL STORAGE =====
function saveState() {
    try { localStorage.setItem('nexuschat_state', JSON.stringify(state)); } catch(e) {}
}
function loadState() {
    try {
        const saved = localStorage.getItem('nexuschat_state');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Merge pour garder les nouvelles clés
            state = { ...state, ...parsed };
        }
    } catch(e) {}
}

// ===== RENDER =====
function renderServers() {
    const list = document.getElementById('serverList');
    list.innerHTML = Object.keys(state.servers).map(name => `
        <div class="server-item" onclick="switchChat('server','${name}')">
            # ${name} <span class="badge-count">${state.servers[name].members.length}</span>
        </div>
    `).join('');
}

function renderFriends() {
    const list = document.getElementById('friendList');
    const friends = state.users[state.currentUser]?.friends || [];
    list.innerHTML = friends.map(f => `
        <div class="friend-item" onclick="openDMWith('${f}')">
            ${f} <span style="color:#43b581;">🟢</span>
        </div>
    `).join('');
}

function renderMessages() {
    const chat = document.getElementById('chatArea');
    let msgs = [];
    const chatKey = state.currentChat.type + '_' + state.currentChat.name;
    
    if (state.currentChat.type === 'server') {
        msgs = state.servers[state.currentChat.name]?.messages || [];
    } else if (state.currentChat.type === 'dm') {
        const dmKey = [state.currentUser, state.currentChat.name].sort().join('-');
        msgs = state.dms[dmKey] || [];
    }

    chat.innerHTML = msgs.map(m => {
        const isOwn = m.user === state.currentUser;
        const userBadges = state.users[m.user]?.badges || [];
        const badgeStr = userBadges.length ? userBadges.join('') : '';
        return `<div class="message ${isOwn ? 'own' : ''}">
            <span class="msg-user">${m.user}</span>
            ${badgeStr ? `<span class="msg-badge">${badgeStr}</span>` : ''}
            ${m.content} <span class="msg-time">${m.time}</span>
        </div>`;
    }).join('');
    chat.scrollTop = chat.scrollHeight;
}

function updateUserUI() {
    document.getElementById('userNameDisplay').textContent = state.currentUser;
    document.getElementById('userBadges').textContent = state.users[state.currentUser]?.badges?.join(' ') || '⭐';
    const avatar = document.getElementById('profileAvatar');
    if (state.users[state.currentUser]?.avatar) {
        avatar.src = state.users[state.currentUser].avatar;
    }
    const chatName = document.getElementById('currentChatName');
    chatName.textContent = state.currentChat.type === 'server' ? '#' + state.currentChat.name : '@' + state.currentChat.name;
    document.getElementById('currentChatType').textContent = state.currentChat.type === 'server' ? '(public)' : '(privé)';
}

function updateUserSelect() {
    const select = document.getElementById('userSelect');
    select.innerHTML = Object.keys(state.users).map(u => `<option value="${u}">${u}</option>`).join('');
}

function renderAllBadges() {
    const container = document.getElementById('allUserBadges');
    container.innerHTML = Object.entries(state.users).map(([u, data]) => `
        <div class="user-item"><span>${u}</span> <span>${data.badges?.join(' ') || 'Aucun'}</span></div>
    `).join('');
}

// ===== CHAT SWITCH =====
function switchChat(type, name) {
    state.currentChat = { type, name };
    document.getElementById('currentChatName').textContent = type === 'server' ? '#' + name : '@' + name;
    document.getElementById('currentChatType').textContent = type === 'server' ? '(public)' : '(privé)';
    renderMessages();
    saveState();
}

function openDMWith(user) {
    if (user === state.currentUser) { alert("Tu ne peux pas te DM toi-même !"); return; }
    switchChat('dm', user);
    closeModal('dmModal');
}

function openDM() {
    const select = document.getElementById('dmUserSelect');
    const user = select.value;
    if (!user || user === state.currentUser) { alert("Choisis un autre utilisateur."); return; }
    openDMWith(user);
}

// ===== SEND MESSAGE =====
function sendMessage() {
    const input = document.getElementById('msgInput');
    const content = input.value.trim();
    if (!content) return;

    const msg = {
        user: state.currentUser,
        content: content,
        time: new Date().toLocaleTimeString()
    };

    if (state.currentChat.type === 'server') {
        if (!state.servers[state.currentChat.name]) state.servers[state.currentChat.name] = { members: [], messages: [] };
        state.servers[state.currentChat.name].messages.push(msg);
    } else if (state.currentChat.type === 'dm') {
        const dmKey = [state.currentUser, state.currentChat.name].sort().join('-');
        if (!state.dms[dmKey]) state.dms[dmKey] = [];
        state.dms[dmKey].push(msg);
    }

    input.value = '';
    renderMessages();
    saveState();
}

function addEmoji(emoji) {
    const input = document.getElementById('msgInput');
    input.value += emoji;
    input.focus();
}

// ===== CREATE SERVER =====
function createServer() {
    const input = document.getElementById('newServerName');
    const name = input.value.trim();
    if (!name) return;
    if (state.servers[name]) { alert('Ce serveur existe déjà.'); return; }
    state.servers[name] = { members: [state.currentUser], messages: [] };
    renderServers();
    closeModal('serverModal');
    input.value = '';
    saveState();
}

// ===== ADMIN =====
function activateAdmin() {
    const code = document.getElementById('adminCode');
    if (code.value !== 'Y7X') { alert('Code invalide.'); return; }
    document.getElementById('adminStatus').textContent = '✅ Admin';
    document.getElementById('adminStatus').style.color = '#43b581';
    document.getElementById('adminControls').style.display = 'block';
    document.getElementById('adminPanel').classList.add('active');
    updateUserSelect();
    renderAllBadges();
}

function giveBadge() {
    const user = document.getElementById('userSelect').value;
    const badge = document.getElementById('badgeSelect').value;
    if (!state.users[user]) { alert('Utilisateur inconnu.'); return; }
    if (!state.users[user].badges) state.users[user].badges = [];
    if (!state.users[user].badges.includes(badge)) {
        state.users[user].badges.push(badge);
        renderAllBadges();
        updateUserUI();
        saveState();
        alert(`✅ Badge ${badge} donné à ${user}`);
    } else {
        alert(`❌ ${user} a déjà ce badge.`);
    }
}

function removeBadge() {
    const user = document.getElementById('userSelect').value;
    const badge = document.getElementById('badgeSelect').value;
    if (!state.users[user]?.badges) return;
    state.users[user].badges = state.users[user].badges.filter(b => b !== badge);
    renderAllBadges();
    updateUserUI();
    saveState();
    alert(`✅ Badge ${badge} retiré de ${user}`);
}

// ===== PROFILE =====
function updateProfile() {
    const newName = document.getElementById('profileName').value.trim();
    const avatar = document.getElementById('profileAvatarUrl').value.trim();
    const banner = document.getElementById('profileBannerUrl').value.trim();

    if (newName && newName !== state.currentUser) {
        // Renommer l'utilisateur
        if (state.users[newName]) { alert('Ce pseudo est déjà pris.'); return; }
        state.users[newName] = { ...state.users[state.currentUser] };
        delete state.users[state.currentUser];
        state.currentUser = newName;
    }
    if (avatar) state.users[state.currentUser].avatar = avatar;
    if (banner) state.users[state.currentUser].banner = banner;

    updateUserUI();
    renderMessages();
    renderFriends();
    renderServers();
    saveState();
    closeModal('profileModal');
}

// ===== MODALS =====
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

window.onclick = function(e) {
    if (e.target.classList.contains('modal')) e.target.style.display = 'none';
};

// ===== DM SELECT =====
function updateDMSelect() {
    const select = document.getElementById('dmUserSelect');
    select.innerHTML = Object.keys(state.users)
        .filter(u => u !== state.currentUser)
        .map(u => `<option value="${u}">${u}</option>`).join('');
}

// Override openModal pour mettre à jour le select DM
const originalOpenModal = openModal;
openModal = function(id) {
    if (id === 'dmModal') updateDMSelect();
    originalOpenModal(id);
};

// ===== START =====
document.addEventListener('DOMContentLoaded', init);
