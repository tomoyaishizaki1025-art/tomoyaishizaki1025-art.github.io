(() => {
  /* =========================================================
   *  A. 設定・要素取得
   * ======================================================= */
  const sel = {
    motionToggle: '.js-motion-toggle', // 「Motion: On/Off」ボタン
    wiggle: '.wiggle',                  // 波打ち背景（アニメ対象）
    revealTargets: '.reveal',           // スクロールで出現させる要素
    inPageLinks: 'a[href^="#"]',        // ページ内アンカー
  };

  const $toggle = document.querySelector(sel.motionToggle);
  const $wiggle = document.querySelector(sel.wiggle);

  /* =========================================================
   *  B. Motion トグル（背景アニメの一時停止/再開）
   *     - ボタン押下で animationPlayState を切り替え
   *     - aria-pressed と ボタン表示文言も同期
   * ======================================================= */
  if ($toggle && $wiggle) {
    $toggle.addEventListener('click', () => {
      const paused = $wiggle.style.animationPlayState === 'paused';
      $wiggle.style.animationPlayState = paused ? 'running' : 'paused';
      $toggle.setAttribute('aria-pressed', String(!paused));
      $toggle.textContent = `Motion: ${paused ? 'On' : 'Off'}`;
    });
  }

  /* =========================================================
   *  C. スクロールで要素をふわっと表示（IntersectionObserver）
   *     - しきい値 0.15 で .reveal に .is-visible を付与
   * ======================================================= */
  const io = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('is-visible');
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll(sel.revealTargets).forEach(el => io.observe(el));

  /* =========================================================
   *  D. リロード時：ハッシュ(#section)が付いていたら削除して最上部へ
   *     - 最下部に飛んでしまう不具合の回避
   * ======================================================= */
  window.addEventListener('DOMContentLoaded', () => {
    if (location.hash) {
      // 履歴は追加せずに URL のハッシュだけ消す
      history.replaceState(null, '', location.pathname + location.search);
      // 念のためページ先頭へ
      window.scrollTo(0, 0);
    }
  });

  /* =========================================================
   *  E. ページ内リンクのスムーススクロール
   *     - クリック時にデフォルト遷移を止める
   *     - scrollIntoView でスムーズに移動
   *     - その後 URL のハッシュは残さない（再読込時に下へ飛ばない）
   * ======================================================= */
  document.querySelectorAll(sel.inPageLinks).forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return; // 不正なリンクは無視
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // ハッシュを残さないことで URL をクリーンに維持
      history.replaceState(null, '', location.pathname + location.search);
    });
  });
})();
// === モバイルナビの開閉 ===
const navToggle = document.querySelector('.nav-toggle');
const siteNav   = document.querySelector('#site-nav');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const open = siteNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  // リンクタップで自動クローズ
  siteNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      siteNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // 画面外クリックでクローズ（任意）
  document.addEventListener('click', (e) => {
    if (!siteNav.contains(e.target) && !navToggle.contains(e.target)) {
      siteNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}
