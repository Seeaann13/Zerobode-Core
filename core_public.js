// Zerobode 💠 Core: Pure Local WebGPU Edition
// No API Key Required | 100% Privacy | On-Device Intelligence

(async function() {
    if (document.getElementById('zb-core-ui')) return;

    // --- 1. 物理沙盒：阻止網頁跳轉 (保護本地模型記憶體) ---
    document.addEventListener('click', e => {
        const a = e.target.closest('a');
        if (a && a.href && a.href.startsWith('http')) {
            e.preventDefault();
            log(`<span style="color:#f87171">🚫 [沙盒攔截] 已阻止跳轉至外站。</span>`);
        }
    }, true);
    document.addEventListener('submit', e => {
        e.preventDefault();
        log(`<span style="color:#f87171">🚫 [沙盒攔截] 已攔截表單提交。</span>`);
    }, true);

    // --- 2. 注入賽博龐克 UI ---
    const style = document.createElement('style');
    style.innerHTML = `
        #zb-core-ui { position:fixed; bottom:20px; right:20px; width:350px; background:rgba(15,23,42,0.9); backdrop-filter:blur(12px); border:1px solid #06b6d4; border-radius:16px; padding:16px; z-index:2147483647; box-shadow:0 10px 40px rgba(0,0,0,0.8); font-family:system-ui, sans-serif; color:#e2e8f0; display:flex; flex-direction:column; max-height:80vh; }
        #zb-core-ui h1 { margin:0 0 10px 0; font-size:16px; color:#22d3ee; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(6,182,212,0.3); padding-bottom:8px; }
        #zb-log { flex:1; min-height:150px; overflow-y:auto; background:#000; padding:10px; border-radius:8px; font-size:12px; font-family:monospace; color:#4ade80; margin-bottom:10px; border:1px solid #1e293b; line-height:1.5; }
        .zb-input { width:100%; padding:10px; background:#1e293b; border:1px solid #0ea5e9; color:#fff; border-radius:8px; margin-bottom:10px; font-size:14px; outline:none; box-sizing:border-box; }
        .zb-btn { width:100%; padding:12px; border:none; border-radius:8px; font-weight:bold; cursor:pointer; font-size:14px; color:white; background:linear-gradient(135deg, #0891b2, #0284c7); box-shadow:0 4px 12px rgba(2,132,199,0.3); }
        #zb-progress-box { display:none; background:#000; padding:10px; border-radius:8px; margin-bottom:10px; border:1px solid #334155; }
        .zb-bar-bg { width:100%; background:#1e293b; height:6px; border-radius:3px; margin-top:5px; overflow:hidden; }
        #zb-bar-fill { background:#22d3ee; height:100%; width:0%; transition:width 0.2s; }
        .zn-badge { position:absolute; background:#ef4444; color:white; font-size:10px; font-weight:bold; padding:2px 4px; border-radius:4px; z-index:2147483646; pointer-events:none; }
        .zn-flash { outline: 4px solid #facc15 !important; box-shadow: 0 0 20px #facc15 !important; }
    `;
    document.head.appendChild(style);

    const ui = document.createElement('div');
    ui.id = 'zb-core-ui';
    ui.innerHTML = `
        <h1><span>💠 Zerobode Local</span><b id="zb-close" style="color:#ef4444;cursor:pointer">×</b></h1>
        <div id="zb-progress-box">
            <div style="display:flex;justify-content:space-between;font-size:10px;color:#22d3ee;"><span id="zb-dl-text">載入模型...</span><span id="zb-dl-pct">0%</span></div>
            <div class="zb-bar-bg"><div id="zb-bar-fill"></div></div>
        </div>
        <div id="zb-log">🚀 [本地引擎] 準備就緒。<br/>請點擊按鈕喚醒 GPU 大腦。</div>
        <button id="zb-ignite" class="zb-btn" style="background:linear-gradient(135deg, #7c3aed, #5b21b6);">🧠 1. 喚醒 GPU 大腦</button>
        <div id="zb-action-area" style="display:none">
            <input id="zb-mission" class="zb-input" type="text" placeholder="輸入指令 (例: 幫我點擊搜尋)">
            <button id="zb-run" class="zb-btn">⚡ 2. 執行本地推理</button>
        </div>
    `;
    document.body.appendChild(ui);

    // --- 3. 核心變數與日誌 ---
    let generator = null;
    let elementsMap = {};
    const logDiv = document.getElementById('zb-log');
    const log = (msg) => { logDiv.innerHTML += `<div>> ${msg}</div>`; logDiv.scrollTop = logDiv.scrollHeight; };
    document.getElementById('zb-close').onclick = () => { ui.remove(); document.querySelectorAll('.zn-badge').forEach(e => e.remove()); };

    // --- 4. 喚醒 WebGPU 引擎 ---
    document.getElementById('zb-ignite').onclick = async () => {
        document.getElementById('zb-ignite').style.display = 'none';
        document.getElementById('zb-progress-box').style.display = 'block';
        log("正在啟動 WebGPU 渲染管線...");

        try {
            // 引入 Transformers.js (v3 支援 WebGPU)
            const { pipeline, env } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0-alpha.14/dist/transformers.min.js');
            env.allowLocalModels = false;

            generator = await pipeline('text-generation', 'Xenova/Qwen1.5-0.5B-Chat', {
                device: 'webgpu', 
                progress_callback: (d) => {
                    if (d.status === 'downloading' || d.status === 'progress') {
                        const pct = Math.round(d.progress || 0);
                        document.getElementById('zb-bar-fill').style.width = `${pct}%`;
                        document.getElementById('zb-dl-pct').innerText = `${pct}%`;
                        document.getElementById('zb-dl-text').innerText = `讀取數據: ${d.file?.split('/').pop() || '...'} `;
                    }
                }
            });

            document.getElementById('zb-progress-box').style.display = 'none';
            document.getElementById('zb-action-area').style.display = 'block';
            log("✅ <span style='color:#fde047'>大腦喚醒成功！目前正在使用手機 GPU 運算。</span>");
        } catch (err) {
            log(`<span style="color:#ef4444">❌ 喚醒失敗: ${err.message}</span>`);
        }
    };

    // --- 5. A11y 標籤引擎 ---
    function scanDOM() {
        document.querySelectorAll('.zn-badge').forEach(e => e.remove());
        elementsMap = {};
        let ctx = "【當前網頁結構】\n";
        let c = 1;
        document.querySelectorAll('a, button, input, textarea, [role="button"]').forEach(el => {
            const r = el.getBoundingClientRect();
            if(r.width === 0 || r.height === 0 || getComputedStyle(el).display === 'none') return;
            const id = `ZN-${c++}`;
            elementsMap[id] = el;
            let d = (el.innerText || el.placeholder || el.value || "元件").replace(/\s+/g,' ').trim().substring(0, 30);
            ctx += `[${id}] ${el.tagName.toLowerCase()}: ${d}\n`;
            const b = document.createElement('div');
            b.className = 'zn-badge'; b.innerText = id;
            b.style.top = (window.scrollY + r.top - 10) + 'px'; b.style.left = (window.scrollX + r.left - 10) + 'px';
            document.body.appendChild(b);
        });
        return ctx;
    }

    // --- 6. 執行動作與推理 ---
    document.getElementById('zb-run').onclick = async () => {
        const cmd = document.getElementById('zb-mission').value.trim();
        if (!cmd || !generator) return;

        document.getElementById('zb-run').disabled = true;
        document.getElementById('zb-run').innerText = "🧠 GPU 思考中...";
        log(`\n<span style="color:#22d3ee">啟動本地推理...</span>`);

        try {
            const tree = scanDOM();
            const messages = [
                { role: 'system', content: '你是網頁助理。根據結構，若要點擊請回答【CLICK:ZN-X】，若要輸入請回答【INPUT:ZN-X:文字】。請簡短。' },
                { role: 'user', content: `目標: ${cmd}\n\n${tree}` }
            ];
            const prompt = generator.tokenizer.apply_chat_template(messages, { tokenize: false, add_generation_prompt: true });
            const output = await generator(prompt, { max_new_tokens: 100, temperature: 0.1 });
            const answer = output[0].generated_text.split('<|im_start|>assistant\n')[1] || output[0].generated_text;
            
            log(`🤖 AI: <span style="color:#fde047">${answer.trim()}</span>`);

            const clickMatch = answer.match(/【CLICK:(ZN-\d+)】/);
            const inputMatch = answer.match(/【INPUT:(ZN-\d+):(.*?)】/);

            if (clickMatch && elementsMap[clickMatch[1]]) {
                const el = elementsMap[clickMatch[1]];
                log(`⚡ 點擊: ${clickMatch[1]}`);
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('zn-flash');
                setTimeout(() => { el.classList.remove('zn-flash'); el.click(); }, 1000);
            } else if (inputMatch && elementsMap[inputMatch[1]]) {
                const el = elementsMap[inputMatch[1]];
                log(`⚡ 輸入: ${inputMatch[2]}`);
                el.focus(); el.value = inputMatch[2];
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.classList.add('zn-flash');
                setTimeout(() => el.classList.remove('zn-flash'), 1000);
            }

        } catch (err) { log(`❌ 錯誤: ${err.message}`); }
        document.getElementById('zb-run').disabled = false;
        document.getElementById('zb-run').innerText = "⚡ 2. 讓 AI 決策與操作";
    };
})();
