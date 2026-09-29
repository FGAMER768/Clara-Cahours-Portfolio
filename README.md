# Portfolio Clara Cahours de Virgile

Site statique en HTML / CSS / JS vanilla. Aucun framework, aucun build,
rien à installer. La police Inter est hébergée dans le dépôt (`fonts/`) :
l'affichage du site ne dépend d'aucun domaine externe. Seules les vidéos
YouTube intégrées (chargées à l'approche de l'écran) en contactent un.
Pensé pour un hébergement statique de type GitHub
Pages : tous les chemins sont relatifs (jamais de `/` initial), le site
peut donc vivre dans un sous-dossier.

## Structure

```
index.html                  Page d'accueil, toutes les sections dans l'ordre :
                            hero, Qui suis-je, Parcours, Projets, Travaux
                            académiques, Personnages pour le jeu de rôle,
                            Productions visuelles, Contact
pages/                      Une fiche par projet (thème, langue et navbar
                            fonctionnent comme sur l'accueil)
  sinnaya.html              Projets
  glory-of-gods.html
  mecha-crisis.html
  beez-adventures.html
  analyse-deconstruction.html   Travaux académiques
  etude-de-cas.html
  scenario.html
  roleplay-gta5.html        Personnages pour le jeu de rôle
  roleplay-rdr2.html
data/
  i18n.json                 Toutes les chaînes FR / EN, clé par clé
documents/
  CV.pdf                    CV téléchargeable (boutons du hero et de Contact)
images/
  profile/                  Photo de portrait (cercle du hero)
  projects/<projet>/        Jaquette, couverture et visuels de chaque projet
                            (10 dossiers, un par fiche ou tuile de l'accueil)
  gallery/                  Illustrations, dessins, flyers, 3D
  og/                       Aperçus de partage 1200×630, un par page
                            (voir « Aperçu de partage »)
fonts/
  inter/                    Police Inter (fichier variable, sous-ensemble latin,
                            toutes graisses) et sa licence SIL OFL
icons/
  sprite.svg                Icônes de l'interface : menu, lune, soleil,
                            flèches, fermer, lecture, LinkedIn, téléchargement
  Unity/                    Logo Unity, versions claire et sombre
  favicon/                  Favicon « CC » : .svg (principal), .ico et .png
                            (repli), apple-touch-icon.png (écran d'accueil iOS)
scripts/
  theme.js                  Bascule clair / sombre, persistée en localStorage
  i18n.js                   Charge data/i18n.json, bascule FR / EN
  navbar.js                 Menu mobile, mise en évidence du lien actif
  slider.js                 Carrousels d'images des fiches projet, avec compteur
  lightbox.js               Visionneuse plein écran (sliders et galerie) :
                            flèches, clavier, swipe sur mobile
  hero-ring.js              Met en pause l'anneau animé du hero hors écran
  ripple.js                 Effet « goutte d'eau » au tap (voir plus bas)
  showcase.js               Sons de survol des jaquettes (voir plus bas)
styles/
  fonts.css                 @font-face d'Inter (chargé avant tokens.css)
  tokens.css                Couleurs, typo, espacements, rayons (variables)
  base.css                  Reset, focus visible, classes utilitaires
  layout.css                Ajustements de mise en page globaux
  navbar.css                Barre de navigation
  hero.css                  Section d'accueil
  timeline.css              Frise chronologique du parcours
  cards.css                 Cartes projets et mini-cartes
  showcase.css              Vitrine des jeux façon bibliothèque (jaquettes)
  roleplay.css              Vitrine des personnages de jeu de rôle
  gallery.css               Grille de productions visuelles
  lightbox.css              Visionneuse plein écran
  project-page.css          Fiches projet (lien de retour, dégagement navbar)
  footer.css                Pied de page et section contact
  ripple.css                Style de l'effet « goutte d'eau » (voir plus bas)
.gitignore                  Exclut l'archive Clara-s-Website.zip et
                            documents/scenario-sequence.pdf
```

**Présents mais non chargés.** `scripts/ripple.js`, `styles/ripple.css` et
`scripts/showcase.js` ne sont référencés par aucune page : ni l'effet de
goutte d'eau, ni les sons de survol des jaquettes ne sont actifs. Pour les
réactiver, ajouter la balise `<link>` ou `<script>` correspondante dans
`index.html` (et dans les fiches concernées). Sinon, on peut les supprimer.

## À faire avant mise en ligne


## Fonctionnement des systèmes légers

### Thème clair / sombre

Détecte la préférence système au premier chargement, puis retient le choix
de la personne dans `localStorage` (clé `clara-portfolio-theme`).
`theme.js` est chargé dans le `<head>`, avant le CSS, pour poser
`data-theme` sur `<html>` avant le premier affichage et éviter tout flash.

Toutes les couleurs passent par des variables CSS (`styles/tokens.css`),
donc ajouter une couleur ailleurs dans le code casserait la bascule.
Attention : les valeurs sombres existent **en double** dans `tokens.css`
(sélecteur `[data-theme="dark"]` et media query `prefers-color-scheme`).
Modifier une couleur sombre impose de la changer aux deux endroits.

