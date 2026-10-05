# Portfolio Clara Cahours de Virgile

Site en ligne : https://claracahours.vercel.app/

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
  showcase.css              Vitrine des jeux façon bibliothèque (jaquettes)
  roleplay.css              Vitrine des personnages de jeu de rôle
  gallery.css               Grille de productions visuelles
  lightbox.css              Visionneuse plein écran
  project-page.css          Fiches projet (lien de retour, dégagement navbar)
  footer.css                Pied de page et section contact
  ripple.css                Style de l'effet « goutte d'eau » (voir plus bas)
  easter-egg.css            Style du trophée caché
  beez-egg.css              Style des abeilles et de leur compteur
  ascii-egg.css             Style du portrait ASCII (inactif tant que l'easter egg est désactivé)
vercel.json                 Facultatif : force le nom du CV au téléchargement
                            (voir « CV téléchargeable »)
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
- `data-i18n-attr="alt:clé, aria-label:autre.clé"` remplace des attributs
  (textes alternatifs des images, libellés accessibles...).
- Le titre de l'onglet se traduit comme le reste : la balise `<title>` porte
  un `data-i18n` (`meta.title` pour l'accueil, `meta.title.<fiche>` pour
  chaque fiche).

Pour ajouter un texte traduisible : ajouter la clé dans les deux blocs
(`fr` et `en`) du JSON, qui doivent rester strictement identiques
(214 clés chacun aujourd'hui), puis poser `data-i18n="la.cle"` sur
l'élément HTML concerné.

Pour du HTML créé par JavaScript (c'est le cas de la lightbox), poser
`data-i18n` / `data-i18n-attr` dans le HTML injecté, puis appeler
`window.claraPortfolioI18n.refresh()` juste après l'insertion dans la page.

Le JSON fait foi : au chargement, il remplace le texte écrit dans le HTML.
Ce texte HTML ne sert que de repli si le JSON n'est pas chargé ou si la clé
est absente. Au premier passage, la langue est déduite du navigateur
(anglais si `en`, français sinon). Le chemin du JSON est calculé à partir de
l'emplacement de `i18n.js`, ce qui fonctionne aussi depuis `pages/`.

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

### `vercel.json` (facultatif)

Le fichier `vercel.json` ajoute une ceinture et des bretelles : il fait
envoyer par le serveur l'en-tête `Content-Disposition: attachment;
filename="CV-Clara-Cahours-de-Virgile.pdf"`, que les navigateurs appliquent
en priorité, avant `download` et avant le nom de l'URL. Le CV est alors
téléchargé sous le bon nom même si quelqu'un ouvre directement l'adresse du
PDF.

- **Le site fonctionne très bien sans** : le nom du fichier suffit déjà.
  Supprimer `vercel.json` ne casse rien.
- Il n'agit que sur Vercel (ou un hébergeur qui lit ce format). GitHub
  Pages ignore le fichier, car il ne permet pas de régler les en-têtes.
- Si le fichier PDF est renommé, mettre à jour `source` et `filename` dans
  `vercel.json`.

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

## Statistiques de visite

Le site utilise **Vercel Web Analytics** (offre Hobby, gratuite) : pages
vues, visiteurs, pays, appareils et provenance, sans cookie et sans rien
à héberger. Rien à surveiller : on consulte les chiffres dans le tableau
de bord Vercel, onglet **Analytics** du projet.

- **Mise en place** : activer *Analytics* dans le projet Vercel (bouton
  *Enable*), puis redéployer. Les 10 pages portent dans leur `<head>` un
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
  faudrait alors le remplacer dans les 10 pages (`index.html` et
  `pages/*.html`).
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
- Les animations respectent `prefers-reduced-motion`.
- Chaque image porte un texte alternatif descriptif, jamais vide sauf pour
  les éléments strictement décoratifs (marqueurs de la frise).
- Le lien actif de la navbar est signalé par `aria-current`, le compteur
  des sliders est annoncé (`aria-live`), la lightbox est une boîte de
  dialogue modale (`role="dialog"`, `aria-modal`).
- Les icônes décoratives sont masquées aux lecteurs d'écran
  (`aria-hidden`). Les liens LinkedIn annoncent qu'ils s'ouvrent dans un
  nouvel onglet.