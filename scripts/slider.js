(function () {
  "use strict";

  document.querySelectorAll("[data-slider]").forEach(function (slider) {
    // Toute la mise en place d'UN slider est protégée individuellement :
    // une erreur inattendue sur un slider ne doit jamais empêcher les
    // AUTRES sliders de la même page de fonctionner. Sans ce garde-fou,
    // une exception non interceptée dans un callback forEach stoppe net
    // toute la boucle : les sliders suivants ne reçoivent alors jamais
    // leurs écouteurs de clic, ce qui les rend inertes sans la moindre
    // erreur visible pour qui ne regarde pas la console.
    try {
      setupSlider(slider);
    } catch (error) {
      console.error("Slider non initialisé :", slider, error);
    }
  });

  function setupSlider(slider) {
    var viewport = slider.querySelector("[data-slider-viewport]");
    var previousButton = slider.querySelector("[data-slider-prev]");
    var nextButton = slider.querySelector("[data-slider-next]");
    // Le <p> de statut ("3 / 7") est placé, dans le HTML actuel du site,
    // juste APRÈS .media-slider plutôt qu'à l'intérieur (comme un frère,
    // pas un enfant) : slider.querySelector() ne le trouve donc jamais.
    // On élargit la recherche au parent direct du slider, qui contient
    // les deux, plutôt que d'exiger que le statut soit dans le slider
    // lui-même. Le statut est purement informatif (aria-live) : son
    // absence éventuelle ne doit de toute façon jamais empêcher les
    // flèches de fonctionner, d'où le fallback sur un objet inoffensif.
    var status =
      slider.querySelector("[data-slider-status]") ||
      (slider.parentElement && slider.parentElement.querySelector("[data-slider-status]"));

    if (!viewport || !previousButton || !nextButton) {
      console.warn("Slider incomplet, éléments manquants :", {
        slider: slider,
        viewport: viewport,
        previousButton: previousButton,
        nextButton: nextButton
      });
      return;
    }

    if (!status) {
      // Pas bloquant : le slider reste pleinement utilisable sans son
      // indicateur "X / N", on évite juste qu'écrire dedans plante.
      status = { textContent: "" };
    }

    // Les slides dont l'image ne charge pas se retirent elles-mêmes (onerror),
    // donc on relit la liste à chaque fois plutôt que de la figer au démarrage.
    function getSlides() {
      return slider.querySelectorAll(".media-slider__slide");
    }

    // Position de scroll de la Nème slide, mesurée PAR RAPPORT AU VIEWPORT
    // (et non avec offsetLeft). offsetLeft se calcule depuis le premier
    // ancêtre positionné, qui ici est <body> : il inclut donc tout le
    // décalage du slider dans la page (marges du container, bouton
    // "précédent", etc.). Résultat : les positions étaient fausses d'une
    // valeur constante, le compteur retardait de plusieurs slides et un
    // clic sur "suivant" pouvait en sauter une. getBoundingClientRect()
    // relatif au viewport, auquel on rajoute le scroll courant, donne
    // exactement la valeur de scrollLeft qui aligne cette slide sur le
    // bord gauche (point d'alignement scroll-snap).
    function getSlideOffset(index) {
      var slides = getSlides();
      var target = slides[Math.max(0, Math.min(index, slides.length - 1))];
      if (!target) {
        return 0;
      }
      return (
        target.getBoundingClientRect().left -
        viewport.getBoundingClientRect().left +
        viewport.scrollLeft
      );
    }

    function getMaxScroll() {
      return Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    }

    // Index de la slide alignée sur le bord gauche du viewport (la plus
    // proche de la position de scroll réelle). C'est cet index, la
    // position RÉELLE, qui sert à naviguer : depuis la butée droite,
    // "précédent" doit partir de là et non du compteur affiché.
    function getPositionIndex() {
      var slides = getSlides();
      var scrollLeft = viewport.scrollLeft;
      var closestIndex = 0;
      var closestDistance = Infinity;
      slides.forEach(function (slide, index) {
        var distance = Math.abs(getSlideOffset(index) - scrollLeft);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      return closestIndex;
    }

    // Index AFFICHÉ dans le compteur. Comme plusieurs slides sont visibles
    // à la fois (2 sur ordinateur), les dernières ne peuvent jamais
    // atteindre le bord gauche : tout à droite, la slide alignée à gauche
    // est l'avant-dernière. On affiche alors la dernière ("9 / 9"), ce
    // que la personne attend en butée droite.
    function getDisplayIndex() {
      var slides = getSlides();
      var maxScroll = getMaxScroll();
      if (maxScroll > 1 && viewport.scrollLeft >= maxScroll - 1) {
        return slides.length - 1;
      }
      return getPositionIndex();
    }

    function updateControls() {
      var slides = getSlides();

      if (!slides.length) {
        // Toutes les images ont échoué : on masque le slider ET son
        // compteur (display:grid du CSS l'emporte sur l'attribut hidden).
        slider.hidden = true;
        slider.style.display = "none";
        status.hidden = true;
        return;
      }

      // Une seule slide restante : rien à faire défiler.
      if (slides.length === 1) {
        previousButton.disabled = true;
        nextButton.disabled = true;
        status.textContent = "1 / 1";
        return;
      }

      // Viewport pas encore affiché (largeur nulle) : on ne fige PAS les
      // boutons sur "disabled", on attend le prochain passage
      // (resize/load/observer) pour ne jamais bloquer le slider.
      if (viewport.clientWidth === 0) {
        previousButton.disabled = viewport.scrollLeft <= 1;
        nextButton.disabled = false;
        status.textContent = "1 / " + slides.length;
        return;
      }

      var maxScroll = getMaxScroll();

      // Toutes les slides tiennent dans le viewport : rien à faire défiler.
      if (maxScroll <= 1) {
        previousButton.disabled = true;
        nextButton.disabled = true;
        status.textContent = "1 / " + slides.length;
        return;
      }

      previousButton.disabled = viewport.scrollLeft <= 1;
      nextButton.disabled = viewport.scrollLeft >= maxScroll - 1;
      status.textContent = Math.min(getDisplayIndex() + 1, slides.length) + " / " + slides.length;
    }

    function moveSlider(direction) {
      var slides = getSlides();
      if (!slides.length) {
        return;
      }
      var targetIndex = getPositionIndex() + direction;
      var targetOffset = getSlideOffset(targetIndex);

      viewport.scrollTo({
        left: Math.max(0, Math.min(targetOffset, getMaxScroll())),
        behavior: "smooth"
      });
    }

    previousButton.addEventListener("click", function () {
      moveSlider(-1);
    });

    nextButton.addEventListener("click", function () {
      moveSlider(1);
    });

    viewport.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls);

    // Les erreurs de chargement d'image (onerror inline) retirent des slides
    // après le premier rendu : on laisse une passe au navigateur puis on relit l'état.
    window.addEventListener("load", updateControls);

    // Les images chargent en asynchrone et peuvent changer la largeur
    // réelle du viewport/track après le premier rendu (avant que "load"
    // ne se déclenche pour toute la page) : un ResizeObserver capte ça
    // de façon fiable, plutôt que de dépendre uniquement de "load".
    if ("ResizeObserver" in window) {
      var resizeObserver = new ResizeObserver(function () {
        updateControls();
      });
      resizeObserver.observe(viewport);
    }

    // Une slide retirée (image en erreur) change la largeur défilable sans
    // changer la taille du viewport : le ResizeObserver ne la voit pas.
    if ("MutationObserver" in window) {
      var track = slider.querySelector(".media-slider__track");
      if (track) {
        new MutationObserver(updateControls).observe(track, { childList: true });
      }
    }

    updateControls();
  }
})();
