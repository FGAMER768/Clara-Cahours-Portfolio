/*
  Easter egg ASCII : le portrait de Clara, fait de caractères, s'affiche
  en plein écran et se dessine ligne par ligne. Un troisième trophée
  s'affiche à la fin du dessin (ou à la fermeture si on est pressé).

  Déclencheurs :
  - Clavier : taper le mot « clara » sur la page.
  - Tactile / souris : 5 clics ou taps en moins de 2 secondes sur le nom
    « Clara » de la barre de navigation, toujours visible en haut de
    l'écran (attribut data-ascii-trigger sur son <span> dans index.html).
    Sur mobile, ce nom occupe toute la largeur libre de la barre : la
    zone de tap est large.

  Fermeture : bouton ×, Échap, ou clic / tap sur le fond (ignoré juste après
  l'ouverture et pendant un spam de taps : voir CLOSE_GRACE). Le focus arrive
  sur la fenêtre elle-même ; Tab le mène à la croix (anneau visible).

  S'appuie sur scripts/easter-egg.js (à charger avant) pour le trophée
  et le carillon : window.claraPortfolioEgg.

  Rendu : UN SEUL <canvas>, pas un élément HTML par caractère. Une version
  précédente construisait ~11 000 <span> (22 000 nœuds) : environ 0,7 s de
  travail du processeur à l'ouverture sur ordinateur, plus d'une seconde
  sur téléphone. Le canvas ne crée aucun nœud, et le dessin lui-même est
  l'animation : les lignes sont tracées au fil des images (2 ou 3 par
  image), donc aucun gros bloc de calcul. La mémoire du canvas est
  libérée à la fermeture.

  Pour changer le dessin : générer un nouveau texte (par exemple sur
  asciiart.eu/image-to-ascii) et le coller dans ART ci-dessous, à la
  place de l'ancien. Aucune autre modification : la taille s'ajuste toute
  seule à l'écran. Attention : le texte collé ne doit contenir ni accent
  grave (`) ni la séquence ${ (le reste, y compris les antislashs, est
  accepté grâce à String.raw).

  Accessibilité : le dessin est une image décorative (role="img" avec
  un libellé, les quelque 21 600 caractères ne sont pas lus). Le focus va sur
  la fenêtre (Tab mène à la croix) et revient à sa place ensuite. Avec
  prefers-reduced-motion, le portrait apparaît d'un coup.
*/
(function () {
  "use strict";

  var WORD = ["c", "l", "a", "r", "a"];
  var TAPS_REQUIRED = 5;      // taps sur le nom de la barre...
  var TAPS_WINDOW = 2000;     // ... dans cette fenêtre de temps (ms)
  var LINE_DELAY = 18;        // délai entre deux lignes du dessin (ms)
  var START_DELAY = 150;      // attente avant la première ligne (ms)
  var MAX_FONT = 16;          // taille de police maximale sur grand écran (px)

  // Anti-fermeture accidentelle : quand on « spamme » le nom de la barre, les
  // taps qui suivent le 5e tombent sur le fond du portrait. Ils ne doivent
  // pas le refermer : un tap sur le fond est ignoré pendant CLOSE_GRACE
  // après l'ouverture, puis tant que les taps se suivent à moins de
  // CLOSE_BURST les uns des autres. La croix et Échap ferment toujours
  // tout de suite.
  var CLOSE_GRACE = 800;      // ms après l'ouverture
  var CLOSE_BURST = 500;      // ms entre deux taps pour compter comme un spam

  // Du plus clair au plus dense : sert à nuancer la teinte de chaque
  // caractère (ALPHA, même ordre), pour que le visage ressorte. Un caractère
  // absent de cette liste est tracé à pleine intensité : c'est voulu pour
  // ) ( [ ] } < >, que le convertisseur emploie pour les contours et les
  // zones les plus sombres du portrait.
  var RAMP = " .:-=+*#%@";
  var ALPHA = [0, 0.05, 0.08, 0.12, 0.2, 0.32, 0.5, 0.75, 0.92, 1];

  var FONT_FAMILY = 'ui-monospace, "SFMono-Regular", Menlo, Consolas, "Liberation Mono", monospace';
  var LINE_HEIGHT = 1.2;      // interligne, en multiple de la taille de police

  // Netteté : le canvas est tracé à SHARPNESS fois la densité de l'écran, pour
  // rester lisible quand on zoome avec deux doigts. MAX_PIXELS borne la
  // mémoire (4 octets par pixel : 4 millions de pixels = 16 Mo).
  var SHARPNESS = 2;
  var MAX_PIXELS = 4000000;

  // Portrait en ASCII, 200 colonnes (zones sombres = caractères denses).
  var ART = String.raw`
 @@*)@@)@}->@@:--:::--:-:  ::::::::::::::::::::::::::::-=+**>>>*+=--:--:::-::::: :: ::[@@@@@@::::   =[@@@)}@@@[@@@@@*@@@@@[>#}%@)@@*)>@=@<+@<@@**@:@+*@)@*[@@=+=:   =%@*::>@#+@}@#>@@}@*@@@@%#:@}@@* +@ 
 @@*)@@[@]-*@@<@@@@@@@@)*%@@@>:::::::::::  :::::::::::: :=+**+=---:  :++=-: :::::    :%@>})@@>::::::*@[-@*@@@@*@*-#@>@)]@@@]@+:[@%@>]=@+@<+@]@@*=@+@+*}[]#>@@= =-: :<@}:: *@@+@@@@+#@*@+)@@@@%*@}@@* -@ 
 @@*<@@}@):*@@@@@@@@@@@@[@@@@@#@@@}+  ::::    ::  ->][%@@@@*:>@@@%)::+%@@@@<:: ::  :::@@>%[@@@::::::)@<:@=@[>@*@++]@-@]-=@@)@<+>@>@]}=@=@[+@}@%*-@[@)*#@=@=@@-*=:  =%@==::*@#)%@@@+>@+@>*@@@@#)#}@@+ :@ 
 @@*>@@#@)-)@@@@[>@#]+@@]@<*@@@@@@@#:: ::::::::   ]@@@@@@@@%-}@@@@@=:}@@@@@%  ::::::::%@*@#]@@::::::]@<=@*@}-@*@+-]@+@#)[%@+@=+=@:@)]*@+@}>@[@}>:[@]@=+@[@+@@>:-=+<%@[:--+}#)<#@@@-=@]@]<@@@@[<*)@@= :# 
 @@*>@@%@]=}@@@@>=@[<=@@*@[=@@@[+*@@@@@*::::::::::@@}}#)*)@@:#@)*@@+:@@%)[@@::::::::::[@<]@=@@------[@]+@)@#-@)@)+<@[@#*=>@=@<>:@=@>>*@)@}>@%@[+-=@=@*<@}@<]@@:}@@@@@=-:=%%+)<#@%@: @@@}>@@@@[<:+@@= :) 
 @@+<@@%@}=#@@@@*+@[]-%@-@%=@@@@-=}@@@@@::  :   ::@@* *+*:@@-}@#+@@+:@@%<}@@::::::::::<@]+@*@@=:::::[@[=@}@%+@[}[*+@@@@>=+@[@}<=@<@[]]@@@@<#@#@**+@+@=-@@@#:@@ @@@@]>*: <@=#@))@]@==@@@@*@@@@>]:+@@- :+ 
 @@=)@@%@@[@@@@@*=@[}=%@:@@=@@@@)]%%#%@@::::--::--@@>=*+=-@@+[@%:@@>:@@%)#@@:::::::: :>@}+#>@@>     }@#-@@@@-}#]@>=@@@@++*@@@@>]@@@@<=@@@@>[@[@*+-@<@<+@@[}+@@@@@[}*)> -@@@@@)=@*@=:@@)@=[@}@-}=<@@- :: 
 @@+)@@[@@=}@@@@*+@#%[@@)@@+@@@@<<[}*)@@++=-:--:::@@>:-=-=@@<]@@-@@<:@@#<@@@:::::::  :*@#>}<@@)   ::}@@=@@@@+}@<@)*@@@@>>+@@@@])@@}@)*@@@@<#@-@<<=@[<]+)@*[*[@)*@@}##> )@]@@@]=@>@[-[@:@:>@-@]#>[@@- :: 
 @@><@@]@@)[@@@@*+#][>>@[@@-@@@@]+)}*>@@]=-:      @@)-:= -@@[<@@:@@):@@%}@@@:: ::::: :=@@>}<@@}::  :#@@*@@@@-]@+@]=@@@@>=:@@@@==@@@@<-@@@@)]@>@}[+##>[*=@[@*>@@@@@+#@]=@>@@@@[>@@@@><@>@++@)@@}*}@@:::: 
 @@>>@@[@@+>@@@@>*@#@<]@@@@-@@@@)>}}*>@@@----:::: @@]--<>>#@%>@@-@@[:@@[}%@@:::-==-:::-@@>}*@@@: :--#@@:@@@@>>@-@]<@@#@]*-@@@@))@@]@)=#@)@[>@#@%[+>[-]+:@}@)*@@=@@+[@%[@@@@@@#>@@@@>+@#@)+@@@@)+[@@ ::: 
 @@<*@@]@@*+@@@@**@@@}]@@@@+@@@@<<})>)@@@========-%@[:-)=>}@@+@@:%@# @@#)@@@::--::-:::-@@>}*[@@:*#@@@@%<@@@@+=@-@>=@@<@]: @@[@<<}@*@)**@ @<+@@@@%[*@)%>+@@%}-@@=@@>)@@@=@@>@@@>@@@@)=@@@@=#@@@<>[@@ ::- 
 @@)>@@<@@>-@@@@>>@@#@}@@@@:)@+@]*[*>]@@@ :::: :--#@#-*<):]@@=@@:[@@:@@}]@@% :  :::::::@@<})>@@:%@@@%#)-@@@@+:@>@]*@@)@@:-#@*@]>}@+@]*:@)@)=@@@%>)=@*@>-@@)@+@@)@@<<@[)@@[-@@@>@@@@]+@@@@+}@#@+<<@@ ::: 
 @@}<@@*@@*:@@@@<*@@))]@@@@* @<@#)[-[}%@@<--+@@@@%)@%=> )*>@@:@@->@@ @@>>@@}      :::::[@[)}:@@=@@+-+>]-@@@@++@]@%-@@<@@**<@:@@+%@-@#>=@@@}+#@@%:]+@*@)<[@+@+}@]@@]<#:]@@: %@@+@@@@)-@@%@>[@>@=[<@@@@@* 
 @@@<@@=@@+-@@@@>+@@[)[@@@@*>@@@@[]-#)<@@}=-*@@@@@=@@+><][-@@-@@=*@@ @@>>@@}    :      >@@*]<@@}@@%@@@@[@@@}--@)@@+#@@@@>>-@>@@:#@=@@>-@@@@:*@[@>**@<@>**@)@<=@[#@#][]@@<  }@@*@@@@%<@@>@)<#:@>%=@@@@@@ 
 @@@>@@:@@=-@@@@)*@@@)}@@@@]]@@@@)*+}<+@@%::+@@>@@<@@++@#@-@@)@@+>@@ @@**@@[::         -@@+<]%@@@@@@@@@@@@@@@@@}@#<]@@@@+*=@]@@-]@>@@+:@@@@--@+@<]##)@%>-@@@}-[}*@#]>@@@=::[@@>@@@@@*@@=@[+#*@@@#@@#@#@ 
 @@@>@@-@@=:@@@@}+@@@]]@@@@@>@@@@[*+]**@@@::=@@+@@}@@*>@}@-@@@@@*>@@ @@+=@@] :         :@@<@@@@@@@@@@@%%@@@@@@@@@)->@@]@---@#@@=>@[@@*-@@#@--@+@@@]=[}@)+@@@@+>} @[<-@@):::]@@>@@#@@+[@>@#*%]@@#[@@)@@- 
 @@@*@@*@@--@@@@%+@@#[<@@@@@*@@#@#*=]+*@@@ ::@@*@@@@@=+@)@*]@@@@><@@ @@+=@@]    :===:-==@@@@@@@@@}}#%#]*-*)}@@@@@@@@@@>@>--@%@@--@@@@)=@@*@*-}[<**=+@>@<*@@@@+=}+@#<-@@[ ::<@@*@@>@@-+@%@%*%@@@%[*@@@@) 
 @@@+@@<@@=-@@@@%+@@][*@@@@@+@@[@#+:[]>]@@:  @@<%@@@@::@=@<<@@@@)<@@:@@+=@@< :---->#@@@@@@@@@)+-    :=*>*=+><<]#@@@@@@@]>-+][#@==@@@@}>%@=@<-*>+=-:*@=@>)@@<@*-#<@@)+%@@ ::>@@<@@:@@= @@@@+}@@@)[=@@@@- 
 #@@+@@]@@::@@@@@+@@<}=@@@@@*@@[@[:-%#>=@@+  @@<[@@@@::@>@@>@@}@[*@@:@@+=@@>=>}@@@@@@@@@@@><@]         :=+=: :::+<#@@@@@]+ *[]@+=@@@@[<]@}@]-+<*+= >@:@++]@*@):#)@@)=]@@ ::+@@]@@>@@-+@@@%**@<@+]<@@@@= 
 )@@-@@#@@==@@}@@*@@=#:@@>@@*@@[@<:-%#:=@@]  @@<)@@@@==@#@@>@@<@}-@@=@@-=@@@@@@@@@@@@<<-%])+@#     :::::: ::   :-=>][@@@@@)>}*@-=@@@@}*[@@@}=-)*]=:>@=@<=-@@@]-[<@@>++@@:: -@@[#@%@@->@}@[):@)@@]<@@[@- 
 >@@ @@@@@:-@@#@@+#@:% @@=@@+#@]@*:-}@-*}@@  @@<>@@@@+:@@@@<@@:@#-@@=@@<*%@@@@@@@}+-+)<]@)[+%#=::-*)}%@@@@@#[<>+= -*<<[@@@@@@)}::@@@@}>)@@@@=:}+@--<#<@}+<@@#)-*]>}=*-@@::::@@[]@@@@+<#]}+[+#@@@)]@@=@* 
 *@@:@@@@@-:@@}@@-[@-@ %@[@@+]@*@)--#@=>+@@  @@<*@@@@>=@@@@)@@<@@-@@[@@=<[@@@@[<=*=*<}-@@<)*<#)*<}@@@@@@@@@@@@@@@@@%)+=>}@@@@@@)*@@#@]>=@@@@--@*@=*[}@#%>}#@=]-:+@@@)=@@-:::@@}*@@@@+)<[)*%=)@@@+]%@*@< 
 +@@:#@@@@=:@@<@@:]@-@:}@@@@*<@:@[+=@@:>:@@- @@)*@@@@)=@@@@>@@%@@-%@@@@[#@@#]*:: +]>##[@+]-+->)]%@@@@@@@@@@@@@@@@@@@@@@[*-[@@@@@@@@[@<==@@@@--@*@==[]@<@=%>@*[=:#@@@<:@@=   @@}-@@@@-)]#>}%--@#@*>>@@@} 
 =@@-]@@@@= @@+@@:[@+@:[@@@@<+@*@#>+@#:>+@@* @@]>@@@@)=@@@@=@@@@@}@@@@>]##]= -==>)=}@-@%<]==*+-)%%%#}}}[)<>><)][}#@@@@@@@@}+)@@@@@@@@>-+#@>@--})@+:[*@+@*[-@]}+:@@@@*-@@+   @@%-@@@@><)]=%[=:@*@>*>@@@% 
 =@@+>@@@@= @@:@@:}@=@:)@@@@[+@]@@)<@]:<>@@[ @@[*@@@@<=%@@@]#@@@@@}=-=[#]+--:- *=+#@-@@-]=++**<]%%##[])>*+=-===+=++*<]#@@@@@@**]%@@@@@]*<@=@--*]]<-[ @*@[]=@%}<:@@@@-=@@>   %@@:@@@@@=<)+@+<:@-@>*>@@@@ 
 =@@*+@@@@+:@@-@@+#@-@-*@@@@#+@@@@>)@>:]*@@@:@@[*@@@@) #@]@@)@@@}:>=*#)=+: -:+>=*[@<}@)>*++>=)#%@%}[)>*++++=--:-::  ::-+>)%@@@@*+>}@@@@[<@]@=*=]:[:)+@@@)))@@})-%@@@*-@@) : ]@@:@@[@@-*)>@-[:%+@)>+@@@@ 
 -@@*-@@@@*=@@+@@-#@*@-+@@@@@*@@@@*}@*-}<@@@ @@[*@@@@]=[@<@@>)*->*+[}>--=-+-+< *<#>]@#-=+=*=*@@@@#]*=-::-----::::: ::::::-+)@@@@]-:*%@@@#@%@:+<]=@+*>@%)<)}@@%<:)@>@++@@# : >@@-@@=@@+=*>@+} %)@[<+@@#@ 
 <@@*-@@@@*+@@>@@*}@<@=*@@@@@=@@@@+@@-*[)}@@:@@[>@@@@)=>@@@@+=>*-*%]--:=-- +>-<>[[<@#>=:--=>@@@@#)*-:  :::::-::::: :: ::::::*[@@@@+ :<@@@@@}-><]+@+:>[@[}<}%@**+=@-@++<@@   +@@ @@%@@[::*@>}=}#@%[*@@=@ 
 #@@<-@@@@><@@)@@-)@[@)*@@@@@+@@@@=@@-[<=]@@:@@]>@@@@[=*@@#-+++=[[>**--::-+*:+*)]+#])===:-*@@@@#<+-:    :::-::-:-: :: ::-----=<%@@@*  >@@@@>*<<}*@*+=*@)@+[+@@@%=@]@*:+@@   =@@:[@@@@%+-*#}]>[@@@%*@@#@ 
 @@@):@@@@]*@@]@@-)@@@@=@@@@@=@@@@=@@+#*=>@@:@@)>@@@@%<}[=-=---}]:+=+*:=+==:-=]]-#])>+)--+%@@@#<+-::::: :::-::-::- :: :-::-----+]@@@*  )@@@}*=-@>@<++*@:@*]>@@@@*@@@[=:@@:: :@@+]@@@@@+->#@>*>@@@%><@@@ 
 @@@[-@@@@]-%@}@@+)@@@@-@@%@@-@@@@=@@+%]=+@@+@@)*@@@@@%):=:=->#[:*:>>-+*>--=-)#-@]>>+[=++%@@@}>=::::::   ::---::--::: :-::::::---)@@@= -}@@@+=-@>@]=)]@<@*>*@@@@><@#@>-@@=:  @@><@@@@@*:<[@**-@<@]]-@@@ 
 @@@]+@@@@)=%@%@@<)@@@@=@@]@@-@@@@+@@+[<<=@@<@@}=@@@@@>-===:<%]:> <+-==)*:=:>}-@[=+>[:>-@@@#<<[}[)<***+===-::--:--:::::-::::---::=)@@) *]#%@}--@*@}])>@[@+=*@@@@)-@)@]=@@<: :@@)*@@@@@>:><@=<-#=@+]*@@@ 
 @@@)+@@@@)*@@@@@]<@@@@:@@+@@-@@@@*#@-@]]=@@#@@#=@@@@-+====[#<+<-*=+-<]+--=))+@#=:*)=):}@#)*]#%@@@@@@@%]<*+==-----::-:::::::--:::-*[@%-)><#@%<>@)#@%<)@#%>=>@@%@[:@#@[=[@}:  @@[+@@@@@*:=-@*[-]:@=}+@@@ 
 @@@]-@@@@)+@@@@@)>@@@@:@@-@@-@@[@*[@+@><>@@@@@%=*@[:=---+}[-**:+-+-]]----><>@[-+<+>}-}@@@[<<>>*=<%@@@@@@@@[>*+=-=-:: ::::------:-+<@@+<+<@%]*>@@>@@)*}@<):*@@*@@><%)]*]@@   @@]:@@@@@>+:=@@[<<=@>%*@@# 
 @@@[-@@@@)=#@@@@>+@@@@=@@]@@:#@>@*[@+@<[*@@@#@@+]>=+++-*[)-<+----<[]-==:=+<@[:+)=]]=@@@@@@@@@%%%@@#<=}@@@@@@%}<+-: -::  ::---==-=+>#@++>)@@<->[@-@%+:*@:}>}@@)@@]+):>*<@@   @@>:@@%@@><=<@@)<<>@)%+@@+ 
 @@@}:@@@@[=}@@@@<-@@@@-@@@@@=}@=@>[@=@}@-@@@%@@[< =+=-<[>-*---+:)#<:**-- <}<:)>-[<>@@@@[>-=+=-++>[@@@@[=*[@@@@%]+::-::::: :-:-==+*<}@<=-<@@)-<*@<@>+=*@:@<}@@@@@>+>*=*>@@=*=@@>-@@[@@+):]#@**>>@[@+@@< 
 @@@#=@@@@#-[@@@@[-@@@@-}@@@@-}@:@)<@}@%@>@@@@@@):-=:>])*:-::===]}*+<+:-+]]=>]*>[+>@@@[*<[%@@@@@@@@%)+>][]<++*>)]<=-:  ::::--:::-*>)}@)::>%@]:<=@*@@<+:@<@[}}@@@@}>+*=<>@@+ +@@)*@@<@@+[=))@>*+<@}@>]@@ 
 @@@@:@@@@%:[@@@@@-@@@@-]@@@@:]@=@}*@@@#@#@@@@@]=++:*)+:== :--*]<+<*==*)>=+]>-][:>}%}])#@@@##@@@@@@@@@%+=<][]]]]]>-::::---=====-:=>]%@< :*}@}=<+[]]@>=-@@@@)*@@@@<=:[>]*@@=*=@@#=@@>@@<[<<<@>)*=@[@)*@@ 
 @@@@-@@@@@-[@@@@@]@@@@+<@@@@>[@<@%*@@@#]#@@<#@*-=-><<=:==---*+>===-:=<*=>>:)#):<)>)@@@@@@@@@]>=*[@@@@@%]+-+)}%%#[)>+====*><)])<*=+)%@) :*]@@)>+*@:%*++@@@@<:@@@@}]]%>[*@@-  @@@=@@=@@*<***@*<-*@)@[+@@ 
 @[@@:@@@@@:)@@@@%+@@@@>+@@@@[[@}@@+@@@#-++})@]-:+)]<=**-:-+**+])-+=*)+>+*)}[*:>[]<>+==<#@%>-*<+))<*=>)]})>>>)[#%#}]<****<]}%@@@@@@<#@] :>))@%]+=@<@<=-@@@@*-@@@@}=*}+}<@@*  @@@+@@:@@><<)-@]#=]@>@}<@@ 
 @>@@:@@@@@=+@@#@@*@@%@]:@@@@@*@@@@-@@%@-::><[=+>)]*=}@[<=:*+>:=))]}<-==*)]*- *%@@@@@@@@@@@@@@@@@@@}#)-))>>]][[))<<<)))<<)][[}@@@@@@%@) :<<*)@@+>@[@<))@@@@>=@@@@@@#@>[>@@[  @@%+@@-@@]>=>>@%%-}@<@%]@@ 
 @>@%:@@@@@->@@@@@+@@#@}:@@@@@)@@@@=@@)@*=-:=<<]>-+]%)-*=*=+)[}@@]* ::*))+:  >@@@@@@%#}[]>--+[@@@@@@@@@}[#@@@})*=:=*<[#}[[[]<>*+++)@@}> :><<>%@+<@[#->}%@%@}>}@@@@-+@<#*%@@  @@#-@@=@@@*-*]@@@+}@+@@]@@ 
 @=@#)@@@@%->@@@@@=@@[@@-@@@@@+@@@@>@@*@+:-+)})+:<]=>)<><>]#@}>*=:+=*)<=:   =@@@@@[<+=-::-==+><<*+>>*>#@%@@%])*==- =*)%@@#]>+-+)[}#}>+= :*>)>[@<>%][:*)-@=@@>=@@@@]}@)@><@@  @@}-@@+@@@>==#@@#*>@[@@][@ 
 @}@#>@@@@):*@@@@@=@@)@@*@@@@@+@@@@}@@<@+-+)}]+=-))<== *[%>)*-+<>*]]>=:    =#@@@#)+======+><][}}}}###%@@@@%>++----::+>[@@%<>*+=*]%@@@@[= =><)]@}+#}}+>)<@)@@>:@@@@>*#]#}=@@  @@[=@@*%@@>-:%@@))-@@@@[-@ 
 @@@@]@@@@* +@@}@@:@@*@@*@@@@@=@@@@[@@<@**]]*+=><<)=+]}>)=<<}*<%#)*-::::::=[@@@#)*++===+==++>]}@@@@@@@@@@%]*==--- ---+>@@@--=+<<<]>:*#@) -**]}%@=]@]%>)>@@@@<=%@%@])@@]@-@@  @@]=@@>]@@<::[@@}]=@@@@[:@ 
 @@@@>@@[@<:=@@<@@+@@:@@+@@@@@-@@@@=]%+@]#[<><>[)*]@[*>-*]=]%})*+::::::::+]@@@%<**>>*+++=========--====+*>*++=-: ::-==+)@@#**->]%@@@[>@[ :+*)}[@)<@*@+:+@@@@)++@<@@-#@*@=@@- @@<=@@>*@@)->@@@@]:@@@@}:@ 
 @@@@:@@=@]:=@@-@@*@@)@@-@@]@@+@@}@=*}>@@[=*[}]}%]>=+:++:=<<<>=++::   :-+]@@@@]+--==++==--=:----===+******=:::--:---=+**@@@=+<+*+*]%@[#) :=+>])%}>@-@>==@@@@)--%*@@<<@:@=@@> @@<=@@<=@@]:}@@<@}:@@%@%=@ 
 @@@@>@@<@@=-@@-@@+@@@@@-@@-@@+@@<@*-)}@}-<%[>*+=>=-+-*->[):)]<<*-:::-=*]%@@@#*--::: ::=: ---=+*><<<><[}#}<+=-::- -=*><*>@@@<]*--::+)))+ :==*]]#@<@>@]:=@@}@%= #<@@-:@+@:@@[ @@)=@@):@@]:}@@@@@+@@>@@+@ 
 @@@@*%@@@@=-@@>@@=]@@@@ @@)@@<@@>@>-)@@]%@@<-:=*><>)*-#%-=)@%*: :::::+)}%@@%<=:::-=====-=*><<<)))]][}}}[[>-:-*]##]>))>*+)@@@@@[<+ :=+=: :=-+]]}@}@[@[**@@:@@:+%[@@>*@)@*@@% @@]=@@[ @@}:]@@[@@+[@:@@*@ 
 @@@@<#@@@@=-@@}@@=>@@@@-#@%@@]@@+@<=}@%@@[ +=>)=)%)+}#<:>##]-*=:::::->[}#%%]*=---==+***>)]]]][[[])]]>=*]}}@@@@@@@@@@@}[}}%@+=]}}]= :::  :-:->)[%%@#@@]+#@]@@-=[@@@++@]@>%@@ @@}+@@}:@@#:<@@*@@=<@>@@*@ 
 @@@@}}@@@@+ @@@@@=+@@@@+[@@@@]@@+@])%#<)>::*)+<@#-}@)--=<>>]*:+:::-=>)}}[}})+-:-==++*><)]][[[}}[)*-+)}#)-#@@@%)>%@%@@@@@@[<<*=*]#<:     :=-:=<}[#@@@@):)@@@@<:*@@@:-@)%+}@@ @@}=@@#:@@@:>@@-@@*>@[@@>@ 
 @@@@}[@@@@*-#@@@@+=@@@@*)@@@@>}@>@%@}*])*-:-+%@><%<=>-+*=+==>*= --=<][[[][)<+::-==+**>)][}}}]<* +<}%@@##%@@@@@@@@=@@@@@#<*+<])<<#}+      -= :*[[#@@@@]=>@@@@<-+@[@::@[}*>@@ @@#=@@#:@@@-*@@=@@><@#@@<@ 
 @@@@)>@@@@*=]@@@@+=@@@@<>@@@@*)@]@@%>>)]+-*)%[:}}<=<:*<*+>][> ::-=>[[))]))<*+::-==--=*][[)+:+)]}%@@%}]<>)@@@@})]@@@@%[)><<=-*][[@@[-     -=-:=[]}@@)@]<>@@@@):*@=@>*@@))*@@ @@#+%@% @@@=*@@<@@>=#@@@)} 
 @@@@)+@@@@++<@@@@*-@@@@)*@@@@)>%@@@[>*>>-:=<+<%#>-*=))<><>-:::::-*)[]>><<)<*+-:--::-+><*<)<)]]][}##[)>+=:::>}@[*>)]<+*<<><>+=+<[%@@<     :--:-)}}@@<@}<-@@@@#:*@:@# %@-)+@@-%@@*#@@ [@@**@@#@@)+*@%@}* 
 @@[@)-@@@@=*>@@@@)=@@@@[+@@@@]->)@@)- ++=-*+[%]*=>:><>=:: ::::::=<][[)<>><<+=-:- -==*>)]<=-:+++)[[)<>+-: :-)%]<#@@#}[<+*+*>**=:+)%@%-     --  +}#@@@@}<>@@<@@<>] @@<[@:]+@@>}@@<%@@ >@@)+@@@[@[=:@<@#+ 
 @@>@[:@@@@:*<@@@@[>@@@@}=@@@@[*> @@= +>]<=*[#<==>-<>+::   ::::::+)[[}[<<**<*-::----=*<><[))]%@@%#@@@@@@@@@@@%-><}%}[[]<>*+*++++-+]@@*     :- :-<##@@]>>*@@<@@[:*=@#+*@-}+@@}]@@<@@@ =@@}:@@@>@%==@=@#< 
 @@:@%=@@@@-*<@@@@%=@@@@#=@@@@@]<+@@>*[}[**=<+: *-*=-- ::::::-:::>[}[]]++=-><-: :=-:--*}[+*)#@@]>>[%@@@@@@@@@@@@@@*>)<<<>***=--===>%@]     :=:--+}#}@*=:*}@@@@#***@%<>@*#>[@@)@@*@@@ :@@%-@@@=@@*=@-@}* 
 @@+@@:@@@@:+>@@@@@=@@@@#-@@#@@>)@@}<<]>:>+**: =+:==-:::: :::-:::<}}]<)=:: +)=-::: :=>]]+[@@@@@@@@@@@#]>-)@%#%@@@@@>=******+-::-==*[@}     -<>> =)@}})++*+@@@@#=+<@%>+@)}>>@@<@@:@@@  @@@>}@@ @@*=@-@@< 
 @@)@@=@@@@-+*@@@@@+@@[@@-@@]@@*<@@++><:+*=>= -= -=+: -::  :: : :<##]<>=:-:-<*-:--=+><**#@#]<+=<]]][%@@[]}>==>]<*)@@)---==-::---=+*]@}     -@]% :*@@>>[])=@@@@#=*>@[>:@[[*+@@<@@-}@@  @@@[<@@ @@]]@)@@< 
 @@%@@ @@}@)+*@@@@@=@@>@@-@@=@@*]@@+=+=-=+:**:=-::=-:---==:--- ::<##[)>=++*:><=-:-=++=*[})>+-::::--==>]<<])][}}%}<=%@):::::::-==++*#@)    :-@)@=::)@@#:[}]@@%@@--*@][:@#]* @@*@@+<@@  %@@}=@@:@@#[@@@@[ 
 @@@@@ @@<@}+*@@#@@+@@+@@-@@ @@-[#@]>- :=-<+<-=::-= =+-+*>=*++::->[}}]<+=->*+<+--::-+<]])*+=-: :--:-+>]]>>=+=*]#%@[-%@<- :-:--=+++)@%=    :+@+@>: -@@[[)}%@@*@@=+}@<@-@#<>:@@-@@>=@@ :]@@}:@@+}@@<@@@@# 
 @@@@@:@@-@@**@@)@@>@@+@@-@@)@@+<+@@>= -+)>>=+-::+--+=+<><+*++---+)}}[)>>++<->+-::-+><<>*----::::-=+*>))>**-==*<>>[)+]}<:-=-==+==+}@>      >@+@]:  >@@[=[@@@*@@><}@=@=##>)-@@*@@*-@@::*@@@=@@])@@]}@%@* 
 @@@@@-@@)@@>+@@=@@>@@:@@:@@#@[=*]@@**>)]]=<:::+*=:+=-*])]>-*-+=-->}#}]<<<=+=>>-=-+***+=:::-=--==--=+*<)<><>*++-:-*]%}])*<***+===-}@-      <@+@[    +@@=>@@@%@@:+>@-@=)%-[=%@[@@+=@@: -@@@)@@@>@@][@>@* 
 #@@@@+#@@@@>+@@ @@>@@*@@-@@]@}*-*@@=[#})++>=-)>[:*<**+)]#[]+-*++:-)##[))>+=>+]=======:: :::--=+++**>)[#}[[[]<****<<)[#}]*=<>=-=<)]@:    : <@>@[::   <@[-#@@@@@ --@+@=-%*}-)@@@@=:@@:::@@@[@@@*@@]>@:@) 
 [@@@@*}@@@@*-@@:@@>@@[@@*@@-@@==>@@@#>+-*<>:])<]>]<<<=[#)#%-+*=+=-=)##}[)*+*=]*++=---:     ::--==++++>))[}[])<*+====+**-+))*-=)@#[#    :  >#+[[: ::  ]@>)@@@@@===@>@*:)]]-+@@@@-:@@:  @@@)%@@+@@)-@>@} 
 )@@@@*]@@@@*:@@=@@>@@@@@>}@<@@:+]@@[>]<:><][@>}=])+*+<[@*@#=*>--+=-=<[}%#]<<*[<>*+==--:::::::::::---==+-=>))<))<*=-:=++>])*--)@#>*>      :>}+[]::-=-:-}%<@@@@@*<*@]@[:-]=::@@@@--@@:  @@@)]@@-@@+*@}@% 
 <@@@@*)@@@@+ @@*@@<%@@@@>)@@@@+<[%@]@)[><<*%*%[=})**-)}@+@}-*+--=++*+=>[##})>[)<<>*+======-:--==*>****+====*==**+=::--*<<=:=)@%=-=-    : :*<>)]::+++--+#]@@@@@)]=@@@%+<[**=@@@@--@@-  @@@<>@@:@@=)@@@@ 
 <@@@@><@@@@=:@@>@@]}@@@@><@@@@*=[@@])<@<<)<])])>@]+=*)@@=@#:>---=+++++==>)]]]}}}[[]<>*++++++++><)<)))]])))<*-:-++-:::=*+-:-]@@+       :::=<-+>] -*-*[<=<#@@@]@%)=@@@@*)[#>-@@@@=-@@+  @@@>>@@-@@=}@@@@ 
 )@@@@<>@@@@-=@@]@@}]@@@@>*@@@@>#@@*)##[*[=@+}=<)@*::)<%@=@#=>::=====-++=-:-+>)}#%%%#}[)>>><)]]]])]][}}}[])<>>***+---=+=--*}@@+        --:+*:->* =*->=+:-#@@@=@@>-@@}@+)}@> @@@@*:@@<  @@@>>@@>@@)##@@@ 
 >@@@@>+@@@@-*%@@@@}*@@@@>:@@@@#@*<}[]->]-@<%<:>[@=:+[*#@*@<*=:---:--==---- -=-+>][#@@@@%}[}#%%%###}}}]<>>>><<>*=+=-===--<@@%*         -::=+***::=+:=}* +@@@@=@@<-@@>@=>#@>=#@>@)-@@}  %@@==@@}@@])+@@@ 
 +=@@@= >@@@:**@@@#[*@@@)<=]@@[]}}]*=[)<-}@)%==>}]=-]#*@@<@+>=:+:-=======--=*+=-:-+><]}#%@%%%%%%%#}[]<*++*>>>>*==+=----=)@@]=          --:::-+--:-+ *+>--@@@@]@@<+[@<@+-}#<>+@+@[:}@@  [@@=:@@@@@++:@@@ 
 :+#)@-:-@)@:*>@@@#]))*@#>+=---*>=+}@%*:*@+@>-=*)+-=%%*@#]}=** +-++==+=-:-+>*+==--:::-+><][[]))<<>>>*+++++*+==++++===+]@@@>::+*=       ::--::: -:+*+>-=*)@@[@@@])*>@@%*>@[]>=@@@#=)@@@@@@@=<@@@@@-+=@%@ 
 :+@)@--+@>@+<)@@@@[]>)@}*==-=)[[#@@)::*[@)@+==**-=+@[]@))<>=<:>++=--: ::+*+===++==-:: ::-==+=-:::--:--===-:::-=+==>}@@@[+  :@@@        :=:-:  : >-)+==>@@%<<@@[]<>%@@*)@<@<>)@@[:=#@@@@%[)+]@@@**>*[@* 
 [@@@%=+-@*@><]@@@@[]>[@]+==>])>[@%)---<@)@]*-]>-==>@<##:*=>:<+<====-:-+**+=+++***++=-::: :::::::::   ::::::---+]@@@@@[+     @]@        :=---   ==** :*@@#>>)@@@>>]}@@-)@=@)=@<@==-<*}@@}=%++)@@@=>][)< 
 <@@@>*+:%:@)<]@%@@)):<@)+>}@}<<#@]*+**[@:@)=][-+-->}*@#+-==:+>*==--=+*++=========+++==-: :::-----:::::-=+<[@@@@@@@#<-       @=@-       :--::  -=-+ =*[@@+*+>@}@+=[%@@-<@*@) @#@>*=]@@@@@<%-:@@@@:>[%<} 
 )@<@-**=}+@]))@%@@<<=+@<<[%>:>#@]=+:><@@)@**<+:>*>+)>@#):=:==--=+:-=+=--====---:::-====-:------===+*>)}#@@@@@@%]+:          @+@=       :::  ::=:-+]%@}@@>+++@+@=*#@]@<<@<@]-@@@#**#@%*#@#%=:@@@@+>@@-@ 
 -@<@<><=]*@)>*##@%>>++@>[}[=>@@#+>+-[>@[}@=>+=+[]>=+<@}[=*-+=:===-==--====-------::---==---::---=+*>)][[}[>-                @%@-     :: :: : =+>[%@@@#@@#<+=@+@]*[@*@]>@>@[-@@@@*>%@[>#@@#*-@@@@)+[@[< 
 <@>@)=<->*%<**]]}}*)*<@-#}>*%#<>=<*[]=@]}}=+++]%>=*-<@)}*<*=-=-:===-:--==--:::::--:---=----::::-==+++==+=-                 =)]]    :::::::::<%@}#@@%<@@@*]+=@]@}-}%-@[*@)@[=]@}@**%@>)#@#[*=@@@@}>]@## 
 )@)}):<++=[<+*)<)]*<>]#=@}<}@)=* =<#+>@]}>*:+>#}*=<<)}:}+<*::=--===-:::--::::::---:------=-:---=++=---=++-                :+:+: :::--::=+-:+}%[<[@}+}@@@-)=:@)@]=[#-@%+#]}[)<@[@<*%@:[]@)[=-@#@@@+]@*= 
 [@%>*-<*:-)<=*<<<[+<++)}@)}@[**==]#+*=@*[<<==)]><]}]>*))->+-==--=----:::-: :-::-------=----=---==-::-==*+:               -=--=::::---=**=-=<}[+<[@=*}@@@+]>+@>#<=]@+@@-)[*[)[@#@)*#@+@)#*<==)<[@@*[%*: 
 [[%-*=<+==)<+>>*>[=>=*)@@<#[=:=<}#*>*@@-]}<*+>=<@@}]>=)->>>*=--:=-=-=-==--:----====-========+=-------=+>+              +<*--:: :-=+=++-:=<>>}[>+<}:*}@@@]]<+]=>)*]@<%@:<#=<=>#@@[][@<@+)=>*===>##*][+  
 )]#<+=<>+:)+>>*->)=<>+)@>]#+:>[[*-=*]@]*)@=+* ]@@%))>]:+>)<+=---+=--:----::: :: :-=---==---=+=-:--=--=+<+           =<)<==:- ::=*><}%]=*]))>%)=+>]*[%@%@[}[<<++<}-@><@><#>)*-#>@)**@]@-<+><*:-=[#=)[+: 
 <]}]+:+<>:<=+>*-**=>*=)]>]<}%@%)*<[[[@-<*#]*=}@@%]> @*+:])=-====+=-------::: :::----::-===-===--======+)*       ::::++-:*+: :-+]@@@@@@]#)>})@>>><]=>)[@@=*>=-:*)]:#)-}*>]]+>-)]%<#%@}@+)+<]*:==)#*)}*- 
 )>%}+*+)]-<++<+-==-*+><*)>%@@@@@@@@%[>+==]}@+@}<=-+<#=*>}>=====++=====-: ::--:::--::::=-===-=+***+++*+*)*         ::-*>=:  ->#@@@@%+=[))>@)#@+ :)@#@@@@@>[}+*<<))*[[>}**<}>++:*%}*%@[@+<=<]+-=+>[)*}>= 
 )*@@><>}[+>[}[>++==<])*@@@@@@@@@@@@@@[<*}[@@#@*+=*=-[+<)]+--====--=--: ::::: :-:::: :---==--+*>>>**>>><]>:       ::::::  :+[@@@@=<#>=<[>[@+@@[)+]@+<)%#@-*@=*=-][<)++)>*><--==-))=[@<@-*-<]+-=**))-}>= 
 )*@@-+-}[>+=+<#@@@%]@=@@@@@@@})<)][]]@<#}[@@@@*-:+<*]-)>=:::-----====-:-=-::-::----::---==++****><>**>)]>-:::  :::--: -+<)}@@[=*+->]#[<}@*@@><][)@)*<#%@-=@+*=:)})[>>+]=>>==**-+):*@=@>+ >}+=+>*>>-}>* 
 <<@@-*+}@@@@@<[@@@@@]@@}>=----==--+*}@=@<<@@@@<]<*=-[:]*---------=====--::-::  :------=++*******++++*>]]>===-::-----=+>)<*[%)-==*[%%)]@@=@@]]#@@@@)*<[@%::}}>=-[}-)+>:):***->=*+]*+@>@*+=>@)+*]>+++}++ 
 ]@@@)<)[@@@#@@@@@*@@=@@+-:: :-:: :-+@@>@<)@@#@))>*-+[=]**>*===-:=--::=-: :---:::-::::--==+++++====++*>][>*+**=:-==++>>>==+[))>=+><+-+@@)#@)<[<*@@@[}@@@@>=*)>+-)]=+)}+<-+==:>=<+<=+}>@::=<@]:+[*::=]=+ 
 @@@#)>+:==+*}@@@@@@@%@@*=+=-=+++==++@@@@*>@@*@}+*=*])>)>>=++=---=--::---:---=: ::::::::: :--==---==++*)[*+++*+-*>>><>+:*=><*<<))<)))=}@@<@@)***=-=-+[@@)>>)}#]=>])#%@**-=>*=++<=)+:+<@::+-@]-*]*==:]-* 
 @}+::: ---==+@@@@@>@@[@]+++*>**>>**+@@@@:=@@-@@+*+*%>)*<*=-==--==---::-++=---:::: ::::------=-=--+++++>[>===>+=>><<<>+>-><+=++====+++=[@@<@@*=====----=- =+>}@@@%%]%@=*-=<++*>> [=+=)[-=<@@[+<<=: :]-+ 
 :::---==----=)@@<@@@@*@@*--========*@@@@=+%@@@@==*=@*}*)+-:--====-:::-====----::::: ----===--:---=++**>])++><==<***-*)=)[<<)]]]]]))<>+=@@@@@#+=++=--:: ::-==:>}#[):@@-*:*]<*>>*=}-+=<<--<[>=+]>=-: ]:= 
 --==--------=*@@@@@<@@*@}=--:-====-<@)@@=-<@@@@==*}[%}}*):- -==--:::--:::----::::::--:::----:::::--=**><]*+<[]*+]))[<-[#))][]))]))<>*=-+@@)@@>++==:::::-:: ::---=*>}@[-+=#[)>-++[<-:>*-:>%#)+>)+--=[:+ 
 ----:-::::-==+)@@-@@]@%>@< -===::--)@=@@= :*@@]*>=@=@>%*]-:-:::----=-::::------:::--::-==----:::-===+*<<<<)]%@@#*==:)}[])]])>****>*+===+]@@<@@+=--::::    ::  :::-:+}@%<-##)>++*)[-:>*---+[*++)-:*+#:> 
 ---:::: :----=*@@@@@]#@%)@**<<<>*-:<@-@#*-==--+*=}]@@-<}*>==::--==-----===--=-::::::::==--====---=+==+>>>][][}@@@@@@@%#%%#[)*+++*+=-==+*>@@@@@}=-::-:: :::----:::: : <%%[%@-]+--+#::)+--=*}}>*)::><}:* 
 :::: ::::----=+]@@+@@*@@%]@<=**>][]}@-@#<--=::=-<#<@+=-)*])=+==--=--:----++===: :::::--: -::-=----===+++><<>>>><[%@@@@@@%[<+=-=+========+<@@]@@-::---::----:---:::: :::+]@@}<= :+}:-]+::-<]})<)::=>>-+ 
 ::::  ::::::-==*@@@@@<>%@#[@#-:-=<]%@#@@<:=====][-#>-:=*%+@)+*+:-- ----:-+++==- ::::-:-:-======-:-=+=+=>>+==--+<]}%%#[)<*=-- :-=======-=+*[@@}@@----::::::::::--: :: ::::>@@]+*+<[:=)>--=<[]>)]:=*++-= 
 :::  :::-:::-==+]@@@@@-+[@@)@@<===:=@@@@)*=:==+>>}>  :-=]@-@>:--=:==-:---=+*++=: ----==+*****++++==*==>*+==***>][]<*+==::-=-:-=+==-::--===>#@@@@>=-::-: ::::::::::::::::::<@@])))<-=<<=++<==+<]+==*>== 
 :::     :-::--=*)@@+@@:++<@@=@@[*++*@@+@@*<>>*+**=--::  :}%]@+::=-:-:-:::-+**+-- ===+***+++=+=+**=*++>*=+><)))))>+=::-::-=-:==++-::::::---+<@@*@@-:::::::::     ::: :::::::*#%#[):=:<):-*>*==+<<)-+*=* 
 ::::    ::::-:-*<@@[@@-*+=>#%=#@@]<)=@@@@[:=>)<+--=+*>>*++%>@%=--=:=:---++-=**+--===+=====----=-+*-*>**>***+***=----:::::--+++=-:::--:--:-=+[@@@@}:    ::  :     ::   :-::::+)]-*+*-*)-+*>*===+-)=+*=) 
 :: :    ::---:-=*#@@@@<*+==*]#)<@@[<<>@#@@[+- =><>*=-:=+***#+@[+=+-++==-=:--=*>+====----:: ---+>+=<>===+===------::::  :-=*+++=:--------::-=+@@@@@+:::  ::::::   :::  :::-: :+})*=>-=<+++<*=++>*<-=++] 
 :::: :::-::-----=)@@@@@++=--+<}[:}@%<>)@<@@@)<>*=:=*<<*=:::]}[@>*+-=+*+-:-:--+*==----=-:::::-+>-*>+-----====-:--:::: :========--------:::::::=@@]@@:::: ::::: :  :::::::::-::->}}->=-)>++]>=+<)=+ ==*> 
 :: : : :::--:----*@@+@@*+==-=+*)[)+@@)=[@}}@@}<>**+- -+++++<@+%]>+=-:-=--=-::=>*=--<@@@@@@@@@#+]<=-:: ::--::-:: ::---==-:-------::::::   ::: :[@@@@<:  ::      : :::::::::-:::->%>*=:<<**]>+*}[ ::==*+ 
 :::: :::::-::---:=#@@@@<=-=---==*]%+[@[=>@@>]@@<--=+=--- --=%%<}*+-:-=-: :-:: +*+*=>#}#)}@@@#]@*++=--:::: : ::::::--==-:--::-::-: ::   ::::-  -@@+@@=:::::          ::::::-:-::=[[-+:>>+*<><=}#+: =*<+ 
 ::-:::::::----:-:->@@@@#=:=-::-=++)%[=@[-=}@@*}[@@]=====+<%@#%=@[>+===-::::==::-=*<}@@@}[<))[@%=:==+--:::: :: :::::::::-=--:::::----::::----  :*@@@@@-::  :     : :  :::::::--:-*]<- >>=>>*<*<[*=-:*<: 
 --====--=--=--:::-+@@:@@>=--:: --=+>#@-@[*+*%@@[*})+<]}#%##<*<%@<----::::::-:::-=--=<%%[%@@@@#<- :---:  :::::-::--:-::::-:::::::------::::: ::::@@@@@<:    :      ::  ::::::-:--->)+ >>=)<=+**]*-=-<>= 
 --========+=:::  :-%@@@@>=- ::----==+}@*%#+*>><@@@<-===- =]@@#})=::::::-----::::---==+>}%#[[)*-::--::-::::-::::------:::-::----:::::------:::  :+@@]@@+:  :::     ::   ::::--:--:=>>-*>-]<-*+*)*-=-)>- 
 ========--:: ::: :-)@@@@)-::-==-===+**[@>}%*+<))<<<)[}#@@%}[)<>*+=--==+==+=------=-::----: ::::  :::-:::--::::::::---=-:--------:-----==-::---::=#@@@@#:  :: : :  :  : : :::-:----+<*=<-[)=>->)>:-:)*  
 *+==----:    :-----+@@%@%+::::::--==++=)@>#@>=+**>>>><<)<<>*+======---:::---::::::  :: : : : :::::: :::  ::: : :   : ::::--::  ::--:::  :: :--:::=@@*@@*::::::::::::: :: ::--::---=><:)+#]-**=)*-=:)>= 
`;

  var TROPHY = {
    label: { key: "easteregg.label", fallback: "Trophée débloqué" },
    name: { key: "easteregg.ascii.name", fallback: "Portrait en code" },
    text: {
      key: "easteregg.ascii.text",
      fallback: "Même un portrait peut se cacher dans le code."
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    var lines = ART.split("\n").filter(function (line) {
      return line.trim() !== "";
    });

    var overlay = null;
    var sheet = null;
    var canvas = null;
    var ctx = null;
    var closeButton = null;
    var lastFocused = null;
    var trophyTimer = null;
    var trophyPending = false;
    var openedAt = 0;
    var lastOverlayTap = 0;

    var rows = null;        // lignes découpées en séries de même teinte
    var cols = 0;
    var size = null;        // dimensions courantes du dessin
    var drawn = 0;          // nombre de lignes déjà tracées
    var frameId = null;
    var resizeTimer = null;

    var reducedMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function isOpen() {
      return overlay !== null && !overlay.hidden;
    }

    /* ---------- Préparation (une seule fois, au premier déclenchement) ---------- */

    // Découpe chaque ligne en séries de caractères de même teinte : un seul
    // appel de dessin par série. Les espaces ne sont pas tracés.
    function prepareRows() {
      rows = lines.map(function (text) {
        var runs = [];
        var start = 0;
        var level = null;
        for (var i = 0; i <= text.length; i++) {
          var found = i < text.length ? RAMP.indexOf(text.charAt(i)) : -2;
          var current = found === -1 ? RAMP.length - 1 : found;
          if (i === text.length || (level !== null && current !== level)) {
            if (level > 0) {
              runs.push({ x: start, text: text.slice(start, i), alpha: ALPHA[level] });
            }
            start = i;
          }
          level = i < text.length ? current : null;
        }
        return runs;
      });
      cols = lines.reduce(function (max, text) {
        return Math.max(max, text.length);
      }, 0);
    }

    /* ---------- Construction de la fenêtre ---------- */

    function build() {
      overlay = document.createElement("div");
      overlay.className = "ascii-egg";
      overlay.hidden = true;
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      // Le focus arrive sur la fenêtre elle-même (sans anneau visible) ;
      // la croix ne reçoit son anneau qu'au clavier, avec Tab.
      overlay.tabIndex = -1;
      overlay.setAttribute("aria-label", "Portrait de Clara en ASCII");
      overlay.setAttribute("data-i18n-attr", "aria-label:easteregg.ascii.label");

      sheet = document.createElement("div");
      sheet.className = "ascii-egg__sheet";

      canvas = document.createElement("canvas");
      canvas.className = "ascii-egg__canvas";
      canvas.setAttribute("role", "img");
      canvas.setAttribute("aria-label", "Portrait de Clara en ASCII");
      canvas.setAttribute("data-i18n-attr", "aria-label:easteregg.ascii.label");
      ctx = canvas.getContext("2d");

      // Le bouton est un enfant direct de la fenêtre (pas de la feuille) :
      // il reste dans l'angle de l'écran, sans jamais recouvrir le dessin.
      closeButton = document.createElement("button");
      closeButton.className = "ascii-egg__close";
      closeButton.type = "button";
      closeButton.setAttribute("aria-label", "Fermer");
      closeButton.setAttribute("data-i18n-attr", "aria-label:lightbox.close");
      closeButton.innerHTML =
        '<svg aria-hidden="true" focusable="false"><use href="icons/sprite.svg#icon-close"></use></svg>';

      sheet.appendChild(canvas);
      overlay.appendChild(sheet);
      overlay.appendChild(closeButton);
      document.body.appendChild(overlay);

      // Libellés injectés en JS : on rejoue la traduction (voir README).
      if (window.claraPortfolioI18n && window.claraPortfolioI18n.refresh) {
        window.claraPortfolioI18n.refresh();
      }

      overlay.addEventListener("click", function (event) {
        // La croix ferme toujours, immédiatement.
        if (closeButton.contains(event.target)) {
          close();
          return;
        }
        var now = Date.now();
        var accidental = now - openedAt < CLOSE_GRACE || now - lastOverlayTap < CLOSE_BURST;
        lastOverlayTap = now;
        if (!accidental) {
          close();
        }
      });
    }

    /* ---------- Dimensions : le dessin tient toujours à l'écran ---------- */

    function px(value) {
      return parseFloat(value) || 0;
    }

    // Calcule la taille du dessin (en pixels CSS et en pixels réels du canvas).
    // Les positions sont calculées avec la largeur de caractère mesurée à la
    // taille réellement utilisée : aucune dérive d'une série à l'autre, même
    // si la police arrondit ses avances à petite taille.
    function measure() {
      var overlayStyle = window.getComputedStyle(overlay);
      var sheetStyle = window.getComputedStyle(sheet);
      var availableWidth = overlay.clientWidth -
        px(overlayStyle.paddingLeft) - px(overlayStyle.paddingRight) -
        px(sheetStyle.paddingLeft) - px(sheetStyle.paddingRight);
      var availableHeight = overlay.clientHeight -
        px(overlayStyle.paddingTop) - px(overlayStyle.paddingBottom) -
        px(sheetStyle.paddingTop) - px(sheetStyle.paddingBottom);

      ctx.font = "100px " + FONT_FAMILY;
      var advance = ctx.measureText("M").width / 100;
      // 0,985 : petite marge pour l'arrondi de la police à la taille finale.
      var scale = Math.min(
        availableWidth / (cols * advance),
        availableHeight / (rows.length * LINE_HEIGHT)
      ) * 0.985;
      var fontSize = Math.max(2, Math.min(scale, MAX_FONT));

      var cssWidth = cols * advance * fontSize;
      var cssHeight = rows.length * LINE_HEIGHT * fontSize;
      var ratio = Math.max(1, Math.min(
        (window.devicePixelRatio || 1) * SHARPNESS,
        Math.sqrt(MAX_PIXELS / (cssWidth * cssHeight))
      ));

      var deviceFont = fontSize * ratio;
      ctx.font = deviceFont + "px " + FONT_FAMILY;
      var cell = ctx.measureText("M").width;
      var lineHeight = deviceFont * LINE_HEIGHT;

      return {
        ratio: ratio,
        deviceFont: deviceFont,
        cell: cell,
        lineHeight: lineHeight,
        width: Math.ceil(cols * cell),
        height: Math.ceil(rows.length * lineHeight)
      };
    }

    // Applique les dimensions au canvas. Redimensionner un canvas efface son
    // contenu et réinitialise son contexte : on repose donc la police etc.
    function applySize(next) {
      size = next;
      canvas.width = size.width;
      canvas.height = size.height;
      canvas.style.width = (size.width / size.ratio) + "px";
      canvas.style.height = (size.height / size.ratio) + "px";

      var ink = window.getComputedStyle(overlay).getPropertyValue("--ascii-ink").trim();
      ctx.font = size.deviceFont + "px " + FONT_FAMILY;
      ctx.textBaseline = "top";
      ctx.fillStyle = ink || "#211e28";
      // Pas de ligatures ni de crénage (« -- », « == » resteraient fusionnés
      // dans certaines polices), et un tracé plus rapide.
      if ("fontKerning" in ctx) {
        ctx.fontKerning = "none";
      }
      if ("textRendering" in ctx) {
        ctx.textRendering = "optimizeSpeed";
      }
    }

    function drawRows(from, to) {
      for (var y = from; y < to; y++) {
        var runs = rows[y];
        var top = y * size.lineHeight;
        for (var i = 0; i < runs.length; i++) {
          ctx.globalAlpha = runs[i].alpha;
          ctx.fillText(runs[i].text, runs[i].x * size.cell, top);
        }
      }
      ctx.globalAlpha = 1;
    }

    /* ---------- Trophée ---------- */

    function giveTrophy() {
      window.clearTimeout(trophyTimer);
      if (!trophyPending) {
        return;
      }
      trophyPending = false;
      if (window.claraPortfolioEgg && window.claraPortfolioEgg.unlock) {
        window.claraPortfolioEgg.unlock(TROPHY);
      }
    }

    /* ---------- Dessin ---------- */

    function stopDrawing() {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
        frameId = null;
      }
      window.clearTimeout(resizeTimer);
    }

    function startDrawing() {
      sheet.style.visibility = "";
      stopDrawing();
      applySize(measure());
      drawn = 0;

      if (reducedMotion) {
        drawRows(0, rows.length);
        drawn = rows.length;
        trophyTimer = window.setTimeout(giveTrophy, 300);
        return;
      }

      // Les lignes sont tracées au rythme de LINE_DELAY, au fil des images :
      // quelques lignes par image, jamais de long calcul d'un seul bloc.
      var startAt = window.performance.now() + START_DELAY;
      function frame(now) {
        frameId = null;
        if (!isOpen()) {
          return;
        }
        var target = Math.min(rows.length, Math.max(0, Math.floor((now - startAt) / LINE_DELAY) + 1));
        if (target > drawn) {
          drawRows(drawn, target);
          drawn = target;
        }
        if (drawn < rows.length) {
          frameId = window.requestAnimationFrame(frame);
        } else {
          trophyTimer = window.setTimeout(giveTrophy, 300);
        }
      }
      frameId = window.requestAnimationFrame(frame);
    }

    // Rotation de l'écran, redimensionnement : on recalcule la taille et on
    // retrace ce qui était déjà dessiné (le dessin en cours continue ensuite).
    function onResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        if (!isOpen() || !size) {
          return;
        }
        var next = measure();
        if (next.width === size.width && next.height === size.height) {
          return;
        }
        applySize(next);
        drawRows(0, drawn);
      }, 150);
    }

    /* ---------- Ouverture / fermeture ---------- */

    function onKeydown(event) {
      if (event.key === "Escape") {
        close();
      } else if (event.key === "Tab") {
        // Un seul élément focalisable dans la boîte de dialogue.
        event.preventDefault();
        closeButton.focus();
      }
    }

    function open() {
      if (isOpen()) {
        return;
      }
      // Pas par-dessus la lightbox des galeries.
      if (document.querySelector('.lightbox[aria-hidden="false"]')) {
        return;
      }
      if (!overlay) {
        build();
      }
      lastFocused = document.activeElement;
      openedAt = Date.now();
      lastOverlayTap = openedAt;
      overlay.hidden = false;
      document.body.style.overflow = "hidden";
      overlay.focus({ preventScroll: true });
      document.addEventListener("keydown", onKeydown);
      window.addEventListener("resize", onResize);

      trophyPending = true;
      // Feuille cachée le temps de la préparation, pour ne pas montrer un
      // rectangle vide. Le fond et la croix, eux, apparaissent tout de suite.
      sheet.style.visibility = "hidden";
      window.setTimeout(function () {
        if (!rows) {
          prepareRows();
        }
        if (isOpen()) {
          startDrawing();
        }
      }, 40);
    }

    function close() {
      if (!isOpen()) {
        return;
      }
      stopDrawing();
      overlay.hidden = true;
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeydown);
      window.removeEventListener("resize", onResize);
      // Libère la mémoire du dessin : il sera retracé à la prochaine ouverture.
      canvas.width = 0;
      canvas.height = 0;
      size = null;
      drawn = 0;
      // Fermé avant la fin du dessin : le trophée est quand même donné.
      giveTrophy();
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus({ preventScroll: true });
      }
    }

    /* ---------- Déclencheur 1 : taper « clara » ---------- */

    var recentKeys = [];

    document.addEventListener("keydown", function (event) {
      if (isOpen() || event.repeat || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }
      var target = event.target;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) {
        return;
      }
      if (event.key.length !== 1) {
        return;
      }

      recentKeys.push(event.key.toLowerCase());
      if (recentKeys.length > WORD.length) {
        recentKeys.shift();
      }
      if (recentKeys.join("") === WORD.join("")) {
        recentKeys = [];
        open();
      }
    });

    /* ---------- Déclencheur 2 : taps sur le nom de la barre de navigation ---------- */

    var trigger = document.querySelector("[data-ascii-trigger]");
    var taps = [];

    if (trigger) {
      trigger.addEventListener("click", function () {
        var now = Date.now();
        taps.push(now);
        taps = taps.filter(function (time) {
          return now - time <= TAPS_WINDOW;
        });
        if (taps.length >= TAPS_REQUIRED) {
          taps = [];
          open();
        }
      });
    }
  });
})();
