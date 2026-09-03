import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { getSessionEmail } from "@/lib/auth";
import { useFuelAuth } from "@/contexts/AuthContext";

const nav = [
  { to: "/planner", label: "Crear plan" },
  { to: "/calculators", label: "Calculadoras" },
  { to: "/sports", label: "Deportes" },
  { to: "/blog", label: "Blog" },
];

function AccountBadge() {
  const { provider, plan, entitlementLoading } = useFuelAuth();
  const isPedalMap = provider === "pedalmap";
  const isPremium = plan === "premium";

  if (!isPedalMap && !isPremium) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-xs font-medium text-white">
      {isPedalMap ? (
        <>
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-fuel-300" aria-hidden="true" />
          <span>Conectado con PedalMap</span>
        </>
      ) : null}
      {isPremium && !entitlementLoading ? (
        <span className="ml-1 rounded-full bg-fuel-500 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          Premium
        </span>
      ) : null}
    </span>
  );
}

export function Layout() {
  const [open, setOpen] = useState(false);
  const email = getSessionEmail();

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2">
        Saltar al contenido
      </a>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-900/95 text-white backdrop-blur">
        <div className="sf-container flex items-center justify-between gap-3 py-3">
          <Link to="/" className="font-display text-lg font-semibold tracking-tight">
            PedalMap Fuel
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex" aria-label="Principal">
            {nav.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? "text-fuel-300" : "text-white/80 hover:text-white")}>
                {item.label}
              </NavLink>
            ))}
            <div className="flex items-center gap-3">
              <AccountBadge />
              <NavLink to={email ? "/plans" : "/login"} className="text-white/80 hover:text-white">
                {email ? "Mis planes" : "Entrar"}
              </NavLink>
            </div>
            <Link to="/planner" className="sf-tap inline-flex items-center rounded-full bg-fuel-500 px-4 py-2 font-semibold text-white hover:bg-fuel-400">
              Crear mi plan
            </Link>
          </nav>
          <button
            type="button"
            className="sf-tap inline-flex min-h-11 items-center rounded-lg px-3 text-sm md:hidden"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            Menú
          </button>
        </div>
        {open ? (
          <nav className="sf-container flex flex-col gap-1 pb-4 md:hidden" aria-label="Móvil">
            {nav.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)} className="sf-tap flex items-center text-white/90">
                {item.label}
              </NavLink>
            ))}
            <div className="flex items-center gap-2">
              <AccountBadge />
              <NavLink to={email ? "/plans" : "/login"} onClick={() => setOpen(false)} className="sf-tap flex items-center text-white/90">
                {email ? "Mis planes" : "Entrar"}
              </NavLink>
            </div>
            <Link to="/planner" onClick={() => setOpen(false)} className="sf-btn mt-2 bg-fuel-500 text-center text-white">
              Crear mi plan
            </Link>
          </nav>
        ) : null}
      </header>
      <main id="contenido" className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-ink-900/10 bg-white">
        <div className="sf-container grid gap-6 py-10 text-sm text-ink-700 md:grid-cols-4">
          <div>
            <p className="font-display text-base font-semibold text-ink-900">PedalMap Fuel</p>
            <p className="mt-2 max-w-xs">Nutrición e hidratación para tu próxima salida. Estimaciones, no un producto médico.</p>
          </div>
          <div className="flex flex-col gap-2">
            <Link to="/calculators">Calculadoras</Link>
            <Link to="/premium">Premium</Link>
            <Link to="/blog">Blog</Link>
          </div>
          <div className="flex flex-col gap-2">
            <Link to="/legal/privacidad">Privacidad</Link>
            <Link to="/legal/cookies">Cookies</Link>
            <Link to="/legal/terminos">Términos</Link>
            <Link to="/legal/aviso">Disclaimer</Link>
          </div>
          <p className="text-xs leading-relaxed text-ink-700/80">
            No diagnostica ni trata enfermedades. No sustituye a un dietista-nutricionista o médico.
          </p>
        </div>
      </footer>
    </div>
  );
}
