import { Seo } from "@/components/Seo";
import { DISCLAIMER } from "@/features/nutrition-engine";

export function PrivacyPage() {
  return (
    <Legal
      path="/legal/privacidad"
      title="Política de privacidad"
      body={[
        "Responsable: el operador de PedalMap Fuel (producto independiente; no comparte usuarios ni datos con PedalMap).",
        "Datos que pedimos: en el calculador, peso, deporte, duración, intensidad, temperatura y objetivo. Son los mínimos para estimar un plan.",
        "No pedimos diagnósticos médicos. Si indicas una condición clínica, el sistema deja de personalizar y te remite a un profesional.",
        "En el MVP las cuentas y planes se guardan en tu navegador (localStorage). No hay servidor obligatorio ni cesión a terceros de pago.",
        "Base jurídica (RGPD): interés legítimo y consentimiento para la cuenta local. Puedes eliminar la cuenta y los planes desde /plans.",
        "No usamos analítica de terceros en esta versión. Los eventos de producto se quedan en tu dispositivo.",
        "Contacto para derechos de acceso, rectificación, supresión, oposición y portabilidad: indica un canal cuando el producto tenga dominio propio. Mientras tanto, borra los datos locales desde la app.",
      ]}
    />
  );
}

export function CookiesPage() {
  return (
    <Legal
      path="/legal/cookies"
      title="Cookies"
      body={[
        "PedalMap Fuel no instala cookies de publicidad ni de analítica de terceros en el MVP.",
        "Usamos almacenamiento local del navegador para sesión, planes y eventos de producto. Es necesario para guardar tu historial si creas cuenta.",
        "Puedes borrar este almacenamiento desde la configuración del navegador o eliminando la cuenta local.",
      ]}
    />
  );
}

export function TermsPage() {
  return (
    <Legal
      path="/legal/terminos"
      title="Términos de uso"
      body={[
        "PedalMap Fuel ofrece orientación general de nutrición para actividad física, no coaching humano, no marketplace y no tratamiento.",
        "Los resultados son estimaciones. Tú decides qué comes y bebes.",
        "No se permite usar el servicio para diagnosticar, tratar o sustituir consejo sanitario profesional.",
        "El modo Premium descrito es provisional y no implica un contrato de pago activo.",
        "El software se ofrece “tal cual” durante la fase MVP.",
      ]}
    />
  );
}

export function DisclaimerPage() {
  return (
    <Legal
      path="/legal/aviso"
      title="Disclaimer nutricional"
      body={[DISCLAIMER, "PedalMap Fuel no es un producto sanitario ni un dispositivo médico.", "Ante diabetes, enfermedad renal o cardiovascular, embarazo, TCA, alergias graves o medicación relevante, consulta a un profesional. La app no creará un plan personalizado en esos casos."]}
    />
  );
}

function Legal({ path, title, body }: { path: string; title: string; body: string[] }) {
  return (
    <div className="sf-container max-w-3xl py-12">
      <Seo title={`${title} — PedalMap Fuel`} description={title} path={path} />
      <h1 className="font-display text-4xl">{title}</h1>
      <div className="mt-6 space-y-4 leading-relaxed">
        {body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
    </div>
  );
}
