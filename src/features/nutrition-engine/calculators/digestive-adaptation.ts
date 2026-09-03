export interface DigestiveAdaptation {
  tolerance: "low" | "normal" | "trained";
  summary: string;
  timingGuidance: string[];
  foodGuidance: string[];
  carbohydrateNote: string;
}

function lowAdaptation(): DigestiveAdaptation {
  return {
    tolerance: "low",
    summary: "Plan conservador: tomas más pequeñas, mayor frecuencia y alimentos de digestión segura.",
    timingGuidance: [
      "Espacia las tomas cada 15–20 min en lugar de cada 30 min.",
      "Evita tomar grandes volúmenes de una vez.",
      "Prefiere líquidos con concentración moderada.",
    ],
    foodGuidance: [
      "Alimentos familiares y probados previamente.",
      "Evita alimentos nuevos, ricos en fibra o muy grasos durante la salida.",
      "Fruta madura, pan o productos deportivos de composición sencilla.",
    ],
    carbohydrateNote: "Se prioriza el extremo práctico inferior del rango de carbohidratos para reducir riesgo de molestias.",
  };
}

function normalAdaptation(): DigestiveAdaptation {
  return {
    tolerance: "normal",
    summary: "Estrategia estándar adaptada a tus hábitos habituales.",
    timingGuidance: [
      "Mantiene la frecuencia de tomas recomendada por el motor.",
      "Ajusta las cantidades según sed y tolerancia real.",
    ],
    foodGuidance: [
      "Combina alimentos reales y productos deportivos según tu preferencia.",
      "No introduzcas alimentos nuevos el día de la salida.",
    ],
    carbohydrateNote: "Sigue el rango de carbohidratos calculado para tu perfil.",
  };
}

function trainedAdaptation(): DigestiveAdaptation {
  return {
    tolerance: "trained",
    summary: "Plan con mayor densidad energética por toma, apropiado para esfuerzos largos.",
    timingGuidance: [
      "Permite tomas más concentradas cuando la duración lo justifica.",
      "Aprovecha la ventana de mayor tolerancia para esfuerzos >2,5 h.",
      "Si el esfuerzo es corto, mantiene tomas moderadas.",
    ],
    foodGuidance: [
      "Puedes utilizar productos más concentrados o combinaciones de fuentes.",
      "Sigue probando nuevas combinaciones en entrenamiento, no el día de la competición.",
      "Mantén una opción de reserva más sencilla por si aparecen molestias.",
    ],
    carbohydrateNote: "Se permite acercarse al extremo superior del rango cuando el motor ya lo contempla para tu perfil.",
  };
}

export function calculateDigestiveAdaptation(tolerance: "low" | "normal" | "trained"): DigestiveAdaptation {
  if (tolerance === "low") return lowAdaptation();
  if (tolerance === "trained") return trainedAdaptation();
  return normalAdaptation();
}
