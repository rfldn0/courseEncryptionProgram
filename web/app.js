// Course Encryption Program: static front-end for program.py.
// Behaviour follows "Course Encryption App v2" from the Claude Design project.
(() => {
  "use strict";

  const { ORIGINAL, COURSES, STATES, CODES } = window.CEP_DATA;
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];
  const isDigit = (c) => c >= "0" && c <= "9";

  // ---------------------------------------------------------------- cipher
  // Reverse table. Skips program.py's '' key (it can never match a character).
  const INV = {};
  for (const [k, v] of Object.entries(CODES)) if (k && v && !(v in INV)) INV[v] = k;
  // Keys whose code can't be reversed exactly: 'k' is dropped, the rest become digits.
  const LOSSY_KEYS = new Set(["k", "R", "r", "S", "T", "t", "U", "u", "a", "c"]);

  // Same as encrypt_file() in program.py.
  const encrypt = (text) => [...text].map((c) => (c in CODES ? CODES[c] : c)).join("");

  // Returns the text plus segments; `hl` marks digits that were turned back into letters.
  function decrypt(text, keepDigits) {
    const segs = [];
    let out = "", amb = 0;
    const push = (t, hl) => {
      const last = segs[segs.length - 1];
      if (last && last.hl === hl) last.t += t; else segs.push({ t, hl });
    };
    for (const c of text) {
      if (isDigit(c) && c in INV) {
        amb++;
        const t = keepDigits ? c : INV[c];
        out += t;
        push(t, !keepDigits);
      } else {
        const t = c in INV ? INV[c] : c;
        out += t;
        push(t, false);
      }
    }
    return { text: out, segs, amb };
  }

  // ---------------------------------------------------------------- sprites
  function sprite(src, frames, scale, dur, loop) {
    const w = 128 * scale;
    const el = document.createElement("div");
    el.className = "sprite";
    el.setAttribute("aria-hidden", "true");
    Object.assign(el.style, {
      width: w + "px",
      height: w + "px",
      backgroundImage: `url(${src})`,
      backgroundSize: `${frames * w}px ${w}px`,
      animation: `spr ${dur}s steps(${frames}) ${loop ? "infinite" : "1 forwards"}`,
    });
    el.style.setProperty("--end", `-${frames * w}px`);
    return el;
  }

  // One busy state at a time, like the design's runBusy().
  let busy = null;
  function runBusy(kind, ms, show, hide, fn) {
    if (busy) return;
    busy = kind;
    show();
    setTimeout(() => {
      busy = null;
      hide();
      fn();
    }, ms);
  }
  // Destroyer = quick inline check.
  function showInline(el, label) {
    const text = document.createElement("span");
    text.textContent = label;
    el.replaceChildren(sprite("assets/destroyer-shot.png", 8, 0.8, 0.9, true), text);
    el.hidden = false;
  }
  function hideInline(el) {
    el.hidden = true;
    el.replaceChildren();
  }

  // ---------------------------------------------------------------- boot
  function makeStars() {
    let seed = 11;
    const r = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 110; i++) {
      const x = r() * 100, y = r() * 100, big = r() > 0.85, tw = r() > 0.82;
      const center = x > 35 && x < 65 && y > 20 && y < 80; // dimmer behind the robot
      const s = document.createElement("i");
      s.className = "star";
      const size = big ? "3px" : "2px";
      Object.assign(s.style, {
        left: x + "%", top: y + "%", width: size, height: size,
        opacity: String(center ? 0.12 + r() * 0.15 : 0.3 + r() * 0.6),
      });
      if (tw && !center) s.style.animation = `twinkle ${(1.8 + r() * 2.4).toFixed(1)}s ${(r() * 2).toFixed(1)}s steps(4) infinite`;
      frag.appendChild(s);
    }
    $("#stars").appendChild(frag);
  }

  function boot() {
    const bootEl = $("#boot");
    const showApp = () => { $("#app").hidden = false; route(); };
    let seen = false;
    try { seen = sessionStorage.getItem("cep-booted") === "1"; } catch (_) {}
    if (seen) { bootEl.remove(); showApp(); return; }

    makeStars();
    const holder = $("#boot-sprite");
    holder.appendChild(sprite("assets/swordsman-enabling.png", 5, 3, 0.7, false));
    const t1 = setTimeout(() => holder.replaceChildren(sprite("assets/swordsman-idle.png", 5, 3, 0.8, true)), 700);

    const msgs = ["Loading courses…", "Loading 50 states…", "Loading code table…", "Ready."];
    let pct = 0, done = false, t2;
    const finish = () => {
      if (done) return;
      done = true;
      clearInterval(iv); clearTimeout(t1); clearTimeout(t2);
      try { sessionStorage.setItem("cep-booted", "1"); } catch (_) {}
      showApp();
      bootEl.classList.add("fade");
      setTimeout(() => bootEl.remove(), 300);
    };
    const iv = setInterval(() => {
      pct = Math.min(100, pct + 2);
      $("#boot-bar").style.width = pct + "%";
      $("#boot-msg").textContent = msgs[Math.min(3, Math.floor(pct / 34))];
      if (pct >= 100) { clearInterval(iv); t2 = setTimeout(finish, 500); }
    }, 50);
    $("#boot-skip").addEventListener("click", finish);
  }

  // ---------------------------------------------------------------- router
  const TITLES = { "/": "Home", "/cipher": "Encrypt / Decrypt", "/course": "Course info", "/quiz": "Capital quiz" };
  function route() {
    let path = location.hash.replace(/^#/, "") || "/";
    if (!(path in TITLES)) path = "/";
    for (const s of $$(".screen")) s.hidden = s.dataset.screen !== path;
    for (const a of $$(".side a")) {
      if (a.dataset.route === path) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    }
    $("#loc").textContent = (location.host || "localhost:5000") + path;
    document.title = path === "/" ? "Course Encryption Program" : `${TITLES[path]} · CEP`;
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);

  // ---------------------------------------------------------------- cipher workspace
  const st = {
    original: ORIGINAL,
    mode: "encrypt",
    input: { encrypt: ORIGINAL, decrypt: "" },
    ran: null,          // { mode, input } of the last run
    keepDigits: false,
    highlight: true,
    showTable: false,
  };
  const inEl = $("#cipher-in");

  // Prefer the real original.txt served by serve.py; fall back to the built-in copy.
  async function loadOriginal() {
    try {
      const res = await fetch("original.txt", { cache: "no-store" });
      if (res.ok) {
        const text = await res.text();
        if (st.input.encrypt === st.original) st.input.encrypt = text;
        st.original = text;
      }
    } catch (_) { /* opened from file:// */ }
    renderCipher();
  }

  function output() {
    const r = st.ran;
    if (!r) return null;
    if (r.mode === "encrypt") {
      const text = encrypt(r.input);
      return { text, segs: [{ t: text, hl: false }], amb: 0 };
    }
    return decrypt(r.input, st.keepDigits);
  }

  function renderCipher() {
    const enc = st.mode === "encrypt";
    const input = st.input[st.mode];
    if (inEl.value !== input) inEl.value = input;

    for (const t of $$(".tab")) t.setAttribute("aria-selected", String(t.dataset.mode === st.mode));
    $("#in-label").textContent = enc ? "Plain text" : "Encrypted text";
    $("#out-label").textContent = enc ? "Encrypted result" : "Decrypted result";
    $("#run").textContent = enc ? "Encrypt ↓" : "Decrypt ↓";
    $("#empty-msg").textContent = enc ? "Nothing to encrypt yet." : "Nothing to decrypt yet.";
    $("#in-empty").hidden = !!input.trim();

    // Output
    const out = output();
    const outEl = $("#cipher-out");
    if (out) {
      outEl.replaceChildren(...out.segs.map((s) => {
        if (!(s.hl && st.highlight)) return document.createTextNode(s.t);
        const span = document.createElement("span");
        span.className = "hl";
        span.textContent = s.t;
        return span;
      }));
    } else {
      outEl.innerHTML = '<span class="output-empty">Result appears here.</span>';
    }
    $("#out-actions").hidden = !out;
    $("#save").textContent = `Save ${enc ? "encrypted.txt" : "decrypted.txt"}`;
    $("#to-decrypt").hidden = !(enc && out);

    // Warning: before running when encrypting, after running when decrypting.
    let title = "", body = "";
    if (enc) {
      const kCount = [...input].filter((c) => c === "k").length;
      const passDigits = [...input].filter((c) => isDigit(c) && c in INV).length;
      if (kCount || passDigits) {
        title = "This text won't decrypt exactly.";
        body = [
          kCount ? `${kCount} "k" will be removed.` : "",
          passDigits ? `${passDigits} digit${passDigits > 1 ? "s" : ""} will come back as letters.` : "",
        ].filter(Boolean).join(" ");
      }
    } else if (out && out.amb) {
      title = `${out.amb} character${out.amb > 1 ? "s" : ""} may be wrong.`;
      body = st.keepDigits
        ? "Digits were kept as digits, so any encrypted R, r, S, T, t, U, u, a or c stay as numbers."
        : "Digits were turned back into letters (1→R, 2→r, 3→S, 9→a, 0→c …).";
    }
    $("#warn").hidden = !title;
    $("#warn-title").textContent = title;
    $("#warn-body").textContent = body;
    $("#warn-actions").hidden = enc || !title;
    $("#toggle-hl").textContent = st.highlight ? "Hide highlights" : "Highlight them";
    $("#toggle-keep").textContent = st.keepDigits ? "Turn digits into letters" : "Keep digits as digits";

    // Code table
    $("#table-aside").hidden = !st.showTable;
    $("#table-toggle").textContent = st.showTable ? "Code table ▸" : "Code table ◂";
    $("#table-toggle").setAttribute("aria-expanded", String(st.showTable));

    // Home status mirrors the encrypt input.
    const status = $("#home-status");
    const encIn = st.input.encrypt;
    status.textContent = encIn.trim()
      ? `● ready · ${encIn === st.original ? "original.txt" : encIn.length + " characters"} loaded`
      : "● empty · load a .txt file";
    status.classList.toggle("empty", !encIn.trim());
  }

  function renderTable() {
    const q = $("#table-q").value.trim();
    const grid = $("#table-grid");
    grid.replaceChildren();
    for (const [k, v] of Object.entries(CODES)) {
      if (!k || (q && k !== q && v !== q)) continue;
      const span = document.createElement("span");
      span.textContent = `${k === " " ? "␣" : k} → ${v === "" ? "∅" : v}`;
      if (LOSSY_KEYS.has(k)) span.className = "lossy";
      grid.appendChild(span);
    }
  }

  function setInput(text) {
    st.input[st.mode] = text;
    st.ran = null;
    renderCipher();
  }

  function initCipher() {
    inEl.addEventListener("input", () => { st.input[st.mode] = inEl.value; renderCipher(); });
    inEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); $("#run").click(); }
    });
    for (const t of $$(".tab")) {
      t.addEventListener("click", () => { st.mode = t.dataset.mode; st.ran = null; renderCipher(); });
    }

    // Infantryman = long task overlay.
    $("#run").addEventListener("click", () => {
      const input = st.input[st.mode];
      if (!input.trim()) return;
      const mode = st.mode;
      runBusy(mode, 1300,
        () => {
          $("#busy-label").textContent = mode === "decrypt" ? "Decrypting…" : "Encrypting…";
          $("#busy-sprite").replaceChildren(sprite("assets/infantryman-shot.png", 11, 2.5, 1.1, true));
          $("#busy-overlay").hidden = false;
        },
        () => { $("#busy-overlay").hidden = true; $("#busy-sprite").replaceChildren(); },
        () => { st.ran = { mode, input }; renderCipher(); });
    });

    const fileIn = $("#file-in");
    for (const b of $$("[data-pick-file]")) b.addEventListener("click", () => fileIn.click());
    const loadFile = (f) => {
      if (!/\.txt$/i.test(f.name) && f.type !== "text/plain") {
        $("#file-error-name").textContent = `${f.name} isn't a text file.`;
        $("#file-error").hidden = false;
        return;
      }
      f.text().then((t) => { $("#file-error").hidden = true; setInput(t); });
    };
    fileIn.addEventListener("change", (e) => {
      const f = e.target.files && e.target.files[0];
      e.target.value = "";
      if (f) loadFile(f);
    });
    inEl.addEventListener("dragover", (e) => e.preventDefault());
    inEl.addEventListener("drop", (e) => {
      const f = e.dataTransfer.files[0];
      if (f) { e.preventDefault(); loadFile(f); }
    });
    $("#file-error-close").addEventListener("click", () => { $("#file-error").hidden = true; });

    $("#use-orig").addEventListener("click", () =>
      setInput(st.mode === "encrypt" ? st.original : encrypt(st.original)));
    $("#clear").addEventListener("click", () => { setInput(""); inEl.focus(); });
    $("#toggle-hl").addEventListener("click", () => { st.highlight = !st.highlight; renderCipher(); });
    $("#toggle-keep").addEventListener("click", () => { st.keepDigits = !st.keepDigits; renderCipher(); });

    $("#save").addEventListener("click", () => {
      const out = output();
      if (!out) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([out.text], { type: "text/plain" }));
      a.download = st.mode === "encrypt" ? "encrypted.txt" : "decrypted.txt";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    $("#copy").addEventListener("click", () => {
      const out = output();
      if (!out || !navigator.clipboard) return;
      navigator.clipboard.writeText(out.text).then(() => {
        $("#copy").textContent = "Copied";
        setTimeout(() => { $("#copy").textContent = "Copy"; }, 1500);
      }, () => {});
    });
    $("#to-decrypt").addEventListener("click", () => {
      const out = output();
      if (!out) return;
      st.mode = "decrypt";
      st.input.decrypt = out.text;
      st.ran = null;
      renderCipher();
    });

    const toggleTable = () => { st.showTable = !st.showTable; renderCipher(); if (st.showTable) $("#table-q").focus(); };
    $("#table-toggle").addEventListener("click", toggleTable);
    $("#table-close").addEventListener("click", toggleTable);
    $("#table-q").addEventListener("input", renderTable);

    renderTable();
    renderCipher();
  }

  // ---------------------------------------------------------------- course info
  function initCourse() {
    const input = $("#course-in");
    const chips = $("#course-chips");
    for (const code of Object.keys(COURSES)) {
      const b = document.createElement("button");
      b.className = "chip";
      b.textContent = code;
      b.addEventListener("click", () => { input.value = code; lookup(); });
      chips.appendChild(b);
    }
    input.addEventListener("input", () => {
      const pos = input.selectionStart;
      input.value = input.value.toUpperCase();
      input.setSelectionRange(pos, pos);
    });
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") lookup(); });
    $("#lookup").addEventListener("click", lookup);

    function lookup() {
      const code = input.value.trim().toUpperCase();
      if (!code) return;
      $("#course-result").hidden = true;
      $("#course-miss").hidden = true;
      const busyEl = $("#course-busy");
      runBusy("course", 700, () => showInline(busyEl, "Looking up…"), () => hideInline(busyEl), () => {
        const c = COURSES[code];
        if (c) {
          const box = $("#course-result");
          const grid = document.createElement("div");
          grid.className = "course-grid";
          for (const [k, v, mono] of [["Course", code, true], ["Room number", c[0]], ["Instructor", c[1]], ["Meeting time", c[2]]]) {
            const a = document.createElement("span");
            a.className = "k";
            a.textContent = k;
            const b = document.createElement("span");
            if (mono) b.className = "mono";
            b.textContent = v;
            grid.append(a, b);
          }
          box.replaceChildren(grid);
          box.hidden = false;
        } else {
          const miss = $("#course-miss");
          const red = document.createElement("span");
          red.className = "t-error";
          red.textContent = `Course not found: "${code}".`;
          miss.replaceChildren(red, ` Available: ${Object.keys(COURSES).join(", ")}.`);
          miss.hidden = false;
        }
      });
    }
  }

  // ---------------------------------------------------------------- capital quiz
  function initQuiz() {
    const names = Object.keys(STATES);
    const pickState = (prev) => {
      let s;
      do { s = names[Math.floor(Math.random() * names.length)]; } while (s === prev);
      return s;
    };
    const q = { state: pickState(), phase: "ask", correct: 0, incorrect: 0, played: false };
    const input = $("#quiz-in");

    function render() {
      $("#score").innerHTML = `<span class="ok">${q.correct} ✓</span> · <span class="bad">${q.incorrect} ✗</span>`;
      $("#q-state").textContent = q.state;
      const locked = q.phase !== "ask" || busy === "quiz";
      input.disabled = locked;
      $("#check").disabled = locked;
      $("#quiz-active").hidden = q.phase === "ended";
      $("#quiz-ended").hidden = q.phase !== "ended";
      $("#final-score").textContent = `Final score: ${q.correct} correct, ${q.incorrect} incorrect`;
      $("#quiz-card-sub").textContent = q.played
        ? `Last score ${q.correct} / ${q.correct + q.incorrect} · Resume`
        : "50 states";
    }
    function hideFeedback() { $("#feedback").hidden = true; }

    function check() {
      const answer = input.value.trim();
      if (q.phase !== "ask" || !answer) return;
      const busyEl = $("#quiz-busy");
      hideFeedback();
      runBusy("quiz", 900,
        () => { showInline(busyEl, "Checking answer…"); render(); },
        () => hideInline(busyEl),
        () => {
          const right = STATES[q.state];
          const ok = answer.toLowerCase() === right.toLowerCase();
          q.phase = "answered";
          q.played = true;
          if (ok) q.correct++; else q.incorrect++;
          const fb = $("#feedback");
          fb.textContent = ok ? "Correct!" : `Incorrect. The capital of ${q.state} is ${right}.`;
          fb.className = `box feedback ${ok ? "ok" : "bad"}`;
          fb.hidden = false;
          render();
          $("#next-state").focus();
        });
    }
    function next() {
      q.state = pickState(q.state);
      q.phase = "ask";
      input.value = "";
      hideFeedback();
      render();
      input.focus();
    }

    $("#check").addEventListener("click", check);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") check(); });
    $("#next-state").addEventListener("click", next);
    $("#stop-quiz").addEventListener("click", () => { q.phase = "ended"; hideFeedback(); render(); $("#play-again").focus(); });
    $("#play-again").addEventListener("click", () => { q.correct = 0; q.incorrect = 0; next(); });
    render();
  }

  // ---------------------------------------------------------------- start
  window.CEP = { encrypt, decrypt }; // handy for console checks
  initCipher();
  initCourse();
  initQuiz();
  loadOriginal();
  boot();
})();