### Langue FR / EN

Toutes les chaînes visibles passent par des attributs, résolus via
`data/i18n.json` (clé `localStorage` : `clara-portfolio-lang`) :

- `data-i18n="clé"` remplace le texte de l'élément.
- `data-i18n-attr="alt:clé, aria-label:autre.clé"` remplace des attributs
  (textes alternatifs des images, libellés accessibles...).
- Le titre de l'onglet se traduit comme le reste : la balise `<title>` porte
  un `data-i18n` (`meta.title` pour l'accueil, `meta.title.<fiche>` pour
  chaque fiche).

Pour ajouter un texte traduisible : ajouter la clé dans les deux blocs
(`fr` et `en`) du JSON, qui doivent rester strictement identiques
(209 clés chacun aujourd'hui), puis poser `data-i18n="la.cle"` sur
l'élément HTML concerné.

Pour du HTML créé par JavaScript (c'est le cas de la lightbox), poser
`data-i18n` / `data-i18n-attr` dans le HTML injecté, puis appeler
`window.claraPortfolioI18n.refresh()` juste après l'insertion dans la page.

Le JSON fait foi : au chargement, il remplace le texte écrit dans le HTML.
Ce texte HTML ne sert que de repli si le JSON n'est pas chargé ou si la clé
est absente. Au premier passage, la langue est déduite du navigateur
(anglais si `en`, français sinon). Le chemin du JSON est calculé à partir de
l'emplacement de `i18n.js`, ce qui fonctionne aussi depuis `pages/`.

## CV téléchargeable

Le CV est le fichier `documents/CV.pdf` (casse exacte). Deux boutons y
mènent : un dans le hero, un dans la section Contact, tous deux traduits par
la clé `cv.download`.

- L'attribut `download` force le téléchargement (pas d'ouverture dans le
  navigateur) et propose le nom `CV-Clara-Cahours-de-Virgile.pdf`.
- Pour mettre le CV à jour, remplacer le fichier : aucun code à modifier.
- Le lien doit rester **relatif** : un lien vers `raw.githubusercontent.com`
  ferait ignorer l'attribut `download`, car le fichier serait sur un autre
  domaine.
- Sur certains navigateurs mobiles (notamment Safari sur iPhone), le
  fichier peut s'ouvrir dans un aperçu avec un bouton d'enregistrement :
  c'est un choix du navigateur, le code ne peut pas l'empêcher.

## Aperçu de partage (Open Graph)

Chaque page (l'accueil et les 9 fiches) déclare dans son `<head>` des balises
`og:*` et `twitter:card`, pour qu'un lien collé dans un message, sur LinkedIn
ou sur X affiche un titre, une description et une image.

- Titre et description sont en français uniquement : les robots n'exécutent
  pas JavaScript, ils ne voient donc jamais la traduction anglaise.
- Exception à la règle des chemins relatifs : `og:url` et `og:image` doivent
  être des URL **absolues** (`https://claracahours.vercel.app/...`). Si le
  domaine change, remplacer `claracahours.vercel.app` dans les 10 pages.
- Les images sont dans `images/og/`, une par page, nommée comme le fichier
  HTML (`sinnaya.jpg` pour `pages/sinnaya.html`, `home.jpg` pour l'accueil).
  Format 1200 × 630 px, JPEG, de préférence sous 300 Ko (au-delà, WhatsApp
  peut ne pas afficher l'image). Pour en changer une, remplacer le fichier en
  gardant le nom et les dimensions.
- Les réseaux gardent l'aperçu en cache : après une modification, forcer la
  mise à jour avec le Sharing Debugger de Facebook ou le Post Inspector de
  LinkedIn.

## Images

Chaque dossier d'images contient les fichiers d'origine (utilisés en `src`
de repli) et un sous-dossier `responsive/` avec des versions `.webp` à
plusieurs largeurs (`nom-400w.webp`, `nom-800w.webp`...), listées dans les
`srcset`. Aucun script de génération n'est inclus : pour ajouter une image,
créer soi-même les variantes avant de les déposer. Le portrait du hero est
chargé en priorité, toutes les autres images en différé (`loading="lazy"`).

## Accessibilité (WCAG)

- Un lien d'évitement permet de sauter directement au contenu principal.
- Le focus clavier est toujours visible (`:focus-visible`), jamais masqué.
- Les contrastes de texte (encre sur papier, accent sur fond clair et
  sombre) ont été choisis au-dessus du seuil AA pour le texte courant. Le
  bouton plein du CV atteint 5,2:1 en thème clair et 9,4:1 en thème sombre.
- Les animations respectent `prefers-reduced-motion`.
- Chaque image porte un texte alternatif descriptif, jamais vide sauf pour
  les éléments strictement décoratifs (marqueurs de la frise).
- Le lien actif de la navbar est signalé par `aria-current`, le compteur
  des sliders est annoncé (`aria-live`), la lightbox est une boîte de
  dialogue modale (`role="dialog"`, `aria-modal`).
- Les icônes décoratives sont masquées aux lecteurs d'écran
  (`aria-hidden`). Les liens LinkedIn annoncent qu'ils s'ouvrent dans un
  nouvel onglet.