import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { track } from "@/lib/analytics";
import { loginLocal, registerLocal } from "@/lib/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";

export function LoginPage() {
  return <AuthForm mode="login" />;
}

export function RegisterPage() {
  return <AuthForm mode="register" />;
}

function AuthForm({ mode }: { mode: "login" | "register" }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const requestedNext = params.get("next");
  const next = requestedNext && requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/plans";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [googleBusy, setGoogleBusy] = useState(false);

  async function signInGoogle() {
    if (!isFirebaseConfigured()) {
      setMessage("No está configurado el acceso compartido de PedalMap. Inténtalo más tarde.");
      return;
    }
    const auth = getFirebaseAuth();
    if (!auth) {
      setMessage("No se pudo inicializar el acceso con Google. Inténtalo más tarde.");
      return;
    }

    setGoogleBusy(true);
    setMessage(null);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      navigate(next, { replace: true });
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error
        ? String((error as { code?: unknown }).code ?? "")
        : "";
      const googleMessage = code === "auth/popup-closed-by-user"
        ? "Has cerrado la ventana de Google antes de completar el acceso."
        : code === "auth/popup-blocked"
          ? "El navegador ha bloqueado la ventana de Google. Permite las ventanas emergentes y vuelve a intentarlo."
          : code === "auth/unauthorized-domain"
            ? "Firebase todavía no autoriza este dominio para iniciar sesión con Google."
            : "No se pudo iniciar sesión con Google. Comprueba la configuración de la cuenta e inténtalo de nuevo.";
      setMessage(googleMessage);
    } finally {
      setGoogleBusy(false);
    }
  }

  return (
    <div className="sf-container max-w-md py-12">
      <Seo
        title={mode === "login" ? "Entrar — PedalMap Fuel" : "Crear cuenta — PedalMap Fuel"}
        description="Registro opcional para guardar planes. El calculador funciona sin cuenta."
        path={mode === "login" ? "/login" : "/register"}
      />
      <h1 className="font-display text-3xl">{mode === "login" ? "Entrar" : "Crear cuenta"}</h1>
      <p className="mt-3 text-ink-700">
        Guest-first: puedes calcular sin registrarte. La cuenta guarda historial y preferencias en este dispositivo.
      </p>
      <form
        className="sf-card mt-6 space-y-4 p-6"
        onSubmit={async (event) => {
          event.preventDefault();
          if (mode === "register") track("signup_started", {});
          const result = mode === "login" ? await loginLocal(email, password) : await registerLocal(email, password);
          if (!result.ok) {
            setMessage(result.message);
            return;
          }
          if (mode === "register") track("signup_completed", {});
          navigate(next);
        }}
      >
        <label className="block text-sm">
          Email
          <input className="mt-1 w-full rounded-2xl border px-4 py-3" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="block text-sm">
          Contraseña
          <input className="mt-1 w-full rounded-2xl border px-4 py-3" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {message ? <p className="text-sm text-red-700" role="alert">{message}</p> : null}
        <button className="w-full rounded-full bg-fuel-600 py-3 font-semibold text-white" type="submit">
          {mode === "login" ? "Entrar" : "Crear cuenta gratis"}
        </button>
        <button
          type="button"
          className="w-full rounded-full border py-3 text-sm disabled:opacity-60"
          disabled={googleBusy}
          onClick={() => void signInGoogle()}
        >
          {googleBusy ? "Conectando…" : "Continuar con Google (cuenta PedalMap)"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        {mode === "login" ? (
          <Link to="/register" className="text-fuel-700">
            Crear cuenta
          </Link>
        ) : (
          <Link to="/login" className="text-fuel-700">
            Ya tengo cuenta
          </Link>
        )}
      </p>
    </div>
  );
}
