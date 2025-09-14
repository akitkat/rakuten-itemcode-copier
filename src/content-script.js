// 楽天市場の検索結果ページに商品コードコピーボタンを追加するコンテンツスクリプト

console.log('楽天商品コードコピー拡張機能が読み込まれました');

// 楽天市場の商品要素を特定する関数
function findRakutenProducts() {
  // 楽天市場の検索結果ページの商品要素を探す
  const products = document.querySelectorAll('.searchresultitem');
  console.log(`商品要素を${products.length}個発見しました`);
  return products;
}

// JavaScript変数からitemCodeを取得する関数
function getItemCodeFromJSVariable(productElement, productIndex) {
  try {
    // ListShopCode変数が存在するかチェック
    if (typeof window.ListShopCode !== 'undefined') {
      console.log('ListShopCode変数を発見:', window.ListShopCode);

      // 配列の場合
      if (Array.isArray(window.ListShopCode)) {
        if (window.ListShopCode[productIndex]) {
          console.log(`ListShopCode[${productIndex}]からitemCodeを発見: ${window.ListShopCode[productIndex]}`);
          return window.ListShopCode[productIndex];
        }
      }
      // オブジェクトの場合
      else if (typeof window.ListShopCode === 'object') {
        const keys = Object.keys(window.ListShopCode);
        if (keys[productIndex]) {
          const itemCode = window.ListShopCode[keys[productIndex]];
          console.log(`ListShopCode.${keys[productIndex]}からitemCodeを発見: ${itemCode}`);
          return itemCode;
        }
      }
    }

    // 他の可能性のある変数名もチェック
    const possibleVariableNames = [
      'ListShopCode',
      'listShopCode',
      'shopCodeList',
      'itemCodeList',
      'productList',
      'rakutenItems'
    ];

    // grp15_ias_prm.itemid配列をチェック
    if (typeof window.grp15_ias_prm !== 'undefined' &&
        window.grp15_ias_prm.itemid &&
        Array.isArray(window.grp15_ias_prm.itemid)) {
      console.log('grp15_ias_prm.itemid配列を発見:', window.grp15_ias_prm.itemid);

      if (window.grp15_ias_prm.itemid[productIndex]) {
        const itemCode = window.grp15_ias_prm.itemid[productIndex];
        console.log(`grp15_ias_prm.itemid[${productIndex}]からitemCodeを発見: ${itemCode}`);
        return itemCode;
      }
    }

    for (const varName of possibleVariableNames) {
      if (typeof window[varName] !== 'undefined') {
        console.log(`${varName}変数を発見:`, window[varName]);

        if (Array.isArray(window[varName]) && window[varName][productIndex]) {
          console.log(`${varName}[${productIndex}]からitemCodeを発見: ${window[varName][productIndex]}`);
          return window[varName][productIndex];
        }
      }
    }

  } catch (error) {
    console.log('JavaScript変数からの取得中にエラー:', error);
  }

  return null;
}

// itemCodeを取得する関数
function getItemCode(productElement, productIndex = 0) {
  // 複数の方法でitemCodeを探す

  // 1. JavaScript変数から探す（最優先）
  const jsItemCode = getItemCodeFromJSVariable(productElement, productIndex);
  if (jsItemCode) {
    return jsItemCode;
  }

  // 2. data属性から探す
  const dataItemCode = productElement.dataset.itemCode ||
                      productElement.dataset.productId ||
                      productElement.dataset.itemId;

  if (dataItemCode) {
    console.log(`data属性からitemCodeを発見: ${dataItemCode}`);
    return dataItemCode;
  }

  // 3. 子要素のdata属性から探す
  const childWithData = productElement.querySelector('[data-item-code], [data-product-id], [data-item-id]');
  if (childWithData) {
    const itemCode = childWithData.dataset.itemCode ||
                    childWithData.dataset.productId ||
                    childWithData.dataset.itemId;
    console.log(`子要素のdata属性からitemCodeを発見: ${itemCode}`);
    return itemCode;
  }

  // 4. 商品リンクのURLから探す（楽天の商品ページURL形式）
  const productLink = productElement.querySelector('a[href*="item.rakuten.co.jp"]');
  if (productLink) {
    const href = productLink.href;
    // URL形式: https://item.rakuten.co.jp/shop/itemcode/
    const urlParts = href.split('/');
    const itemCode = urlParts[urlParts.length - 2];

    if (itemCode && itemCode !== 'item.rakuten.co.jp') {
      console.log(`商品リンクからitemCodeを発見: ${itemCode}`);
      return itemCode;
    }
  }

  // 5. 商品画像のURLから探す
  const productImage = productElement.querySelector('img[src*="item.rakuten.co.jp"]');
  if (productImage) {
    const src = productImage.src;
    // 画像URLにitemCodeが含まれている場合
    const match = src.match(/item\.rakuten\.co\.jp\/[^\/]+\/([^\/]+)/);
    if (match && match[1]) {
      console.log(`商品画像からitemCodeを発見: ${match[1]}`);
      return match[1];
    }
  }

  // 6. 商品要素のIDやクラス名から探す
  const elementId = productElement.id;
  if (elementId && elementId.includes('item')) {
    console.log(`要素IDからitemCodeを発見: ${elementId}`);
    return elementId;
  }

  console.log('itemCodeが見つかりませんでした');
  console.log('商品要素の詳細:', productElement);
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

    // デバッグ用: 商品要素の詳細情報を出力
    if (itemCode === 'itemCode未発見') {
      console.log(`=== 商品${index + 1}のデバッグ情報 ===`);
      console.log('商品要素:', product);
      console.log('商品要素のHTML:', product.outerHTML.substring(0, 500) + '...');
      console.log('商品要素のdata属性:', product.dataset);
      console.log('商品要素のID:', product.id);
      console.log('商品要素のクラス:', product.className);

      // JavaScript変数の詳細チェック
      console.log('=== JavaScript変数の詳細チェック ===');

      // grp15_ias_prmの詳細チェック
      if (typeof window.grp15_ias_prm !== 'undefined') {
        console.log('grp15_ias_prm:', window.grp15_ias_prm);
        if (window.grp15_ias_prm.itemid && Array.isArray(window.grp15_ias_prm.itemid)) {
          console.log('grp15_ias_prm.itemidの長さ:', window.grp15_ias_prm.itemid.length);
          console.log(`grp15_ias_prm.itemid[${index}]:`, window.grp15_ias_prm.itemid[index]);
        }
      }

      const jsVariables = ['ListShopCode', 'listShopCode', 'shopCodeList', 'itemCodeList', 'productList', 'rakutenItems'];
      jsVariables.forEach(varName => {
        if (typeof window[varName] !== 'undefined') {
          console.log(`${varName}:`, window[varName]);
          console.log(`${varName}の型:`, typeof window[varName]);
          if (Array.isArray(window[varName])) {
            console.log(`${varName}の長さ:`, window[varName].length);
            console.log(`${varName}[${index}]:`, window[varName][index]);
          }
        }
      });

      // 子要素のリンクをチェック
      const links = product.querySelectorAll('a');
      links.forEach((link, linkIndex) => {
        console.log(`リンク${linkIndex + 1}:`, link.href);
      });

      // 子要素の画像をチェック
      const images = product.querySelectorAll('img');
      images.forEach((img, imgIndex) => {
        console.log(`画像${imgIndex + 1}:`, img.src);
      });
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
