/*
  Easter egg Beez : cinq abeilles s'échappent et traversent l'écran,
  en clin d'œil à Beez Adventures. Il faut les rattraper (clic ou tap).
  Les cinq attrapées, un second trophée s'affiche.

  Déclencheurs :
  - Clavier : taper le mot « beez » sur la page.
  - Tactile / souris : toucher le petit repère « Beez Adventures » de
    la frise du parcours (l'élément porte l'attribut data-beez-trigger).

  S'appuie sur scripts/easter-egg.js (à charger avant) pour le trophée
  et les sons : window.claraPortfolioEgg.

  Son : un « pop » synthétisé à chaque abeille attrapée, et un
  bourdonnement (audio/bee-buzzing.mp3, voir audio/LICENSE.txt) à la
  capture de la cinquième, juste avant le trophée.

  Accessibilité : le jeu est purement décoratif et au pointeur. Les
  abeilles et le compteur sont masqués aux lecteurs d'écran, aucun
  focus n'est volé. Avec prefers-reduced-motion, les abeilles ne volent
  pas : elles se posent à l'écran, sans battement d'ailes, et restent
  attrapables.
*/
(function () {
  "use strict";

  var BEE_COUNT = 5;
  var STAGGER = 700;          // délai entre deux abeilles lâchées (ms)
  var CROSSING_MIN = 9000;    // traversée de l'écran : de 9 s...
  var CROSSING_RANGE = 4000;  // ... à 13 s
  var STATIC_LIFE = 20000;    // durée de présence si les animations sont réduites (ms)
  var HUD_LINGER = 2500;      // le compteur reste affiché après la fin (ms)
  var WORD = ["b", "e", "e", "z"];

  // Bourdonnement de la dernière capture. Le chemin est calculé à partir
  // de l'emplacement de ce script (comme i18n.js), pas de la page.
  var BUZZ_PATH = "../audio/bee-buzzing.mp3";
  var BUZZ_VOLUME = 0.6;
  var scriptUrl = document.currentScript && document.currentScript.src;

  // Contenu du second trophée (clés dans data/i18n.json).
  var TROPHY = {
    label: { key: "easteregg.label", fallback: "Trophée débloqué" },
    name: { key: "easteregg.beez.name", fallback: "Retour à la ruche" },
    text: {
      key: "easteregg.beez.text",
      fallback: "Les 5 abeilles sont rentrées à la ruche. Beez peut reprendre sa mission."
    }
  };

  // Beez, de profil : tête ronde, antennes à bout noir, joues violettes,
  // ailes bleu pâle, abdomen rayé. Les couleurs sont des variables CSS
  // définies dans beez-egg.css (c'est une illustration : elle ne change
  // pas avec le thème clair / sombre).
  var BEE_SVG =
    '<svg viewBox="0 0 80 56" focusable="false">' +
    '<g class="beez-bee__wings">' +
    '<ellipse class="beez-bee__wing" cx="30" cy="14" rx="8" ry="13" transform="rotate(-15 30 24)"/>' +
    '<ellipse class="beez-bee__wing beez-bee__wing--back" cx="41" cy="15" rx="7" ry="12" transform="rotate(12 41 24)"/>' +
    "</g>" +
    '<path class="beez-bee__legs" d="M22 46v6M29 47v6M36 46v6"/>' +
    '<path class="beez-bee__black" d="M9 31L1 34L9 37Z"/>' +
    '<ellipse class="beez-bee__yellow" cx="29" cy="34" rx="21" ry="14"/>' +
    '<path class="beez-bee__black" d="M19 21.7A21 14 0 0 1 24 20.4L24 47.6A21 14 0 0 1 19 46.3Z"/>' +
    '<path class="beez-bee__black" d="M30 20A21 14 0 0 1 35 20.6L35 47.4A21 14 0 0 1 30 48Z"/>' +
    '<path class="beez-bee__antennae" d="M52 19Q50 11 46 8M60 19Q62 11 66 8"/>' +
    '<circle class="beez-bee__black" cx="46" cy="8" r="2.4"/>' +
    '<circle class="beez-bee__black" cx="66" cy="8" r="2.4"/>' +
    '<circle class="beez-bee__yellow-light" cx="56" cy="32" r="14"/>' +
    '<circle class="beez-bee__black" cx="61" cy="29" r="3.2"/>' +
    '<circle class="beez-bee__white" cx="62" cy="28" r="1"/>' +
    '<ellipse class="beez-bee__blush" cx="56" cy="37" rx="3.2" ry="2"/>' +
    '<path class="beez-bee__smile" d="M61 37q2.5 2 5 .2"/>' +
    "</svg>";

  // Nid d'abeilles : cinq alvéoles (une par abeille), accolées. Elles
  // s'habillent des tokens du site (voir .beez-hud__icon dans
  // beez-egg.css), donc suivent le thème clair / sombre.
  var HONEYCOMB_SVG =
    '<svg viewBox="0 0 24 24" focusable="false">' +
    '<polygon points="8.50,4.93 12.00,6.95 12.00,10.99 8.50,13.01 5.00,10.99 5.00,6.95"/>' +
    '<polygon points="15.50,4.93 19.00,6.95 19.00,10.99 15.50,13.01 12.00,10.99 12.00,6.95"/>' +
    '<polygon points="5.00,10.99 8.50,13.01 8.50,17.05 5.00,19.07 1.50,17.05 1.50,13.01"/>' +
    '<polygon points="12.00,10.99 15.50,13.01 15.50,17.05 12.00,19.07 8.50,17.05 8.50,13.01"/>' +
    '<polygon points="19.00,10.99 22.50,13.01 22.50,17.05 19.00,19.07 15.50,17.05 15.50,13.01"/>' +
    "</svg>";

  document.addEventListener("DOMContentLoaded", function () {
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    var layer = document.createElement("div");
    layer.className = "beez-layer";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);

    var active = false;
    var bees = [];
    var caught = 0;
    var resolved = 0; // abeilles attrapées OU parties
    var rafId = null;
    var lastTime = 0;
    var hud = null;
    var hudCount = null;

    /* ---------- Bourdonnement ---------- */

    var buzz = null;

    // Chargé au lâcher des abeilles (pas au chargement de la page) : il
    // est prêt à la dernière capture, et ne coûte rien à qui ne joue pas.
    function prepareBuzz() {
      if (buzz || !scriptUrl || typeof Audio === "undefined") {
        return;
      }
      try {
        buzz = new Audio(new URL(BUZZ_PATH, scriptUrl).href);
        buzz.preload = "auto";
        buzz.volume = BUZZ_VOLUME;
        buzz.load();
      } catch (err) {
        buzz = null; // l'audio n'est jamais critique
      }
    }

    function playBuzz() {
      if (!buzz) {
        return;
      }
      try {
        buzz.currentTime = 0;
        var started = buzz.play();
        if (started && started.catch) {
          started.catch(function () {});
        }
      } catch (err) {
        // On ignore silencieusement.
      }
    }

    /* ---------- Compteur ---------- */

    function renderHud() {
      hudCount.textContent = caught + " / " + BEE_COUNT;
    }

    function showHud() {
      if (hud) {
        hud.remove();
      }
      hud = document.createElement("div");
      hud.className = "beez-hud";
      hud.setAttribute("aria-hidden", "true");
      hud.innerHTML = '<span class="beez-hud__icon">' + HONEYCOMB_SVG + '</span><span class="beez-hud__count"></span>';
      hudCount = hud.querySelector(".beez-hud__count");
      renderHud();
      document.body.appendChild(hud);
      void hud.offsetWidth;
      hud.classList.add("beez-hud--visible");
    }

    function pulseHud() {
      hud.classList.remove("beez-hud--pulse");
      void hud.offsetWidth;
      hud.classList.add("beez-hud--pulse");
    }

    function hideHud() {
      var leaving = hud;
      if (!leaving) {
        return;
      }
      leaving.classList.remove("beez-hud--visible");
      window.setTimeout(function () {
        leaving.remove();
        if (hud === leaving) {
          hud = null;
        }
      }, 300);
    }

    /* ---------- Abeilles ---------- */

    function place(bee, progress) {
      var x = bee.startX + (bee.endX - bee.startX) * progress;
      var y = bee.baseY + bee.amplitude * Math.sin(bee.phase + progress * bee.cycles * Math.PI * 2);
      bee.el.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
    }

    function spawnBee(index) {
      var el = document.createElement("span");
      el.className = "beez-bee";
      var sprite = document.createElement("span");
      sprite.className = "beez-bee__sprite";
      sprite.innerHTML = BEE_SVG;
      el.appendChild(sprite);
      layer.appendChild(el);

      var width = window.innerWidth;
      var height = window.innerHeight;
      var size = el.offsetWidth;
      var clearance = 96; // sous la navbar fixe
      var minY = Math.min(clearance, height / 3);
      var maxY = Math.max(minY + 1, height - size - 24);

      var bee = { el: el, done: false, age: 0 };

      if (reducedMotion.matches) {
        // Posée : réparties sur la largeur, hauteur au hasard.
        bee.isStatic = true;
        bee.life = STATIC_LIFE;
        var slot = (index + 0.5) / BEE_COUNT;
        var staticX = Math.max(0, Math.min(width - size, slot * width - size / 2));
        var staticY = minY + Math.random() * (maxY - minY);
        el.style.transform = "translate3d(" + staticX.toFixed(1) + "px," + staticY.toFixed(1) + "px,0)";
      } else {
        // En vol : une traversée, d'un bord à l'autre, en ondulant.
        var direction = Math.random() < 0.5 ? 1 : -1;
        bee.isStatic = false;
        bee.life = CROSSING_MIN + Math.random() * CROSSING_RANGE;
        bee.startX = direction === 1 ? -size : width;
        bee.endX = direction === 1 ? width : -size;
        bee.baseY = minY + Math.random() * (maxY - minY);
        bee.amplitude = 20 + Math.random() * 30;
        bee.phase = Math.random() * Math.PI * 2;
        bee.cycles = 2 + Math.random() * 1.5;
        if (direction === -1) {
          sprite.classList.add("beez-bee__sprite--left");
        }
        place(bee, 0);
      }

      el.addEventListener("pointerdown", function (event) {
        event.preventDefault();
        catchBee(bee);
      });

      bees.push(bee);
    }

    function removeBee(bee) {
      bee.el.remove();
      bees = bees.filter(function (other) {
        return other !== bee;
      });
    }

    function catchBee(bee) {
      if (bee.done) {
        return;
      }
      bee.done = true;
      caught += 1;
      renderHud();
      pulseHud();

      if (window.claraPortfolioEgg) {
        window.claraPortfolioEgg.playTone(520, 0, 0.14, 0.45, 980);
      }

      bee.el.classList.add("beez-bee--caught");
      window.setTimeout(function () {
        removeBee(bee);
      }, 320);

      resolveOne();
    }

    function escapeBee(bee) {
      bee.done = true;
      removeBee(bee);
      resolveOne();
    }

    /* ---------- Boucle d'animation ---------- */

    function tick(now) {
      // Plafonne le pas de temps : si l'onglet passe en arrière-plan,
      // les abeilles reprennent là où elles étaient au lieu de sauter.
      var delta = lastTime ? Math.min(now - lastTime, 100) : 16;
      lastTime = now;

      bees.slice().forEach(function (bee) {
        if (bee.done) {
          return;
        }
        bee.age += delta;
        var progress = bee.age / bee.life;
        if (progress >= 1) {
          escapeBee(bee);
        } else if (!bee.isStatic) {
          place(bee, progress);
        }
      });

      if (active) {
        rafId = window.requestAnimationFrame(tick);
      }
    }

    function resolveOne() {
      resolved += 1;
      if (resolved < BEE_COUNT) {
        return;
      }

      active = false;
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }

      if (caught === BEE_COUNT) {
        // Dans le geste de l'utilisateur (le clic sur la dernière
        // abeille) : les navigateurs autorisent alors la lecture.
        playBuzz();
      }

      if (caught === BEE_COUNT && window.claraPortfolioEgg) {
        // Laisse le temps au dernier « pop » de se terminer.
        window.setTimeout(function () {
          window.claraPortfolioEgg.unlock(TROPHY);
        }, 350);
      }
      window.setTimeout(hideHud, HUD_LINGER);
    }

    function release() {
      if (active) {
        return;
      }
      active = true;
      caught = 0;
      resolved = 0;
      lastTime = 0;
      prepareBuzz();
      showHud();

      for (var i = 0; i < BEE_COUNT; i++) {
        window.setTimeout(spawnBee.bind(null, i), i * STAGGER);
      }
      rafId = window.requestAnimationFrame(tick);
    }

    /* ---------- Déclencheur 1 : taper « beez » ---------- */

    var recentKeys = [];

    document.addEventListener("keydown", function (event) {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }
      var target = event.target;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) {
        return;
      }

      recentKeys.push(event.key.length === 1 ? event.key.toLowerCase() : event.key);
      if (recentKeys.length > WORD.length) {
        recentKeys.shift();
      }

      if (recentKeys.join(",") === WORD.join(",")) {
        recentKeys = [];
        release();
      }
    });

    /* ---------- Déclencheur 2 : repère Beez de la frise ---------- */

    document.querySelectorAll("[data-beez-trigger]").forEach(function (trigger) {
      trigger.addEventListener("click", release);
    });
  });
})();
