// ===== TẠO ÂM THANH BÍP =====
function playBeep() {
    try {
        // Tạo audio context
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Tạo oscillator
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        // Kết nối
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        // Cài đặt âm thanh
        oscillator.frequency.value = 800; // Tần số 800Hz
        oscillator.type = 'sine'; // Sóng sine
        
        // Volume
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        
        // Phát
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.1);
    } catch(e) {
        // Bỏ qua lỗi nếu không hỗ trợ audio
        console.log('Audio not supported');
    }
}

// ===== SỬA HÀM TOGGLE FUNC =====
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
    
    // ===== PHÁT TIẾNG BÍP KHI BẬT/TẮT =====
    playBeep();
    
    showToast((isOn ? '✅ BẬT' : '⏹ TẮT') + ' ' + funcMap[key].label);
}
