// 💠 Zerobode 測試版 - 僅供連線測試
(function() {
    console.log("Zerobode Online!");
    const id = 'zb-final-test';
    if (document.getElementById(id)) return;

    const ui = document.createElement('div');
    ui.id = id;
    ui.style.cssText = "position:fixed; bottom:20px; right:20px; width:280px; background:#0f172a; border:3px solid #38bdf8; border-radius:20px; padding:20px; z-index:2147483647; color:#fff; font-family:sans-serif; box-shadow:0 0 30px rgba(56,189,248,0.5); text-align:center;";
    ui.innerHTML = `
        <h2 style="margin:0 0 10px 0; color:#38bdf8;">💠 Zerobode</h2>
        <p style="font-size:14px; color:#4ade80;">雲端連線成功！</p>
        <p style="font-size:10px; color:#94a3b8;">如果你看到這個，代表你的書籤已經成功抓到 GitHub 的大腦了。</p>
        <button onclick="this.parentElement.remove()" style="margin-top:10px; width:100%; padding:10px; background:#38bdf8; border:none; color:#000; border-radius:10px; font-weight:bold;">太棒了，關閉</button>
    `;
    document.body.appendChild(ui);
})();
