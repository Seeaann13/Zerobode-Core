(function() {
    // 1. 基礎檢查
    if (window.top !== window.self) return;
    if (document.getElementById('zb-ball')) {
        document.getElementById('zb-ball').style.display = 'flex';
        return;
    }

    console.log("💠 Zerobode Core Initializing...");

    // 2. 建立 UI 容器與樣式 (使用最高優先權 !important)
    const style = document.createElement('style');
    style.innerHTML = `
        #zb-ball { 
            position: fixed !important; bottom: 20px !important; right: 20px !important; 
            width: 60px !important; height: 60px !important; 
            background: linear-gradient(135deg, #7c3aed, #5b21b6) !important; 
            border-radius: 50% !important; display: flex !important; 
            justify-content: center !important; align-items: center !important; 
            font-size: 30px !important; cursor: pointer !important; 
            z-index: 2147483647 !important; box-shadow: 0 0 25px rgba(124,58,237,0.6) !important; 
            border: 2px solid #c4b5fd !important; color: white !important;
        }
        #zb-panel { 
            position: fixed !important; bottom: 90px !important; right: 20px !important; 
            width: 320px !important; background: rgba(15,23,42,0.98) !important; 
            backdrop-filter: blur(15px) !important; border: 1px solid #8b5cf6 !important; 
            border-radius: 16px !important; padding: 15px !important; 
            z-index: 2147483646 !important; color: #e2e8f0 !important; 
            display: none; flex-direction: column !important; 
            max-height: 80vh !important; font-family: sans-serif !important;
            box-shadow: 0 10px 40px rgba(0,0,0,0.8) !important;
        }
        #zb-panel.active { display: flex !important; }
        .zb-log { height: 120px !important; overflow-y: auto !important; background: #000 !important; padding: 8px !important; border-radius: 8px !important; font-size: 11px !important; font-family: monospace !important; color: #4ade80 !important; margin: 10px 0 !important; border: 1px solid #334155 !important; }
        .zb-btn { width: 100% !important; padding: 10px !important; background: #7c3aed !important; color: white !important; border: none !important; border-radius: 8px !important; font-weight: bold !important; cursor: pointer !important; margin-top: 5px !important; }
    `;
    document.head.appendChild(style);

    // 3. 建立懸浮球與面板
    const ball = document.createElement('div');
    ball.id = 'zb-ball'; ball.innerHTML = '💠';
    
    const panel = document.createElement('div');
    panel.id = 'zb-panel';
    panel.innerHTML = `
        <div style="font-weight:bold; color:#c4b5fd; border-bottom:1px solid #334155; padding-bottom:5px; margin-bottom:10px;">Zerobode 💠 Local Agent</div>
        <div class="zb-log" id="zb-log-win">> 系統就緒。請載入模型。</div>
        <button class="zb-btn" id="zb-btn-load">💾 載入 WebGPU 引擎</button>
        <div id="zb-action-ui" style="display:none;">
            <input id="zb-task" style="width:100%; padding:8px; background:#1e293b; border:1px solid #8b5cf6; color:white; border-radius:5px; margin-bottom:5px;" placeholder="輸入目標...">
            <button class="zb-btn" style="background:#059669;">⚡ 執行自動化</button>
        </div>
    `;

    // 確保插入 body
    if (document.body) {
        document.body.appendChild(ball);
        document.body.appendChild(panel);
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            document.body.appendChild(ball);
            document.body.appendChild(panel);
        });
    }

    // 4. 控制邏輯
    ball.onclick = () => {
        panel.classList.toggle('active');
        console.log("💠 Zerobode Panel Toggled");
    };

    const logWin = document.getElementById('zb-log-win');
    document.getElementById('zb-btn-load').onclick = async function() {
        this.innerText = "⏳ 引擎初始化...";
        logWin.innerHTML += "<div>> 正在連線至 HuggingFace CDN...</div>";
        
        try {
            // 動態載入 Transformers.js
            const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0-alpha.14');
            logWin.innerHTML += "<div style='color:#4ade80'>> ✅ 引擎載入成功！</div>";
            document.getElementById('zb-action-ui').style.display = 'block';
            this.style.display = 'none';
        } catch (e) {
            logWin.innerHTML += `<div style="color:#ef4444">> ❌ 載入失敗: ${e.message}</div>`;
            this.innerText = "重試載入";
            this.disabled = false;
        }
    };

    // 5. 劫持導航 (防止跳頁死機)
    document.addEventListener('click', e => {
        const a = e.target.closest('a');
        if (a && a.href && a.href.startsWith('http') && !a.href.includes('#')) {
            e.preventDefault();
            logWin.innerHTML += `<div style="color:#eab308">> 🔄 劫持導航至: ${a.href.substring(0,30)}...</div>`;
            // 這裡後續接全自動 Fetch 渲染邏輯
            window.history.pushState({}, "", a.href);
        }
    }, true);

})();
