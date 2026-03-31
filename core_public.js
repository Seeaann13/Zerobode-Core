// Zerobode 💠 Core Engine v4.1 - 穩定強化版
// 整合了 GitHub AI 的錯誤處理與記憶體管理邏輯

(async function() {
    if (document.getElementById('zb-ball')) return;

    // --- [1. 初始化設定與記憶體管理] ---
    const config = window.ZB_USER_CONFIG || { mode: 'cloud', apiKey: '' };
    let elementsMap = {};
    let isProcessing = false;
    let logs = []; // 限制日誌長度，防止手機記憶體溢出
    const MAX_LOGS = 50;

    function logMessage(message) {
        const logDiv = document.getElementById('zb-log');
        if (logs.length >= MAX_LOGS) logs.shift();
        logs.push(message);
        if (logDiv) {
            logDiv.innerHTML += `<div>> ${message}</div>`;
            logDiv.scrollTop = logDiv.scrollHeight;
        }
        console.log("[Zerobode]", message);
    }

    // --- [2. 視覺化 UI 注入 (懸浮球模式)] ---
    const style = document.createElement('style');
    style.innerHTML = `
        #zb-ball { position:fixed; bottom:20px; right:20px; width:56px; height:56px; background:linear-gradient(135deg, #0284c7, #0369a1); border-radius:28px; display:flex; justify-content:center; align-items:center; font-size:26px; cursor:pointer; z-index:2147483647; box-shadow:0 0 20px rgba(6,182,212,0.5); border:2px solid #22d3ee; }
        #zb-panel { position:fixed; bottom:90px; right:20px; width:350px; background:rgba(10,15,30,0.95); backdrop-filter:blur(15px); border:1px solid #0ea5e9; border-radius:16px; padding:18px; z-index:2147483646; shadow:0 15px 50px rgba(0,0,0,0.9); font-family:sans-serif; color:#e2e8f0; display:none; flex-direction:column; max-height:80vh; }
        #zb-panel.active { display:flex; }
        #zb-log { flex:1; min-height:150px; overflow-y:auto; background:rgba(0,0,0,0.8); padding:10px; border-radius:8px; font-size:12px; font-family:monospace; color:#4ade80; border:1px solid #334155; }
        .zb-input { width:100%; padding:12px; background:rgba(30,41,59,0.9); border:1px solid #38bdf8; color:#fff; border-radius:8px; margin:10px 0; outline:none; box-sizing:border-box; }
        .zb-btn { width:100%; padding:12px; background:#0284c7; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer; }
        .zn-badge { position:absolute; background:red; color:white; font-size:10px; padding:2px; border-radius:4px; z-index:2147483645; }
    `;
    document.head.appendChild(style);

    const ball = document.createElement('div');
    ball.id = 'zb-ball'; ball.innerHTML = '💠';
    document.body.appendChild(ball);

    const panel = document.createElement('div');
    panel.id = 'zb-panel';
    panel.innerHTML = `
        <div style="display:flex;justify-content:space-between"><b>💠 Zerobode Pro</b><small>${config.mode}</small></div>
        <div id="zb-log">🚀 系統就緒。</div>
        <input id="zb-mission" class="zb-input" placeholder="輸入任務指令...">
        <button id="zb-run" class="zb-btn">⚡ 開始自動化執行</button>
    `;
    document.body.appendChild(panel);

    ball.onclick = () => panel.classList.toggle('active');

    // --- [3. 核心大腦與感知 (A11y Scan)] ---
    function scanDOM() {
        document.querySelectorAll('.zn-badge').forEach(e => e.remove());
        elementsMap = {};
        let ctx = "【網頁互動元素清單】\n";
        let c = 1;
        document.querySelectorAll('a, button, input, textarea, select').forEach(el => {
            const r = el.getBoundingClientRect();
            if(r.width === 0 || getComputedStyle(el).display === 'none') return;
            const id = `ZN-${c++}`;
            elementsMap[id] = el;
            ctx += `[${id}] ${el.tagName}: ${(el.innerText || el.placeholder || "").substring(0, 20)}\n`;
            const b = document.createElement('div');
            b.className = 'zn-badge'; b.innerText = id;
            b.style.top = (window.scrollY + r.top - 10) + 'px'; b.style.left = (window.scrollX + r.left - 10) + 'px';
            document.body.appendChild(b);
        });
        return ctx;
    }

    // --- [4. 呼叫 AI 引擎 (支援超時機制)] ---
    async function askAI(sys, user) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('AI 思考超時')), 30000);

            const payload = {
                "system_instruction": { "parts": [{ "text": sys }] },
                "contents": [{ "parts": [{ "text": user }] }],
                "generationConfig": { "responseMimeType": "application/json" }
            };

            GM_xmlhttpRequest({
                method: "POST",
                url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${config.apiKey}`,
                headers: { "Content-Type": "application/json" },
                data: JSON.stringify(payload),
                onload: (r) => {
                    clearTimeout(timer);
                    try {
                        const d = JSON.parse(r.responseText);
                        resolve(d.candidates[0].content.parts[0].text);
                    } catch (e) { reject(e); }
                },
                onerror: (e) => { clearTimeout(timer); reject(e); }
            });
        });
    }

    // --- [5. 永生全自動迴圈] ---
    async function agentLoop() {
        if (isProcessing) return;
        let state = await GM_getValue('zn_state');
        if (!state || JSON.parse(state).status !== 'RUNNING') return;

        isProcessing = true;
        logMessage("🔄 正在分析頁面結構...");

        try {
            const tree = scanDOM();
            const sys = `你是 Zerobode，必須輸出 JSON: {"thought": "理由", "action": "CLICK:ZN-X" 或 "INPUT:ZN-X:文字", "status": "CONTINUE" 或 "FINISH"}`;
            const user = `目標: ${JSON.parse(state).mission}\n\n${tree}`;

            const ans = await askAI(sys, user);
            const dec = JSON.parse(ans);

            logMessage(`💡 思考: ${dec.thought}`);

            if (dec.status === 'FINISH') {
                logMessage("🎉 任務完成！");
                await GM_setValue('zn_state', JSON.stringify({status: 'FINISHED'}));
                isProcessing = false; return;
            }

            if (dec.action && dec.action !== 'NONE') {
                const [type, tid, ...val] = dec.action.split(':');
                const el = elementsMap[tid];
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    if (type === 'CLICK') {
                        logMessage(`⚡ 點擊: ${tid}`);
                        setTimeout(() => { el.click(); isProcessing = false; }, 1000);
                    } else if (type === 'INPUT') {
                        const txt = val.join(':');
                        logMessage(`⚡ 輸入: ${txt}`);
                        el.value = txt;
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                        isProcessing = false;
                    }
                }
            }
            // 延遲後進入下一輪
            setTimeout(agentLoop, 3000);

        } catch (err) {
            logMessage(`❌ 錯誤: ${err.message}`);
            isProcessing = false;
        }
    }

    // --- [6. 啟動與 Enter 鍵支援] ---
    async function start() {
        const m = document.getElementById('zb-mission').value.trim();
        if(!m) return;
        await GM_setValue('zn_state', JSON.stringify({ mission: m, status: 'RUNNING' }));
        agentLoop();
    }

    document.getElementById('zb-run').onclick = start;
    document.getElementById('zb-mission').addEventListener('keypress', (e) => {
        if (event.key === 'Enter') start();
    });

    // 自動接關檢查
    const checkState = await GM_getValue('zn_state');
    if (checkState && JSON.parse(checkState).status === 'RUNNING') agentLoop();

})();
