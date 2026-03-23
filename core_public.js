(function() {
    if (window.top !== window.self) return;
    if (document.getElementById('zb-ball')) return;

    // --- [1. 載入 WebGPU AI 引擎 (Transformers.js v3)] ---
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0-alpha.14";
    script.type = "module";
    document.head.appendChild(script);

    // --- [2. 注入 UI 介面] ---
    const style = document.createElement('style');
    style.innerHTML = `
        #zb-ball { position:fixed; bottom:20px; right:20px; width:56px; height:56px; background:linear-gradient(135deg, #7c3aed, #5b21b6); border-radius:28px; display:flex; justify-content:center; align-items:center; font-size:26px; cursor:pointer; z-index:2147483647; box-shadow:0 0 20px rgba(124,58,237,0.5); border:2px solid #c4b5fd; transition:all 0.3s; }
        #zb-panel { position:fixed; bottom:90px; right:20px; width:350px; background:rgba(15,23,42,0.95); backdrop-filter:blur(15px); border:1px solid #8b5cf6; border-radius:16px; padding:18px; z-index:2147483646; color:#e2e8f0; transform:scale(0); opacity:0; transform-origin:bottom right; transition:0.3s; display:flex; flex-direction:column; max-height:80vh; font-family:sans-serif; }
        #zb-panel.active { transform:scale(1); opacity:1; }
        #zb-log { flex:1; min-height:150px; overflow-y:auto; background:#000; padding:10px; border-radius:8px; font-size:11px; font-family:monospace; color:#4ade80; margin-bottom:12px; border:1px solid #334155; }
        .zb-progress { height:6px; background:#1e293b; border-radius:3px; overflow:hidden; margin-bottom:10px; display:none; }
        .zb-bar { height:100%; width:0%; background:#a78bfa; transition:width 0.2s; }
        .zb-btn { width:100%; padding:12px; background:#7c3aed; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer; }
    `;
    document.head.appendChild(style);

    const ball = document.createElement('div');
    ball.id = 'zb-ball'; ball.innerHTML = '💠';
    document.body.appendChild(ball);

    const panel = document.createElement('div');
    panel.id = 'zb-panel';
    panel.innerHTML = `
        <h1 style="font-size:16px;color:#c4b5fd;margin-bottom:10px;">Zerobode 💠 Local Agent</h1>
        <div id="zb-progress-box" class="zb-progress"><div id="zb-bar" class="zb-bar"></div></div>
        <div id="zb-log">> 系統就緒。點擊「載入模型」開始。</div>
        <button id="zb-load" class="zb-btn" style="margin-bottom:10px;">💾 載入本地 WebGPU 模型</button>
        <input id="zb-input" style="width:100%;padding:10px;background:#1e293b;border:1px solid #8b5cf6;color:#fff;border-radius:8px;margin-bottom:10px;" placeholder="輸入任務目標...">
        <button id="zb-run" class="zb-btn" disabled>⚡ 啟動自動化</button>
    `;
    document.body.appendChild(panel);

    ball.onclick = () => panel.classList.toggle('active');

    // --- [3. 劫持跳轉：防止網頁重整] ---
    document.addEventListener('click', async (e) => {
        const link = e.target.closest('a');
        if (link && link.href && link.href.startsWith('http') && !link.href.includes(window.location.hostname)) {
            // 只有跨域或需要跳轉時才攔截
            e.preventDefault();
            const targetUrl = link.href;
            console.log("💠 攔截跳轉至:", targetUrl);
            await navigateTo(targetUrl);
        }
    }, true);

    async function navigateTo(url) {
        document.getElementById('zb-log').innerHTML += `<div style="color:#fbbf24">> 🔄 正在背景抓取並渲染: ${url}</div>`;
        try {
            const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
            const html = await res.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // 核心：只換掉 body 內容，腳本和 UI 依然活在原本的 window 裡！
            document.body.innerHTML = doc.body.innerHTML;
            document.title = doc.title;
            // 重新放回我們的 UI
            document.body.appendChild(ball);
            document.body.appendChild(panel);
            window.history.pushState({}, "", url); // 更新網址列但不重整
            document.getElementById('zb-log').innerHTML += `<div style="color:#4ade80">> ✅ 跳轉成功！AI 仍然存活。</div>`;
        } catch (err) {
            alert("跳轉失敗(CORS/防爬蟲): " + err);
        }
    }

    // --- [4. 模型載入邏輯] ---
    let generator;
    document.getElementById('zb-load').onclick = async function() {
        this.disabled = true;
        this.innerText = "連線中...";
        const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0-alpha.14');
        
        document.getElementById('zb-progress-box').style.display = 'block';
        
        try {
            generator = await pipeline('text-generation', 'Xenova/Qwen1.5-0.5B-Chat', {
                device: 'webgpu',
                progress_callback: (d) => {
                    const p = Math.round(d.progress || 0);
                    document.getElementById('zb-bar').style.width = p + '%';
                }
            });
            document.getElementById('zb-log').innerHTML += `<div>> ✅ WebGPU 模型載入完成！</div>`;
            document.getElementById('zb-run').disabled = false;
            this.style.display = 'none';
        } catch (err) {
            alert("WebGPU 啟動失敗，請檢查瀏覽器是否支援: " + err);
        }
    };

    // --- [5. 自動化掃描與執行 (略，可放入之前的 scanDOM 邏輯)] ---
    document.getElementById('zb-run').onclick = () => {
        // 這裡放入 AI 思考與操作的迴圈...
    };

})();
