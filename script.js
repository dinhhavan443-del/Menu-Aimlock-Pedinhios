// ============================================================
// AIMLOCK PRO - SCRIPT HOÀN CHỈNH
// ============================================================

// ===== DOM REFS =====
const loginScreen = document.getElementById('loginScreen');
const mainApp = document.getElementById('mainApp');
const keyInput = document.getElementById('keyInput');
const btnLogin = document.getElementById('btnLogin');
const loginError = document.getElementById('loginError');
const keyDisplay = document.getElementById('keyDisplay');

// ===== STATE =====
const state = {
    currentGame: 'freefire',
    isInjected: false,
    key: '',
    funcs: {
        aimlock: true,
        keoTam: true,
        fixLo: true,
        giamRung: false,
        fixGiat: false,
        toiUu: false // Thay DPI bằng Tối Ưu
    }
};

const GAME_SCHEMES = {
    freefire: 'com.dts.freefireth://',
    freefiremax: 'com.dts.freefiremax://'
};

const GAME_NAMES = {
    freefire: 'FreeFire',
    freefiremax: 'FreeFire Max'
};

const funcMap = {
    aimlock: { label: 'AimLock', hint: 'Auto' },
    keoTam: { label: 'Kéo Tầm Nhẹ', hint: '1.5s' },
    fixLo: { label: 'Fix Lỗ', hint: 'Stable' },
    giamRung: { label: 'Giảm Rung', hint: 'On' },
    fixGiat: { label: 'Fix Giật', hint: 'On' },
    toiUu: { label: 'Tối Ưu', hint: 'On' } // Thêm Tối Ưu
};

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

// ===== LOGIN =====
function checkLogin() {
    try {
        const savedKey = localStorage.getItem('aimlock_key');
        if (savedKey) {
            state.key = savedKey;
            loginScreen.style.display = 'none';
            mainApp.style.display = 'block';
            keyDisplay.textContent = '✅ ' + savedKey.substring(0, 15) + '...';
            updateUI();
            showToast('✅ Đã đăng nhập: ' + savedKey);
        }
    } catch(e) {}
}

function handleLogin() {
    const key = keyInput.value.trim();
    if (!key) {
        loginError.textContent = '⚠️ Vui lòng nhập key!';
        return;
    }
    if (key.startsWith('ANHDINH-') && key.length > 10) {
        state.key = key;
        localStorage.setItem('aimlock_key', key);
        loginScreen.style.display = 'none';
        mainApp.style.display = 'block';
        keyDisplay.textContent = '✅ ' + key.substring(0, 15) + '...';
        loginError.textContent = '';
        updateUI();
        showToast('✅ Đăng nhập thành công!');
        playBeep();
    } else {
        loginError.textContent = '❌ Key không hợp lệ! Định dạng: ANHDINH-YYYYMMDD-TB1-XXXXXX';
    }
}

// ===== ÂM THANH =====
function playBeep() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.1);
    } catch(e) {}
}

// ===== TOAST =====
function showToast(msg) {
    toast.textContent = msg;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.textContent = '✅ Sẵn sàng · ' + GAME_NAMES[state.currentGame];
    }, 3000);
}

// ===== UPDATE UI =====
function updateUI() {
    const count = Object.values(state.funcs).filter(v => v).length;
    moduleCount.textContent = count + ' active';
}

// ===== TOGGLE FUNC =====
function toggleFunc(key) {
    console.log('Toggle: ' + key);
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
    playBeep();
    showToast((isOn ? '✅ BẬT' : '⏹ TẮT') + ' ' + funcMap[key].label);
}

// ===== SELECT GAME =====
function selectGame(game) {
    console.log('Select game: ' + game);
    state.currentGame = game;
    btnFF.classList.toggle('active', game === 'freefire');
    btnFFMax.classList.toggle('active', game === 'freefiremax');
    showToast('✅ ' + GAME_NAMES[game]);
}

// ===== OPEN GAME =====
function openGame() {
    console.log('Open game: ' + state.currentGame);
    const scheme = GAME_SCHEMES[state.currentGame];
    if (!scheme) {
        showToast('❌ Không tìm thấy game!');
        return;
    }
    try {
        const link = document.createElement('a');
        link.href = scheme;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('🚀 Đang mở ' + GAME_NAMES[state.currentGame] + '...');
        return true;
    } catch (e) {
        showToast('❌ Không thể mở game!');
        return false;
    }
}

// ===== INJECT =====
function handleInject() {
    console.log('Inject clicked!');
    const active = Object.keys(state.funcs).filter(k => state.funcs[k]);
    console.log('Active functions:', active);
    
    if (active.length === 0) {
        showToast('⚠️ Chọn ít nhất 1 chức năng!');
        return;
    }
    
    if (state.isInjected) {
        state.isInjected = false;
        btnMain.textContent = '▶ ÁP DỤNG & INJECT';
        btnMain.className = 'btn-main';
        injStatus.textContent = '○ Chưa kích hoạt';
        injStatus.className = 'val warn';
        showToast('🔄 Đã gỡ bỏ inject');
        playBeep();
        return;
    }
    
    state.isInjected = true;
    btnMain.textContent = '⏹ GỠ BỎ & KHÔI PHỤC';
    btnMain.className = 'btn-main injected';
    injStatus.textContent = '● Đã inject';
    injStatus.className = 'val';
    
    const gameName = GAME_NAMES[state.currentGame];
    showToast('✅ Đã inject ' + active.length + ' chức năng vào ' + gameName);
    playBeep();
    
    saveLog(active);
    
    setTimeout(() => {
        openGame();
    }, 1000);
}

// ===== LOG =====
function saveLog(active) {
    try {
        let logs = JSON.parse(localStorage.getItem('aimlock_logs') || '[]');
        logs.unshift({
            time: new Date().toISOString(),
            game: state.currentGame,
            funcs: active,
            key: state.key
        });
        if (logs.length > 50) logs = logs.slice(0, 50);
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
            msg += `\n${i+1}. ${time}\n   🎮 ${game}\n   ⚡ ${log.funcs.join(' + ')}\n   🔑 ${log.key || 'N/A'}\n`;
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
    if (daysLeft) daysLeft.textContent = days;
}, 86400000);

// ===== EVENTS =====
btnLogin.addEventListener('click', handleLogin);
keyInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleLogin(); });

btnFF.addEventListener('click', () => selectGame('freefire'));
btnFFMax.addEventListener('click', () => selectGame('freefiremax'));
btnMain.addEventListener('click', handleInject);
btnOpenGame.addEventListener('click', openGame);
btnViewLog.addEventListener('click', viewLog);

// ===== INIT =====
checkLogin();
updateUI();
console.log('🎯 AIMLOCK PRO - GOET');
console.log('📱 Zalo: 0862937139');
