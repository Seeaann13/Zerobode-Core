(async function() {
    if (document.getElementById('zb-main-ui')) return;
    const config = window.ZB_USER_CONFIG || { mode: 'cloud', apiKey: '' };

    // 1. 介面注入 (懸浮球 + 面板)
    const ui = document.createElement('div');
    ui.id = 'zb-main-ui';
    ui.style.cssText = "position:fixed; bottom:20px; right:20px; z-index:2147483647; font-family:sans-serif;";
    ui.innerHTML = `
        <div id="zb-ball" style="width:50px; height:50px; background:#0284c7; border-radius:25px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:24px; box-shadow:0 4px 15px rgba(0,0,0,0.4); border:2px solid #38bdf8;">💠</div>
        <div id="zb-panel" style="display:none; position:absolute; bottom:60px; right:0; width:320px; background:#0f172a; border:1px solid #1e40af; border-radius:12px; padding:15px; color:#fff; box-shadow:0 10px 40px rgba(0,0,0,0.6);">
            <div style="font-weight:bold; color:#38bdf8; margin-bottom:10px; border-bottom:1px solid #1e40af; padding-bottom:5px;">Zerobode 💠 ${config.mode.toUpperCase()}</div>
            <div id="zb-status" style="height:100px; overflow-y:auto; font-size:11px; background:#000; color:#4ade80; padding:8px; border-radius:6px; margin-bottom:10px; font-family:monospace;">🚀 準備就緒。</div>
            <input id="zb-task" style="width:100%; padding:8px; background:#1e293b; border:1px solid #38bdf8; color:#fff; border-radius:6px; margin-bottom:10px; box-sizing:border-box;" placeholder="輸入任務指令...">
            <button id="zb-run" style="width:100%; padding:10px; background:#0284c7; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">⚡ 啟動代理人</button>
        </div>
    `;
    document.body.appendChild(ui);

    const log = (m) => { const l=document.getElementById('zb-status'); l.innerHTML += `<div>> ${m}</div>`; l.scrollTop = l.scrollHeight; };
    const ball = document.getElementById('zb-ball');
    const panel = document.getElementById('zb-panel');
    ball.onclick = () => panel.style.display = panel.style.display === 'none' ? 'block' : 'none';

    // 2. 本地引擎初始化 (只在需要時載入)
    let localPipe = null;
    async function initLocalBrain() {
        if (localPipe) return localPipe;
        log("📱 正在初始化本地 WebGPU 引擎...");
        const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0-alpha.14/dist/transformers.min.js');
        localPipe = await pipeline('text-generation', 'Xenova/Qwen1.5-0.5B-Chat', { device: 'webgpu' });
        log("✅ 本地大腦已覺醒。");
        return localPipe;
    }

    // 3. 執行按鈕
    document.getElementById('zb-run').onclick = async () => {
        const task = document.getElementById('zb-task').value;
        if (!task) return;
        log(`執行中: ${task}`);

        if (config.mode === 'local') {
            const pipe = await initLocalBrain();
            const out = await pipe(task, { max_new_tokens: 50 });
            log("AI 回應: " + out[0].generated_text);
        } else {
            log("☁️ 正在連線雲端大腦...");
            // (雲端 API 呼叫邏輯...)
        }
    };
})();
