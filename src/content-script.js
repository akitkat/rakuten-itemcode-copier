// 楽天市場の検索結果ページに商品コードコピーボタンを追加するコンテンツスクリプト

console.log('楽天商品コードコピー拡張機能が読み込まれました');

// 楽天市場の商品要素を特定する関数
function findRakutenProducts() {
  // 楽天市場の検索結果ページの商品要素を探す
  const products = document.querySelectorAll('.searchresultitem');
  console.log(`商品要素を${products.length}個発見しました`);
  return products;
}


// itemCodeを取得する関数
function getItemCode(productElement, productIndex = 0) {
  // grp15_ias_prm.itemid配列のみからitemCodeを取得

  if (typeof window.grp15_ias_prm !== 'undefined' &&
      window.grp15_ias_prm.itemid &&
      Array.isArray(window.grp15_ias_prm.itemid)) {

    if (window.grp15_ias_prm.itemid[productIndex]) {
      const itemCode = window.grp15_ias_prm.itemid[productIndex];
      console.log(`grp15_ias_prm.itemid[${productIndex}]からitemCodeを発見: ${itemCode}`);
      return itemCode;
    }
  }

  console.log('grp15_ias_prm.itemidが見つかりませんでした');
  return 'itemCode未発見';
}

// コピーボタンを作成する関数
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
      console.log(`itemCode "${itemCode}" をクリップボードにコピーしました`);

      // ボタンのテキストを一時的に変更してフィードバック
      const originalText = button.textContent;
      button.textContent = 'コピー完了!';
      button.style.backgroundColor = '#4CAF50';

      setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '';
      }, 2000);

    } catch (err) {
      console.error('クリップボードへのコピーに失敗しました:', err);
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

// 商品にコピーボタンを追加する関数
function addCopyButtonsToProducts() {
  const products = findRakutenProducts();

  products.forEach((product, index) => {
    // 既にボタンが追加されている場合はスキップ
    if (product.querySelector('.rakuten-copy-button')) {
      return;
    }

    const itemCode = getItemCode(product, index);
    const copyButton = createCopyButton(itemCode);

    // 商品要素にボタンを追加
    // 実際のページ構造に合わせて配置を調整
    product.appendChild(copyButton);

    console.log(`商品${index + 1}にコピーボタンを追加しました: ${itemCode}`);

    // デバッグ用: grp15_ias_prmの詳細情報を出力
    if (itemCode === 'itemCode未発見') {
      console.log(`=== 商品${index + 1}のデバッグ情報 ===`);

      if (typeof window.grp15_ias_prm !== 'undefined') {
        console.log('grp15_ias_prm:', window.grp15_ias_prm);
        if (window.grp15_ias_prm.itemid && Array.isArray(window.grp15_ias_prm.itemid)) {
          console.log('grp15_ias_prm.itemidの長さ:', window.grp15_ias_prm.itemid.length);
          console.log(`grp15_ias_prm.itemid[${index}]:`, window.grp15_ias_prm.itemid[index]);
        }
      } else {
        console.log('grp15_ias_prmが見つかりません');
      }
    }
  });
}

// ページ読み込み完了後にボタンを追加
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addCopyButtonsToProducts);
} else {
  addCopyButtonsToProducts();
}

// SPA（Single Page Application）対応のため、ページ遷移を監視
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('ページ遷移を検出しました');
    setTimeout(addCopyButtonsToProducts, 1000); // 1秒後にボタンを追加
  }
}).observe(document, { subtree: true, childList: true });
