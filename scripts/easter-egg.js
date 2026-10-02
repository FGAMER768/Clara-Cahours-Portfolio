/*
  Easter egg : trophée « débloqué », façon console de jeu.

  Deux façons de le déclencher :
  - Clavier : le Konami code (↑ ↑ ↓ ↓ ← → ← → B A).
  - Tactile (et souris) : 5 taps rapides sur le portrait du hero.

  Le trophée s'affiche en bas de l'écran, avec un petit carillon généré
  par la Web Audio API (comme showcase.js : aucun fichier audio). Il
  disparaît seul après quelques secondes, ou au clic.

  Le texte passe par data/i18n.json (clés easteregg.*), comme tout le
  site. Les couleurs viennent uniquement des variables de tokens.css :
  le thème clair / sombre est donc géré sans rien ajouter.
*/
(function () {
  "use strict";

  var KONAMI = [
    "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
    "b", "a"
  ];

  var TAPS_REQUIRED = 5;     // nombre de taps sur le portrait
  var TAPS_WINDOW = 2000;    // ... dans cette fenêtre de temps (ms)
  var TOAST_DURATION = 6000; // durée d'affichage du trophée (ms)
  var EXIT_DURATION = 300;   // doit correspondre à la transition dans easter-egg.css

  // Volume général des sons synthétisés (pop, carillon), pour les deux
  // easter eggs : 1 = réglage par défaut, 0 = muet. Au-delà de 1,3 environ,
  // le son risque de saturer. Le bourdonnement a le sien (beez-egg.js).
  var SFX_VOLUME = 1;

  var TROPHY_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" ' +
    'stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M7 4h10v5a5 5 0 0 1-10 0V4z"/>' +
    '<path d="M7 6H4v2a3 3 0 0 0 3 3"/>' +
    '<path d="M17 6h3v2a3 3 0 0 1-3 3"/>' +
    '<path d="M12 14v4"/>' +
    '<path d="M8 20h8"/>' +
    '</svg>';

  document.addEventListener("DOMContentLoaded", function () {
    /* ---------- Zone d'annonce (lecteurs d'écran) ----------
       Une région « live » doit exister dans la page AVANT que son
       contenu change pour être annoncée : on la crée une fois, vide,
       et le trophée y est injecté au déclenchement. */

    var region = document.createElement("div");
    region.className = "trophy-region";
    region.setAttribute("role", "status");
    region.setAttribute("aria-live", "polite");
    document.body.appendChild(region);

    /* ---------- Son : petit carillon à trois notes ---------- */

    var AudioContextClass = window.AudioContext || window.webkitAudioContext;
    var audioCtx = null;

    function getAudioContext() {
      if (!AudioContextClass) {
        return null;
      }
      if (!audioCtx) {
        audioCtx = new AudioContextClass();
      }
      if (audioCtx.state === "suspended") {
        audioCtx.resume().catch(function () {});
      }
      return audioCtx;
    }

    // endFrequency (facultatif) : la note glisse vers cette hauteur
    // (utile pour un petit « pop »).
    function playTone(frequency, startDelay, duration, volume, endFrequency) {
      var ctx = getAudioContext();
      if (!ctx) {
        return;
      }
      try {
        var peak = volume * SFX_VOLUME;
        var start = ctx.currentTime + startDelay;
        var oscillator = ctx.createOscillator();
        var gain = ctx.createGain();

        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(frequency, start);
        if (endFrequency) {
          oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
        }

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(peak, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        oscillator.start(start);
        oscillator.stop(start + duration + 0.02);
      } catch (err) {
        // L'audio n'est jamais critique : on ignore silencieusement.
      }
    }

    function playChime() {
      // Mi5, La5, Mi6 : une arpège qui monte, façon « succès débloqué ».
      playTone(659, 0, 0.18, 0.32);
      playTone(880, 0.09, 0.18, 0.35);
      playTone(1319, 0.18, 0.42, 0.4);
    }

    /* ---------- Trophée ---------- */

    var toast = null;
    var hideTimer = null;
    var removeTimer = null;

    function hideToast() {
      if (!toast) {
        return;
      }
      window.clearTimeout(hideTimer);
      var leaving = toast;
      leaving.classList.remove("trophy-toast--visible");
      removeTimer = window.setTimeout(function () {
        leaving.remove();
        if (toast === leaving) {
          toast = null;
        }
      }, EXIT_DURATION);
    }

    // Contenu par défaut (Konami). Un autre easter egg peut fournir le
    // sien : clés i18n + texte français de repli pour chaque ligne.
    var DEFAULT_TROPHY = {
      label: { key: "easteregg.label", fallback: "Trophée débloqué" },
      name: { key: "easteregg.name", fallback: "Esprit curieux" },
      text: {
        key: "easteregg.text",
        fallback: "Code secret trouvé. Les meilleurs niveaux cachent toujours quelque chose."
      }
    };

    function showToast(content) {
      toast = document.createElement("div");
      toast.className = "trophy-toast";
      toast.innerHTML =
        '<span class="trophy-toast__icon" aria-hidden="true">' + TROPHY_ICON + "</span>" +
        '<div class="trophy-toast__body">' +
        '<p class="trophy-toast__label" data-i18n="' + content.label.key + '">' + content.label.fallback + "</p>" +
        '<p class="trophy-toast__name" data-i18n="' + content.name.key + '">' + content.name.fallback + "</p>" +
        '<p class="trophy-toast__text" data-i18n="' + content.text.key + '">' + content.text.fallback + "</p>" +
        "</div>";

      region.appendChild(toast);

      // Texte injecté en JS : on rejoue la traduction (voir README, « Langue FR / EN »).
      if (window.claraPortfolioI18n && window.claraPortfolioI18n.refresh) {
        window.claraPortfolioI18n.refresh();
      }

      toast.addEventListener("click", hideToast);

      // Force un reflow pour que la transition d'entrée se joue bien.
      void toast.offsetWidth;
      toast.classList.add("trophy-toast--visible");

      hideTimer = window.setTimeout(hideToast, TOAST_DURATION);
    }

    function unlock(content) {
      // Un seul trophée à l'écran à la fois (y compris pendant sa sortie).
      if (toast) {
        return;
      }
      playChime();
      showToast(content || DEFAULT_TROPHY);
    }

    // Petite API pour les autres easter eggs (scripts/beez-egg.js).
    window.claraPortfolioEgg = {
      unlock: unlock,
      playTone: playTone
    };

    /* ---------- Déclencheur 1 : Konami code ---------- */

    // On garde les dernières touches pressées et on regarde si elles se
    // terminent par la séquence : plus tolérant qu'un compteur (une
    // flèche haut en trop au début ne fait pas perdre le fil).
    var recentKeys = [];

    function normalizeKey(key) {
      return key.length === 1 ? key.toLowerCase() : key;
    }

    document.addEventListener("keydown", function (event) {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }
      var target = event.target;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) {
        return;
      }

      recentKeys.push(normalizeKey(event.key));
      if (recentKeys.length > KONAMI.length) {
        recentKeys.shift();
      }

      if (recentKeys.join(",") === KONAMI.join(",")) {
        recentKeys = [];
        unlock();
      }
    });

    /* ---------- Déclencheur 2 : taps sur le portrait ---------- */

    var portrait = document.querySelector(".hero__portrait");
    var taps = [];

    if (portrait) {
      portrait.addEventListener("click", function () {
        var now = Date.now();
        taps.push(now);
        taps = taps.filter(function (time) {
          return now - time <= TAPS_WINDOW;
        });

        if (taps.length >= TAPS_REQUIRED) {
          taps = [];
          unlock();
        }
      });
    }
  });
})();
