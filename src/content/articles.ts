export interface Article {
  slug: string;
  title: string;
  description: string;
  date: string;
  sport?: string;
  body: string[];
  faqs: Array<{ q: string; a: string }>;
  sources: Array<{ name: string; url: string }>;
  cta?: { label: string; to: string };
}

export const ARTICLES: Article[] = [
  {
    slug: "que-comer-antes-de-correr",
    title: "Qué comer antes de correr",
    description: "Ideas sencillas para desayunar o merendar antes de un rodaje, sin convertir la comida en un protocolo clínico.",
    date: "2026-08-15",
    sport: "running",
    body: [
      "La pregunta útil no es “cuál es el desayuno perfecto”, sino “qué alimentos toleras, con cuánto tiempo y para qué duración”.",
      "Las position stands de ACSM/AND/DC (Thomas et al., 2016) sitúan un rango amplio de 1–4 g de carbohidratos por kg en las 1–4 horas previas. Eso no significa que un corredor recreativo deba calcular un menú de laboratorio: significa que una comida familiar rica en carbohidratos suele ser el punto de partida.",
      "Para un rodaje de menos de una hora, muchas personas rinden bien con su desayuno habitual o incluso en ayunas si ya lo toleran. Para 70–120 minutos, pan, avena, plátano, arroz o yogur suelen ser más previsibles que un plato muy graso o muy alto en fibra justo antes de salir.",
      "Beber un volumen enorme en los 10 minutos previos no sustituye haber llegado hidratado. ACSM (Sawka et al., 2007) habla de empezar euhidratado, con margen de horas si hace falta, no de forzar un protocolo de bidón obligatorio.",
    ],
    faqs: [
      { q: "¿Tengo que comer un gel antes de correr 40 minutos?", a: "No. En esfuerzos cortos las reservas endógenas suelen bastar. Un gel no es obligatorio." },
      { q: "¿Y si me sienta mal el desayuno?", a: "Prioriza alimentos que ya hayas probado. SportFuel no asume alergias ni construye dietas clínicas." },
    ],
    sources: [
      { name: "Thomas et al., 2016. Nutrition and Athletic Performance", url: "https://pubmed.ncbi.nlm.nih.gov/26891166/" },
      { name: "Sawka et al., 2007. Exercise and Fluid Replacement", url: "https://pubmed.ncbi.nlm.nih.gov/17277604/" },
    ],
    cta: { label: "Calcular mi plan de running", to: "/planner" },
  },
  {
    slug: "que-comer-antes-de-montar-en-bici",
    title: "Qué comer antes de montar en bici",
    description: "Estrategia previa para salidas de 1 a 4 horas, con comida real o productos, sin dietas clínicas.",
    date: "2026-08-15",
    sport: "cycling",
    body: [
      "En bicicleta suele ser más fácil comer que corriendo, pero el estómago sigue teniendo límites. Una comida 2–3 horas antes con avena, pan, arroz o patata es coherente con el rango 1–4 g/kg de ACSM, recortado a un intervalo práctico.",
      "Si sales pronto y no hay tiempo, una ración más pequeña (plátano, tostada, yogur) más una bebida con carbohidratos puede ser más realista que forzar un desayuno copioso.",
      "El objetivo de hidratación previa es llegar en equilibrio, no “cargar agua”. En calor, ese margen importa más; en frío, beber por sistema puede ser innecesario.",
    ],
    faqs: [
      { q: "¿Es mejor un gel o un bocadillo?", a: "Depende de tolerancia y tiempo. Ninguno es obligatorio. El plan puede construirse con comida real, productos o mezcla." },
    ],
    sources: [{ name: "Thomas et al., 2016", url: "https://pubmed.ncbi.nlm.nih.gov/26891166/" }],
    cta: { label: "Crear plan de ciclismo", to: "/planner" },
  },
  {
    slug: "carbohidratos-durante-el-ejercicio",
    title: "Carbohidratos durante el ejercicio: rangos, no una cifra mágica",
    description: "Qué dicen ACSM, IOC e ISSN sobre gramos por hora y por qué no se deben aplicar a ciegas.",
    date: "2026-08-15",
    body: [
      "ACSM 2016 y el marco de Burke/Jeukendrup describen, de forma resumida: poco o nada por debajo de ~45–75 min; 30–60 g/h entre 1 y 2,5 h; hasta 90 g/h en esfuerzos más largos con múltiples transportadores.",
      "Eso no es una receta universal. La intensidad absoluta baja, la tolerancia digestiva y el objetivo (terminar vs competir) cambian el punto del rango. Jeukendrup (2011) advierte que atletas más lentos pueden no necesitar el techo del intervalo.",
      "Intakes de 90–120 g/h aparecen en literatura reciente (p. ej. revisiones 2022 y consenso SEÑ 2025) ligados a entrenamiento intestinal. SportFuel no los usa como valor por defecto recreativo.",
    ],
    faqs: [
      { q: "¿30–60 g/h vale para todo el mundo?", a: "No. Es el intervalo de consenso para 1–2,5 h de ejercicio exigente, no una dosis fija." },
    ],
    sources: [
      { name: "Thomas et al., 2016", url: "https://pubmed.ncbi.nlm.nih.gov/26891166/" },
      { name: "Burke et al., 2011", url: "https://pubmed.ncbi.nlm.nih.gov/21660838/" },
      { name: "SEÑ 2025", url: "https://doi.org/10.3390/nu17243862" },
    ],
    cta: { label: "Usar la calculadora de carbohidratos", to: "/calculadora-carbohidratos-deporte" },
  },
  {
    slug: "hidratacion-en-ciclismo",
    title: "Hidratación en ciclismo: rangos y supuestos",
    description: "Por qué no debes beber “exactamente X ml” y cómo usar una tasa de sudoración.",
    date: "2026-08-15",
    sport: "cycling",
    body: [
      "ACSM 2007 deja claro que las tasas de sudor varían mucho. El objetivo práctico es evitar una pérdida de masa corporal mayor del 2 % y también evitar beber por encima de las pérdidas (hiponatremia).",
      "Un rango de 400–1000 ml/h cubre muchos contextos recreativos, pero no es tu número. Temperatura, intensidad y aclimatación lo mueven. El peso ayuda poco como predictor único.",
      "La forma honesta de afinar es un test de campo: peso antes/después + líquido + orina. Eso tampoco es una medición clínica.",
    ],
    faqs: [
      { q: "¿Debo beber 500 ml cada hora sí o sí?", a: "No. Es una referencia frecuente, no una necesidad exacta." },
    ],
    sources: [{ name: "Sawka et al., 2007", url: "https://pubmed.ncbi.nlm.nih.gov/17277604/" }],
    cta: { label: "Calcular hidratación", to: "/calculadora-hidratacion-deporte" },
  },
  {
    slug: "geles-o-comida-real",
    title: "Geles o comida real: no hay un ganador universal",
    description: "Cómo elegir según tolerancia, duración y lo que ya tienes en la cocina.",
    date: "2026-08-15",
    body: [
      "Las guías hablan de gramos de carbohidrato, no de una marca de gel. Pan, dátiles, plátano, arroz o miel pueden cubrir el mismo objetivo que un producto deportivo si los toleras y puedes transportarlos.",
      "Los geles ganan en dosificación y peso. La comida real suele ganar en coste y familiaridad. Una mezcla es, para muchas salidas, la opción más sostenible.",
      "Ningún producto concreto es obligatorio. Si una web te dice lo contrario, está vendiendo, no aplicando evidencia.",
    ],
    faqs: [{ q: "¿Los geles son más científicos?", a: "No. Son una forma práctica de entregar carbohidratos. La evidencia habla de cantidad, tipo y tolerancia." }],
    sources: [{ name: "Thomas et al., 2016", url: "https://pubmed.ncbi.nlm.nih.gov/26891166/" }],
    cta: { label: "Adaptar el plan a lo que tengo", to: "/planner" },
  },
  {
    slug: "nutricion-en-trail",
    title: "Nutrición en trail: más tiempo, más estómago, más incertidumbre",
    description: "Cómo pensar carbohidratos e hidratación cuando el desnivel y el calor cambian el día.",
    date: "2026-08-15",
    sport: "trail",
    body: [
      "El trail alarga la sesión y complica la tolerancia. El marco de duración (30–60 g/h, hasta 90 g/h en jornadas largas) sigue siendo el ancla, pero el extremo alto exige práctica previa.",
      "Beber en fuente no equivale a un plan. Con calor, una tasa de sudoración propia vale más que copiar el bidón de otra persona.",
      "Comida real (fruta, sándwich, arroz) suele ser más fácil de mantener en 4–6 h que una sucesión de geles si no entrenaste el intestino.",
    ],
    faqs: [{ q: "¿El desnivel aumenta los gramos por hora?", a: "El desnivel aumenta el coste energético, pero las guías no dan un extra fijo en g/h por cada metro. Se usa como contexto, no como fórmula inventada." }],
    sources: [
      { name: "Thomas et al., 2016", url: "https://pubmed.ncbi.nlm.nih.gov/26891166/" },
      { name: "SEÑ 2025", url: "https://doi.org/10.3390/nu17243862" },
    ],
    cta: { label: "Plan de trail", to: "/planner" },
  },
  {
    slug: "recuperacion-despues-de-entrenar",
    title: "Recuperación: comida normal, no una ventana mágica",
    description: "Qué dice ISSN sobre carbohidratos y proteína después, y cuándo sí importa el timing.",
    date: "2026-08-15",
    body: [
      "Si no tienes otra sesión exigente en las siguientes horas, una comida normal con carbohidratos y algo de proteína es coherente con la evidencia. No hace falta un protocolo de minutero.",
      "ISSN (Kerksick et al., 2017) sitúa la reposición agresiva de glucógeno (~1,2 g/kg/h) cuando hay que rendir de nuevo en <4 h. ACSM menciona ~1–1,2 g/kg/h en las primeras 4–6 h si el reabastecimiento es prioridad.",
      "Un bolo de ~20–40 g de proteína en la comida posterior es un ancla práctica de ISSN. El total del día importa más que un batido a los 12 minutos.",
    ],
    faqs: [{ q: "¿Se me pasa la ventana anabólica?", a: "No hay una única ventana de minutos que condicione todo el resultado. Evitamos esa afirmación absoluta." }],
    sources: [
      { name: "Kerksick et al., 2017. ISSN nutrient timing", url: "https://doi.org/10.1186/s12970-017-0189-4" },
      { name: "Thomas et al., 2016", url: "https://pubmed.ncbi.nlm.nih.gov/26891166/" },
    ],
    cta: { label: "Ver estrategia post en el planner", to: "/planner" },
  },
  {
    slug: "sodio-y-electrolitos",
    title: "Sodio y electrolitos: contexto, no megadosis",
    description: "Por qué el sudor de cada persona es distinto y qué se puede decir sin un test de laboratorio.",
    date: "2026-08-15",
    body: [
      "La concentración de sodio en sudor varía mucho (órdenes de 20–80 mmol/L en literatura de campo). Por eso no hay una pastilla universal.",
      "ACSM ha citado concentraciones de bebida de ~0,5–0,7 g de sodio por litro en ejercicio largo. Eso es un ancla de composición de bebida, no una orden de suplementarte 2 g/h.",
      "En salidas cortas y frescas, la dieta habitual suele bastar. En calor y muchas horas, tiene sentido que la bebida o la comida aporten algo de sodio. Megadosis no.",
    ],
    faqs: [{ q: "¿Debo tomar pastillas de sal siempre?", a: "No. Solo tiene sentido contextualizarlas en sesiones largas, calor o altas pérdidas, y sin tratarlas como dosis clínica." }],
    sources: [
      { name: "Sawka et al., 2007", url: "https://pubmed.ncbi.nlm.nih.gov/17277604/" },
      { name: "ACSM Fluid 1996 (contexto histórico)", url: "https://journals.lww.com/acsm-msse/fulltext/1996/10000/acsm_position_stand__exercise_and_fluid.45.aspx" },
    ],
  },
  {
    slug: "como-medir-tasa-de-sudoracion",
    title: "Cómo estimar tu tasa de sudoración",
    description: "Fórmula de campo, limitaciones y por qué no es un diagnóstico.",
    date: "2026-08-15",
    body: [
      "Fórmula: (peso antes − peso después) + líquido ingerido − orina, dividido por las horas. El resultado es una estimación de litros por hora.",
      "No cuenta agua respiratoria ni cambios de masa por oxidación. Una camiseta empapada o una báscula distinta lo distorsionan.",
      "Úsala para mover el rango de hidratación, no para perseguir el mililitro exacto.",
    ],
    faqs: [{ q: "¿Sirve como prueba médica?", a: "No. Es un test de campo educativo." }],
    sources: [{ name: "Sawka et al., 2007", url: "https://pubmed.ncbi.nlm.nih.gov/17277604/" }],
    cta: { label: "Abrir calculadora de sudoración", to: "/calculators/sweat-rate" },
  },
  {
    slug: "que-llevar-en-una-salida-de-3-horas",
    title: "Qué llevar en una salida de 3 horas",
    description: "Lista práctica de comida, bebida y extras, con cantidades orientativas.",
    date: "2026-08-15",
    body: [
      "Tres horas caen en el límite 2,5–3 h de las guías: el motor de SportFuel usa un rango de transición, no un salto automático a 90 g/h.",
      "Una lista típica (no obligatoria): 2–3 piezas de fruta o equivalente, pan o barritas, 2–3 bidones, y algo de sodio si hace calor.",
      "El coste puede ir de comida real barata a geles de ejemplo. Ninguna marca es necesaria.",
    ],
    faqs: [{ q: "¿Cuántos geles son “los correctos”?", a: "No hay un número correcto de geles. Hay un rango de carbohidratos que puedes cubrir de varias formas." }],
    sources: [{ name: "Thomas et al., 2016", url: "https://pubmed.ncbi.nlm.nih.gov/26891166/" }],
    cta: { label: "Generar lista para 3 h", to: "/planner" },
  },
  {
    slug: "nutricion-en-carrera-popular",
    title: "Nutrición en una carrera popular",
    description: "10K, media y maratón: qué cambia y qué no deberías improvisar el domingo.",
    date: "2026-08-15",
    sport: "running",
    body: [
      "Un 10K suele durar menos de una hora para muchos corredores: la comida previa y la hidratación de salida importan más que un protocolo de geles.",
      "En media maratón, 30–60 g/h es el intervalo de consenso si el ritmo es exigente. En maratón, el techo puede subir y la tolerancia se entrena en las tiradas largas, no el día de la carrera.",
      "No copies el dorsal de un élite. Su intensidad absoluta y su intestino no son los tuyos.",
    ],
    faqs: [{ q: "¿Debo probar geles nuevos en carrera?", a: "No. Las guías coinciden en usar alimentos ya tolerados." }],
    sources: [{ name: "Thomas et al., 2016", url: "https://pubmed.ncbi.nlm.nih.gov/26891166/" }],
    cta: { label: "Simular el plan de carrera", to: "/planner" },
  },
  {
    slug: "errores-habituales-de-fueling",
    title: "Errores habituales al alimentarse en el entrenamiento",
    description: "Cifras universales, megadosis de sodio, ayuno improvisado y productos “obligatorios”.",
    date: "2026-08-15",
    body: [
      "Error 1: tratar 60 g/h como ley. Es un punto dentro de un rango.",
      "Error 2: beber por encima del sudor “por si acaso”. ACSM advierte el riesgo de hiponatremia.",
      "Error 3: descubrir un gel nuevo el día de la marcha.",
      "Error 4: pedir a una app que te trate una enfermedad. SportFuel no lo hace.",
    ],
    faqs: [{ q: "¿SportFuel usa IA para inventar el plan?", a: "No. Es un motor de reglas determinista con fuentes." }],
    sources: [
      { name: "Sawka et al., 2007", url: "https://pubmed.ncbi.nlm.nih.gov/17277604/" },
      { name: "Thomas et al., 2016", url: "https://pubmed.ncbi.nlm.nih.gov/26891166/" },
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((article) => article.slug === slug);
}
