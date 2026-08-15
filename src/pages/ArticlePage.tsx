import { Link, useParams } from "react-router-dom";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { Seo, breadcrumbLd, faqLd } from "@/components/Seo";
import { getArticle } from "@/content/articles";

export function ArticlePage() {
  const { slug } = useParams();
  const article = slug ? getArticle(slug) : undefined;
  if (!article) {
    return (
      <div className="sf-container py-16">
        <h1 className="font-display text-3xl">Artículo no encontrado</h1>
        <Link to="/blog" className="mt-4 inline-block text-fuel-700">
          Volver al blog
        </Link>
      </div>
    );
  }
  return (
    <article className="sf-container max-w-3xl py-10">
      <Seo
        title={`${article.title} — SportFuel`}
        description={article.description}
        path={`/${article.slug.startsWith("que-") || article.slug.startsWith("nutricion") ? article.slug : `blog/${article.slug}`}`}
        type="article"
        jsonLd={[
          breadcrumbLd([
            { name: "Inicio", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: article.title, path: `/blog/${article.slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            datePublished: article.date,
            inLanguage: "es",
            author: { "@type": "Organization", name: "SportFuel" },
          },
          faqLd(article.faqs),
        ]}
      />
      <p className="text-sm text-fuel-700">
        <Link to="/blog">Blog</Link> · {article.date}
      </p>
      <h1 className="mt-2 font-display text-4xl">{article.title}</h1>
      <p className="mt-4 text-lg text-ink-700">{article.description}</p>
      <div className="mt-8 space-y-4 leading-relaxed">
        {article.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <section className="mt-10">
        <h2 className="font-display text-2xl">Preguntas</h2>
        <dl className="mt-4 space-y-3">
          {article.faqs.map((faq) => (
            <div key={faq.q} className="sf-card p-4">
              <dt className="font-semibold">{faq.q}</dt>
              <dd className="mt-1 text-ink-700">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="mt-8 text-sm">
        <h2 className="font-display text-2xl">Fuentes</h2>
        <ul className="mt-3 list-disc pl-5">
          {article.sources.map((source) => (
            <li key={source.url}>
              <a className="text-fuel-700 underline" href={source.url} target="_blank" rel="noreferrer">
                {source.name}
              </a>
            </li>
          ))}
        </ul>
      </section>
      {article.cta ? (
        <Link to={article.cta.to} className="mt-8 inline-block rounded-full bg-fuel-600 px-5 py-3 font-semibold text-white">
          {article.cta.label}
        </Link>
      ) : null}
      <div className="mt-8">
        <DisclaimerBanner compact />
      </div>
    </article>
  );
}
