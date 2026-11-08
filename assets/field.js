/* Brotta field: ink particles drift as noise and settle into the sprout. */
(() => {
  const canvas = document.getElementById("field");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });
  // honours the system's reduced-motion setting; ?motion=1 forces the animation (for previews)
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches && !/[?&]motion=1/.test(location.search);
  const mode = canvas.dataset.mode || "sprout";      // "sprout" | "drift"
  const INK = "rgba(21,20,15,.42)";
  const G1 = "rgba(28,140,71,.95)";
  const G2 = "rgba(28,140,71,.5)";

  let W = 0, H = 0, dpr = 1, N = 0;
  let P = [];                 // particles
  let T = [];                 // targets [{x,y,tone}]
  let raf = 0, visible = true, hidden = false, last = 0;
  const mouse = { x: -1e5, y: -1e5 };

  /* ---- 3D gradient noise ---- */
  const perm = new Uint8Array(512);
  {
    const p = []; for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [p[i], p[j]] = [p[j], p[i]]; }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  }
  const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a, b, t) => a + (b - a) * t;
  const grad = (h, x, y, z) => { const g = h & 15, u = g < 8 ? x : y, v = g < 4 ? y : (g === 12 || g === 14 ? x : z); return ((g & 1) ? -u : u) + ((g & 2) ? -v : v); };
  function noise(x, y, z) {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
    x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
    const u = fade(x), v = fade(y), w = fade(z);
    const A = perm[X] + Y, AA = perm[A] + Z, AB = perm[A + 1] + Z, B = perm[X + 1] + Y, BA = perm[B] + Z, BB = perm[B + 1] + Z;
    return lerp(
      lerp(lerp(grad(perm[AA], x, y, z), grad(perm[BA], x - 1, y, z), u), lerp(grad(perm[AB], x, y - 1, z), grad(perm[BB], x - 1, y - 1, z), u), v),
      lerp(lerp(grad(perm[AA + 1], x, y, z - 1), grad(perm[BA + 1], x - 1, y, z - 1), u), lerp(grad(perm[AB + 1], x, y - 1, z - 1), grad(perm[BB + 1], x - 1, y - 1, z - 1), u), v), w);
  }

  /* ---- sprout silhouette sampled into target points ---- */
  function sampleSprout() {
    const S = 220, off = document.createElement("canvas");
    off.width = off.height = S;
    const o = off.getContext("2d");
    o.scale(S / 32, S / 32);
    // stem
    o.strokeStyle = "#f00"; o.lineWidth = 2.6; o.lineCap = "round";
    o.beginPath(); o.moveTo(16, 29); o.lineTo(16, 15); o.stroke();
    // right leaf
    o.fillStyle = "#f00";
    o.beginPath(); o.moveTo(16, 16); o.bezierCurveTo(16, 9.5, 20.6, 5, 27, 5); o.bezierCurveTo(27, 11.4, 22.5, 16, 16, 16); o.closePath(); o.fill();
    // left leaf (lighter tone)
    o.fillStyle = "#00f";
    o.beginPath(); o.moveTo(16, 19.5); o.bezierCurveTo(16, 14.6, 12.5, 11, 7.5, 11); o.bezierCurveTo(7.5, 16, 11.1, 19.5, 16, 19.5); o.closePath(); o.fill();

    const d = o.getImageData(0, 0, S, S).data, pts = [];
    for (let y = 0; y < S; y += 2) for (let x = 0; x < S; x += 2) {
      const i = (y * S + x) * 4;
      if (d[i + 3] > 120) pts.push({ x: x / S, y: y / S, tone: d[i + 2] > d[i] ? 2 : 1 });
    }
    // shuffle
    for (let i = pts.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pts[i], pts[j]] = [pts[j], pts[i]]; }
    return pts;
  }

  function layout() {
    const rect = canvas.getBoundingClientRect();
    W = Math.max(1, rect.width); H = Math.max(1, rect.height);
    dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const dense = mode === "sprout" ? 520 : 2600;
    N = Math.max(400, Math.min(mode === "sprout" ? 3200 : 900, Math.round(W * H / dense)));

    // where the sprout forms
    const narrow = W < 820;
    const s = narrow ? Math.min(W * 0.72, H * 0.38) : Math.min(W * 0.40, H * 0.70);
    const cx = narrow ? W * 0.5 : W * 0.70;
    const cy = narrow ? H * 0.30 : H * 0.47;
    const base = sampleSprout();
    const M = Math.round(N * 0.72);            // the rest stays loose ink, so the field never empties
    T = [];
    for (let i = 0; i < N; i++) {
      if (i >= M) { T.push(null); continue; }
      const b = base[i % base.length];
      T.push({ x: cx + (b.x - 0.5) * s + (Math.random() - .5) * 1.5, y: cy + (b.y - 0.5) * s + (Math.random() - .5) * 1.5, tone: b.tone });
    }
    // particles: keep existing where possible so a resize does not restart the scene
    const old = P; P = [];
    for (let i = 0; i < N; i++) {
      const q = old[i];
      P.push(q ? q : { x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, s: Math.random() * 1000 });
    }
  }

  /* coherence 0..1 over a 16 s cycle: noise, grow, hold, release */
  function coherence(t) {
    if (mode !== "sprout") return 0;
    const c = (t + 1.9) % 16;
    const sm = x => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
    if (c < 2.4) return 0;
    if (c < 7.4) return sm((c - 2.4) / 5);
    if (c < 12.6) return 1;
    return 1 - sm((c - 12.6) / 3.4);
  }

  function step(dt, t) {
    const k = coherence(t);
    const z = t * 0.07, ns = 0.0019, e = 0.35;
    const flow = (mode === "sprout" ? 46 : 22) * (1 - k) + 4;
    const r = 150, r2 = r * r;
    for (let i = 0; i < N; i++) {
      const p = P[i], tg = T[i];
      const nx = p.x * ns, ny = p.y * ns, zz = z + p.s * 0.0003;
      const cx = (noise(nx, ny + e, zz) - noise(nx, ny - e, zz)) / (2 * e);
      const cy = -(noise(nx + e, ny, zz) - noise(nx - e, ny, zz)) / (2 * e);
      const kk = tg ? k : 0, f = tg ? flow : flow * 0.6 + 10;
      let ax = cx * f + (tg ? (tg.x - p.x) * 9 * kk : 0) - p.vx * (4.5 + 2 * kk);
      let ay = cy * f + (tg ? (tg.y - p.y) * 9 * kk : 0) - p.vy * (4.5 + 2 * kk);
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < r2 && d2 > 0.01) { const d = Math.sqrt(d2), f = (1 - d / r) * 1400; ax += dx / d * f; ay += dy / d * f; }
      p.vx += ax * dt; p.vy += ay * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.x < -20) p.x += W + 40; else if (p.x > W + 20) p.x -= W + 40;
      if (p.y < -20) p.y += H + 40; else if (p.y > H + 20) p.y -= H + 40;
    }
    return k;
  }

  function draw(k) {
    ctx.clearRect(0, 0, W, H);
    const settled = k > 0.25;
    // ink pass
    ctx.fillStyle = INK;
    for (let i = 0; i < N; i++) {
      const p = P[i], tg = T[i];
      if (settled && tg) { const dx = tg.x - p.x, dy = tg.y - p.y; if (dx * dx + dy * dy < 30) continue; }
      ctx.fillRect(p.x, p.y, 1.6, 1.6);
    }
    if (!settled) return;
    // green passes
    for (const tone of [1, 2]) {
      ctx.fillStyle = tone === 1 ? G1 : G2;
      for (let i = 0; i < N; i++) {
        const p = P[i], tg = T[i];
        if (!tg || tg.tone !== tone) continue;
        const dx = tg.x - p.x, dy = tg.y - p.y;
        if (dx * dx + dy * dy >= 30) continue;
        ctx.fillRect(p.x - 0.5, p.y - 0.5, 2.5, 2.5);
      }
    }
  }

  let t0 = 0;
  function frame(now) {
    raf = 0;
    if (!visible || hidden) return;
    if (!t0) t0 = now;
    const t = (now - t0) / 1000;                       // scene clock follows real time
    const dt = Math.min(0.25, (now - last) / 1000 || 0.016);
    last = now;
    const n = Math.max(1, Math.ceil(dt / 0.034)), h = dt / n;   // sub-steps keep physics stable after a throttled frame
    let k = 0;
    for (let i = 0; i < n; i++) k = step(h, t - dt + h * (i + 1));
    draw(k);
    raf = requestAnimationFrame(frame);
  }
  function start() { if (!raf && !reduce) { last = performance.now(); raf = requestAnimationFrame(frame); } }

  function still() {
    // reduced motion: show the formed sprout, no animation
    if (mode !== "sprout") { for (const p of P) { p.x = Math.random() * W; p.y = Math.random() * H; } draw(0); return; }
    for (let i = 0; i < N; i++) {
      const p = P[i], tg = T[i];
      if (tg) { p.x = tg.x + (Math.random() - .5) * 3; p.y = tg.y + (Math.random() - .5) * 3; }
      else { p.x = Math.random() * W; p.y = Math.random() * H; }
    }
    draw(1);
  }

  let rt;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { layout(); if (reduce) still(); }, 120); });
  addEventListener("pointermove", ev => {
    const r = canvas.getBoundingClientRect();
    mouse.x = ev.clientX - r.left; mouse.y = ev.clientY - r.top;
  }, { passive: true });
  addEventListener("pointerleave", () => { mouse.x = mouse.y = -1e5; });
  document.addEventListener("visibilitychange", () => { hidden = document.hidden; if (!hidden) start(); });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) start(); }, { threshold: 0.02 }).observe(canvas);
  }

  layout();
  if (reduce) still(); else start();
})();
