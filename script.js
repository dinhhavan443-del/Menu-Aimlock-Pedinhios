// ============================================================
// AIMLOCK PRO - SCRIPT (LOGIC INJECT + MỞ GAME)
// ============================================================

// ===== STATE =====
const state = {
    currentGame: 'freefire',
    isInjected: false,
    funcs: {
        aimlock: true,
        keoTam: true,
        fixLo: true,
        giamRung: false,
        fixGiat: false,
        dpi: false
    }
};

const funcMap = {
    aimlock: { label: 'AimLock', hint: 'Auto' },
    keoTam: { label: 'Kéo Tầm Nhẹ', hint: '1.5s' },
    fixLo: { label: 'Fix Lỗ', hint: 'Stable' },
    giamRung: { label: 'Giảm Rung', hint: 'On' },
    fixGiat: { label: 'Fix Giật', hint: 'On' },
    dpi: { label: 'DPI 2000', hint: '2000' }
};

const GAME_SCHEMES = {
    freefire: 'com.dts.freefireth://',
    freefiremax: 'com.dts.freefiremax://'
};

const GAME_NAMES = {
    freefire: 'FreeFire',
    freefiremax: 'FreeFire Max'
};

// ===== DOM REFS =====
const $ = id => document.getElementById(id);
const btnMain = $('btnMain');
const btnFF = $('btnFF');
const btnFFMax = $('btnFFMax');
const btnOpenGame = $('btnOpenGame');
const btnViewLog = $('btnViewLog');
const toast = $('toast');
const injStatus = $('injStatus');
const moduleCount = $('moduleCount');
const daysLeft = $('daysLeft');

// ===== TOAST =====
function showToast(msg, type = 'success') {
    toast.textContent = msg;
    toast.style.background = type === 'success' ? 'rgba(61,212,181,0.06)' : 'rgba(212,184,58,0.06)';
    toast.style.borderColor = type === 'success' ? 'rgba(61,212,181,0.08)' : 'rgba(212,184,58,0.08)';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        const game = state.currentGame;
        toast.textContent = '✅ Sẵn sàng · ' + GAME_NAMES[game];
        toast.style.background = 'rgba(61,212,181,0.04)';
        toast.style.borderColor = 'rgba(61,212,181,0.06)';
    }, 3000);
}

// ===== UPDATE UI =====
function updateUI() {
    const count = Object.values(state.funcs).filter(v => v).length;
    moduleCount.textContent = count + ' active';
}

// ===== TOGGLE FUNC =====
function toggleFunc(key) {
    state.funcs[key] = !state.funcs[key];
    const item = document.querySelector(`.func-item[data-key="${key}"]`);
    if (!item) return;
    const isOn = state.funcs[key];
    item.classList.toggle('active', isOn);
    const toggle = item.querySelector('.toggle');
    if (toggle) toggle.classList.toggle('active', isOn);
    const hint = item.querySelector('.hint');
    if (hint) hint.textContent = isOn ? funcMap[key].hint : 'Off';
    updateUI();
    showToast((isOn ? '✅ BẬT' : '⏹ TẮT') + ' ' + funcMap[key].label);
}

// ===== SELECT GAME =====
function selectGame(game) {
    state.currentGame = game;
    btnFF.classList.toggle('active', game === 'freefire');
    btnFFMax.classList.toggle('active', game === 'freefiremax');
    showToast('✅ ' + GAME_NAMES[game]);
}

// ===== OPEN GAME =====
function openGame() {
    const scheme = GAME_SCHEMES[state.currentGame];
    if (!scheme) {
        showToast('❌ Không tìm thấy game!', 'error');
        return;
    }
    try {
        window.location.href = scheme;
        showToast('🚀 Đang mở ' + GAME_NAMES[state.currentGame] + '...');
        return true;
    } catch (e) {
        showToast('❌ Không thể mở game!', 'error');
        return false;
    }
}

// ===== INJECT =====
function handleInject() {
    const active = Object.keys(state.funcs).filter(k => state.funcs[k]);
    
    if (active.length === 0) {
        showToast('⚠️ Chọn ít nhất 1 chức năng!', 'error');
        return;
    }
    
    if (state.isInjected) {
        // Remove inject
        state.isInjected = false;
        btnMain.textContent = '▶ ÁP DỤNG & INJECT';
        btnMain.className = 'btn-main';
        injStatus.textContent = '○ Chưa kích hoạt';
        injStatus.className = 'val warn';
        showToast('🔄 Đã gỡ bỏ inject');
        return;
    }
    
    // Inject
    state.isInjected = true;
    btnMain.textContent = '⏹ GỠ BỎ & KHÔI PHỤC';
    btnMain.className = 'btn-main injected';
    injStatus.textContent = '● Đã inject';
    injStatus.className = 'val';
    
    const gameName = GAME_NAMES[state.currentGame];
    showToast('✅ Đã inject ' + active.length + ' chức năng vào ' + gameName);
    
    // Log inject
    const log = {
        time: new Date().toISOString(),
        game: state.currentGame,
        funcs: active
    };
    saveLog(log);
    
    // Tự động mở game sau 1 giây
    setTimeout(() => {
        openGame();
    }, 1000);
}

// ===== LOG =====
function saveLog(log) {
    try {
        let logs = JSON.parse(localStorage.getItem('aimlock_logs') || '[]');
        logs.unshift(log);
        if (logs.length > 100) logs = logs.slice(0, 100);
        localStorage.setItem('aimlock_logs', JSON.stringify(logs));
    } catch (e) {}
}

function viewLog() {
    try {
        const logs = JSON.parse(localStorage.getItem('aimlock_logs') || '[]');
        if (logs.length === 0) {
            alert('📋 Chưa có log nào!');
            return;
        }
        let msg = '📋 LOG INJECT\n' + '='.repeat(30) + '\n';
        logs.forEach((log, i) => {
            const time = new Date(log.time).toLocaleString('vi-VN');
            const game = GAME_NAMES[log.game] || log.game;
            msg += `\n${i+1}. ${time}\n   🎮 ${game}\n   ⚡ ${log.funcs.join(' + ')}\n`;
        });
        alert(msg);
    } catch (e) {
        alert('📋 Chưa có log nào!');
    }
}

// ===== KEY EXPIRE =====
let days = 365;
setInterval(() => {
    days--;
    if (days < 0) days = 0;
    daysLeft.textContent = days;
}, 86400000);

// ===== EVENTS =====
// Func items
document.querySelectorAll('.func-item').forEach(item => {
    item.addEventListener('click', function(e) {
        const key = this.dataset.key;
        // Không toggle nếu click vào toggle
        if (e.target.closest('.toggle')) return;
        toggleFunc(key);
    });
});

// Toggle switches
document.querySelectorAll('.toggle').forEach(toggle => {
    toggle.addEventListener('click', function(e) {
        e.stopPropagation();
        const key = this.dataset.key;
        toggleFunc(key);
    });
});

// Game buttons
btnFF.addEventListener('click', () => selectGame('freefire'));
btnFFMax.addEventListener('click', () => selectGame('freefiremax'));

// Main button
btnMain.addEventListener('click', handleInject);

// Open game button
btnOpenGame.addEventListener('click', openGame);

// View log button
btnViewLog.addEventListener('click', viewLog);

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleInject();
    if (e.key === 'o' || e.key === 'O') openGame();
});

// ===== INIT =====
updateUI();
showToast('✅ Sẵn sàng · FreeFire');
console.log('🎯 AIMLOCK PRO - GOET');
console.log('📱 Zalo: 0862937139');
console.log('🔥 Chọn game, bật chức năng, inject!');
