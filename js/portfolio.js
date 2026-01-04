(() => {
  /* =========================================================
   *  A. 設定・要素取得
   * ======================================================= */
  const sel = {
    motionToggle: '.js-motion-toggle',
    wiggle: '.wiggle',
    revealTargets: '.reveal',
    inPageLinks: 'a[href^="#"]',
    header: '.site-header',
    navToggle: '.nav-toggle',
    nav: '#site-nav',
  };

  const $toggle = document.querySelector(sel.motionToggle);
  const $wiggle = document.querySelector(sel.wiggle);
  const $header = document.querySelector(sel.header);
  const $navToggle = document.querySelector(sel.navToggle);
  const $nav = document.querySelector(sel.nav);

  // nav内のリンク（メニュー開閉やフォーカス用）
  const getNavLinks = () => ($nav ? Array.from($nav.querySelectorAll('a[href]')) : []);

  /* =========================================================
   *  B. Motion トグル（背景アニメの一時停止/再開）
   * ======================================================= */
  if ($toggle && $wiggle) {
    // 初期表示整形（任意）
    $toggle.setAttribute('aria-pressed', 'false');

    $toggle.addEventListener('click', () => {
      const paused = $wiggle.style.animationPlayState === 'paused';
      $wiggle.style.animationPlayState = paused ? 'running' : 'paused';
      $toggle.setAttribute('aria-pressed', String(!paused));
      $toggle.textContent = `Motion: ${paused ? 'On' : 'Off'}`;
    });
  }

  /* =========================================================
   *  C. スクロールで要素をふわっと表示（IntersectionObserver）
   *  - “少し手前”で発火させると自然（rootMargin）
   * ======================================================= */
 const io = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;

      const delay = Number(e.target.dataset.delay || 0);

      if (e.target.dataset.revealed === '1') return;
      e.target.dataset.revealed = '1';

      setTimeout(() => {
        e.target.classList.add('is-visible');
      }, delay);

      obs.unobserve(e.target);
    });
  },
  {
    threshold: 0.10,
    rootMargin: '0px 0px -8% 0px',
  }
);


  /* =========================================================
   *  D. ヘッダー高さ（アンカー時のズレ対策）
   * ======================================================= */
  const getHeaderOffset = () => {
    if (!$header) return 0;
    const h = $header.getBoundingClientRect().height || 0;
    return Math.ceil(h) + 12; // 少し余白
  };

  /* =========================================================
   *  E. スムーススクロール（ヘッダー分オフセット / hash残さない）
   * ======================================================= */
  const scrollToTarget = (target) => {
    const y = target.getBoundingClientRect().top + window.pageYOffset - getHeaderOffset();
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  // リロード時に # が付いてても最下部に飛ばないように（既存維持）
  window.addEventListener('DOMContentLoaded', () => {
    if (location.hash) {
      history.replaceState(null, '', location.pathname + location.search);
      window.scrollTo(0, 0);
    }
  });

  /* =========================================================
   *  F. モバイルナビ開閉（全画面オーバーレイ想定）
   *  - 背景スクロール禁止：body.nav-open
   *  - aria / フォーカス最低限整備
   * ======================================================= */
  const openMenu = () => {
    if (!$nav || !$navToggle) return;

    $nav.classList.add('is-open');
    document.body.classList.add('nav-open'); // ★追加：背景スクロール禁止

    $navToggle.setAttribute('aria-expanded', 'true');
    $nav.setAttribute('aria-hidden', 'false');

    // 最初のリンクへフォーカス（キーボード操作配慮）
    const links = getNavLinks();
    if (links[0]) links[0].focus({ preventScroll: true });
  };

  const closeMenu = () => {
    if (!$nav || !$navToggle) return;

    $nav.classList.remove('is-open');
    document.body.classList.remove('nav-open'); // ★追加

    $navToggle.setAttribute('aria-expanded', 'false');
    $nav.setAttribute('aria-hidden', 'true');

    // トグルボタンへ戻す
    $navToggle.focus({ preventScroll: true });
  };

  const isMenuOpen = () => $nav?.classList.contains('is-open');

  // a[href^="#"] をクリックしたらスムーススクロール + メニュー閉じる
  document.querySelectorAll(sel.inPageLinks).forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      scrollToTarget(target);

      // URLをクリーンに（#を残さない）
      history.replaceState(null, '', location.pathname + location.search);

      // モバイルメニューは閉じる
      if (isMenuOpen()) closeMenu();
    });
  });

  // ナビ開閉のイベント
  if ($navToggle && $nav) {
    // 初期状態（念のため）
    $nav.setAttribute('aria-hidden', 'true');
    $navToggle.setAttribute('aria-expanded', 'false');

    $navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      isMenuOpen() ? closeMenu() : openMenu();
    });

    // メニュー内クリックは外側扱いにしない
    $nav.addEventListener('click', (e) => e.stopPropagation());

    // 画面外クリックでクローズ
    document.addEventListener('click', () => {
      if (isMenuOpen()) closeMenu();
    });

    // ESCで閉じる
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isMenuOpen()) closeMenu();
    });

    // スクロールしたら閉じる（“黒い板が残る”体験を消す）
    window.addEventListener(
      'scroll',
      () => {
        if (isMenuOpen()) closeMenu();
      },
      { passive: true }
    );

    // リサイズでPC幅になったら閉じる
    window.addEventListener('resize', () => {
      if (window.matchMedia('(min-width: 601px)').matches && isMenuOpen()) closeMenu();
    });
  }
})();
