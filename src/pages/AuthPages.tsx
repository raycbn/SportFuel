import { useState, type FormEvent } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useSearchParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { FuelLink as Link, useFuelNavigate } from "@/components/FuelLink";
import { track } from "@/lib/analytics";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { useFuelAuth } from "@/contexts/AuthContext";
import { buildSharedAccountSignInPath } from "@/lib/shared-account";

export function LoginPage() {
  return <AuthForm mode="login" />;
}

export function RegisterPage() {
  return <AuthForm mode="register" />;
}

export function ForgotPasswordPage() {
  const [params] = useSearchParams();
  const next = safeNextPath(params.get("next"), true);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const auth = getFirebaseAuth();
    if (!isFirebaseConfigured() || !auth) {
      setMessage("La recuperación de contraseña no está disponible temporalmente.");
      return;
    }
    setBusy(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMessage("Si existe una cuenta con ese email, recibirás un enlace para restablecer la contraseña.");
    } catch {
      setMessage("No se pudo enviar el enlace. Comprueba el email e inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  const loginParams = new URLSearchParams({ shared: "1", next });
  return (
    <div className="sf-container max-w-md py-12">
      <Seo title="Recuperar contraseña - PedalMap Fuel" description="Restablece la contraseña de tu cuenta compartida de PedalMap." path="/forgot-password" />
      <h1 className="font-display text-3xl">Recuperar contraseña</h1>
      <p className="mt-3 text-ink-700">Te enviaremos un enlace al correo asociado a tu cuenta de PedalMap.</p>
      <form className="sf-card mt-6 space-y-4 p-6" onSubmit={(event) => void submit(event)}>
        <label className="block text-sm">
          Email
          <input className="mt-1 w-full rounded-2xl border px-4 py-3" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        {message ? <p className="text-sm text-ink-700" role="status">{message}</p> : null}
        <button className="w-full rounded-full bg-fuel-600 py-3 font-semibold text-white disabled:opacity-60" type="submit" disabled={busy}>
          {busy ? "Enviando…" : "Enviar enlace"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        <Link to={`/login?${loginParams.toString()}`} className="text-fuel-700">Volver a iniciar sesión</Link>
      </p>
    </div>
  );
}

function safeNextPath(raw: string | null, sharedMode: boolean): string {
  const fallback = sharedMode ? "/premium" : "/plans";
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return fallback;
  try {
    const base = new URL("https://fuel.invalid");
    const target = new URL(raw, base);
    if (target.origin !== base.origin) return fallback;
    if (["/login", "/register", "/forgot-password"].includes(target.pathname)) return fallback;
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return fallback;
  }
}

function sharedAuthError(error: unknown, mode: "login" | "register" | "google"): string {
  const code = error && typeof error === "object" && "code" in error
    ? String((error as { code?: unknown }).code ?? "")
    : "";
  if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
    return "El email o la contraseña no coinciden con la cuenta compartida.";
  }
  if (code === "auth/email-already-in-use") return "Ya existe una cuenta con ese email. Entra con esa cuenta de PedalMap.";
  if (code === "auth/weak-password") return "La contraseña debe tener al menos 6 caracteres.";
  if (code === "auth/invalid-email") return "Introduce un email válido.";
  if (code === "auth/popup-closed-by-user") return "Has cerrado la ventana de Google antes de terminar el acceso.";
  if (code === "auth/popup-blocked") return "El navegador ha bloqueado la ventana de Google. Permite las ventanas emergentes y vuelve a intentarlo.";
  if (code === "auth/unauthorized-domain") return "Firebase todavía no autoriza este dominio para el acceso con Google. Puedes entrar con email y contraseña o desde PedalMap.";
  return mode === "register"
    ? "No se pudo crear la cuenta compartida de PedalMap. Comprueba la configuración e inténtalo de nuevo."
    : "No se pudo iniciar sesión en la cuenta compartida. Comprueba tus datos e inténtalo de nuevo.";
}

function AuthForm({ mode }: { mode: "login" | "register" }) {
  const navigate = useFuelNavigate();
  const { provider, logout, user, plan, entitlementLoading, entitlementError, entitlementAllowlisted, entitlementGrupetaSeat } = useFuelAuth();
  const [params] = useSearchParams();
  const sharedMode = true;
  const next = safeNextPath(params.get("next"), true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);



  async function closePedalMapSession(returnPath: string) {
    setBusy(true);
    setMessage(null);
    try {
      await logout();
      navigate(returnPath, { replace: true });
    } catch {
      setMessage("No se pudo cerrar la sesión de PedalMap. No se ha confirmado el cierre; vuelve a intentarlo.");
      setBusy(false);
    }
  }
  async function completeSharedLogin(kind: "login" | "register" | "google") {
    if (!isFirebaseConfigured()) {
      setMessage("No se ha configurado la autenticación compartida de PedalMap. Inténtalo más tarde.");
      return;
    }
    const auth = getFirebaseAuth();
    if (!auth) {
      setMessage("No se pudo inicializar la autenticación compartida de PedalMap.");
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      if (kind === "google") {
        await signInWithPopup(auth, new GoogleAuthProvider());
      } else if (kind === "register") {
        track("signup_started", { provider: "pedalmap" });
        await createUserWithEmailAndPassword(auth, email.trim(), password);
        track("signup_completed", { provider: "pedalmap" });
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      navigate(next, { replace: true });
    } catch (error) {
      setMessage(sharedAuthError(error, kind));
      setBusy(false);
    }
  }

  if (provider === "pedalmap") {
    const planMessage = entitlementLoading || plan === null
      ? "Verificando el plan de esta cuenta…"
      : entitlementError
        ? "No hemos podido verificar el plan. No mostraremos Premium hasta confirmar el estado."
        : plan === "premium"
          ? "Esta cuenta tiene Premium activo."
          : "Esta cuenta está en el plan Free. Conectarse no activa Premium.";

    if (sharedMode) {
      const switchAccountPath = `/login?${new URLSearchParams({ shared: "1", next }).toString()}`;
      return (
        <div className="sf-container max-w-md py-12">
          <Seo title="Cuenta de PedalMap - Fuel" description="Comprueba qué cuenta de PedalMap está conectada." path="/login" />
          <h1 className="font-display text-3xl">Ya hay una sesión de PedalMap</h1>
          <p className="mt-3 text-ink-700">Cuenta: {user?.email ?? "email no disponible"}</p>
        {plan === "premium" && !entitlementLoading ? (
          <p className="mt-2 text-sm text-ink-700">Origen del derecho: {entitlementAllowlisted ? "autorización Premium administrativa" : entitlementGrupetaSeat ? "plaza Premium de Grupeta" : "facturación o registro de suscripción del servidor"}.</p>
        ) : null}
          <p className="mt-3 text-sm text-ink-700" role={entitlementError ? "alert" : "status"}>{planMessage}</p>
        {message ? <p className="mt-3 text-sm text-red-700" role="alert">{message}</p> : null}
          <div className="mt-6 flex flex-col gap-3">
            <button type="button" className="sf-btn bg-fuel-500 text-white" disabled={entitlementLoading || plan === null || entitlementError} onClick={() => navigate(next, { replace: true })}>
              Continuar con esta cuenta
            </button>
            <button type="button" className="sf-btn border" disabled={busy} onClick={() => void closePedalMapSession(switchAccountPath)}>
              {busy ? "Cerrando sesión..." : "Cambiar cuenta de PedalMap"}
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="sf-container max-w-md py-12">
        <Seo
          title={mode === "login" ? "Sesión de PedalMap - Fuel" : "Cuenta de PedalMap - Fuel"}
          description="Estás conectado a una cuenta de PedalMap; el plan se verifica por separado."
          path={mode === "login" ? "/login" : "/register"}
        />
        <h1 className="font-display text-3xl">Cuenta de PedalMap conectada</h1>
        <p className="mt-3 text-ink-700">Cuenta: {user?.email ?? "email no disponible"}</p>
        {plan === "premium" && !entitlementLoading ? (
          <p className="mt-2 text-sm text-ink-700">Origen del derecho: {entitlementAllowlisted ? "autorización Premium administrativa" : entitlementGrupetaSeat ? "plaza Premium de Grupeta" : "facturación o registro de suscripción del servidor"}.</p>
        ) : null}
        <p className="mt-3 text-sm text-ink-700" role={entitlementError ? "alert" : "status"}>{planMessage}</p>
        {message ? <p className="mt-3 text-sm text-red-700" role="alert">{message}</p> : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link to="/planner" className="sf-btn bg-fuel-500 text-center text-white hover:bg-fuel-400">
            Ir al planificador
          </Link>
          <button type="button" className="sf-btn border" disabled={busy} onClick={() => void closePedalMapSession("/login")}>
            {busy ? "Cerrando sesión..." : "Cerrar sesión en PedalMap"}
          </button>
        </div>
      </div>
    );
  }

  const sharedLinkParams = new URLSearchParams({ shared: "1", next });
  const loginLink = `/login?${sharedLinkParams.toString()}`;
  const registerLink = `/register?${sharedLinkParams.toString()}`;

  return (
    <div className="sf-container max-w-md py-12">
      <Seo
        title={sharedMode ? "Cuenta compartida - PedalMap Fuel" : mode === "login" ? "Entrar - PedalMap Fuel" : "Crear cuenta - PedalMap Fuel"}
        description={sharedMode ? "Accede con la cuenta compartida de PedalMap." : "Registro opcional para guardar planes. El calculador funciona sin cuenta."}
        path={mode === "login" ? "/login" : "/register"}
      />
      <h1 className="font-display text-3xl">
        {sharedMode ? "Conectar cuenta de PedalMap" : mode === "login" ? "Entrar" : "Crear cuenta"}
      </h1>
      <p className="mt-3 text-ink-700">
        {sharedMode
          ? "Usa los mismos datos con los que entras en PedalMap. Tu plan se comparte entre PedalMap y Fuel; no se crea una suscripción aparte."
          : "Guest-first: puedes calcular sin registrarte. La cuenta local guarda historial y preferencias en este dispositivo."}
      </p>
      {!sharedMode ? (
        <p className="mt-3 text-sm text-ink-700">
          ¿Quieres comprobar el Premium de tu cuenta de PedalMap?{" "}
          <Link to={buildSharedAccountSignInPath("year")} className="font-semibold text-fuel-700 underline underline-offset-2">
            Conectar cuenta de PedalMap
          </Link>
        </p>
      ) : null}
      <form
        className="sf-card mt-6 space-y-4 p-6"
        onSubmit={async (event) => {
          event.preventDefault();
          await completeSharedLogin(mode);
        }}
      >
        <label className="block text-sm">
          Email
          <input className="mt-1 w-full rounded-2xl border px-4 py-3" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="block text-sm">
          Contraseña
          <input className="mt-1 w-full rounded-2xl border px-4 py-3" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={sharedMode ? 6 : undefined} value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {message ? <p className="text-sm text-red-700" role="alert">{message}</p> : null}
        <button className="w-full rounded-full bg-fuel-600 py-3 font-semibold text-white disabled:opacity-60" type="submit" disabled={busy}>
          {busy ? "Conectando…" : sharedMode ? mode === "login" ? "Entrar con mi cuenta PedalMap" : "Crear cuenta de PedalMap" : mode === "login" ? "Entrar" : "Crear cuenta gratis"}
        </button>
        {sharedMode ? (
          <button
            type="button"
            className="w-full rounded-full border py-3 text-sm disabled:opacity-60"
            disabled={busy}
            onClick={() => void completeSharedLogin("google")}
          >
            {busy ? "Conectando…" : "Continuar con Google"}
          </button>
        ) : (
          <button
            type="button"
            className="w-full rounded-full border py-3 text-sm disabled:opacity-60"
            disabled={busy}
            onClick={() => void completeSharedLogin("google")}
          >
            {busy ? "Conectando…" : "Continuar con Google (cuenta PedalMap)"}
          </button>
        )}
      </form>
      {mode === "login" ? (
        <p className="mt-4 text-sm"><Link to={`/forgot-password?${new URLSearchParams({ next }).toString()}`} className="text-fuel-700">¿Has olvidado tu contraseña?</Link></p>
      ) : null}
      <p className="mt-4 text-sm">
        {mode === "login" ? (
          <Link to={sharedMode ? registerLink : "/register"} className="text-fuel-700">
            {sharedMode ? "Crear una cuenta compartida nueva" : "Crear cuenta"}
          </Link>
        ) : (
          <Link to={sharedMode ? loginLink : "/login"} className="text-fuel-700">
            Ya tengo cuenta
          </Link>
        )}
      </p>
      {sharedMode ? <p className="mt-4 text-xs text-ink-700">Si ya tienes cuenta, no te registres de nuevo: inicia sesión con el mismo método que usas en PedalMap.</p> : null}
    </div>
  );
}