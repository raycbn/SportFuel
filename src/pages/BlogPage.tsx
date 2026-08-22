import { Link } from "react-router-dom";
import { Seo, breadcrumbLd } from "@/components/Seo";
import { ARTICLES } from "@/content/articles";

export function BlogPage() {
  return (
    <div className="sf-container py-12">
      <Seo
        title="Blog de nutrición deportiva — PedalMap Fuel"
        description="Artículos con fuentes sobre carbohidratos, hidratación, comida real y planes para ciclismo, running y trail."
        path="/blog"
        jsonLd={[breadcrumbLd([{ name: "Inicio", path: "/" }, { name: "Blog", path: "/blog" }])]}
      />
      <h1 className="font-display text-4xl">Blog</h1>
      <p className="mt-3 max-w-2xl text-ink-700">Pocas piezas, con fuentes. No es una granja de palabras clave.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {ARTICLES.map((article) => (
          <Link key={article.slug} to={`/blog/${article.slug}`} className="sf-card p-5 hover:border-fuel-400">
            <h2 className="font-display text-xl">{article.title}</h2>
            <p className="mt-2 text-sm text-ink-700">{article.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
