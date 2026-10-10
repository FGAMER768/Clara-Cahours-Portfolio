# Portfolio Clara Cahours de Virgile

Site en ligne : https://claracahours.vercel.app/

Site statique en HTML / CSS / JS vanilla. Aucun framework, aucun build,
rien à installer. La police Inter est hébergée dans le dépôt (`fonts/`) :
l'affichage du site ne dépend d'aucun domaine externe. Seules les vidéos
YouTube intégrées (chargées à l'approche de l'écran) en contactent un.
Pensé pour un hébergement statique de type GitHub
Pages : tous les chemins sont relatifs (jamais de `/` initial), le site
peut donc vivre dans un sous-dossier. Les adresses s'affichent sans
`.html` (`/sinnaya`) : cela demande un hébergeur qui les gère, voir
« Adresses sans `.html` ».

## Structure

```
index.html                  Page d'accueil, toutes les sections dans l'ordre :
                            hero, Qui suis-je, Parcours, Projets, Travaux
                            académiques, Personnages pour le jeu de rôle,
                            Productions visuelles, Contact
                            (Projets : jaquette + rôle de chacun des 4 jeux,
                            directement sur l'accueil. Les autres sections
                            ne gardent que leur texte et des boutons
                            « Découvrir » vers les pages secondaires)
Pages secondaires, entre l'accueil et les fiches (voir « Pages secondaires ») :
travaux-academiques.html    Jaquettes des travaux académiques
roleplay.html               Cartes d'identité des personnages de jeu de rôle
petits-exercices.html       Les 2 vidéos des petits exercices Unity
productions-visuelles.html  Grille de dessins / illustrations (avec lightbox)
production-3d.html          Vidéo de la production 3D (3DS Max / Unreal)
                            Une fiche par projet, à la racine, à côté de
                            index.html (thème, langue et navbar fonctionnent
                            comme sur l'accueil) :
sinnaya.html                Projets
glory-of-gods.html
mecha-crisis.html
beez-adventures.html
analyse-deconstruction.html Travaux académiques
etude-de-cas.html
scenario.html
roleplay-gta5.html          Personnages pour le jeu de rôle
roleplay-rdr2.html
data/
  i18n.json                 Toutes les chaînes FR / EN, clé par clé
documents/
  CV-Clara-Cahours-de-Virgile.pdf
                            CV téléchargeable (boutons du hero et de Contact)
images/
  profile/                  Photo de portrait (cercle du hero)
  projects/<projet>/        Jaquette, couverture et visuels de chaque projet
                            (10 dossiers, un par fiche ou tuile de l'accueil)
  gallery/                  Illustrations, dessins, flyers, 3D
  og/                       Aperçus de partage 1200×630, un par page
                            (voir « Aperçu de partage »)
audio/
  bee-buzzing.mp3           Bourdonnement de l'easter egg Beez (2,6 s)
  LICENSE.txt               Crédit et lien de la source (voir « Crédits »)
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
                            (plage « 1-2 / 9 » sur ordinateur où 2 slides sont
                            visibles, « 3 / 9 » sur mobile)
  lightbox.js               Visionneuse plein écran (sliders et galerie) :
                            flèches, clavier, swipe sur mobile
  hero-ring.js              Met en pause l'anneau animé du hero hors écran
  ripple.js                 Effet « goutte d'eau » au tap (voir plus bas)
  showcase.js               Sons de survol des jaquettes (voir plus bas)
  easter-egg.js             Trophée caché (voir « Easter egg »)
  beez-egg.js               Abeilles à rattraper (voir « Easter egg Beez »)
  ascii-egg.js              Portrait en ASCII, DÉSACTIVÉ (voir « Easter egg ASCII »)
styles/
  fonts.css                 @font-face d'Inter (chargé avant tokens.css)
  tokens.css                Couleurs, typo, espacements, rayons (variables)
  base.css                  Reset, focus visible, classes utilitaires
  layout.css                Ajustements de mise en page globaux
  navbar.css                Barre de navigation
  hero.css                  Section d'accueil
  timeline.css              Frise chronologique du parcours
  cards.css                 Cartes projets et mini-cartes
  showcase.css              Vitrine façon bibliothèque (jaquettes) : page travaux-academiques
  overview.css              Accueil : aperçu des projets (jaquette + rôle) et rangée de boutons
  roleplay.css              Vitrine des personnages de jeu de rôle
  gallery.css               Grille de productions visuelles
  lightbox.css              Visionneuse plein écran
  project-page.css          Fiches projet (lien de retour, dégagement navbar)
  footer.css                Pied de page et section contact
  ripple.css                Style de l'effet « goutte d'eau » (voir plus bas)
  easter-egg.css            Style du trophée caché
  beez-egg.css              Style des abeilles et de leur compteur
  ascii-egg.css             Style du portrait ASCII (inactif tant que l'easter egg est désactivé)
robots.txt                  Autorise l'indexation et indique le sitemap
sitemap.xml                 Liste des 15 pages (accueil + 5 pages secondaires + 9 fiches) pour les
                            moteurs de recherche (voir « Référencement »)
vercel.json                 Adresses sans .html et redirections des anciennes
                            adresses (voir « Adresses sans .html »), nom du CV
                            au téléchargement (voir « CV téléchargeable »)
.gitignore                  Exclut l'archive Clara-s-Website.zip et
                            documents/scenario-sequence.pdf
```
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

