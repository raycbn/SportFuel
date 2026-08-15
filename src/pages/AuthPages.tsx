import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { track } from "@/lib/analytics";
import { firebaseConfigured, loginLocal, registerLocal } from "@/lib/auth";

export function LoginPage() {
  return <AuthForm mode="login" />;
}

export function RegisterPage() {
  return <AuthForm mode="register" />;
}

function AuthForm({ mode }: { mode: "login" | "register" }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") ?? "/plans";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="sf-container max-w-md py-12">
      <Seo
        title={mode === "login" ? "Entrar — SportFuel" : "Crear cuenta — SportFuel"}
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
        {message ? <p className="text-sm text-red-700">{message}</p> : null}
        <button className="w-full rounded-full bg-fuel-600 py-3 font-semibold text-white" type="submit">
          {mode === "login" ? "Entrar" : "Crear cuenta gratis"}
        </button>
        <button
          type="button"
          className="w-full rounded-full border py-3 text-sm"
          onClick={() => setMessage(firebaseConfigured() ? "Google estará disponible cuando el proyecto Firebase esté activo." : "Google Sign-In requiere configurar Firebase (gratis en Spark). No se finge un login.")}
        >
          Continuar con Google
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
