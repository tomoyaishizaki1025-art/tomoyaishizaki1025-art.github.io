console.log("portfolio.js loaded");

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
    navClose: '.nav-close', // ★追加
  };

  const $toggle = document.querySelector(sel.motionToggle);
  const $wiggle = document.querySelector(sel.wiggle);
  const $header = document.querySelector(sel.header);
  const $navToggle = document.querySelector(sel.navToggle);
  const $nav = document.querySelector(sel.nav);
  const $navClose = document.querySelector('.nav-close');

  // nav内のリンク（メニュー開閉やフォーカス用）
  const getNavLinks = () => ($nav ? Array.from($nav.querySelectorAll('a[href]')) : []);

  /* =========================================================
   *  B. Motion トグル（背景アニメの一時停止/再開）
   * ======================================================= */
  if ($toggle && $wiggle) {
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
   * ======================================================= */
  document.querySelectorAll('.hero .reveal').forEach((el) => {
    el.classList.add('is-visible');
    el.dataset.revealed = '1';
  });

  const revealEls = document.querySelectorAll(sel.revealTargets);
  if (revealEls.length) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;

          if (e.target.dataset.revealed === '1') {
            obs.unobserve(e.target);
            return;
          }

          const delay = Number(e.target.dataset.delay || 0);
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

    revealEls.forEach((el) => io.observe(el));
  }

  /* =========================================================
   *  D. ヘッダー高さ（アンカー時のズレ対策）
   * ======================================================= */
  const getHeaderOffset = () => {
    if (!$header) return 0;
    const h = $header.getBoundingClientRect().height || 0;
    return Math.ceil(h) + 12;
  };

  /* =========================================================
   *  E. スムーススクロール（ヘッダー分オフセット / hash残さない）
   * ======================================================= */
  const scrollToTarget = (target) => {
    const y = target.getBoundingClientRect().top + window.pageYOffset - getHeaderOffset();
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  window.addEventListener('DOMContentLoaded', () => {
    if (location.hash) {
      history.replaceState(null, '', location.pathname + location.search);
      window.scrollTo(0, 0);
    }
  });

  /* =========================================================
   *  F. モバイルナビ開閉
   * ======================================================= */
  const openMenu = () => {
    if (!$nav || !$navToggle) return;

    $nav.classList.add('is-open');
    document.body.classList.add('nav-open');

    $navToggle.setAttribute('aria-expanded', 'true');
    $nav.setAttribute('aria-hidden', 'false');

    // 最初のリンクへフォーカス
    const links = getNavLinks();
    if (links[0]) links[0].focus({ preventScroll: true });
  };

  const closeMenu = () => {
    if (!$nav || !$navToggle) return;

    $nav.classList.remove('is-open');
    document.body.classList.remove('nav-open');

    $navToggle.setAttribute('aria-expanded', 'false');
    $nav.setAttribute('aria-hidden', 'true');

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

      history.replaceState(null, '', location.pathname + location.search);

      if (isMenuOpen()) closeMenu();
    });
  });

  // ナビ開閉のイベント
  if ($navToggle && $nav) {
    $nav.setAttribute('aria-hidden', 'true');
    $navToggle.setAttribute('aria-expanded', 'false');

    $navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      isMenuOpen() ? closeMenu() : openMenu();
    });

    // ★ここが重要：navの「余白」タップで閉じる（リンク等は閉じない）
    $nav.addEventListener('click', (e) => {
      if (e.target === $nav && isMenuOpen()) closeMenu();
    });

    // ★×ボタンで閉じる
    if ($navClose) {
      $navClose.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isMenuOpen()) closeMenu();
      });
    }

    // 画面外クリックでクローズ（navが全画面でも一応残す）
    document.addEventListener('click', () => {
      if (isMenuOpen()) closeMenu();
    });

    // ESCで閉じる
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isMenuOpen()) closeMenu();
    });

    // スクロールしたら閉じる
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

/* ヘッダーを追従させる（影を付ける） */
(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('is-stuck', window.scrollY > 8);
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();
// Contact/Hero: mailto でメール作成画面を開く（1本化）
(() => {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const mailtoLink = document.getElementById("mailtoLink");  // お問い合わせ内ボタン
  const heroConsult = document.getElementById("heroConsult"); // ヒーローの「まずは相談してみる」
  const note = document.getElementById("formNote");
  const contactSection = document.getElementById("contact");

  const TO = "tomoya.ishizaki1025@gmail.com"; // 宛先（あなたの商用アドレスに置き換え）

  const getValue = (name) => (form.elements[name]?.value || "").trim();

  const buildMailtoUrl = () => {
    const name = getValue("name");
    const email = getValue("email");
    const message = getValue("message");

    const subject = `【Web制作のご相談】${name || "お名前未入力"} 様`;
    const body =
`お名前：${name}
メール：${email}

ご相談内容：
${message}
`;

    return `mailto:${encodeURIComponent(TO)}`
      + `?subject=${encodeURIComponent(subject)}`
      + `&body=${encodeURIComponent(body)}`;
  };

  const pulseNote = () => {
    if (!note) return;
    note.classList.add("is-strong");
    setTimeout(() => note.classList.remove("is-strong"), 1400);
  };

  const scrollToContactAndFocus = () => {
    contactSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => form.elements["name"]?.focus(), 350);
    pulseNote();
  };

  const openMailOrGuide = (e) => {
    e.preventDefault();

    const name = getValue("name");
    const email = getValue("email");
    const message = getValue("message");

    // 3つとも空なら「入力しに来てね」
    if (!name && !email && !message) {
      scrollToContactAndFocus();
      return;
    }

    // 何か入ってるならメール作成画面へ
    window.location.href = buildMailtoUrl();
  };

  // ボタン（問い合わせ内 / ヒーロー）に同じ挙動を付与
  if (mailtoLink) mailtoLink.addEventListener("click", openMailOrGuide);
  if (heroConsult) heroConsult.addEventListener("click", openMailOrGuide);

  // 送信ボタン（準備中）は submit を止めて案内だけ
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    pulseNote();
  });
})();
