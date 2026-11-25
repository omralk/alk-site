/* ALK Hospitality & Development: shared text (EN / FR / AR) and helpers.
   Everything the owner edits lives in content/ and is edited from Pages CMS (app.pagescms.org):
   content/settings.json (form, Revolut payment link, calendar), content/places.json (map), content/gallery.json (story photos).
   The join flow stays in demo mode until BOTH the form endpoint and the Revolut payment link are set. */
const SETTINGS = {
  FORM_ENDPOINT: "", REVOLUT_PAYMENT_LINK: "", CALENDAR_LINK: "",
  INSTAGRAM: "https://www.instagram.com/mohammad_elkhaldy/",
  INSTAGRAM_HOUSE: "https://www.instagram.com/elkhaldy_hospitality/"
};
let LIVE = false, PLACES = [], GALLERY = [];
/* only http(s) links are used from the content files */
const safeUrl = u => /^https:\/\/[^\s"'<>]+$/i.test(String(u || "").trim()) ? String(u).trim() : "";
/* image paths from the CMS ("/img/x.jpg") are made relative so they also work under a sub-folder */
const asset = u => { u = String(u || "").trim(); return /^https:\/\//i.test(u) ? safeUrl(u) : u.replace(/^\/+/, "").replace(/[^\w\-./]/g, ""); };
const num = v => v === "" || v == null || isNaN(+v) ? null : +v;
function normPlace(p){
  const q = {...p, lat:num(p.lat), lng:num(p.lng), confirm:!!p.confirm, map:safeUrl(p.map), ig:safeUrl(p.ig), photo:asset(p.photo)};
  q.noPin = !!p.noPin || q.lat === null || q.lng === null;
  if (!q.lab) q.lab = "r";
  if (!q.area || q.area === "none") delete q.area;
  for (const k of ["location", "city"]) if (!q[k]) delete q[k];
  return q;
}
const getJSON = u => fetch(u, {cache:"no-cache"}).then(r => r.ok ? r.json() : Promise.reject(new Error(u + " " + r.status)));
const CONTENT = Promise.allSettled([getJSON("content/settings.json"), getJSON("content/places.json"), getJSON("content/gallery.json")]).then(([st, pl, ga]) => {
  if (st.status === "fulfilled" && st.value) {
    SETTINGS.FORM_ENDPOINT = safeUrl(st.value.form_endpoint);
    SETTINGS.REVOLUT_PAYMENT_LINK = safeUrl(st.value.revolut_payment_link);
    SETTINGS.CALENDAR_LINK = safeUrl(st.value.calendar_link);
  }
  if (pl.status === "fulfilled" && Array.isArray(pl.value)) PLACES = pl.value.filter(p => p && p.name).map(normPlace);
  if (ga.status === "fulfilled" && Array.isArray(ga.value)) GALLERY = ga.value.filter(g => g && g.image).map(g => ({...g, image:asset(g.image)}));
  LIVE = !!(SETTINGS.FORM_ENDPOINT && SETTINGS.REVOLUT_PAYMENT_LINK);
});

/* Map statuses: done (champagne) | progress (bronze) | open (sand, dashed) | own (ivory). Places come from content/places.json. */
const CITIES = {
  cairo:[30.044,31.236],giza:[30.013,31.209],alex:[31.2,29.92],portsaid:[31.26,32.3],ismailia:[30.6,32.27],suez:[29.97,32.53],
  mansoura:[31.04,31.38],tanta:[30.79,31.0],fayoum:[29.31,30.84],minya:[28.1,30.75],asyut:[27.18,31.18],luxor:[25.69,32.64],
  aswan:[24.09,32.9],hurghada:[27.26,33.81],gouna:[27.39,33.68],sharm:[27.92,34.33],dahab:[28.5,34.51],marsaalam:[25.07,34.89],
  matrouh:[31.35,27.24],siwa:[29.2,25.52]
};
/* Countries for the join form (ISO codes). Names are shown in English or Arabic by the browser. Egypt is listed first. */
const COUNTRIES = "AD AE AF AG AI AL AM AO AR AT AU AW AZ BA BB BD BE BF BG BH BI BJ BM BN BO BR BS BT BW BY BZ CA CD CF CG CH CI CL CM CN CO CR CU CV CY CZ DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FR GA GB GD GE GH GM GN GQ GR GT GW GY HK HN HR HT HU ID IE IN IQ IR IS IT JM JO JP KE KG KH KM KN KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MG MK ML MM MN MO MR MT MU MV MW MX MY MZ NA NE NG NI NL NO NP NZ OM PA PE PG PH PK PL PS PT PY QA RO RS RU RW SA SB SC SD SE SG SI SK SL SM SN SO SR SS ST SV SY SZ TD TG TH TJ TL TM TN TO TR TT TW TZ UA UG US UY UZ VA VC VE VN VU WS XK YE ZA ZM ZW".split(" ");
function countryName(code, lang){
  try { const n = new Intl.DisplayNames([lang], {type:"region"}).of(code); if (n && n !== code) return n; } catch (e) {}
  return code;
}
/* Greater Cairo view bounds */
const CAIRO = {w:570,h:300,lng0:30.95,lng1:31.47,lat1:30.177};
CAIRO.k = CAIRO.w/(CAIRO.lng1-CAIRO.lng0); CAIRO.lat0 = CAIRO.lat1 - CAIRO.h/(CAIRO.k/Math.cos(30.05*Math.PI/180));

const T = {
en:{
  menu:"Menu",menuClose:"Close",
  kicker:"Chef Mohammad Elkhaldy",
  navHome:"Home",navMap:"Our map",cta:"Open your file",
  foot:"ALK Hospitality & Development · Consulting & signature catering",
  /* home */
  h1:"Thirty years at the stove. Now at the service of your house.",
  lead:"ALK Hospitality & Development is the house of chef Mohammad Elkhaldy. Consulting and signature catering for restaurants, hotels and private clients, in Egypt and in Europe.",
  readStory:"Read our story",drawNote:"Drawn by hand: zaatar and olive oil, olives, hummus, koshari, baladi bread, mint tea.",
  whoTitle:"Who we are",
  whoBody:"A house led by a chef. Thirty years of kitchens, openings, trained teams and cooking on television, from Damascus to Paris and Cairo. That experience is now at the service of your house.",
  diffs:[["The kitchen first", "Every recommendation comes from the kitchen. It has to hold in the middle of service, not only on paper."], ["The guest's mind", "Why a guest chooses a dish, a table, a house, and what makes them come back."], ["Food as art", "A plate is a canvas, a drink can be a moment of theatre. We design what guests remember and talk about."]],
  storyTitle:"Our story",
  photos:["Chef Mohammad Elkhaldy standing under a single studio light","A white plate printed with two open hands","Steam rising from a jar of cherry tomatoes"],
  story:[["Damascus · 1996", "At sixteen, Mohammad Elkhaldy walks into a kitchen for the first time. He never leaves it."], ["Syria, Lebanon, Egypt, the Emirates", "Twenty years in the kitchens of the region, and cooking shows on Syrian television, for home cooks and professionals alike."], ["France · 2015", "War forces him to leave Syria. He starts again in France and cooks with the Refugee Food Festival."], ["Cancale · 2018", "With chef Olivier Rœllinger he creates a zaatar blend, still sold today by Épices Rœllinger."], ["Cairo", "He co-founds Jouri, Les Secrets and 80%, and advises restaurants on concept, menu and the psychology of the guest."], ["Today", "ALK Hospitality & Development carries this experience to restaurants, hotels and private tables, in Egypt and in Europe."]],
  storyNote:"Story drawn from public profiles and interviews. To be confirmed by Mohammad Elkhaldy.",
  svcTitle:"What we do",
  svc:[["Concept and positioning", "Who the house is for, what it promises, and how that promise reads in the room, the menu and the prices."], ["Menu and costing", "A menu that reads clearly, is costed dish by dish, and showcases what the kitchen does best."], ["Guest experience", "From the door to the bill: the welcome, the pace at the table, the details guests carry home."], ["Operations and team", "Routines, roles and training, so the standard holds on the busiest night, not only on opening day."], ["Openings and development", "From the first plan to opening week, then the houses that follow."], ["Signature catering", "Conceptual and corporate catering, weddings and chef's tables, designed and signed by Mohammad Elkhaldy."]],
  joinTitle:"Working with us",
  joinBody:"Every house we work with takes its place on our map. Its colour shows where the work stands.",
  joinSteps:[["File opened", "You open your file. Chef Mohammad Elkhaldy studies it personally, and your house appears on the map."], ["Visit and project", "We come to see your house in service. The project begins from what we observe."], ["Completed", "The work is delivered. Your house joins our completed projects."]],
  seeMap:"See the map",
  ticker:["Cairo", "Paris", "London", "Edinburgh", "Berlin", "Damascus"],
  /* statuses */
  st:{done:"Completed",progress:"Project in progress",open:"File opened",own:"Our own houses",tbc:"Status to confirm"},
  types:{restaurant:"Restaurant",bistro:"Bistro",boat:"Restaurant on a Nile boat",residence:"Luxury residence",hotel:"Hotel restaurant",cafe:"Café",own:"Founded by Mohammad Elkhaldy"},
  areas:{zamalek:"Zamalek, Cairo",zayed:"Sheikh Zayed, Giza",katameya:"Katameya, New Cairo",nasr:"Nasr City, Cairo",heliopolis:"Heliopolis, Cairo",dokki:"Dokki, Giza",almaza:"Almaza, Heliopolis",paris:"Paris area, France"},
  workTbc:"Details of our work coming soon.",ownLine:"Co-founded by Mohammad Elkhaldy.",tbc:"Status to confirm",noAddr:"Address to add",gmaps:"Open in Google Maps",egypt:"Egypt",cairoView:"Greater Cairo",cluster:n=>`Greater Cairo · ${n}`,
  cities:{cairo:"Cairo",giza:"Giza",alex:"Alexandria",portsaid:"Port Said",ismailia:"Ismailia",suez:"Suez",mansoura:"Mansoura",tanta:"Tanta",fayoum:"Fayoum",minya:"Minya",asyut:"Asyut",luxor:"Luxor",aswan:"Aswan",hurghada:"Hurghada",gouna:"El Gouna",sharm:"Sharm El Sheikh",dahab:"Dahab",marsaalam:"Marsa Alam",matrouh:"Marsa Matrouh",siwa:"Siwa"},
  geo:{med:"Mediterranean Sea",red:"Red Sea",sinai:"Sinai",nile:"Nile",pyr:"Pyramids",zam:"Zamalek",hel:"Heliopolis",nc:"New Cairo",zay:"Sheikh Zayed",dt:"Downtown"},
  /* map page */
  mapH1:"The places we work with",
  mapLead:"Every point is a place we work with. Pick one to see what we did, or filter by status.",
  world:"World",zoomIn:"Zoom in",zoomOut:"Zoom out",mapFail:"The map could not load. The list of places still works.",
  sampleNote:"Places from Google Maps. Grey points are still being confirmed.",noPins:"No point on the map yet for this filter: addresses still to add.",
  allPlaces:"All places",visitIg:"Instagram",
  /* join flow */
  addTitle:"Open your file",
  addLead:"Tell us about your house. Your file is studied personally by chef Mohammad Elkhaldy, then you book the visit where we come to see you.",
  s1:"Your restaurant",s2:"Your file",s3:"Book the visit",
  fName:"Restaurant name",fCountry:"Country",fCity:"City",eCity:"Please add your city.",fPerson:"Your name",fContact:"Phone or email",fNeed:"What do you need?",
  needs:["Opening a new venue","Repositioning a concept","Menu and costing","Guest experience","Operations and team","Something else"],
  next:"Continue",back:"Back",
  eReq:"Please fill this in.",eContact:"Please add a valid phone number or email address.",eSend:"We could not send your details. Check your connection and try again.",sending:"Sending…",
  feeWhat:"Your file is studied personally by chef Mohammad Elkhaldy. It reserves your visit, places your house on our map and opens our work together.",
  pay:"Open my file",payMethods:"Visa, Mastercard, Apple Pay, Google Pay · secure payment by Revolut",
  demoPay:"Payment is not connected yet. Demo: continue without paying",
  payNext:"I have paid, continue",payRef:r=>`Your file reference: ${r}. Keep it: we use it to match your payment.`,
  paidLine:"Your file is open.",paidLineLive:"Thank you. We will confirm your payment.",
  bookLead:"Choose a day and a time for our visit.",fDate:"Date",fSlot:"Time",
  slots:["10:00","12:00","15:00","17:00"],
  openCal:"Open the calendar",book:"Book the visit",calDone:"I have booked my visit",bookLeadCal:"Open the calendar, choose a day and a time, then come back here.",
  doneTitle:"See you soon.",
  at:(d,s)=>`${d} at ${s}`,
  doneBody:(n,w)=>`${n} is on the map as a file opened.${w ? ` Visit requested for ${w}.` : ""} As our work together advances, your point changes colour.`,
  doneLive:(n,w)=>`We received the file for ${n}.${w ? ` Visit requested for ${w}.` : ""} Once we confirm your payment and your visit, your restaurant appears on our map.`,
  demoNote:"Demo: nothing is paid or sent, and your point is only shown in this browser.",
  showMine:"Show it on the map"
},
fr:{
  menu:"Menu",menuClose:"Fermer",
  kicker:"Chef Mohammad Elkhaldy",
  navHome:"Accueil",navMap:"Notre carte",cta:"Ouvrir votre dossier",
  foot:"ALK Hospitality & Development · Conseil & traiteur signature",
  /* home */
  h1:"Trente ans aux fourneaux. Désormais au service de votre maison.",
  lead:"ALK Hospitality & Development est la maison du chef Mohammad Elkhaldy. Conseil et traiteur signature pour les restaurants, les hôtels et les clients privés, en Égypte et en Europe.",
  readStory:"Lire notre histoire",drawNote:"Dessiné à la main : zaatar et huile d’olive, olives, houmous, koshari, pain baladi, thé à la menthe.",
  whoTitle:"Qui sommes-nous",
  whoBody:"Une maison menée par un chef. Trente ans de cuisines, d’ouvertures, d’équipes formées et d’émissions culinaires, de Damas à Paris et au Caire. Cette expérience est aujourd’hui au service de votre maison.",
  diffs:[["La cuisine d’abord", "Chaque recommandation naît en cuisine. Elle doit tenir en plein service, pas seulement sur le papier."], ["L’esprit du client", "Pourquoi un client choisit un plat, une table, une maison, et ce qui le fait revenir."], ["L’assiette comme un art", "Une assiette est une toile, un verre peut devenir un moment de théâtre. Nous concevons ce dont vos clients se souviennent et parlent."]],
  storyTitle:"Notre histoire",
  photos:["Le chef Mohammad Elkhaldy debout sous une seule lumière de studio","Une assiette blanche imprimée de deux mains ouvertes","De la vapeur s’échappe d’un bocal de tomates cerises"],
  story:[["Damas · 1996", "À seize ans, Mohammad Elkhaldy entre pour la première fois dans une cuisine. Il ne la quittera plus."], ["Syrie, Liban, Égypte, Émirats", "Vingt ans dans les cuisines de la région, et des émissions culinaires à la télévision syrienne, pour les amateurs comme pour les professionnels."], ["France · 2015", "La guerre l’oblige à quitter la Syrie. Il repart de zéro en France et cuisine avec le Refugee Food Festival."], ["Cancale · 2018", "Avec le chef Olivier Rœllinger, il crée un mélange de zaatar, toujours vendu aujourd’hui par Épices Rœllinger."], ["Le Caire", "Il cofonde Jouri, Les Secrets et 80 %, et conseille des restaurants sur le concept, la carte et la psychologie du client."], ["Aujourd’hui", "ALK Hospitality & Development met cette expérience au service des restaurants, des hôtels et des tables privées, en Égypte et en Europe."]],
  storyNote:"Histoire tirée de profils publics et d’entretiens. À confirmer par Mohammad Elkhaldy.",
  svcTitle:"Ce que nous faisons",
  svc:[["Concept et positionnement", "À qui s’adresse la maison, ce qu’elle promet, et comment cette promesse se lit dans la salle, la carte et les prix."], ["Carte et coûts", "Une carte claire, chiffrée plat par plat, qui met en valeur ce que la cuisine fait de mieux."], ["Expérience client", "De la porte à l’addition : l’accueil, le rythme à table, les détails que l’on emporte avec soi."], ["Organisation et équipe", "Des routines, des rôles et de la formation, pour que le niveau tienne les soirs de grande affluence, pas seulement le jour de l’ouverture."], ["Ouvertures et développement", "Du premier plan à la semaine d’ouverture, puis les maisons qui suivent."], ["Traiteur signature", "Traiteur conceptuel et d’entreprise, mariages et tables du chef, imaginés et signés par Mohammad Elkhaldy."]],
  joinTitle:"Travailler avec nous",
  joinBody:"Chaque maison avec laquelle nous travaillons prend place sur notre carte. Sa couleur indique où en est le travail.",
  joinSteps:[["Dossier ouvert", "Vous ouvrez votre dossier. Le chef Mohammad Elkhaldy l’étudie personnellement, et votre maison apparaît sur la carte."], ["Visite et projet", "Nous venons voir votre maison en plein service. Le projet commence à partir de ce que nous observons."], ["Réalisé", "Le travail est livré. Votre maison rejoint nos réalisations."]],
  seeMap:"Voir la carte",
  ticker:["Le Caire", "Paris", "Londres", "Édimbourg", "Berlin", "Damas"],
  /* statuses */
  st:{done:"Terminé",progress:"Projet en cours",open:"Dossier ouvert",own:"Nos maisons",tbc:"Statut à confirmer"},
  types:{restaurant:"Restaurant",bistro:"Bistrot",boat:"Restaurant sur un bateau du Nil",residence:"Résidence de luxe",hotel:"Restaurant d’hôtel",cafe:"Café",own:"Fondé par Mohammad Elkhaldy"},
  areas:{zamalek:"Zamalek, Le Caire",zayed:"Cheikh Zayed, Gizeh",katameya:"Katameya, Nouveau Caire",nasr:"Nasr City, Le Caire",heliopolis:"Héliopolis, Le Caire",dokki:"Dokki, Gizeh",almaza:"Almaza, Héliopolis",paris:"Région parisienne, France"},
  workTbc:"Le détail de notre travail arrive bientôt.",ownLine:"Cofondé par Mohammad Elkhaldy.",tbc:"Statut à confirmer",noAddr:"Adresse à ajouter",gmaps:"Ouvrir dans Google Maps",egypt:"Égypte",cairoView:"Grand Caire",cluster:n=>`Grand Caire · ${n}`,
  cities:{cairo:"Le Caire",giza:"Gizeh",alex:"Alexandrie",portsaid:"Port-Saïd",ismailia:"Ismaïlia",suez:"Suez",mansoura:"Mansourah",tanta:"Tanta",fayoum:"Fayoum",minya:"Minya",asyut:"Assiout",luxor:"Louxor",aswan:"Assouan",hurghada:"Hurghada",gouna:"El Gouna",sharm:"Charm el-Cheikh",dahab:"Dahab",marsaalam:"Marsa Alam",matrouh:"Marsa Matrouh",siwa:"Siwa"},
  geo:{med:"Mer Méditerranée",red:"Mer Rouge",sinai:"Sinaï",nile:"Nil",pyr:"Pyramides",zam:"Zamalek",hel:"Héliopolis",nc:"Nouveau Caire",zay:"Cheikh Zayed",dt:"Centre-ville"},
  /* map page */
  mapH1:"Les lieux avec lesquels nous travaillons",
  mapLead:"Chaque point est un lieu avec lequel nous travaillons. Choisissez-en un pour voir ce que nous avons fait, ou filtrez par statut.",
  world:"Monde",zoomIn:"Zoomer",zoomOut:"Dézoomer",mapFail:"La carte n’a pas pu se charger. La liste des lieux fonctionne toujours.",
  sampleNote:"Lieux issus de Google Maps. Les points gris sont en cours de confirmation.",noPins:"Aucun point sur la carte pour ce filtre : adresses encore à ajouter.",
  allPlaces:"Tous les lieux",visitIg:"Instagram",
  /* join flow */
  addTitle:"Ouvrir votre dossier",
  addLead:"Présentez-nous votre maison. Votre dossier est étudié personnellement par le chef Mohammad Elkhaldy, puis vous réservez la visite où nous venons vous voir.",
  s1:"Votre restaurant",s2:"Votre dossier",s3:"Réserver la visite",
  fName:"Nom du restaurant",fCountry:"Pays",fCity:"Ville",eCity:"Merci d’indiquer votre ville.",fPerson:"Votre nom",fContact:"Téléphone ou e-mail",fNeed:"De quoi avez-vous besoin ?",
  needs:["Ouvrir un nouveau lieu","Repositionner un concept","Carte et coûts","Expérience client","Organisation et équipe","Autre chose"],
  next:"Continuer",back:"Retour",
  eReq:"Merci de remplir ce champ.",eContact:"Merci d’indiquer un numéro de téléphone ou un e-mail valide.",eSend:"Impossible d’envoyer vos informations. Vérifiez votre connexion et réessayez.",sending:"Envoi…",
  feeWhat:"Votre dossier est étudié personnellement par le chef Mohammad Elkhaldy. Il réserve votre visite, place votre maison sur notre carte et ouvre notre collaboration.",
  pay:"Ouvrir mon dossier",payMethods:"Visa, Mastercard, Apple Pay, Google Pay · paiement sécurisé par Revolut",
  demoPay:"Le paiement n’est pas encore branché. Démo : continuer sans payer",
  payNext:"J’ai payé, continuer",payRef:r=>`Référence de votre dossier : ${r}. Gardez-la : elle nous sert à retrouver votre paiement.`,
  paidLine:"Votre dossier est ouvert.",paidLineLive:"Merci. Nous allons confirmer votre paiement.",
  bookLead:"Choisissez un jour et une heure pour notre visite.",fDate:"Date",fSlot:"Heure",
  slots:["10:00","12:00","15:00","17:00"],
  openCal:"Ouvrir le calendrier",book:"Réserver la visite",calDone:"J’ai réservé ma visite",bookLeadCal:"Ouvrez le calendrier, choisissez un jour et une heure, puis revenez ici.",
  doneTitle:"À très bientôt.",
  at:(d,s)=>`le ${d} à ${s}`,
  doneBody:(n,w)=>`${n} est sur la carte en dossier ouvert.${w ? ` Visite demandée ${w}.` : ""} À mesure que notre travail avance, votre point change de couleur.`,
  doneLive:(n,w)=>`Nous avons bien reçu le dossier de ${n}.${w ? ` Visite demandée ${w}.` : ""} Dès que nous aurons confirmé votre paiement et votre visite, votre restaurant apparaîtra sur notre carte.`,
  demoNote:"Démo : rien n’est payé ni envoyé, et votre point n’apparaît que dans ce navigateur.",
  showMine:"Le voir sur la carte"
},
ar:{
  menu:"القائمة",menuClose:"إغلاق",
  kicker:"الشيف محمد الخالدي",
  navHome:"الرئيسية",navMap:"خريطتنا",cta:"افتح ملفك",
  foot:"ALK للضيافة والتطوير · استشارات وضيافة بتوقيع الشيف",
  h1:"ثلاثون عامًا أمام المواقد. والآن في خدمة بيتك.",
  lead:"ALK للضيافة والتطوير هي دار الشيف محمد الخالدي: استشارات وخدمات ضيافة بتوقيعه للمطاعم والفنادق والعملاء الخاصين، في مصر وأوروبا.",
  readStory:"اقرأ قصتنا",drawNote:"مرسومة باليد: زعتر وزيت زيتون، زيتون، حمّص، كشري، عيش بلدي، شاي بالنعناع.",
  whoTitle:"من نحن",
  whoBody:"دار يقودها شيف. ثلاثون عامًا من المطابخ والافتتاحات والفرق المدرَّبة وبرامج الطبخ التلفزيونية، من دمشق إلى باريس والقاهرة. هذه الخبرة اليوم في خدمة بيتك.",
  diffs:[["المطبخ أولًا", "كل توصية تولد في المطبخ، ويجب أن تصمد في ذروة الخدمة لا على الورق فقط."], ["عقل الضيف", "لماذا يختار الضيف طبقًا وطاولة ومكانًا، وما الذي يعيده إليه."], ["الطعام فنًّا", "الطبق لوحة، والمشروب قد يصبح لحظة مسرحية. نصمّم ما يتذكره ضيوفك ويتحدثون عنه."]],
  storyTitle:"قصتنا",
  photos:["الشيف محمد الخالدي واقفًا تحت ضوء واحد في الاستوديو","طبق أبيض مطبوع عليه يدان مفتوحتان","بخار يتصاعد من برطمان طماطم كرزية"],
  story:[["دمشق · 1996", "في السادسة عشرة يدخل محمد الخالدي المطبخ لأول مرة، ولن يغادره بعدها."], ["سوريا، لبنان، مصر، الإمارات", "عشرون عامًا في مطابخ المنطقة، وبرامج طبخ على التلفزيون السوري للهواة والمحترفين."], ["فرنسا · 2015", "تجبره الحرب على مغادرة سوريا. يبدأ من جديد في فرنسا ويطبخ مع مهرجان Refugee Food Festival."], ["كانكال · 2018", "مع الشيف أوليفييه رولينجر يبتكر خلطة زعتر ما زالت تُباع حتى اليوم لدى Épices Rœllinger."], ["القاهرة", "يشارك في تأسيس جوري وLes Secrets و80%، ويقدّم الاستشارات للمطاعم في المفهوم والقائمة وسيكولوجية الضيف."], ["اليوم", "تحمل ALK للضيافة والتطوير هذه الخبرة إلى المطاعم والفنادق والموائد الخاصة، في مصر وأوروبا."]],
  storyNote:"القصة مأخوذة من ملفات ومقابلات منشورة. بانتظار تأكيد محمد الخالدي.",
  svcTitle:"ما نقدمه",
  svc:[["المفهوم والتموضع", "لمن هذا البيت، وبماذا يَعِد، وكيف يظهر هذا الوعد في القاعة والقائمة والأسعار."], ["القائمة والتكاليف", "قائمة واضحة، محسوبة التكلفة طبقًا بطبق، تُبرز أفضل ما يتقنه المطبخ."], ["تجربة الضيف", "من الباب حتى الفاتورة: الاستقبال، وإيقاع الطاولة، والتفاصيل التي يحملها الضيف معه."], ["التشغيل والفريق", "إجراءات وأدوار وتدريب، ليبقى المستوى ثابتًا في أكثر الليالي ازدحامًا، لا في يوم الافتتاح فقط."], ["الافتتاحات والتطوير", "من المخطط الأول حتى أسبوع الافتتاح، ثم البيوت التي تليه."], ["ضيافة بتوقيع الشيف", "ضيافة مفاهيمية وللشركات، وحفلات زفاف وموائد الشيف، من تصميم محمد الخالدي وتوقيعه."]],
  joinTitle:"العمل معنا",
  joinBody:"كل بيت نعمل معه يأخذ مكانه على خريطتنا، ولونه يبيّن أين وصل العمل.",
  joinSteps:[["ملف مفتوح", "تفتح ملفك، فيدرسه الشيف محمد الخالدي شخصيًا، ويظهر بيتك على الخريطة."], ["الزيارة والمشروع", "نأتي لرؤية بيتك أثناء الخدمة، ويبدأ المشروع مما نلاحظه."], ["مُنجَز", "يُسلَّم العمل، وينضم بيتك إلى مشاريعنا المنجزة."]],
  seeMap:"شاهد الخريطة",
  ticker:["القاهرة", "باريس", "لندن", "إدنبرة", "برلين", "دمشق"],
  st:{done:"مكتمل",progress:"مشروع قيد التنفيذ",open:"ملف مفتوح",own:"بيوتنا الخاصة",tbc:"الحالة بانتظار التأكيد"},
  types:{restaurant:"مطعم",bistro:"بيسترو",boat:"مطعم على مركب نيلي",residence:"شقق فندقية فاخرة",hotel:"فندق ومطعم",cafe:"مقهى",own:"أسسها محمد الخالدي"},
  areas:{zamalek:"الزمالك، القاهرة",zayed:"الشيخ زايد، الجيزة",katameya:"القطامية، القاهرة الجديدة",nasr:"مدينة نصر، القاهرة",heliopolis:"مصر الجديدة، القاهرة",dokki:"الدقي، الجيزة",almaza:"ألماظة، مصر الجديدة",paris:"منطقة باريس، فرنسا"},
  workTbc:"تفاصيل عملنا قريبًا.",ownLine:"شارك في تأسيسه محمد الخالدي.",tbc:"الحالة بانتظار التأكيد",noAddr:"العنوان لم يُضف بعد",gmaps:"افتح في خرائط Google",egypt:"مصر",cairoView:"القاهرة الكبرى",cluster:n=>`القاهرة الكبرى · ${n}`,
  cities:{cairo:"القاهرة",giza:"الجيزة",alex:"الإسكندرية",portsaid:"بورسعيد",ismailia:"الإسماعيلية",suez:"السويس",mansoura:"المنصورة",tanta:"طنطا",fayoum:"الفيوم",minya:"المنيا",asyut:"أسيوط",luxor:"الأقصر",aswan:"أسوان",hurghada:"الغردقة",gouna:"الجونة",sharm:"شرم الشيخ",dahab:"دهب",marsaalam:"مرسى علم",matrouh:"مرسى مطروح",siwa:"سيوة"},
  geo:{med:"البحر المتوسط",red:"البحر الأحمر",sinai:"سيناء",nile:"النيل",pyr:"الأهرامات",zam:"الزمالك",hel:"مصر الجديدة",nc:"القاهرة الجديدة",zay:"الشيخ زايد",dt:"وسط البلد"},
  mapH1:"الأماكن التي نعمل معها",
  mapLead:"كل نقطة مكان نعمل معه. اختر نقطة لترى ما قمنا به، أو صفِّ حسب الحالة.",
  world:"العالم",zoomIn:"تكبير",zoomOut:"تصغير",mapFail:"تعذّر تحميل الخريطة. قائمة الأماكن ما زالت تعمل.",
  sampleNote:"الأماكن من خرائط Google. النقاط الرمادية قيد التأكيد.",noPins:"لا توجد نقاط على الخريطة لهذا الفلتر بعد: العناوين لم تُضف.",
  allPlaces:"كل الأماكن",visitIg:"إنستغرام",
  addTitle:"افتح ملفك",
  addLead:"عرّفنا ببيتك. يدرس الشيف محمد الخالدي ملفك شخصيًا، ثم تحجز موعد الزيارة التي نأتي فيها لرؤيتك.",
  s1:"مطعمك",s2:"فتح الملف",s3:"حجز الزيارة",
  fName:"اسم المطعم",fCountry:"الدولة",fCity:"المدينة",eCity:"يرجى إضافة مدينتك.",fPerson:"اسمك",fContact:"الهاتف أو البريد الإلكتروني",fNeed:"ما الذي تحتاجه؟",
  needs:["افتتاح مكان جديد","إعادة تموضع المفهوم","القائمة والتكاليف","تجربة الضيف","التشغيل والفريق","أمر آخر"],
  next:"متابعة",back:"رجوع",
  eReq:"يرجى ملء هذا الحقل.",eContact:"يرجى إضافة رقم هاتف أو بريد إلكتروني صحيح.",eSend:"تعذّر إرسال بياناتك. تحقّق من الاتصال وحاول مجددًا.",sending:"جارٍ الإرسال…",
  feeWhat:"يدرس الشيف محمد الخالدي ملفك شخصيًا. فتح الملف يحجز زيارتك، ويضع بيتك على خريطتنا، ويبدأ عملنا معًا.",
  pay:"افتح ملفي",payMethods:"فيزا، ماستركارد، Apple Pay، Google Pay · دفع آمن عبر Revolut",
  demoPay:"الدفع غير متصل بعد. تجربة: المتابعة دون دفع",
  payNext:"دفعت، متابعة",payRef:r=>`رقم ملفك: ${r}. احتفظ به: نستخدمه لمطابقة دفعتك.`,
  paidLine:"ملفك مفتوح.",paidLineLive:"شكرًا. سنؤكد دفعتك.",
  bookLead:"اختر يومًا وساعة لزيارتنا.",fDate:"التاريخ",fSlot:"الساعة",
  slots:["10:00","12:00","15:00","17:00"],
  openCal:"افتح التقويم",book:"احجز الزيارة",calDone:"حجزت موعد الزيارة",bookLeadCal:"افتح التقويم واختر يومًا وساعة، ثم عد إلى هنا.",
  doneTitle:"نراك قريبًا.",
  at:(d,s)=>`يوم ${d} الساعة ${s}`,
  doneBody:(n,w)=>`${n} على الخريطة كملف مفتوح.${w ? ` طُلبت الزيارة ${w}.` : ""} ومع تقدّم عملنا معًا يتغيّر لون نقطتك.`,
  doneLive:(n,w)=>`استلمنا ملف ${n}.${w ? ` طُلبت الزيارة ${w}.` : ""} حين نؤكد دفعتك وموعد زيارتك، يظهر مطعمك على خريطتنا.`,
  demoNote:"تجربة: لا يُدفع أو يُرسل شيء، ونقطتك تظهر في هذا المتصفح فقط.",
  showMine:"اعرضه على الخريطة"
}};

const LANGS = ["en", "fr", "ar"];
let LANG = "en";
try { const s = localStorage.getItem("alk-lang"); if (LANGS.includes(s)) LANG = s; } catch (e) {}
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const t = () => T[LANG];

function applyText(){
  const d = t();
  document.documentElement.lang = LANG;
  document.documentElement.dir = LANG === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-t]").forEach(el => { const v = d[el.dataset.t]; if (typeof v === "string") el.textContent = v; });
  document.querySelectorAll("[data-geo]").forEach(el => el.textContent = d.geo[el.dataset.geo]);
  document.querySelectorAll("#langs button").forEach(b => b.setAttribute("aria-pressed", b.dataset.l === LANG));
}
/* life: sections rise in on scroll; the story line fills as you read */
function initMotion(){
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
  const targets = [...document.querySelectorAll("main .band > *, .intro, .legend, .explore")].filter(el => !el.closest(".hero"));
  targets.forEach(el => el.classList.add("rv"));
  ["diffs", "storyList", "svc", "steps"].forEach(id => { const e = $(id); if (e) { e.classList.add("stg"); if (!e.closest(".rv")) e.classList.add("rv"); } });
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), {rootMargin:"0px 0px -8% 0px", threshold:.06});
  document.querySelectorAll(".rv").forEach(el => io.observe(el));
}
function storyLine(){
  const story = $("storyList"); if (!story) return;
  const mid = innerHeight * .62, r = story.getBoundingClientRect();
  story.style.setProperty("--p", Math.min(1, Math.max(0, (mid - r.top) / r.height)).toFixed(3));
  story.querySelectorAll("li").forEach(li => li.classList.toggle("on", li.getBoundingClientRect().top + 14 < mid));
}
/* the three story photographs drift at different speeds as the page scrolls */
const DRIFT = [-.04, .03, -.06]; /* per column of three */
function frames(){
  const f = document.querySelectorAll("#frames figure"); if (!f.length || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  f.forEach((el, n) => { const r = el.parentNode.getBoundingClientRect(); el.style.setProperty("--y", ((r.top + r.height / 2 - innerHeight / 2) * DRIFT[n % 3]).toFixed(1) + "px"); });
}
addEventListener("scroll", () => { storyLine(); frames(); }, {passive:true}); addEventListener("resize", () => { storyLine(); frames(); });
/* mobile: one "Menu" button opens a full-screen menu (links, file button, languages) */
function initMenu(){
  const btn = $("menuBtn"), head = document.querySelector("header"); if (!btn) return;
  const label = () => { const open = head.classList.contains("open"); btn.firstElementChild.textContent = t()[open ? "menuClose" : "menu"]; btn.setAttribute("aria-expanded", open); };
  const set = open => { head.classList.toggle("open", open); document.documentElement.classList.toggle("menu-lock", open); label(); };
  btn.addEventListener("click", () => set(!head.classList.contains("open")));
  $("menu").addEventListener("click", e => { if (e.target.closest("a")) set(false); });
  addEventListener("keydown", e => { if (e.key === "Escape" && head.classList.contains("open")) { set(false); btn.focus(); } });
  matchMedia("(min-width: 761px)").addEventListener("change", e => { if (e.matches) set(false); });
  document.querySelectorAll("#langs button").forEach(b => b.addEventListener("click", label));
  label();
}
function initLang(render){
  document.querySelectorAll("#langs button").forEach(b => b.addEventListener("click", () => {
    if (b.dataset.l === LANG) return;
    LANG = b.dataset.l;
    try { localStorage.setItem("alk-lang", LANG); } catch (e) {}
    applyText(); render(); storyLine();
  }));
  applyText(); render(); initMotion(); storyLine(); frames(); initMenu();
}
