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

  /* =========================================================
   *  B. Motion トグル（背景アニメの一時停止/再開）
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
   * ======================================================= */
  const io = new IntersectionObserver(
    entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('is-visible')),
    { threshold: 0.15 }
  );
  document.querySelectorAll(sel.revealTargets).forEach(el => io.observe(el));

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

  document.querySelectorAll(sel.inPageLinks).forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      scrollToTarget(target);

      // URLをクリーンに（#を残さない）
      history.replaceState(null, '', location.pathname + location.search);

      // モバイルメニューは閉じる
      closeMenu();
    });
  });

  // リロード時に # が付いてても最下部に飛ばないように
  window.addEventListener('DOMContentLoaded', () => {
    if (location.hash) {
      history.replaceState(null, '', location.pathname + location.search);
      window.scrollTo(0, 0);
    }
  });

  /* =========================================================
   *  F. モバイルナビ開閉（黒い板の暴走を防ぐ）
   * ======================================================= */
  const openMenu = () => {
    if (!$nav || !$navToggle) return;
    $nav.classList.add('is-open');
    $navToggle.setAttribute('aria-expanded', 'true');
  };

  const closeMenu = () => {
    if (!$nav || !$navToggle) return;
    $nav.classList.remove('is-open');
    $navToggle.setAttribute('aria-expanded', 'false');
  };

  const isMenuOpen = () => $nav?.classList.contains('is-open');

  if ($navToggle && $nav) {
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
    window.addEventListener('scroll', () => {
      if (isMenuOpen()) closeMenu();
    }, { passive: true });

    // リサイズでPC幅になったら閉じる
    window.addEventListener('resize', () => {
      if (window.matchMedia('(min-width: 601px)').matches) closeMenu();
    });
  }
})();
