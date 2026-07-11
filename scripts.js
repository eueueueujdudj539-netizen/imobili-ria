/**
 * ============================================================
 *  Casa Nobre Imóveis — Script Principal
 *  Todas as interações do site em Vanilla JS (ES6+)
 * ============================================================
 */
(() => {
  'use strict';

  /* --------------------------------------------------------
   *  Utilitários
   * ------------------------------------------------------ */

  /** Debounce — atrasa a execução até que o usuário pare de digitar */
  const debounce = (fn, ms = 300) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  };

  /** Atalho para document.querySelector / querySelectorAll */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /** Formata número para pt-BR */
  const fmtNum = (n) => n.toLocaleString('pt-BR');

  /** Formata moeda em BRL */
  const fmtBRL = (v) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  /** Easing — easeOutQuad */
  const easeOutQuad = (t) => t * (2 - t);

  /* --------------------------------------------------------
   *  1. Efeito de Scroll no Header
   * ------------------------------------------------------ */
  const initHeaderScroll = () => {
    const header = $('#header');
    if (!header) return;

    let lastY = 0;

    const onScroll = () => {
      const y = window.scrollY;

      // Adiciona classe "scrolled" após 100px
      header.classList.toggle('scrolled', y > 100);

      // Exibe/oculta header conforme direção do scroll
      if (y > lastY && y > 200) {
        header.classList.add('header-hidden');
      } else {
        header.classList.remove('header-hidden');
      }
      lastY = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
  };

  /* --------------------------------------------------------
   *  2. Navegação Mobile
   * ------------------------------------------------------ */
  const initMobileNav = () => {
    const toggle = $('.nav-toggle');
    const menu = $('.mobile-menu');
    if (!toggle || !menu) return;

    const open = () => {
      menu.classList.add('active');
      document.body.classList.add('no-scroll');
      toggle.setAttribute('aria-expanded', 'true');
    };

    const close = () => {
      menu.classList.remove('active');
      document.body.classList.remove('no-scroll');
      toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', () =>
      menu.classList.contains('active') ? close() : open()
    );

    // Fecha menu ao clicar em um link
    $$('a', menu).forEach((link) => link.addEventListener('click', close));
  };

  /* --------------------------------------------------------
   *  3. Smooth Scroll para Âncoras
   * ------------------------------------------------------ */
  const initSmoothScroll = () => {
    const OFFSET = 80; // altura do header fixo

    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;

      const id = anchor.getAttribute('href');
      if (id === '#' || id.length < 2) return;

      const target = $(id);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  };

  /* --------------------------------------------------------
   *  4. Filtro de Imóveis (Busca)
   * ------------------------------------------------------ */
  const initPropertyFilter = () => {
    const form = $('#searchForm');
    const tabs = $$('.search-tab');
    const cards = $$('.property-card');
    if (!form || cards.length === 0) return;

    let activeTab = 'comprar';

    // Alterna entre Comprar / Alugar
    tabs.forEach((btn) => {
      btn.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        btn.classList.add('active');
        activeTab = (btn.textContent || '').trim().toLowerCase();
        applyFilters();
      });
    });

    /** Lê os campos e filtra os cards */
    const applyFilters = () => {
      const city = (form.querySelector('[name="city"]')?.value || '').toLowerCase();
      const neighborhood = (form.querySelector('[name="neighborhood"]')?.value || '').toLowerCase();
      const priceMin = Number(form.querySelector('[name="priceMin"]')?.value) || 0;
      const priceMax = Number(form.querySelector('[name="priceMax"]')?.value) || Infinity;
      const bedrooms = Number(form.querySelector('[name="bedrooms"]')?.value) || 0;
      const garage = form.querySelector('[name="garage"]')?.checked ?? false;
      const pool = form.querySelector('[name="pool"]')?.checked ?? false;
      const type = (form.querySelector('[name="type"]')?.value || '').toLowerCase();

      let visibleCount = 0;

      cards.forEach((card) => {
        const d = card.dataset;
        const match =
          (!city || (d.city || '').toLowerCase().includes(city)) &&
          (!neighborhood || (d.neighborhood || '').toLowerCase().includes(neighborhood)) &&
          (Number(d.price) || 0) >= priceMin &&
          (Number(d.price) || 0) <= priceMax &&
          (bedrooms === 0 || Number(d.bedrooms) >= bedrooms) &&
          (!garage || d.garage === 'true') &&
          (!pool || d.pool === 'true') &&
          (!type || (d.type || '').toLowerCase() === type) &&
          (!activeTab || (d.transaction || '').toLowerCase() === activeTab);

        card.style.display = match ? '' : 'none';
        if (match) visibleCount++;
      });

      // Mensagem "nenhum resultado"
      let noResults = $('#noResults');
      if (visibleCount === 0) {
        if (!noResults) {
          noResults = document.createElement('p');
          noResults.id = 'noResults';
          noResults.className = 'no-results';
          noResults.textContent = 'Nenhum imóvel encontrado com os filtros selecionados.';
          cards[0].parentElement.appendChild(noResults);
        }
        noResults.style.display = '';
      } else if (noResults) {
        noResults.style.display = 'none';
      }
    };

    form.addEventListener('input', debounce(applyFilters, 200));
    form.addEventListener('change', applyFilters);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      applyFilters();
    });
  };

  /* --------------------------------------------------------
   *  5. Modais de Imóveis
   * ------------------------------------------------------ */
  const openPropertyModal = (id) => {
    const modal = $(`#propertyModal-${id}`);
    if (!modal) return;
    modal.classList.add('active');
    document.body.classList.add('no-scroll');
  };

  const closePropertyModal = (id) => {
    const modal = $(`#propertyModal-${id}`);
    if (!modal) return;
    modal.classList.remove('active');
    document.body.classList.remove('no-scroll');
  };

  /* --------------------------------------------------------
   *  9. Modais de Blog
   * ------------------------------------------------------ */
  const openBlogModal = (id) => {
    const modal = $(`#blogModal-${id}`);
    if (!modal) return;
    modal.classList.add('active');
    document.body.classList.add('no-scroll');
  };

  const closeBlogModal = (id) => {
    const modal = $(`#blogModal-${id}`);
    if (!modal) return;
    modal.classList.remove('active');
    document.body.classList.remove('no-scroll');
  };

  /** Comportamento compartilhado de modais (overlay click + ESC) */
  const initModals = () => {
    // Fecha modal ao clicar no overlay (fora do conteúdo)
    document.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal.active, .property-modal.active, .blog-modal.active');
      if (modal && e.target === modal) {
        modal.classList.remove('active');
        document.body.classList.remove('no-scroll');
      }
    });

    // Fecha modal com tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const active = $('.modal.active, .property-modal.active, .blog-modal.active');
      if (active) {
        active.classList.remove('active');
        document.body.classList.remove('no-scroll');
      }
    });
  };

  // Expõe globalmente para uso em atributos onclick do HTML
  window.openPropertyModal = openPropertyModal;
  window.closePropertyModal = closePropertyModal;
  window.openBlogModal = openBlogModal;
  window.closeBlogModal = closeBlogModal;

  /* --------------------------------------------------------
   *  6. Acordeão de FAQ
   * ------------------------------------------------------ */
  const initFaqAccordion = () => {
    const questions = $$('.faq-question');
    if (questions.length === 0) return;

    questions.forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        if (!item) return;

        const isOpen = item.classList.contains('active');

        // Fecha todos os itens abertos (um por vez)
        $$('.faq-item.active').forEach((openItem) => {
          openItem.classList.remove('active');
          const answer = $('.faq-answer', openItem);
          if (answer) answer.style.maxHeight = null;
        });

        // Abre o item clicado (se estava fechado)
        if (!isOpen) {
          item.classList.add('active');
          const answer = $('.faq-answer', item);
          if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    });
  };

  /* --------------------------------------------------------
   *  7. Filtro de Categorias do FAQ
   * ------------------------------------------------------ */
  const initFaqCategoryFilter = () => {
    const buttons = $$('.faq-category');
    const items = $$('.faq-item');
    const counter = $('#faqCounter');
    if (buttons.length === 0) return;

    const updateCounter = () => {
      const visible = items.filter(
        (i) => !i.classList.contains('faq-hidden') && i.style.display !== 'none'
      );
      if (counter) counter.textContent = visible.length;
    };

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const cat = btn.dataset.category || 'all';

        items.forEach((item) => {
          const match = cat === 'all' || item.dataset.category === cat;
          item.classList.toggle('faq-hidden', !match);
          item.style.opacity = match ? '' : '0';
          item.style.display = match ? '' : 'none';
        });

        // Animação de fade-in
        requestAnimationFrame(() => {
          items
            .filter((i) => !i.classList.contains('faq-hidden'))
            .forEach((i) => (i.style.opacity = '1'));
        });

        updateCounter();
      });
    });

    updateCounter();
  };

  /* --------------------------------------------------------
   *  8. Busca no FAQ
   * ------------------------------------------------------ */
  const initFaqSearch = () => {
    const input = $('#faqSearch');
    const items = $$('.faq-item');
    const counter = $('#faqCounter');
    if (!input) return;

    const search = () => {
      const term = input.value.trim().toLowerCase();

      items.forEach((item) => {
        if (item.classList.contains('faq-hidden')) return; // respeita filtro de categoria

        const question = ($('.faq-question', item)?.textContent || '').toLowerCase();
        const answer = ($('.faq-answer', item)?.textContent || '').toLowerCase();
        const match = !term || question.includes(term) || answer.includes(term);

        item.style.display = match ? '' : 'none';
      });

      // Atualiza contador
      if (counter) {
        const visible = items.filter(
          (i) => !i.classList.contains('faq-hidden') && i.style.display !== 'none'
        );
        counter.textContent = visible.length;
      }
    };

    input.addEventListener('input', debounce(search, 300));
  };

  /* --------------------------------------------------------
   *  10. Animações de Scroll (Intersection Observer)
   * ------------------------------------------------------ */
  const initScrollAnimations = () => {
    const animClasses = [
      '.fade-in',
      '.slide-up',
      '.slide-left',
      '.slide-right',
      '.section-title',
      '.property-card',
      '.differential-card',
      '.team-card',
      '.stat-card',
      '.timeline-item',
      '.bank-card',
      '.blog-card',
      '.faq-item',
    ];

    const elements = $$(animClasses.join(','));
    if (elements.length === 0) return;

    // Agrupa elementos por pai para calcular stagger
    const parentMap = new Map();
    elements.forEach((el) => {
      const parent = el.parentElement;
      if (!parentMap.has(parent)) parentMap.set(parent, []);
      parentMap.get(parent).push(el);
    });

    // Aplica delay escalonado
    parentMap.forEach((children) => {
      children.forEach((child, i) => {
        child.style.transitionDelay = `${i * 0.1}s`;
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    elements.forEach((el) => observer.observe(el));
  };

  /* --------------------------------------------------------
   *  11. Contadores Animados
   * ------------------------------------------------------ */
  const initAnimatedCounters = () => {
    const counters = $$('.stat-number');
    if (counters.length === 0) return;

    const DURATION = 2000; // 2 segundos

    const animate = (el) => {
      const target = Number(el.dataset.target) || 0;
      const start = performance.now();

      const tick = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / DURATION, 1);
        const value = Math.floor(easeOutQuad(progress) * target);
        el.textContent = fmtNum(value);

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = fmtNum(target);
        }
      };

      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    counters.forEach((c) => observer.observe(c));
  };

  /* --------------------------------------------------------
   *  12. Validação do Formulário de Contato
   * ------------------------------------------------------ */
  const initContactForm = () => {
    const form = $('#contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Validação de campos obrigatórios
      const required = $$('[required]', form);
      let valid = true;

      required.forEach((field) => {
        field.classList.remove('input-error');
        if (!field.value.trim()) {
          field.classList.add('input-error');
          valid = false;
        }
      });

      if (!valid) return;

      // Mensagem de sucesso
      const successEl = document.createElement('div');
      successEl.className = 'form-success';
      successEl.innerHTML =
        '<p>✅ Mensagem enviada com sucesso! Entraremos em contato em breve.</p>';
      form.reset();
      form.appendChild(successEl);

      setTimeout(() => successEl.remove(), 5000);
    });
  };

  /* --------------------------------------------------------
   *  13. Simulador de Financiamento (SAC e PRICE)
   * ------------------------------------------------------ */
  const initFinancingCalculator = () => {
    const form = $('#simulatorForm');
    const result = $('#simulatorResult');
    if (!form || !result) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const propertyValue = parseFloat(form.querySelector('[name="propertyValue"]')?.value) || 0;
      const downPayment = parseFloat(form.querySelector('[name="downPayment"]')?.value) || 0;
      const annualRate = parseFloat(form.querySelector('[name="interestRate"]')?.value) || 0;
      const termYears = parseInt(form.querySelector('[name="loanTerm"]')?.value, 10) || 0;

      if (propertyValue <= 0 || termYears <= 0) {
        result.innerHTML = '<p class="calc-error">Preencha todos os campos corretamente.</p>';
        return;
      }

      const P = propertyValue - downPayment; // saldo devedor
      const r = annualRate / 100 / 12;       // taxa mensal
      const n = termYears * 12;              // total de parcelas

      if (P <= 0) {
        result.innerHTML = '<p class="calc-error">A entrada não pode ser maior que o valor do imóvel.</p>';
        return;
      }

      // --- Tabela PRICE ---
      let pricePayment = 0;
      if (r > 0) {
        pricePayment = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      } else {
        pricePayment = P / n;
      }
      const priceTotal = pricePayment * n;

      // --- Tabela SAC ---
      const sacAmort = P / n;                        // amortização fixa
      const sacFirst = sacAmort + P * r;             // primeira parcela
      const sacLast = sacAmort + sacAmort * r;       // última parcela (aprox.)
      const sacTotal = Array.from({ length: n }, (_, i) => sacAmort + (P - sacAmort * i) * r)
        .reduce((sum, v) => sum + v, 0);

      result.innerHTML = `
        <div class="calc-results">
          <div class="calc-card">
            <h4>Tabela PRICE</h4>
            <p><strong>Parcela fixa:</strong> ${fmtBRL(pricePayment)}</p>
            <p><strong>Total pago:</strong> ${fmtBRL(priceTotal)}</p>
            <p><strong>Juros pagos:</strong> ${fmtBRL(priceTotal - P)}</p>
          </div>
          <div class="calc-card">
            <h4>Tabela SAC</h4>
            <p><strong>Primeira parcela:</strong> ${fmtBRL(sacFirst)}</p>
            <p><strong>Última parcela:</strong> ${fmtBRL(sacLast)}</p>
            <p><strong>Total pago:</strong> ${fmtBRL(sacTotal)}</p>
            <p><strong>Juros pagos:</strong> ${fmtBRL(sacTotal - P)}</p>
          </div>
          <p class="calc-note">
            Simulação com base em ${n} parcelas, taxa de ${annualRate}% a.a.
            e financiamento de ${fmtBRL(P)}.
          </p>
        </div>
      `;
    });
  };

  /* --------------------------------------------------------
   *  14. Botão Voltar ao Topo
   * ------------------------------------------------------ */
  const initBackToTop = () => {
    const btn = $('.back-to-top');
    if (!btn) return;

    window.addEventListener(
      'scroll',
      () => btn.classList.toggle('visible', window.scrollY > 500),
      { passive: true }
    );

    btn.addEventListener('click', () =>
      window.scrollTo({ top: 0, behavior: 'smooth' })
    );
  };

  /* --------------------------------------------------------
   *  15. Animação de Loading
   * ------------------------------------------------------ */
  const initLoading = () => {
    setTimeout(() => document.body.classList.remove('loading'), 500);
  };

  /* --------------------------------------------------------
   *  16. Links WhatsApp e CTAs
   * ------------------------------------------------------ */
  const initWhatsAppLinks = () => {
    const WA_URL = 'https://wa.me/5511925312151';
    const CTA_URL = 'https://linkmagico.app.br/pricing';

    // Botões de WhatsApp
    $$('.btn-whatsapp').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(WA_URL, '_blank', 'noopener');
      });
    });

    // Botões de CTA (agendar, simular, reservar, comprar, proposta)
    const ctaKeywords = ['agendar', 'simular', 'reservar', 'comprar', 'proposta'];
    const ctaSelector = ctaKeywords
      .map((kw) => `.btn-${kw}, [data-action="${kw}"]`)
      .join(',');

    $$(ctaSelector).forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(CTA_URL, '_blank', 'noopener');
      });
    });

    // Fallback: captura qualquer botão cujo texto contenha as palavras-chave
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('a, button');
      if (!btn || btn.classList.contains('btn-whatsapp')) return;

      const text = (btn.textContent || '').toLowerCase();
      if (ctaKeywords.some((kw) => text.includes(kw))) {
        e.preventDefault();
        window.open(CTA_URL, '_blank', 'noopener');
      }
    });
  };

  /* --------------------------------------------------------
   *  17. Lazy Loading de Imagens
   * ------------------------------------------------------ */
  const initLazyImages = () => {
    const images = $$('img[data-src]');
    if (images.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: '200px' } // carrega antes de entrar na viewport
    );

    images.forEach((img) => observer.observe(img));
  };

  /* --------------------------------------------------------
   *  Inicialização Geral
   * ------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    // Signal to CSS that JS is running — this enables fade-in animations.
    // Without this class, all content stays visible (safe fallback).
    document.body.classList.add('js-ready');
    document.body.classList.remove('loading');
    initHeaderScroll();
    initMobileNav();
    initSmoothScroll();
    initPropertyFilter();
    initModals();
    initFaqAccordion();
    initFaqCategoryFilter();
    initFaqSearch();
    initScrollAnimations();
    initAnimatedCounters();
    initContactForm();
    initFinancingCalculator();
    initBackToTop();
    initWhatsAppLinks();
    initLazyImages();
  });
})();
