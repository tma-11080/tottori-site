(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     Mobile nav toggle
     --------------------------------------------------------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------------------------------------------------
     Scroll reveal
     --------------------------------------------------------- */
  var revealEls = document.querySelectorAll("[data-reveal]");

  if ("IntersectionObserver" in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------------------------------------------------------
     Pun crossfade (鳥取県 -> 星取県) when the night section is in view
     --------------------------------------------------------- */
  var starsSection = document.getElementById("stars-section");
  if (starsSection && "IntersectionObserver" in window) {
    var punObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          starsSection.classList.toggle("in-view", entry.isIntersecting);
        });
      },
      { threshold: 0.45 }
    );
    punObserver.observe(starsSection);
  }

  /* ---------------------------------------------------------
     Sky: day -> night gradient crossfade driven by scroll progress
     --------------------------------------------------------- */
  var skyGradient = document.querySelector(".sky-gradient");
  var starsCanvas = document.getElementById("stars");
  var ticking = false;

  function updateSky() {
    ticking = false;
    var doc = document.documentElement;
    var scrollTop = window.scrollY || doc.scrollTop;
    var max = (doc.scrollHeight - window.innerHeight) || 1;
    var progress = Math.min(Math.max(scrollTop / max, 0), 1);

    // stars fade in from ~35% down the page and are fully visible by ~85%
    var starProgress = Math.min(Math.max((progress - 0.32) / 0.5, 0), 1);
    if (starsCanvas) starsCanvas.style.opacity = String(starProgress);
    if (skyGradient) skyGradient.style.opacity = String(1 - starProgress * 0.92);
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateSky);
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateSky();

  /* ---------------------------------------------------------
     Starfield canvas
     --------------------------------------------------------- */
  if (starsCanvas && starsCanvas.getContext) {
    var ctx = starsCanvas.getContext("2d");
    var stars = [];
    var W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);
    var shootingStar = null;
    var lastShoot = 0;

    function resizeCanvas() {
      W = window.innerWidth;
      H = window.innerHeight;
      starsCanvas.width = W * DPR;
      starsCanvas.height = H * DPR;
      starsCanvas.style.width = W + "px";
      starsCanvas.style.height = H + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      buildStars();
    }

    function buildStars() {
      var count = Math.round((W * H) / 9000);
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H * 0.9,
          r: Math.random() * 1.3 + 0.3,
          baseAlpha: Math.random() * 0.6 + 0.3,
          twinkleSpeed: Math.random() * 0.015 + 0.004,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    function maybeSpawnShootingStar(time) {
      if (shootingStar || reduceMotion) return;
      if (time - lastShoot > 4200 && Math.random() < 0.01) {
        lastShoot = time;
        var startX = Math.random() * W * 0.6 + W * 0.2;
        shootingStar = {
          x: startX,
          y: Math.random() * H * 0.25,
          vx: 6.5,
          vy: 3.2,
          life: 0,
          maxLife: 40
        };
      }
    }

    function drawShootingStar() {
      if (!shootingStar) return;
      shootingStar.x += shootingStar.vx;
      shootingStar.y += shootingStar.vy;
      shootingStar.life++;

      var alpha = 1 - shootingStar.life / shootingStar.maxLife;
      ctx.save();
      ctx.strokeStyle = "rgba(248,243,230," + Math.max(alpha, 0) + ")";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(shootingStar.x, shootingStar.y);
      ctx.lineTo(shootingStar.x - shootingStar.vx * 6, shootingStar.y - shootingStar.vy * 6);
      ctx.stroke();
      ctx.restore();

      if (shootingStar.life >= shootingStar.maxLife) shootingStar = null;
    }

    function frame(time) {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var alpha = reduceMotion
          ? s.baseAlpha
          : s.baseAlpha + Math.sin(time * s.twinkleSpeed + s.phase) * 0.25;
        ctx.beginPath();
        ctx.fillStyle = "rgba(248,243,230," + Math.max(alpha, 0.08) + ")";
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      maybeSpawnShootingStar(time);
      drawShootingStar();
      window.requestAnimationFrame(frame);
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    window.requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------
     Sand ripple canvas (dunes section)
     --------------------------------------------------------- */
  var rippleCanvas = document.getElementById("ripples");
  if (rippleCanvas && rippleCanvas.getContext && !reduceMotion) {
    var rctx = rippleCanvas.getContext("2d");
    var rW = 0, rH = 0, rDPR = Math.min(window.devicePixelRatio || 1, 2);
    var lines = 7;

    function resizeRipples() {
      var rect = rippleCanvas.parentElement.getBoundingClientRect();
      rW = rect.width;
      rH = rect.height;
      rippleCanvas.width = rW * rDPR;
      rippleCanvas.height = rH * rDPR;
      rippleCanvas.style.width = rW + "px";
      rippleCanvas.style.height = rH + "px";
      rctx.setTransform(rDPR, 0, 0, rDPR, 0, 0);
    }

    function drawRipples(time) {
      rctx.clearRect(0, 0, rW, rH);
      for (var i = 0; i < lines; i++) {
        var yBase = (rH / (lines + 1)) * (i + 1);
        var amp = 10 + i * 1.4;
        var freq = 0.006 + i * 0.0006;
        var speed = 0.0004 + i * 0.00005;

        rctx.beginPath();
        for (var x = 0; x <= rW; x += 8) {
          var y = yBase + Math.sin(x * freq + time * speed * (i % 2 === 0 ? 1 : -1)) * amp;
          if (x === 0) rctx.moveTo(x, y);
          else rctx.lineTo(x, y);
        }
        rctx.strokeStyle = "rgba(220,184,119," + (0.12 + i * 0.015) + ")";
        rctx.lineWidth = 1;
        rctx.stroke();
      }
      window.requestAnimationFrame(drawRipples);
    }

    window.addEventListener("resize", resizeRipples);
    resizeRipples();
    window.requestAnimationFrame(drawRipples);
  }
})();
