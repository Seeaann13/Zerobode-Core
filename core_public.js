const GITHUB_RAW_URL = "https://raw.githubusercontent.com/Seeaann13/Zerobode-Core/refs/heads/main/core_public.js";

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['zb_mode'], (d) => {
        if (!d.zb_mode) chrome.storage.local.set({ zb_mode: 'PUBLIC', zb_model: 'cloud_groq' });
    });
});

async function syncPublicCore() {
    try {
        const response = await fetch(GITHUB_RAW_URL + "?t=" + Date.now());
        if (!response.ok) throw new Error("GitHub API 拒絕連線");
        const code = await response.text();
        if (code.length < 50) throw new Error("代碼校驗失敗");

        await chrome.storage.local.set({
            zb_public_core: code,
            zb_core_version: 'Public-v' + new Date().toISOString().split('T')[0]
        });
        return { success: true };
    } catch (err) { return { success: false, error: err.message }; }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "SYNC_PUBLIC") {
        syncPublicCore().then(sendResponse);
        return true; 
    }
});

// 動態注入核心代碼，並將使用者的設定 (API Key, 模型選擇) 透過變數傳遞給網頁
chrome.webNavigation.onDOMContentLoaded.addListener(async (details) => {
    if (details.frameId !== 0) return;

    const data = await chrome.storage.local.get(['zb_mode', 'zb_dev_core', 'zb_public_core', 'zb_model', 'zb_apikey']);
    const mode = data.zb_mode || 'PUBLIC';
    let codeToInject = (mode === 'DEV' && data.zb_dev_core) ? data.zb_dev_core : data.zb_public_core;
    if (!codeToInject) return;

    // 將設定打包成字串，注入到網頁全域環境中
    const configScript = `window.ZB_CONFIG = { model: "${data.zb_model || 'cloud_groq'}", apiKey: "${data.zb_apikey || ''}" };`;

    try {
        await chrome.scripting.executeScript({
            target: { tabId: details.tabId },
            world: "MAIN",
            func: (conf, code) => {
                try {
                    const c = document.createElement('script'); c.textContent = conf; document.head.appendChild(c); c.remove();
                    const s = document.createElement('script'); s.textContent = code; document.head.appendChild(s); s.remove();
                } catch(e){}
            },
            args: [configScript, codeToInject]
        });
    } catch (err) {}
});
