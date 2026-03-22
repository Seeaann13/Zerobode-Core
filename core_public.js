console.log("===================================");
console.log("💠 Zerobode Public Core 雲端載入成功！");
console.log("===================================");

(function() {
    if (document.getElementById('zerobode-public-test')) return;
    const ui = document.createElement('div');
    ui.id = 'zerobode-public-test';
    ui.innerHTML = `
        <div style="position:fixed; bottom:20px; left:20px; background:linear-gradient(135deg, #0284c7, #0369a1); color:white; padding:12px 24px; border-radius:12px; font-weight:bold; z-index:2147483647; box-shadow:0 10px 25px rgba(0,0,0,0.5); font-family:sans-serif; border:1px solid #38bdf8;">
            🚀 Zerobode 💠 遠端核心已成功注入！
        </div>
    `;
    document.body.appendChild(ui);
})();
