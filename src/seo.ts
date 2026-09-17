// Разметка для поисковиков и ИИ-ассистентов (schema.org JSON-LD).
// Собирается из content.ts, чтобы цены и услуги в разметке совпадали с тем, что на экране.
import type { Content, ServicePage } from "./content";

const SITE_URL = "https://rzanbatyr.github.io/groom-demo/";

function priceNumber(p: string): string | undefined {
  const m = p.replace(/\s/g, "").match(/\d+/);
  return m ? m[0] : undefined;
}

export function buildJsonLd(c: Content, page?: ServicePage) {
  const business = {
    "@type": ["LocalBusiness", "HealthAndBeautyBusiness"],
    "@id": `${SITE_URL}#business`,
    name: c.clinic.name,
    description: c.meta.description,
    url: SITE_URL,
    image: `${SITE_URL}og.jpg`,
    telephone: c.clinic.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: c.clinic.addressShort,
      addressLocality: c.clinic.city,
      addressCountry: "KZ",
    },
    openingHours: "Mo-Su 09:00-20:00",
    priceRange: "₸₸",
    currenciesAccepted: "KZT",
    paymentAccepted: "Cash, Kaspi, Card",
    areaServed: c.clinic.city,
    knowsLanguage: ["ru", "kk"],
    sameAs: [c.clinic.whatsapp],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: c.ui.allServices,
      itemListElement: c.pages.map((p) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: p.title, description: p.intro, url: `${SITE_URL}#/p/${p.slug}` },
        priceCurrency: "KZT",
        price: priceNumber(p.prices[0]?.price || ""),
        priceSpecification: p.prices.map((r) => ({
          "@type": "UnitPriceSpecification",
          name: r.name,
          price: priceNumber(r.price),
          priceCurrency: "KZT",
        })),
      })),
    },
  };

  const graph: Record<string, unknown>[] = [
    { "@type": "WebSite", "@id": `${SITE_URL}#website`, url: SITE_URL, name: c.meta.title, inLanguage: ["ru", "kk"] },
    business,
  ];

  if (page) {
    graph.push({
      "@type": "Service",
      "@id": `${SITE_URL}#/p/${page.slug}`,
      name: page.title,
      description: page.intro,
      provider: { "@id": `${SITE_URL}#business` },
      areaServed: c.clinic.city,
      offers: page.prices.map((r) => ({ "@type": "Offer", name: r.name, price: priceNumber(r.price), priceCurrency: "KZT" })),
    });
    graph.push({
      "@type": "FAQPage",
      mainEntity: page.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

// Пишем/обновляем один <script type="application/ld+json"> в <head>
export function applyJsonLd(c: Content, page?: ServicePage) {
  let el = document.getElementById("ld-json") as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = "ld-json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(buildJsonLd(c, page));
}
