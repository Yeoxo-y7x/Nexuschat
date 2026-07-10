// =====================================================
// NEXUSCHAT - Full JavaScript (Cloudflare Ready)
// =====================================================
// Ce fichier contient toute la logique de l'application.
// Assure-toi de l'inclure dans un fichier script.js et de le lier dans ton index.html

// --- ÉTAT GLOBAL ---
const state = {
    currentServer: 'Général',
    adminMode: false,
    userName: 'Toi',
    userBadges: ['⭐'],
    friends: ['Y7X', 'Zack', 'Luna', 'Kira'],
    userBadgeDB: {
        'Toi': ['⭐'],
        'Y7X': ['👑', '🔥'],
        'Zack': ['💎'],
        'Luna': ['🌈'],
        'Kira': ['⚡']
    },
    servers: [
        { name: 'Général', badgeCount: 12 },
        { name: 'Tech', badgeCount: 8 },
        { name: 'Gaming', badgeCount: 5 }
    ],
    messages: [
        { user: 'Y7X', content: 'Bienvenue sur NexusChat ! 🚀', time: '12:00', isOwn: false },
        { user: 'Toi', content: 'Merci ! 🔥', time: '12:01', isOwn: true }
    ]
};

// =====================================================
// 1. FONCTIONS DE RENDU
// =====================================================

// Rendu de la liste des serveurs
function renderServers() {
    const serverList = document.getElementById('serverList');
    if (!serverList) return;
    serverList.innerHTML = state.servers.map(server => `
        <div class="server-item" onclick="selectServer('${server.name}')">
            # ${server.name} <span class="badge">${server.badgeCount}</span>
        </div>
    `).join('');
}

// Rendu des messages
function renderMessages() {
    const chatArea = document.getElementById('chatArea');
    if (!chatArea) return;
    chatArea.innerHTML = state.messages.map(msg => `
        <div class="message ${msg.isOwn ? 'own' : ''}">
            <span class="msg-user">${msg.user}</span> ${msg.content} 
            <span class="msg-time">${msg.time}</span>
        </div>
    `).join('');
    chatArea.scrollTop = chatArea.scrollHeight;
}

// Rendu de la liste d'amis
function renderFriends() {
    const friendList = document.getElementById('friendList');
    if (!friendList) return;
    friendList.innerHTML = state.friends.map(f => `
        <div class="friend-item">
            <span>${f}</span> <span style="color:#43b581;">🟢</span>
        </div>
    `).join('');
}

// Rendu des badges de l'utilisateur courant
function renderUserBadges() {
    const badgeContainer = document.getElementById('userBadges');
    if (badgeContainer) {
        badgeContainer.textContent = state.userBadges.join(' ');
    }
}

// Rendu de tous les badges (panel admin)
function renderAllBadges() {
    const container = document.getElementById('allUserBadges');
    if (!container) return;
    container.innerHTML = Object.entries(state.userBadgeDB).map(([user, badges]) => `
        <div class="user-item">
            <span>${user} : ${badges.length > 0 ? badges.join(' ') : 'Aucun badge'}</span>
        </div>
    `).join('');
}

// Mise à jour du select utilisateur dans le panel admin
function updateUserSelect() {
    const select = document.getElementById('userSelect');
    if (!select) return;
    select.innerHTML = Object.keys(state.userBadgeDB).map(user => `
        <option value="${user}">${user}</option>
    `).join('');
}

// =====================================================
// 2. FONCTIONS D'ACTION
// =====================================================

// Envoyer un message
function sendMessage() {
    const input = document.getElementById('msgInput');
    if (!input) return;
    const content = input.value.trim();
    if (!content) return;

    state.messages.push({
        user: state.userName,
        content: content,
        time: new Date().toLocaleTimeString(),
        isOwn: true
    });

    input.value = '';
    renderMessages();
}

// Ajouter un emoji dans le champ de saisie
function addEmoji(emoji) {
    const input = document.getElementById('msgInput');
    if (!input) return;
    input.value += emoji;
    input.focus();
}

// Changer de serveur
function selectServer(name) {
    state.currentServer = name;
    document.getElementById('currentServer').textContent = '#' + name;
    
    // Ajouter un message système
    state.messages.push({
        user: 'Système',
        content: `Vous êtes maintenant dans #${name} 🎉`,
        time: new Date().toLocaleTimeString(),
        isOwn: false
    });
    renderMessages();
}

