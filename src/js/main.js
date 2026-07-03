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
