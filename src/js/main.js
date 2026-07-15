document.addEventListener("DOMContentLoaded", () => {
  // --- SCROLL REVEAL ---
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal--visible");
      }
    });
  }, observerOptions);

  document.querySelectorAll(".reveal").forEach(el => {
    observer.observe(el);
  });

  // --- FAQ ACCORDION ---
  const faqItems = document.querySelectorAll(".faq__item");
  faqItems.forEach(item => {
    const question = item.querySelector(".faq__question");
    if (question) {
      question.addEventListener("click", () => {
        const isActive = item.classList.contains("faq__item--active");
        
        // Fechar todos
        faqItems.forEach(faq => {
          faq.classList.remove("faq__item--active");
          const ans = faq.querySelector(".faq__answer");
          if (ans) ans.style.maxHeight = null;
        });

        // Abrir se não estava ativo
        if (!isActive) {
          item.classList.add("faq__item--active");
          const ans = item.querySelector(".faq__answer");
          if (ans) ans.style.maxHeight = ans.scrollHeight + "px";
        }
      });
    }
  });



  // --- CARROSSEL DE DEPOIMENTOS NO MOBILE (rolagem automática + arrastar) ---
  const depoimentosContainer = document.querySelector(".depoimentos__carousel-container");
  const depoimentosTrack = document.querySelector(".depoimentos__track");

  if (depoimentosContainer && depoimentosTrack) {
    const mq = window.matchMedia("(max-width: 900px), (hover: none) and (pointer: coarse)");
    let animationId = null;
    let isPaused = false;
    let resumeTimeout = null;
    const SPEED = 0.4; // pixels por frame
    const RESUME_DELAY = 2500; // ms parado após o usuário soltar

    // Posição própria em ponto flutuante: scrollLeft é arredondado para inteiro
    // pelo navegador, então reler e somar 0.4px por quadro pode "travar" no
    // mesmo pixel. Guardamos o valor real aqui e só escrevemos no DOM.
    let scrollPos = depoimentosContainer.scrollLeft;

    function tick() {
      if (!mq.matches) {
        animationId = null;
        depoimentosContainer.scrollLeft = 0;
        return;
      }

      if (!isPaused) {
        const halfWidth = depoimentosTrack.scrollWidth / 2;
        scrollPos += SPEED;
        if (halfWidth > 0 && scrollPos >= halfWidth) {
          scrollPos -= halfWidth;
        }
        depoimentosContainer.scrollLeft = scrollPos;
      } else {
        // Usuário arrastou manualmente: sincroniza para continuar dali quando retomar
        scrollPos = depoimentosContainer.scrollLeft;
      }
      animationId = requestAnimationFrame(tick);
    }

    function startCarousel() {
      if (mq.matches && !animationId) {
        setTimeout(() => {
          animationId = requestAnimationFrame(tick);
        }, 100);
      }
    }

    function stopCarousel() {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    }

    function pause() {
      isPaused = true;
      clearTimeout(resumeTimeout);
    }

    function scheduleResume() {
      clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(() => {
        isPaused = false;
      }, RESUME_DELAY);
    }

    // Ouvir alterações de tamanho de tela/dispositivo
    mq.addEventListener("change", (e) => {
      if (e.matches) {
        startCarousel();
      } else {
        stopCarousel();
        depoimentosContainer.scrollLeft = 0;
      }
    });

    depoimentosContainer.addEventListener("touchstart", pause, { passive: true });
    depoimentosContainer.addEventListener("touchend", scheduleResume);
    depoimentosContainer.addEventListener("mousedown", pause);
    depoimentosContainer.addEventListener("mouseup", scheduleResume);
    depoimentosContainer.addEventListener("scroll", () => {
      // Também faz o loop quando o usuário arrasta manualmente até o fim,
      // não só durante a rolagem automática
      const halfWidth = depoimentosTrack.scrollWidth / 2;
      if (halfWidth > 0 && depoimentosContainer.scrollLeft >= halfWidth) {
        depoimentosContainer.scrollLeft -= halfWidth;
        scrollPos = depoimentosContainer.scrollLeft;
      }
      if (isPaused) scheduleResume();
    });

    // Iniciar se corresponder no carregamento
    if (mq.matches) {
      if (document.readyState === "complete") {
        startCarousel();
      } else {
        window.addEventListener("load", startCarousel);
      }
    }
  }

  // --- WHATSAPP FORM SUBMISSION ---
  const forms = document.querySelectorAll("[data-whatsapp-form]");
  if (forms.length) {
    forms.forEach(form => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!validateForm(form)) return;

        const phone = form.dataset.whatsappPhone || "5519992624315";
        const submitBtn = form.querySelector('[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        const fields = Array.from(form.querySelectorAll("[data-label]"));

        const lines = fields
          .filter(field => field.value.trim() !== "")
          .map(field => `*${field.dataset.label}:* ${field.value.trim()}`);

        const formTitle = form.dataset.whatsappTitle || "Formulário";
        const message = `*${formTitle}*\n\n${lines.join("\n")}`;

        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

        showSuccess(form);
        window.open(url, "_blank");
      });
    });
  }

  function validateForm(form) {
    let valid = true;
    const required = form.querySelectorAll("[required]");

    required.forEach(field => {
      field.classList.remove("is-error");
      const errorEl = form.querySelector(`[data-error-for="${field.id}"]`);

      if (!field.value.trim()) {
        valid = false;
        field.classList.add("is-error");
        if (errorEl) errorEl.style.display = "flex";
      } else {
        if (errorEl) errorEl.style.display = "none";
      }
    });

    return valid;
  }

  function showSuccess(form) {
    const successEl = form.querySelector(".form__success");
    if (successEl) {
      form.querySelectorAll(".form__group, .form__row, [type='submit'], .form__privacy").forEach(el => {
        el.style.display = "none";
      });
      successEl.classList.add("is-visible");
    }
  }
});
