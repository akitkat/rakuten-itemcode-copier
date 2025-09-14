// ポップアップのJavaScript

console.log('ポップアップが読み込まれました');

// 現在のタブの状態を確認
async function checkCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab.url.includes('rakuten.co.jp')) {
      updateStatus('active', '楽天市場のページで動作中です');
    } else {
      updateStatus('inactive', '楽天市場のページで使用してください');
    }
  } catch (error) {
    console.error('タブの確認中にエラーが発生しました:', error);
    updateStatus('inactive', 'エラーが発生しました');
  }
}

// ステータス表示を更新
function updateStatus(type, message) {
  const statusElement = document.getElementById('status');
  statusElement.className = `status ${type}`;
  statusElement.textContent = message;
}

// ページ読み込み時にタブの状態を確認
document.addEventListener('DOMContentLoaded', checkCurrentTab);
