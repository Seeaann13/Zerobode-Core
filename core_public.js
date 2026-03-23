
// 💠 Zerobode 極簡測試核心
(function() {
    console.log("Zerobode Core Loaded!");
    if (document.getElementById('zb-test-ui')) return;

    const ui = document.createElement('div');
    ui.id = 'zb-test-ui';
    ui.style.cssText = "position:fixed; bottom:20px; right:20px; width:300px; background:#0f172a; border:2px solid #06b6d4; border-radius:15px; padding:20px; z-index:2147483647; color:#fff; font-family:sans-serif; box-shadow:0 0 20px rgba(0,0,0,0.5);";
    ui.innerHTML = `
        <h3 style="margin-top:0; color:#22d3ee;">💠 Zerobode Local</h3>
        <p style="font-size:12px; color:#4ade80;">測試成功！這是 100% 本地腳本。</p>
        <button onclick="this.parentElement.remove()" style="width:100%; padding:10px; background:#0ea5e9; border:none; color:white; border-radius:5px; font-weight:bold;">關閉測試面板</button>
    `;
    document.body.appendChild(ui);
})();
