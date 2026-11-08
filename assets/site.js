(() => {
  const WHATSAPP = "5511912728420";
  const wa = msg => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
  document.querySelectorAll(".wa-link").forEach(a => { a.href = wa(a.dataset.msg || "Olá, Brotta!"); a.target = "_blank"; a.rel = "noopener"; });
  const yr = document.getElementById("yr"); if (yr) yr.textContent = new Date().getFullYear();

  // nav: solid after the first scroll, floating WhatsApp after the banner
  const nav = document.getElementById("nav"), fl = document.getElementById("waFloat");
  const onScroll = () => {
    const y = scrollY;
    if (nav) nav.classList.toggle("scrolled", y > 12);
    if (fl) fl.classList.toggle("show", y > innerHeight * 0.8);
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // mobile menu
  const btn = document.getElementById("menuBtn"), menu = document.getElementById("menu");
  if (btn && menu) {
    const set = open => { btn.setAttribute("aria-expanded", open); menu.classList.toggle("open", open); document.body.classList.toggle("menu-open", open); btn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu"); };
    btn.addEventListener("click", () => set(btn.getAttribute("aria-expanded") !== "true"));
    menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => set(false)));
    addEventListener("keydown", e => { if (e.key === "Escape") set(false); });
  }
})();
