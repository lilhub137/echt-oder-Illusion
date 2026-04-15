document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // 1) SCROLL REVEAL (plopp)
  // =========================
  const revealEls = document.querySelectorAll(".reveal, .scene");

  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add("is-visible");
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  revealEls.forEach(el => revealObs.observe(el));

  // =========================
  // 2) HERO PARALLAX (leicht)
  // =========================
  const particles = document.querySelector(".bg-particles");
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    if(particles){
      particles.style.transform = `translateY(${y * 0.06}px)`;
    }
  });

  // =========================
  // 3) MINI GAME (2 Chancen)
  // =========================
  const img = document.getElementById("gameImage");
  const feedback = document.getElementById("feedback");
  const nextBtn = document.getElementById("nextBtn");
  const btnReal = document.getElementById("btnReal");
  const btnFake = document.getElementById("btnFake");
  const gameBox = document.getElementById("gameBox");
  const canvas = document.getElementById("confettiCanvas");

  // Game ist optional – wenn nicht da, überspringen
  const gameOk = img && feedback && nextBtn && btnReal && btnFake && gameBox && canvas;

  let quizItems = [
    // Du kannst später mehr Bilder hinzufügen:
    // { src: "./assets/xxxx.jpg", answer: "real" },
    { src: "./assets/SelbsttestzumVergleich.png", answer: "fake" }
  ];

  let current = 0;
  let locked = false;
  let attemptsLeft = 2;

  // Confetti
  let confetti = [];
  let rafId = null;
  let ctx = null;

  function fitCanvas(){
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * devicePixelRatio);
    canvas.height = Math.floor(rect.height * devicePixelRatio);
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }

  function stopConfetti(){
    if(rafId) cancelAnimationFrame(rafId);
    rafId = null;
    confetti = [];
    if(canvas) canvas.style.display = "none";
  }

  function fireConfetti(){
    if(!gameOk) return;
    if(!ctx) ctx = canvas.getContext("2d");

    fitCanvas();
    canvas.style.display = "block";

    const w = canvas.getBoundingClientRect().width;
    const h = canvas.getBoundingClientRect().height;

    confetti = [];
    const count = 120;

    for(let i=0;i<count;i++){
      confetti.push({
        x: Math.random() * w,
        y: -20 - Math.random() * 40,
        size: 4 + Math.random() * 4,
        vy: 2 + Math.random() * 4,
        vx: -1.4 + Math.random() * 2.8,
        rot: Math.random() * Math.PI,
        vr: -0.18 + Math.random() * 0.36,
        life: 90 + Math.floor(Math.random() * 40)
      });
    }

    if(rafId) cancelAnimationFrame(rafId);
    animateConfetti();
  }

  function animateConfetti(){
    const w = canvas.getBoundingClientRect().width;
    const h = canvas.getBoundingClientRect().height;
    ctx.clearRect(0,0,w,h);

    confetti.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life--;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);

      const mod = p.life % 3;
      ctx.fillStyle = mod === 0 ? "rgba(255,120,180,.95)" : (mod === 1 ? "rgba(20,20,20,.9)" : "rgba(255,255,255,.95)");
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);

      ctx.restore();
    });

    confetti = confetti.filter(p => p.life > 0 && p.y < h + 50);

    if(confetti.length > 0){
      rafId = requestAnimationFrame(animateConfetti);
    }else{
      canvas.style.display = "none";
    }
  }

  function loadItem(){
    if(!gameOk) return;

    locked = false;
    attemptsLeft = 2;

    feedback.textContent = "";
    feedback.className = "";
    nextBtn.style.display = "none";

    gameBox.classList.remove("correct", "wrong");
    stopConfetti();

    img.src = quizItems[current].src;
  }

  function markWrong(){
    gameBox.classList.remove("wrong");
    void gameBox.offsetWidth;
    gameBox.classList.add("wrong");
  }

  function markCorrect(){
    gameBox.classList.remove("correct");
    void gameBox.offsetWidth;
    gameBox.classList.add("correct");
  }

  function check(choice){
    if(!gameOk || locked) return;

    const correct = (choice === quizItems[current].answer);

    if(correct){
      locked = true;
      markCorrect();
      feedback.className = "good";
      feedback.textContent = "Richtig! Du hast den Fake-Moment erkannt.";
      fireConfetti();

      setTimeout(() => {
        feedback.className = "";
        feedback.innerHTML =
          "<strong>Reflexion</strong><br><br>" +
          "Die Entscheidung ist oft schwer, weil Perfektion echt wirken soll. " +
          "Genau deshalb lohnt es sich, kurz zu stoppen und genauer hinzusehen.";
      }, 950);

      nextBtn.style.display = (current < quizItems.length - 1) ? "inline-block" : "none";
      return;
    }

    // falsch
    attemptsLeft--;

    if(attemptsLeft === 1){
      markWrong();
      feedback.className = "bad";
      feedback.textContent = "Fast! Du hast noch 1 Chance. Tipp: Schau auf Details, Kanten, Licht, Unstimmigkeiten.";
      return;
    }

    locked = true;
    markWrong();
    feedback.className = "bad";
    feedback.textContent = "Leider falsch. Genau so wirkt Illusion: überzeugend – bis man genauer hinsieht.";

    setTimeout(() => {
      feedback.className = "";
      feedback.innerHTML =
        "<strong>Reflexion</strong><br><br>" +
        "Wenn wir uns täuschen lassen, liegt es oft nicht an uns – sondern an Bildern, " +
        "die extra dafür gemacht sind, echt zu wirken.";
    }, 1100);

    nextBtn.style.display = (current < quizItems.length - 1) ? "inline-block" : "none";
  }

  function next(){
    if(!gameOk) return;
    if(current < quizItems.length - 1){
      current++;
      loadItem();
    }
  }

  if(gameOk){
    ctx = canvas.getContext("2d");
    window.addEventListener("resize", () => { fitCanvas(); });
    btnReal.addEventListener("click", () => check("real"));
    btnFake.addEventListener("click", () => check("fake"));
    nextBtn.addEventListener("click", next);
    loadItem();
  }

  // =========================
  // 4) PL0PP / POP Funktion
  // =========================
  const popArea = document.getElementById("popArea");

  function popButton(btn){
    if(!btn) return;
    btn.classList.remove("btn-pop");
    void btn.offsetWidth;
    btn.classList.add("btn-pop");
  }

  function makePop(){
    if(!popArea) return;

    const ring = document.createElement("div");
    ring.className = "pop-ring";
    popArea.appendChild(ring);
    setTimeout(() => ring.remove(), 600);

    const pieces = 14;
    const colors = [
      "rgba(255,120,180,.95)",
      "rgba(190,120,255,.90)",
      "rgba(255,220,235,.95)"
    ];

    for(let i=0;i<pieces;i++){
      const c = document.createElement("span");
      c.className = "mini-confetti";
      c.style.setProperty("--dx", (Math.random()*180 - 90) + "px");
      c.style.setProperty("--dy", (Math.random()*140 - 70) + "px");
      c.style.background = colors[Math.floor(Math.random()*colors.length)];
      popArea.appendChild(c);
      setTimeout(() => c.remove(), 900);
    }
  }

  // =========================
  // 5) FINAL CHOICE
  // =========================
  const btnReflect = document.getElementById("btnReflect");
  const btnKeepScrolling = document.getElementById("btnKeepScrolling");
  const finalFeedback = document.getElementById("finalFeedback");

  function lockFinal(){
    if(btnReflect) btnReflect.disabled = true;
    if(btnKeepScrolling) btnKeepScrolling.disabled = true;
  }

  if(btnReflect && btnKeepScrolling && finalFeedback){
    btnReflect.addEventListener("click", () => {
      popButton(btnReflect);
      makePop();
      finalFeedback.innerHTML =
        "✅ Du stoppst den Automatismus.<br><strong>Du wählst bewusst – und das ist Stärke.</strong>";
      lockFinal();
    });

    btnKeepScrolling.addEventListener("click", () => {
      popButton(btnKeepScrolling);
      makePop();
      finalFeedback.innerHTML =
        "⚠️ Scrollen ist leicht – hinterfragen ist stärker.<br><strong>Du kannst jederzeit wieder umkehren.</strong>";
      lockFinal();
    });
  }

  // =========================
  // 6) FRAGEN: Klick -> Antwort
  // =========================
  const qButtons = document.querySelectorAll(".q-btn");
  const qAnswer = document.getElementById("qAnswer");

  const answers = [
    "💡 **Wenn etwas „zu perfekt“ wirkt, fehlt oft das Menschliche.** Achte auf Glätte ohne Struktur: Haut ohne Poren, Augen ohne Tiefe, symmetrische Gesichter, unlogische Details oder Licht, das nicht passt. Und das Wichtigste: Hör auf dein Gefühl. Wenn dein Körper „komisch“ sagt, ist das ein Signal. Du musst nicht beweisen, dass es Fake ist – es reicht, dass du es hinterfragst.",
    "🫶 **Dein Selbstbild ist kein Fehler – es reagiert nur auf Vergleich.** Wenn du nach 10 Minuten Scrollen unruhiger wirst oder dich kleiner fühlst: Das ist Wirkung. Mach daraus ein Stop-Signal: Handy kurz weg, atmen, einmal real um dich schauen. Du bist kein „Vorher–Nachher“. Du bist ein Mensch. Und du bist genug.",
    "🌿 **Gute Inhalte fühlen sich nach dir an – nicht nach Druck.** Frag dich: Gibt mir das Ruhe, Hoffnung, Inspiration? Oder macht es mich nervös, neidisch, leer? Du darfst auswählen. Dein Feed ist dein Raum – und du entscheidest, was dort bleiben darf.",
    "✨ **Entfolgen ist Selbstrespekt, kein Drama.** Wenn dir etwas jedes Mal das Gefühl gibt, nicht zu reichen, ist das kein „Motivation“-Content – es ist Stress. Entfolgen heißt: Ich schütze mich. Ich entscheide. Ich mache Platz für Echtes."
  ];

  qButtons.forEach((btn, idx) => {
    btn.addEventListener("click", () => {
      popButton(btn);
      makePop();
      if(!qAnswer) return;

      qAnswer.classList.remove("show");
      qAnswer.innerHTML = answers[idx] || "";
      void qAnswer.offsetWidth;
      qAnswer.classList.add("show");
    });
  });
});







// ===== Bild-Plopp bei Scroll (hoch & runter) =====
const plopImages = document.querySelectorAll(".plop-img");

const plopObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      } else {
        entry.target.classList.remove("visible"); // wichtig für Hochscrollen
      }
    });
  },
  { threshold: 0.45 }
);

plopImages.forEach(img => plopObserver.observe(img));









// ===== Durchgehend "Plopp" beim Scrollen =====
const imgs = document.querySelectorAll(".scene img");

// throttle, damit es nicht laggt
let scrollTimer = null;

function triggerScrollPop(){
  // Nur Bilder, die gerade sichtbar sind
  imgs.forEach(img => {
    const rect = img.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.85 && rect.bottom > window.innerHeight * 0.15;

    if(inView){
      img.classList.remove("scroll-pop");
      void img.offsetWidth; // restart animation
      img.classList.add("scroll-pop");
    }
  });
}

// bei Scroll: nur alle 120ms ausführen (performance)
window.addEventListener("scroll", () => {
  if(scrollTimer) return;

  scrollTimer = setTimeout(() => {
    triggerScrollPop();
    scrollTimer = null;
  }, 120);
}, { passive: true }); 