### Effet « goutte d'eau » (ripple)

Au tap ou au clic sur un bouton, un cercle part du point de contact, grandit
et s'estompe (550 ms). Il remplace le surlignement bleu des navigateurs
mobiles, supprimé dans `base.css`. Il est actif sur : icônes et bouton de
langue de la navbar, flèches des sliders, boutons de la lightbox.

- `scripts/ripple.js` écoute `pointerdown` (et Entrée/Espace, avec un cercle
  centré) sur `document` : les boutons créés dynamiquement, comme ceux de la
  lightbox, sont donc couverts sans code supplémentaire.
- Pour ajouter l'effet à un autre bouton, ajouter son sélecteur à
  `RIPPLE_SELECTOR` en tête de `ripple.js`.
- `styles/ripple.css` doit être chargé **avant** `navbar.css`, `gallery.css`
  et `lightbox.css` : `.ripple-host` impose `position: relative`, que les
  boutons de la lightbox (`position: absolute`) doivent pouvoir surcharger.
- Désactivé si l'utilisateur demande moins d'animations
  (`prefers-reduced-motion`).

### Langue FR / EN

Toutes les chaînes visibles passent par des attributs, résolus via
`data/i18n.json` (clé `localStorage` : `clara-portfolio-lang`) :

- `data-i18n="clé"` remplace le texte de l'élément.
  **Un élément `data-i18n` ne doit contenir aucun autre élément** : son contenu
  est remplacé en bloc, une icône à l'intérieur serait supprimée. Pour un lien
  avec une flèche, poser `data-i18n` sur un `<span>` à côté du `<svg>`, pas sur
  le `<a>` (c'est le cas des liens « Retour » et « Lire le document »).
- `data-i18n-attr="alt:clé, aria-label:autre.clé"` remplace des attributs
  (textes alternatifs des images, libellés accessibles...).
- Le titre de l'onglet se traduit comme le reste : la balise `<title>` porte
  un `data-i18n` (`meta.title` pour l'accueil, `meta.title.<fiche>` pour
  chaque fiche).

Pour ajouter un texte traduisible : ajouter la clé dans les deux blocs
(`fr` et `en`) du JSON, qui doivent rester strictement identiques
(249 clés chacun aujourd'hui), puis poser `data-i18n="la.cle"` sur
l'élément HTML concerné.

Pour du HTML créé par JavaScript (c'est le cas de la lightbox), poser
`data-i18n` / `data-i18n-attr` dans le HTML injecté, puis appeler
`window.claraPortfolioI18n.refresh()` juste après l'insertion dans la page.

Le JSON fait foi : au chargement, il remplace le texte écrit dans le HTML.
Ce texte HTML ne sert que de repli si le JSON n'est pas chargé ou si la clé
est absente. Au premier passage, la langue est déduite du navigateur
(anglais si `en`, français sinon). Le chemin du JSON est calculé à partir de
l'emplacement de `i18n.js`, ce qui fonctionne quel que soit le dossier de la page.

### Easter egg (trophée caché)

Sur l'accueil uniquement, un trophée « débloqué » s'affiche en bas de
l'écran, avec un petit carillon (Web Audio, aucun fichier audio) :

- **Clavier** : un Konami code à la sauce maison, ↑ ↑ ↓ ↓ ← → ← → C C
  (les initiales de Clara Cahours, à la place du B A d'origine).
- **Tactile / souris** : 5 clics ou taps en moins de 2 secondes sur le
  portrait du hero.

Les éléments des trois easter eggs (trophée, portrait, abeilles, compteur,
repère de la frise, nom de la barre de navigation) n'ont ni surbrillance bleue au tap ni sélection de
texte : `base.css` ne le fait que pour les liens et les boutons, ces
éléments ont donc leurs propres règles dans `easter-egg.css` et
`beez-egg.css` / `ascii-egg.css`.

Il disparaît seul après 6 secondes, ou au clic, et peut être redéclenché
à volonté. Réglages en tête de `scripts/easter-egg.js` (séquence, nombre
de taps, durées). `SFX_VOLUME`, au même endroit, règle le volume de tous
les sons synthétisés (carillon du trophée et « pop » des abeilles) ; le
volume de chaque note se règle dans `playChime()`. Le texte est dans `data/i18n.json` (clés `easteregg.*`),
les couleurs viennent uniquement de `tokens.css`. Avec
`prefers-reduced-motion`, le trophée apparaît sans glissement ni rebond.

### Easter egg Beez (abeilles à rattraper)

Sur l'accueil uniquement. Cinq abeilles, inspirées de Beez Adventures,
traversent l'écran ; il faut les attraper (clic ou tap) avant qu'elles
ne sortent. Un compteur « n / 5 » s'affiche sous la navbar. Les cinq
attrapées, un second trophée s'affiche (« Retour à la ruche »).

- **Clavier** : taper le mot `beez` sur la page.
- **Tactile / souris** : toucher le petit repère « Beez Adventures » de
  la frise du parcours (attribut `data-beez-trigger` sur son
  `.timeline__marker` dans `index.html`).

**Sons.** Chaque abeille attrapée fait un petit « pop » synthétisé (Web
Audio, comme le carillon). À la capture de la cinquième, un bourdonnement
(`audio/bee-buzzing.mp3`, 2,6 s) se joue juste avant l'apparition du
trophée. Le fichier n'est chargé qu'au lâcher des abeilles, pas au
chargement de la page, et son chemin est calculé à partir de
l'emplacement de `beez-egg.js` (`BUZZ_PATH`). Le volume du
bourdonnement se règle avec `BUZZ_VOLUME` en tête du script, celui du
« pop » dans l'appel à `playTone` de `catchBee()`. Si le fichier est absent ou si le
navigateur refuse la lecture, le jeu continue sans le bourdonnement.

`beez-egg.js` s'appuie sur `easter-egg.js`, qui doit donc être chargé
avant lui : celui-ci expose `window.claraPortfolioEgg` (`unlock` pour
afficher un trophée, `playTone` pour les sons). Réglages en tête de
`beez-egg.js` (nombre d'abeilles, vitesses, durées). Le texte du trophée
est dans `data/i18n.json` (clés `easteregg.beez.*`).

L'abeille est une illustration SVG : ses couleurs sont des variables
déclarées dans `styles/beez-egg.css` (et non dans `tokens.css`), car
elles ne doivent pas changer avec le thème. Une seule exception : en
thème sombre, un contour crème (`--bee-halo`) entoure la silhouette,
car le noir de l'abeille se confond avec le fond. Comme pour
`tokens.css`, la règle qui l'active existe **en double** dans
`beez-egg.css` (`[data-theme="dark"]` et media query
`prefers-color-scheme`). Le compteur, lui, utilise
les tokens habituels. Avec `prefers-reduced-motion`, les abeilles ne
volent pas : elles se posent à l'écran, sans battement d'ailes, et
restent attrapables pendant 20 secondes. Le jeu est au pointeur et
masqué aux lecteurs d'écran : c'est un bonus décoratif.

### Easter egg ASCII (portrait en caractères)

> **ÉTAT ACTUEL : DÉSACTIVÉ.** Le code est complet et fonctionnel, mais les
> deux déclencheurs (clavier et tactile) sont coupés : rien ne peut ouvrir le
> portrait, aucun écouteur n'est posé sur la page, et le nom « Clara » de la
> barre de navigation se comporte comme un texte ordinaire.
>
> **Pour le réactiver** : dans `scripts/ascii-egg.js`, remplacer
> `var ENABLED = false;` par `var ENABLED = true;`. C'est tout : le clavier, le
> tactile, le trophée, les textes (`data/i18n.json`) et les styles
> reviennent tels quels. Aucune autre modification, ni dans `index.html` ni
> ailleurs.
>
> **Pour le retirer complètement de la page** (par exemple pour ne plus
> charger ses ~17 Ko compressés) : supprimer ou commenter, dans `index.html`,
> la ligne `<link rel="stylesheet" href="styles/ascii-egg.css" />` et la
> ligne `<script src="scripts/ascii-egg.js"></script>`. Les fichiers peuvent
> rester dans le projet. L'attribut `data-ascii-trigger` sur le nom « Clara »
> et les clés `easteregg.ascii.*` du JSON sont alors inertes. Pour le
> remettre, remettre les deux lignes et passer `ENABLED` à `true`.

Sur l'accueil uniquement. Le portrait de Clara, fait de caractères, s'affiche
en plein écran et se dessine de haut en bas, ligne après ligne. Un troisième
trophée (« Portrait en code ») s'affiche à la fin du dessin, ou à la
fermeture si on l'a fermé avant la fin.

- **Clavier** : taper le mot `clara` sur la page (inactif tant que `ENABLED = false`).
- **Tactile / souris** (inactif tant que `ENABLED = false`) : 5 clics ou taps
  en moins de 2 secondes sur le nom
  « Clara » de la barre de navigation (attribut `data-ascii-trigger` sur
  son `<span>` dans `index.html`). La barre est toujours visible en haut de
  l'écran, donc le déclencheur est accessible où qu'on soit sur la page ; sur
  mobile, le nom occupe toute la largeur libre de la barre et sa zone de tap
  fait 44 px de haut (`styles/ascii-egg.css`, sans changer la mise en page).

Fermeture : croix en haut à droite (même apparence que celle de la
lightbox), `Échap`, ou clic / tap sur le fond. Ces deux premiers ferment
toujours tout de suite. Le tap sur le fond, lui, est ignoré pendant 0,8 s
après l'ouverture et tant que les taps se suivent à moins de 0,5 s : sans
ça, quand on « spamme » le nom de la barre sur mobile, les taps qui suivent le
5e refermaient aussitôt le portrait (réglages `CLOSE_GRACE` et
`CLOSE_BURST` dans `scripts/ascii-egg.js`).

**Changer le dessin.** Générer un nouveau texte (par exemple sur
asciiart.eu/image-to-ascii) et le coller dans la constante `ART` en tête de
`scripts/ascii-egg.js`, à la place de l'ancien. La taille de police se calcule
toute seule pour que le dessin tienne dans l'écran, quelle que soit sa taille
(le dessin actuel fait 200 colonnes sur 108 lignes ; sur téléphone, un pincement
des doigts permet de zoomer : le canvas est tracé à haute résolution pour rester
net).
Le texte collé ne doit pas contenir d'accent grave (`` ` ``) ni la séquence
`${`. Les nuances (caractères denses plus foncés) supposent la rampe
standard ` .:-=+*#%@` (`RAMP` dans le script) ; un caractère hors de cette
liste (comme `)`, `[`, `]`, `}`, `<`, `>`) s'affiche à pleine intensité.

**Couleurs.** Le dessin est sombre sur clair, y compris en thème sombre :
les caractères denses (`@`, `#`) sont les zones sombres de la photo, et
l'inverse en ferait un négatif. Comme pour l'abeille, les couleurs de la
feuille sont donc des variables propres à l'easter egg (`--ascii-*`, dans
`styles/ascii-egg.css`) et ne changent pas avec le thème. Les nuances d'encre
(caractères denses plus foncés) se règlent dans `scripts/ascii-egg.js`
(`ALPHA`, dans le même ordre que `RAMP`). Le reste (rayons, ombre) vient de
`tokens.css`. Le texte est dans `data/i18n.json`
(clés `easteregg.ascii.*`).

`ascii-egg.js` s'appuie sur `easter-egg.js`, qui doit être chargé avant lui
(trophée et carillon). Réglages en tête du script (mots, nombre de taps,
vitesse du dessin, taille maximale).

**Performances.** Le dessin est un seul `<canvas>`, pas un élément HTML par
caractère. Une première version construisait ~11 000 `<span>` (22 000 nœuds) :
environ 0,7 s de travail du processeur à l'ouverture sur ordinateur, plus d'une
seconde sur téléphone, et seulement 13 à 26 images/s pendant l'apparition.
Le canvas ne crée que 5 nœuds, les lignes sont tracées au fil des images (le
tracé *est* l'animation : 1 à 5 lignes par image, quelques millisecondes) et
sa mémoire est libérée à la fermeture. Le fond de la fenêtre n'utilise pas
`backdrop-filter` (flou) : c'était la partie la plus coûteuse à afficher sur
téléphone ; un fond presque opaque suffit. Mesures (Chromium, processeur
ralenti ×4 pour simuler un téléphone milieu de gamme) : ~39 images/s pendant le
dessin au lieu de ~13. La seule tâche longue restante est le carillon du
trophée, créé à froid au moment où il se déclenche (code de `easter-egg.js`,
commun à tous les trophées). Réglages : `LINE_DELAY`, `SHARPNESS` (netteté),
`MAX_PIXELS` (mémoire maximale du canvas) en tête de `scripts/ascii-egg.js`.

**Accessibilité.** Le dessin est une image décorative (`role="img"` sur le
canvas, avec un
libellé : les quelque 21 600 caractères ne sont pas lus). À l'ouverture, le focus va
sur la fenêtre elle-même (sans anneau visible, pour ne pas en afficher un à
un utilisateur à la souris ou au doigt) ; `Tab` mène à la croix, qui reçoit
alors son anneau de focus. Le focus revient à sa place à la fermeture. Avec
`prefers-reduced-motion`, le portrait apparaît d'un coup. L'easter egg ne
s'ouvre pas par-dessus la lightbox des galeries.

## Accueil et fiches projet

- **Aperçu des projets (hero)** : 4 jaquettes cliquables sous les boutons
  (`.hero__preview` dans `index.html`), avec les mêmes clés i18n que la
  vitrine. Pour changer de projet mis en avant, modifier ces 4 `<li>`.
  Elles utilisent les jaquettes `-400w.webp` déjà chargées par la vitrine :
  garder cette variante pour ne rien télécharger en plus.
- **Hero compact** : sous 900 px de hauteur de fenêtre (portables), le
  portrait, l'anneau et les marges sont réduits (bloc `@media (max-height:
  900px)` de `hero.css`) pour que l'aperçu reste visible sans défiler.
- **Projets (aperçu)** : l'accueil affiche pour chacun des 4 jeux une carte
  `.project-overview` (jaquette, genre, titre, équipe, « Mon rôle » et lien
  « Voir le projet »), qui reprend les clés i18n des fiches
  (`project.<projet>.subtitle`, `.title`, `.team`, `.role`). La jaquette et le
  titre mènent à la fiche. Pour un nouveau projet, copier une carte dans
  `#projects` de `index.html`. Sînnaya est le seul dont le rôle est une liste
  à puces (clés `project.sinnaya.role.1` à `.8`, classe
  `.project-card__role-list` dans `overview.css`, aussi chargé par
  `sinnaya.html`) ; pour en faire autant avec un autre projet, remplacer sa
  clé `.role` par des clés `.role.N` et un `<ul>` identique. La ligne
  « candidate aux Rookies 2026 » est la clé `project.sinnaya.rookies`, sur la
  carte et sur la fiche.
- **Vitrine (jaquettes)** : seule la page `travaux-academiques` l'utilise
  encore (`showcase.css`). Le titre et le genre sont affichés en
  permanence ; la ligne de contexte (équipe, année) se déplie au survol ou
  au focus clavier. Sur écran tactile, l'affichage est inchangé.
- **Frise du Parcours** : les 4 étapes qui sont des projets (Beez, Glory of
  Gods, Mecha Crisis, Sînnaya) ont un titre cliquable vers leur fiche, avec
  une flèche toujours visible (`.timeline__link`). Pour une nouvelle étape
  qui est un projet, garder `data-i18n` sur le `<span>` **dans** le lien :
  posé sur le `<h3>`, le script de traduction supprimerait le lien. Les
  étapes scolaires restent de simples titres.
- **Fiches projet** : l'en-tête (`<header class="project-card__header">` :
  genre, titre en `<h1>`, ligne d'équipe) est placé **avant** la cover, qui
  occupe sinon tout l'écran sur ordinateur. Une nouvelle fiche doit suivre
  le même schéma. Le genre (ou le sous-titre) est **dans** le `<h1>`, voir
  « Référencement ».

## Pages secondaires (parcours en deux étapes)

Le contenu secondaire (jaquettes des travaux, cartes d'identité, vidéos des
exercices, dessins, vidéo 3D) n'est pas sur l'accueil : chaque section n'y garde
que son titre et son texte, suivis d'un bouton « Découvrir ... » (classe
`.hero__cta`, rangée `.section-actions`). Seuls les 4 projets de jeu restent
affichés sur l'accueil, avec leur rôle.

```
accueil -> page secondaire (travaux-academiques, roleplay) -> fiche
accueil -> page secondaire (petits-exercices, productions-visuelles, production-3d)
accueil -> fiche directement (les 4 projets de jeu)
```

| Section de l'accueil | Bouton / page                                   | Contenu de la page                          |
|----------------------|-------------------------------------------------|---------------------------------------------|
| `#projects`          | (aucune : cartes `.project-overview`)           | fiches : sinnaya, glory-of-gods, mecha-crisis, beez-adventures |
| `#exercises` (dans `#projects`) | `petits-exercices`                   | `.exercise-grid` : les 2 vidéos Unity       |
| `#academic-work`     | `travaux-academiques`                           | `.showcase` (4 tuiles) vers analyse-deconstruction, etude-de-cas, scenario (+ Notion pour Sandwia) |
| `#roleplay`          | `roleplay`                                      | `.roleplay-ids` (2 cartes) vers roleplay-rdr2, roleplay-gta5 |
| `#gallery`           | `productions-visuelles`                         | `.gallery` (18 dessins, lightbox)           |
| `#gallery`           | `production-3d`                                 | vidéo 3DS Max / Unreal Engine               |

- **Un seul CSS nouveau** : `styles/overview.css` (aperçu des projets sur
  l'accueil et rangée de boutons), qui ne fait que placer des composants déjà
  stylés (`.project-card`, `.project-card__role-text`, `.hero__cta`...) avec
  les tokens de `tokens.css` (le thème sombre suit tout seul). Les autres
  pages secondaires réutilisent `showcase.css`, `roleplay.css`, `gallery.css`,
  `lightbox.css`, `cards.css` et `project-page.css`, sans aucune modification.
  Le balisage des tuiles, cartes et vidéos est celui qui était sur l'accueil.
  L'accueil ne charge plus `showcase.css`, `roleplay.css`, `gallery.css`,
  `lightbox.css`, `slider.js` ni `lightbox.js` (plus rien ne s'en sert).
- Le `<h1>` d'une page secondaire reprend le titre de la section d'origine
  (`academicWork.heading`, `roleplay.heading`, `exercises.heading`,
  `gallery.heading`). Sur `travaux-academiques` et `roleplay`, une courte
  consigne (`listing.*.hint`) remplace l'introduction pour ne pas répéter le
  texte de l'accueil.
- **Liens de retour** : une page secondaire revient à la section d'origine de
  l'accueil (`./#academic-work`, `./#roleplay`, `./#exercises`, `./#gallery`) ;
  chaque fiche de travail académique ou de personnage revient à sa liste (clés
  `project.back.academic`, `project.back.roleplay`) ; les fiches des 4 jeux
  reviennent à `./#projects`.
- **Raccourcis conservés** : l'aperçu du hero (`.hero__preview`) et la frise du
  Parcours renvoient directement aux fiches.
- **Aperçu de partage** : les pages secondaires reprennent `images/og/home.jpg`.
  Pour une image dédiée, déposer `images/og/<page>.jpg` (1200 x 630) et
  changer le `og:image` de la page.
- **Nouvelle fiche** : pour un travail académique ou un personnage, l'ajouter
  à la page de liste correspondante (une `.showcase__tile` ou une `.id-card`),
  pas sur l'accueil, puis suivre « Nouvelle fiche » plus bas. Le `<title>`,
  l'`og:title` et `meta.title.academic` / `.roleplay` / `.exercises` /
  `.gallery` / `.video3d` de `data/i18n.json` vont ensemble, comme pour les
  fiches.
- `scripts/showcase.js` (sons de survol) n'est chargé par aucune page
  aujourd'hui : il suffit d'ajouter `<script src="scripts/showcase.js">
  </script>` à la page `travaux-academiques` pour l'activer. Il laisse le
  navigateur gérer les tuiles `target="_blank"` (la tuile Notion de Sandwia
  s'ouvre dans un nouvel onglet, avec le son de validation).

## Adresses sans `.html`

Le site s'affiche avec des adresses propres et courtes :
`https://claracahours.vercel.app/` au lieu de `.../index.html`, et
`https://claracahours.vercel.app/sinnaya` au lieu de
`.../pages/sinnaya.html`. Les fichiers gardent leur extension dans le dépôt
(`sinnaya.html`, à la racine, à côté de `index.html`) ; seule l'adresse vue
par les visiteurs change.

- **Côté Vercel** : `vercel.json` active `"cleanUrls": true`. Vercel sert
  alors `sinnaya.html` à l'adresse `/sinnaya`, et redirige (code 308,
  permanent) `/sinnaya.html` vers `/sinnaya` et `/index.html` vers `/`.
- **`"trailingSlash": false`** renvoie `/sinnaya/` vers `/sinnaya`. Ce
  réglage compte : avec un `/` final, les chemins relatifs
  (`styles/base.css`...) pointeraient au mauvais endroit et la page
  s'afficherait sans style.
- **Anciennes adresses `/pages/...`** : à l'origine, les fiches étaient dans
  un dossier `pages/` et indexées sous `/pages/sinnaya.html`. Deux règles
  `redirects` de `vercel.json` renvoient définitivement `/pages/xxx.html` et
  `/pages/xxx` vers `/xxx`. Vercel applique `cleanUrls` avant ces règles :
  `/pages/xxx.html` passe donc par deux redirections permanentes
  (`/pages/xxx.html` -> `/pages/xxx` -> `/xxx`), ce que Google suit sans
  difficulté. Les liens déjà postés (LinkedIn, mails) et les résultats
  Google continuent ainsi de fonctionner.
  **Garder ces règles au moins un an** (idéalement pour toujours : elles ne
  coûtent rien).
- **Dans le code**, les liens internes n'ont plus d'extension et restent
  relatifs : `sinnaya` depuis l'accueil, `./` et `./#projects` depuis une
  fiche. Les fichiers CSS, scripts et images se chargent en `styles/...`,
  `scripts/...`, `images/...` (plus de `../`), puisque tout est au même
  niveau.
- **`canonical`, `og:url` et `sitemap.xml`** utilisent tous la forme sans
  `.html`. Les trois doivent rester identiques entre eux : si l'un garde
  `.html`, les moteurs de recherche voient deux adresses pour une même page.
- **Nouvelle fiche** `nom.html` : la placer à la racine (copier l'en-tête
  d'une fiche existante pour garder les chemins `styles/...` et
  `scripts/...`), la lier en `nom` (sans extension) depuis l'accueil, mettre
  `https://claracahours.vercel.app/nom` dans son `canonical` et son
  `og:url`, et ajouter la même adresse dans `sitemap.xml`.
- **Noms interdits pour une fiche** : celui d'un dossier du site (`audio`,
  `data`, `documents`, `fonts`, `icons`, `images`, `scripts`, `styles`),
  `index` et ceux des pages secondaires (`travaux-academiques`, `roleplay`,
  `petits-exercices`, `productions-visuelles`, `production-3d`). Une fiche `images.html` serait en conflit avec le dossier
  `images/`, puisque les deux auraient l'adresse `/images`.
- **Vérifier après un déploiement** : `curl -sIL
  https://claracahours.vercel.app/pages/sinnaya.html` (le `L` suit les
  redirections) doit enchaîner deux `308` (vers `/pages/sinnaya`, puis vers
  `/sinnaya`) et finir par un `200`. `curl -sI
  https://claracahours.vercel.app/sinnaya` doit répondre `200` directement.
- **Tester en local** : l'ouverture directe du fichier (`file://`) et les
  serveurs de fichiers simples (`python -m http.server`) ne connaissent pas
  ces adresses : cliquer sur une fiche donnerait une erreur 404. Utiliser
  `npx serve` (gère les adresses sans extension d'office, mais pas les
  redirections `/pages/...`) ou `npx vercel dev` (reproduit Vercel et lit
  `vercel.json`).
- **Autre hébergeur** : GitHub Pages sert aussi `/sinnaya` sans
  configuration, mais ignore `vercel.json` : ni les anciennes adresses
  `/pages/...` ni `.html` ne seraient redirigées. Sur un hébergeur qui ne
  gère pas ces adresses, les liens sans extension renverraient une 404 : il
  faudrait remettre `.html` dans les liens.
- **Après la mise en ligne**, renvoyer `sitemap.xml` dans la Google Search
  Console pour accélérer la prise en compte des nouvelles adresses. Les
  anciennes y apparaissent quelque temps comme « Page avec redirection » :
  c'est normal.

## CV téléchargeable

Le CV est le fichier `documents/CV-Clara-Cahours-de-Virgile.pdf` (casse
exacte). Deux boutons y mènent : un dans le hero, un dans la section
Contact, tous deux traduits par la clé `cv.download`.

- Le nom téléchargé est celui du fichier lui-même. L'attribut `download`
  (même valeur) force le téléchargement sans ouverture dans le navigateur.
- Pour mettre le CV à jour, remplacer le fichier en gardant exactement le
  même nom : aucun code à modifier.
- Le lien doit rester **relatif** : un lien vers `raw.githubusercontent.com`
  ferait ignorer l'attribut `download`, car le fichier serait sur un autre
  domaine.
- Sur certains navigateurs mobiles (notamment Safari sur iPhone), le
  fichier peut s'ouvrir dans un aperçu avec un bouton d'enregistrement :
  c'est un choix du navigateur, le code ne peut pas l'empêcher.

### Historique du renommage

À l'origine, le fichier s'appelait `documents/CV.pdf` et les boutons
portaient `download="CV-Clara-Cahours-de-Virgile.pdf"`, en comptant sur cet
attribut pour proposer un nom propre. En pratique, le CV arrivait sous le
nom `CV`.

La cause exacte n'a pas pu être vérifiée. Deux pistes sont possibles :
`download` n'est qu'une suggestion, que certains navigateurs ignorent (ils
reprennent alors le nom du fichier dans l'URL) ; ou la version en ligne
n'était pas encore à jour. Le code lui-même était correct.

Solution retenue : donner directement le bon nom au fichier
(`CV-Clara-Cahours-de-Virgile.pdf`). Le nom est alors correct même si
`download` est ignoré, sur n'importe quel hébergeur et sans configuration.
Contrepartie : l'ancienne URL `documents/CV.pdf` n'existe plus, tout lien
posté ailleurs (LinkedIn, mails) vers l'ancienne adresse est à mettre à jour.

### `vercel.json`

Le fichier `vercel.json` contient aussi une règle pour le CV (en plus des
adresses sans `.html`, voir plus haut) : elle fait envoyer par le serveur
l'en-tête `Content-Disposition: attachment;
filename="CV-Clara-Cahours-de-Virgile.pdf"`, que les navigateurs appliquent
en priorité, avant `download` et avant le nom de l'URL. Le CV est alors
téléchargé sous le bon nom même si quelqu'un ouvre directement l'adresse du
PDF.

- **Ne pas supprimer `vercel.json`** : sans lui, les adresses sans `.html`
  (`/sinnaya`) renvoient une 404 sur Vercel et les anciennes adresses
  `/pages/...` ne sont plus redirigées. Seul le bloc `headers` (le nom du
  CV) est facultatif : le nom du fichier suffit déjà à lui seul.
- Il n'agit que sur Vercel (ou un hébergeur qui lit ce format). GitHub
  Pages ignore le fichier, car il ne permet pas de régler les en-têtes.
- Si le fichier PDF est renommé, mettre à jour `source` et `filename` dans
  `vercel.json`.

## Aperçu de partage (Open Graph)

Chaque page (l'accueil, les 5 pages secondaires et les 9 fiches) déclare dans son `<head>` des balises
`og:*` et `twitter:card`, pour qu'un lien collé dans un message, sur LinkedIn
ou sur X affiche un titre, une description et une image.

- Titre et description sont en français uniquement : les robots n'exécutent
  pas JavaScript, ils ne voient donc jamais la traduction anglaise.
- Exception à la règle des chemins relatifs : `og:url` et `og:image` doivent
  être des URL **absolues** (`https://claracahours.vercel.app/...`). Si le
  domaine change, remplacer `claracahours.vercel.app` dans les 15 pages.
- Chaque page déclare aussi `<link rel="canonical">`, avec la même adresse
  que `og:url` (sans `.html`) : elle indique aux moteurs de recherche
  l'adresse de référence de la page (utile si le site est joint par
  plusieurs adresses).
- Les images sont dans `images/og/`, une par page, nommée comme le fichier
  HTML (`sinnaya.jpg` pour `sinnaya.html`, `home.jpg` pour l'accueil).
  Format 1200 × 630 px, JPEG, de préférence sous 300 Ko (au-delà, WhatsApp
  peut ne pas afficher l'image). Pour en changer une, remplacer le fichier en
  gardant le nom et les dimensions.
- Les réseaux gardent l'aperçu en cache : après une modification, forcer la
  mise à jour avec le Sharing Debugger de Facebook ou le Post Inspector de
  LinkedIn.

## Référencement

`robots.txt` autorise l'indexation de tout le site et pointe vers
`sitemap.xml`, qui liste l'accueil, les 5 pages secondaires et les 9 fiches. Les adresses y sont
**absolues** (`https://claracahours.vercel.app/...`) et identiques aux
`og:url` des pages.

- Nouvelle fiche projet : ajouter son adresse dans `sitemap.xml`, sans
  `.html` (voir « Adresses sans `.html` »).
- **`<title>`** : format `Nom - ce qui est présenté | Clara Cahours de
  Virgile` (l'accueil garde `Clara Cahours de Virgile - Portfolio`). Le nom
  du projet vient en tête, la marque à la fin ; viser
  70 caractères au plus (Google tronque vers 60, la marque est la partie
  sacrifiée). Pour un projet, la précision est le domaine de travail réel
  décrit sur la fiche (pas un modèle copié). À modifier à **trois**
  endroits : le `<title>` et l'`og:title` de la page, et `meta.title.<fiche>`
  dans `data/i18n.json` (FR **et** EN), sinon l'onglet reprend l'ancien
  texte au changement de langue.
- **`<h1>` des fiches** : un seul par page, descriptif. Sur les fiches de
  projet et de jeu de rôle il se compose de deux `<span data-i18n>` (le nom,
  puis le genre ou le sous-titre) séparés par un `" - "` masqué
  (`.visually-hidden`), ce qui donne « Sînnaya - Jeu narratif et
  d'énigmes » pour Google et les lecteurs d'écran sans rien changer à
  l'affichage. Le genre reste au-dessus du nom
  (`.project-card__title--genre-first`) ; le sous-titre reste dessous
  (`.project-card__title--subtitle`). Les deux parties sont des `<span>`
  distincts, car le script de traduction remplace tout le contenu d'un
  élément portant `data-i18n`. Ne pas modifier `project.<projet>.title` /
  `.subtitle` pour allonger le h1 : ces clés servent aussi à la vitrine et à
  l'aperçu de l'accueil.
- Changement de domaine : remplacer `claracahours.vercel.app` dans
  `robots.txt`, `sitemap.xml` et les 15 pages (voir aussi « Aperçu de
  partage »).
- L'accueil contient un bloc JSON-LD `Person` (nom, métier, image, LinkedIn)
  dans son `<head>`. Si le métier, la description ou le lien LinkedIn
  changent, penser à le mettre à jour. L'adresse e-mail n'y figure pas
  volontairement (collecte par des robots).
- La balise `google-site-verification` de l'accueil prouve à Google que le
  site t'appartient (Search Console). La supprimer fait perdre l'accès aux
  statistiques de recherche.
- Une fois le site en ligne, déclarer `sitemap.xml` dans la Google Search
  Console accélère l'indexation.

## Images

Chaque dossier d'images contient les fichiers d'origine (utilisés en `src`
de repli) et un sous-dossier `responsive/` avec des versions `.webp` à
plusieurs largeurs (`nom-400w.webp`, `nom-800w.webp`...), listées dans les
`srcset`. Aucun script de génération n'est inclus : pour ajouter une image,
créer soi-même les variantes avant de les déposer. Le portrait du hero est
chargé en priorité, toutes les autres images en différé (`loading="lazy"`).

## Statistiques de visite

Le site utilise **Vercel Web Analytics** (offre Hobby, gratuite) : pages
vues, visiteurs, pays, appareils et provenance, sans cookie et sans rien
à héberger. Rien à surveiller : on consulte les chiffres dans le tableau
de bord Vercel, onglet **Analytics** du projet.

- **Mise en place** : activer *Analytics* dans le projet Vercel (bouton
  *Enable*), puis redéployer. Les 15 pages portent dans leur `<head>` un
  petit script (`/_vercel/insights/script.js`) ; sans l'activation, ou hors
  Vercel (en local, GitHub Pages), il renvoie une erreur 404 sans
  conséquence.
- **Pas de paquet npm** : les panneaux « Next.js » et « Other » du tableau
  de bord proposent `@vercel/analytics`, qui suppose un outil de build. Ce
  site n'en a pas : seule la balise `<script>` s'applique.
- **Vérifier que ça marche** : ouvrir le site (sans bloqueur de pub), puis
  les outils de développement, onglet Réseau, filtre Fetch/XHR : chaque
  page ouverte doit envoyer une requête se terminant par `/view`.
- **Si les chiffres restent vides** : la documentation Vercel pour le HTML
  pur indique désormais un chemin propre au projet
  (`/<chemin-unique>/script.js`) à la place de `/_vercel/insights/`. Il
  faudrait alors le remplacer dans les 15 pages (`index.html`, les 5 pages secondaires et
  les 9 fiches).
- **Limites** : un bloqueur de pub peut empêcher la mesure (les chiffres
  sont donc un minimum). Sur l'offre gratuite, pas d'événements
  personnalisés : on ne peut pas compter les easter eggs, seulement les
  visites. Au-delà de 50 000 événements par mois (loin d'être atteint), la
  collecte est mise en pause, sans facture.
- Le script est servi par le domaine du site lui-même : aucun domaine
  externe n'est contacté.

## Crédits

- **Bourdonnement d'abeille** (`audio/bee-buzzing.mp3`) : effet sonore de
  [freesound_community](https://pixabay.com/users/freesound_community-46691455/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=6254)
  sur [Pixabay](https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=6254).
  Le texte d'attribution d'origine est conservé dans `audio/LICENSE.txt`.
- **Inter** (`fonts/inter/`) : police sous licence SIL OFL, texte de la
  licence dans `fonts/inter/LICENSE.txt`.

## Accessibilité (WCAG)

- Un lien d'évitement permet de sauter directement au contenu principal.
- Le focus clavier est toujours visible (`:focus-visible`), jamais masqué.
- Les contrastes de texte (encre sur papier, accent sur fond clair et
  sombre) ont été choisis au-dessus du seuil AA pour le texte courant. Le
  bouton plein du CV atteint 5,2:1 en thème clair et 9,4:1 en thème sombre.
- L'ocre a deux jetons : `--color-secondary` pour les **décors** (bordures,
  dégradés, illustrations) et `--color-secondary-text` pour tout **texte**
  (dates du parcours, méta des cartes, couleurs au survol). Le premier ne
  passe pas le seuil AA sur fond clair (2,7:1), ne pas l'utiliser en texte.
- Hiérarchie des titres : chaque fiche projet a un seul `<h1>` (son titre
  et sa précision, voir « Référencement ») puis des `<h2>` pour ses blocs. Le style est porté par les classes
  (`.project-card__title`, `.project-card__block-heading`), pas par la
  balise : choisir le niveau selon la structure, sans toucher au CSS.
- Les animations respectent `prefers-reduced-motion`.
- Chaque image porte un texte alternatif descriptif, jamais vide sauf pour
  les éléments strictement décoratifs (marqueurs de la frise).
- Le lien actif de la navbar est signalé par `aria-current`, le compteur
  des sliders est annoncé (`aria-live`), chaque carrousel est nommé par le
  titre de son bloc (`aria-labelledby`, posé par `slider.js`), la lightbox est une boîte de
  dialogue modale (`role="dialog"`, `aria-modal`).
- Les icônes décoratives sont masquées aux lecteurs d'écran
  (`aria-hidden`). Les liens LinkedIn annoncent qu'ils s'ouvrent dans un
  nouvel onglet.