import type { EvidenceSource } from "../models/types";

export const EVIDENCE_SOURCES: EvidenceSource[] = [
  {
    id: "thomas-2016-acsm",
    shortName: "ACSM/AND/DC 2016",
    title: "Nutrition and Athletic Performance. Joint Position Statement",
    authors: "Thomas DT, Erdman KA, Burke LM",
    year: 2016,
    organization: "ACSM, Academy of Nutrition and Dietetics, Dietitians of Canada",
    url: "https://pubmed.ncbi.nlm.nih.gov/26891166/",
    doi: "10.1249/MSS.0000000000000852",
    notes:
      "Rangos de carbohidratos durante el ejercicio por duración; reposición de glucógeno; hidratación orientada a limitar pérdida >2% masa corporal.",
  },
  {
    id: "sawka-2007-acsm-fluid",
    shortName: "ACSM Fluid 2007",
    title: "Exercise and Fluid Replacement. Position Stand",
    authors: "Sawka MN et al.",
    year: 2007,
    organization: "American College of Sports Medicine",
    url: "https://pubmed.ncbi.nlm.nih.gov/17277604/",
    doi: "10.1249/mss.0b013e31802ca597",
    notes:
      "Hidratación individualizada; variabilidad de sudoración; objetivo de evitar deshidratación excesiva y sobrehidratación.",
  },
  {
    id: "acsm-1996-fluid",
    shortName: "ACSM Fluid 1996",
    title: "Exercise and Fluid Replacement. Position Stand",
    organization: "American College of Sports Medicine",
    year: 1996,
    url: "https://journals.lww.com/acsm-msse/fulltext/1996/10000/acsm_position_stand__exercise_and_fluid.45.aspx",
    notes:
      "Contexto histórico: 0,5–0,7 g de sodio por litro en ejercicio >1 h. No se usa como dosis universal; solo como ancla de concentración de bebida.",
  },
  {
    id: "kerksick-2017-issn-timing",
    shortName: "ISSN Timing 2017",
    title: "ISSN position stand: nutrient timing",
    authors: "Kerksick CM et al.",
    year: 2017,
    organization: "International Society of Sports Nutrition",
    url: "https://doi.org/10.1186/s12970-017-0189-4",
    doi: "10.1186/s12970-017-0189-4",
    notes:
      "Carbohidratos durante 30–60 g/h en esfuerzos prolongados; recuperación de glucógeno 1,2 g/kg/h si hay otra sesión <4 h; proteína 20–40 g como bolo práctico.",
  },
  {
    id: "jager-2017-issn-protein",
    shortName: "ISSN Protein 2017",
    title: "ISSN position stand: protein and exercise",
    authors: "Jäger R et al.",
    year: 2017,
    organization: "International Society of Sports Nutrition",
    url: "https://doi.org/10.1186/s12970-017-0177-8",
    doi: "10.1186/s12970-017-0177-8",
    notes:
      "Ingesta proteica diaria y bolos de ~20–40 g; no justifica una única “ventana anabólica” rígida.",
  },
  {
    id: "burke-2011-ioc-cho",
    shortName: "IOC/Burke CHO",
    title: "Carbohydrates for training and competition",
    authors: "Burke LM, Hawley JA, Wong SH, Jeukendrup AE",
    year: 2011,
    organization: "IOC / Journal of Sports Sciences",
    url: "https://pubmed.ncbi.nlm.nih.gov/21660838/",
    doi: "10.1080/02640414.2011.585473",
    notes:
      "Marco de carbohidratos por duración; múltiples transportadores (glucosa+fructosa) cuando el objetivo supera ~60 g/h.",
  },
  {
    id: "jeukendrup-2011",
    shortName: "Jeukendrup 2011",
    title: "Nutrition for endurance sports: marathon, triathlon, and road cycling",
    authors: "Jeukendrup AE",
    year: 2011,
    url: "https://pubmed.ncbi.nlm.nih.gov/21391889/",
    doi: "10.1080/02640414.2011.574509",
    notes:
      "Ajuste a la baja si la intensidad absoluta es baja; tolerancia gastrointestinal como limitante práctico.",
  },
  {
    id: "sen-2025-consensus",
    shortName: "SEÑ 2025",
    title: "Consensus Document of the Spanish Nutrition Society (SEÑ) on Nutritional Strategies in Sports",
    year: 2025,
    organization: "Sociedad Española de Nutrición",
    url: "https://doi.org/10.3390/nu17243862",
    doi: "10.3390/nu17243862",
    notes:
      "Consenso reciente en español: 30–60 g/h (1–2,5 h); 90–120 g/h solo en esfuerzos muy largos con entrenamiento intestinal.",
  },
  {
    id: "podlogar-2022",
    shortName: "Podlogar 2022",
    title: "New horizons in carbohydrate research and application for endurance athletes",
    authors: "Podlogar T, Wallis GA",
    year: 2022,
    url: "https://pubmed.ncbi.nlm.nih.gov/36192127/",
    notes:
      "Revisa intakes altos (hasta 90–120 g/h). No justifica subir el valor por defecto del MVP por encima de 90 g/h.",
  },
  {
    id: "hearris-2022",
    shortName: "Hearris 2022",
    title: "13C-glucose-fructose labelling shows high exogenous CHO oxidation at 120 g/h",
    year: 2022,
    url: "https://pubmed.ncbi.nlm.nih.gov/35089361/",
    notes:
      "Evidencia de tolerancia/oxidación a 120 g/h en contextos controlados. No se aplica como regla universal recreativa.",
  },
];

export function getSource(id: string): EvidenceSource | undefined {
  return EVIDENCE_SOURCES.find((source) => source.id === id);
}

export function sourceList(ids: string[]): EvidenceSource[] {
  return ids
    .map((id) => getSource(id))
    .filter((source): source is EvidenceSource => Boolean(source));
}