// Créer un nouveau serveur
function createServer() {
    const input = document.getElementById('newServerName');
    if (!input) return;
    const name = input.value.trim();
    if (!name) return;

    state.servers.push({ name, badgeCount: 0 });
    renderServers();
    closeModal('serverModal');
    input.value = '';
}

// =====================================================
// 3. FONCTIONS ADMIN
// =====================================================

// Activer le mode admin
function activateAdmin() {
    const codeInput = document.getElementById('adminCode');
    if (!codeInput) return;
    const code = codeInput.value;

    if (code === 'Y7X') {
        state.adminMode = true;
        document.getElementById('adminStatus').textContent = '✅ Admin activé';
        document.getElementById('adminStatus').style.color = '#43b581';
        document.querySelector('.shop-panel').style.border = '2px solid #b48aff';
        
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) {
            adminPanel.classList.add('active');
        }
        
        updateUserSelect();
        renderAllBadges();
        alert('🔐 Mode Admin activé ! Tu peux donner/retirer des badges.');
    } else {
        alert('❌ Code invalide.');
    }
}

// Donner un badge
function giveBadge() {
    if (!state.adminMode) {
        alert('⛔ Pas admin.');
        return;
    }

    const userSelect = document.getElementById('userSelect');
    const badgeSelect = document.getElementById('badgeSelect');
    if (!userSelect || !badgeSelect) return;

    const user = userSelect.value;
    const badge = badgeSelect.value;

    if (!state.userBadgeDB[user]) {
        state.userBadgeDB[user] = [];
    }

    if (!state.userBadgeDB[user].includes(badge)) {
        state.userBadgeDB[user].push(badge);
        
        if (user === state.userName) {
            state.userBadges = state.userBadgeDB[user];
            renderUserBadges();
        }
        
        renderAllBadges();
        alert(`✅ Badge ${badge} donné à ${user}`);
    } else {
        alert(`❌ ${user} a déjà ce badge.`);
    }
}

// Retirer un badge
function removeBadge() {
    if (!state.adminMode) {
        alert('⛔ Pas admin.');
        return;
    }

    const userSelect = document.getElementById('userSelect');
    const badgeSelect = document.getElementById('badgeSelect');
    if (!userSelect || !badgeSelect) return;

    const user = userSelect.value;
    const badge = badgeSelect.value;

    if (state.userBadgeDB[user] && state.userBadgeDB[user].includes(badge)) {
        state.userBadgeDB[user] = state.userBadgeDB[user].filter(b => b !== badge);
        
        if (user === state.userName) {
            state.userBadges = state.userBadgeDB[user];
            renderUserBadges();
        }
        
        renderAllBadges();
        alert(`✅ Badge ${badge} retiré de ${user}`);
    } else {
        alert(`❌ ${user} n'a pas ce badge.`);
    }
}

// =====================================================
// 4. FONCTIONS PROFIL
// =====================================================

// Mettre à jour le profil
function updateProfile() {
    const input = document.getElementById('profileName');
    if (!input) return;
    const newName = input.value.trim();
    if (!newName) return;

    // Mettre à jour la DB des badges
    const oldName = state.userName;
    if (state.userBadgeDB[oldName]) {
        state.userBadgeDB[newName] = state.userBadgeDB[oldName];
        delete state.userBadgeDB[oldName];
    }

    // Mettre à jour le nom dans les messages
    state.messages.forEach(msg => {
        if (msg.user === oldName) {
            msg.user = newName;
        }
    });

    state.userName = newName;
    document.getElementById('userName').textContent = newName;
    updateUserSelect();
    renderAllBadges();
    renderMessages();
    closeModal('profileModal');
    input.value = '';
}

// =====================================================
// 5. FONCTIONS MODAL
// =====================================================

function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'flex';
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
}

// =====================================================
// 6. INITIALISATION
// =====================================================

function init() {
    // Rendu initial
    renderServers();
    renderMessages();
    renderFriends();
    renderUserBadges();

    // Mettre à jour le nom du serveur courant
    const serverDisplay = document.getElementById('currentServer');
    if (serverDisplay) {
        serverDisplay.textContent = '#' + state.currentServer;
    }

    // Événement Entrée pour envoyer un message
    const msgInput = document.getElementById('msgInput');
    if (msgInput) {
        msgInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendMessage();
        });
    }

    // Fermer les modals en cliquant à côté
    window.onclick = function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    };

    // Initialiser le select admin
    updateUserSelect();
    renderAllBadges();

    console.log('🚀 NexusChat initialisé !');
}

// Lancer l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', init);
