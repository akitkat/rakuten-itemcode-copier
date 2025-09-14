// 楽天市場の検索結果ページに商品コードコピーボタンを追加するコンテンツスクリプト

console.log('楽天商品コードコピー拡張機能が読み込まれました');

// 楽天市場の商品要素を特定
function findRakutenProducts() {
  const products = document.querySelectorAll('.searchresultitem');
  console.log(`商品要素を${products.length}個発見しました`);
  return products;
}

// itemCodeを取得
function getItemCode(productIndex = 0) {
  try {
    const scriptElement = [...document.querySelectorAll("#root > div.dui-container.footer > script")]
      .find(e => e.innerText.includes('grp15_ias_prm'));
    
    if (!scriptElement) {
      console.log('scriptタグが見つかりませんでした');
      return 'itemCode未発見';
    }

    const itemidMatch = scriptElement.textContent.match(/itemid:\s*\[(.*?)\]/s);
    if (!itemidMatch) {
      console.log('itemid配列が見つかりませんでした');
      return 'itemCode未発見';
    }

    const itemidElements = itemidMatch[1].split(',')
      .map(item => item.trim().replace(/^["']|["']$/g, ''));

    if (itemidElements.length > productIndex) {
      const itemCode = itemidElements[productIndex];
      console.log(`itemCode発見: ${itemCode}`);
      return itemCode;
    } else {
      console.log(`itemCode未発見 (配列長: ${itemidElements.length})`);
      return 'itemCode未発見';
    }

  } catch (error) {
    console.error('itemCode取得エラー:', error);
    return 'itemCode未発見';
  }
}

// コピーボタンを作成
function createCopyButton(itemCode) {
  const button = document.createElement('button');
  button.textContent = 'コードコピー';
  button.className = 'rakuten-copy-button';
  button.dataset.itemCode = itemCode;

  button.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(itemCode);
      console.log(`itemCode "${itemCode}" をコピーしました`);

      // フィードバック表示
      const originalText = button.textContent;
      button.textContent = 'コピー完了!';
      button.style.backgroundColor = '#4CAF50';

      setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '';
      }, 2000);

    } catch (err) {
      console.error('コピー失敗:', err);
      button.textContent = 'コピー失敗';
      button.style.backgroundColor = '#f44336';

      setTimeout(() => {
        button.textContent = 'コードコピー';
        button.style.backgroundColor = '';
      }, 2000);
    }
  });

  return button;
}

// 商品にコピーボタンを追加
function addCopyButtonsToProducts() {
  const products = findRakutenProducts();

  products.forEach((product, index) => {
    if (product.querySelector('.rakuten-copy-button')) return;

    const itemCode = getItemCode(index);
    const copyButton = createCopyButton(itemCode);
    
    product.appendChild(copyButton);
    console.log(`商品${index + 1}にボタン追加: ${itemCode}`);
  });
}

// ページ読み込み完了後にボタンを追加
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addCopyButtonsToProducts);
} else {
  addCopyButtonsToProducts();
}
