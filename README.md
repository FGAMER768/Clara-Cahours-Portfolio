# Portfolio Clara Cahours de Virgile

Site statique en HTML / CSS / JS vanilla. Aucune dépendance, aucun build.

## Structure

```
index.html                  Page unique, toutes les sections
data/
  i18n.json                 Toutes les chaînes FR / EN, clé par clé
images/
  profile/                  Photo de portrait (cercle du hero)
  projects/
    sinnaya/
    glory-of-gods/
    mecha-crisis/
    beez-adventures/
  gallery/                  Illustrations, dessins, flyers, 3D
documents/
  CV.pdf                    CV téléchargeable (boutons du hero et de la section Contact)
icons/
  sprite.svg                Icônes de l'interface (menu, thème, LinkedIn...)
  favicon/                  Favicon « CC » : .svg (principal), .ico et .png (repli),
                            apple-touch-icon.png (écran d'accueil iOS)
scripts/
  theme.js                  Bascule clair / sombre, persistée en localStorage
  i18n.js                   Charge data/i18n.json, bascule FR / EN
  navbar.js                 Menu mobile, mise en évidence du lien actif
styles/
  tokens.css                Couleurs, typo, espacements, rayons (variables)
  base.css                  Reset, focus visible, classes utilitaires
  layout.css                Ajustements de mise en page globaux
  navbar.css                Barre de navigation
  hero.css                  Section d'accueil
  timeline.css              Frise chronologique du parcours
  cards.css                 Cartes projets et mini-cartes
  gallery.css               Grille de productions visuelles
  footer.css                Pied de page et section contact
```

## À faire avant mise en ligne

- Déposer le CV dans `documents/CV.pdf` (nom exact, majuscules comprises :
  GitHub Pages distingue majuscules et minuscules). Le fichier est proposé au
  téléchargement sous le nom `CV-Clara-Cahours-de-Virgile.pdf`. Pour le mettre
  à jour, il suffit de remplacer ce fichier, aucun code à modifier.


## Fonctionnement des deux systèmes légers

- **Thème clair / sombre** : détecte la préférence système au premier
  chargement, puis retient le choix de la personne dans `localStorage`.
  Toutes les couleurs passent par des variables CSS (`styles/tokens.css`),
  donc ajouter une couleur ailleurs dans le code casserait la bascule.
- **Langue FR / EN** : toutes les chaînes visibles passent par l'attribut
  `data-i18n="clé"` sur l'élément, et sont résolues via `data/i18n.json`.
  Pour ajouter un texte traduisible, ajouter la clé dans les deux blocs
  (`fr` et `en`) du JSON, puis poser `data-i18n="la.cle"` sur l'élément
  HTML concerné.

## Accessibilité (WCAG)

- Un lien d'évitement permet de sauter directement au contenu principal.
- Le focus clavier est toujours visible (`:focus-visible`), jamais masqué.
- Les contrastes de texte (encre sur papier, accent sur fond clair et
  sombre) ont été choisis au-dessus du seuil AA pour le texte courant.
- Les animations respectent `prefers-reduced-motion`.
- Chaque image porte un texte alternatif descriptif, jamais vide sauf pour
  les éléments strictement décoratifs (marqueurs de la frise).
