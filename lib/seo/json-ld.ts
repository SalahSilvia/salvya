import type { BlogPost } from "@/lib/blog/types";
import type { StorefrontProduct } from "@/lib/catalog/storefront-product";
import { pdpPath, priceLabelForProduct } from "@/lib/catalog/storefront-product";
import type { ArtistCard } from "@/lib/site-data";
import {
  DEFAULT_LOCALE,
  SITE_NAME,
  localizedAbsoluteUrl,
  getSiteUrl,
  resolveSalvyaLocale,
  type SalvyaLocale,
} from "./site";

type JsonLd = Record<string, unknown>;

function withContext(node: JsonLd): JsonLd {
  return { "@context": "https://schema.org", ...node };
}

function loc(locale?: string | SalvyaLocale): SalvyaLocale {
  return resolveSalvyaLocale(locale);
}

function pageUrl(path: string, locale?: string | SalvyaLocale): string {
  return localizedAbsoluteUrl(path, loc(locale));
}

export function organizationJsonLd(): JsonLd {
  return withContext({
    "@type": "Organization",
    "@id": `${getSiteUrl()}/#organization`,
    name: SITE_NAME,
    url: getSiteUrl(),
    logo: localizedAbsoluteUrl("/api/brand/salvya-logo-black", DEFAULT_LOCALE),
    description:
      "Salvya is a premium creator-commerce platform for official artist merch, limited drops, and fan-first checkout.",
    sameAs: [],
  });
}

export function websiteJsonLd(locale?: string | SalvyaLocale): JsonLd {
  const l = loc(locale);
  return withContext({
    "@type": "WebSite",
    "@id": `${getSiteUrl()}/#website`,
    name: SITE_NAME,
    url: pageUrl("/", l),
    inLanguage: l,
    publisher: { "@id": `${getSiteUrl()}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${pageUrl("/search", l)}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  });
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
  locale?: string | SalvyaLocale,
): JsonLd {
  const l = loc(locale);
  return withContext({
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: pageUrl(item.path, l),
    })),
  });
}

export function artistProfileJsonLd(artist: ArtistCard, locale?: string | SalvyaLocale): JsonLd {
  const l = loc(locale);
  const path = `/artist/${artist.slug}`;
  return withContext({
    "@type": "ProfilePage",
    "@id": `${pageUrl(path, l)}#profile`,
    url: pageUrl(path, l),
    name: `${artist.name} — Official Merch`,
    description: artist.aboutLead,
    mainEntity: {
      "@type": "Person",
      name: artist.name,
      url: pageUrl(path, l),
      image: localizedAbsoluteUrl(artist.coverImage || artist.profileImage, l),
      description: artist.aboutLead,
    },
    isPartOf: { "@id": `${getSiteUrl()}/#website` },
  });
}

export function productJsonLd(
  product: StorefrontProduct,
  artistName: string,
  locale?: string | SalvyaLocale,
): JsonLd {
  const l = loc(locale);
  const path = pdpPath(product);
  const url = pageUrl(path, l);
  const image = product.images[0]
    ? localizedAbsoluteUrl(product.images[0], l)
    : localizedAbsoluteUrl("/api/brand/salvya-logo-black", l);
  const availability = product.soldOut
    ? "https://schema.org/OutOfStock"
    : "https://schema.org/InStock";

  return withContext({
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.title,
    description:
      product.description?.trim() ||
      `${product.title} by ${artistName} on Salvya. ${priceLabelForProduct(product)}`,
    image: product.images.length
      ? product.images.map((img) => localizedAbsoluteUrl(img, l))
      : [image],
    sku: product.slug,
    brand: {
      "@type": "Brand",
      name: artistName,
    },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "EUR",
      price: (product.priceCents / 100).toFixed(2),
      availability,
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
  });
}

export function articleJsonLd(post: BlogPost, locale?: string | SalvyaLocale): JsonLd {
  const l = loc(locale);
  const path = `/blog/${post.slug}`;
  const url = pageUrl(path, l);
  return withContext({
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    image: post.coverImage ? localizedAbsoluteUrl(post.coverImage, l) : undefined,
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.authorName || SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: localizedAbsoluteUrl("/api/brand/salvya-logo-black", l),
      },
    },
    mainEntityOfPage: url,
    keywords: post.tags.join(", ") || undefined,
    articleSection: post.tags[0] ?? "Culture",
    wordCount: post.bodyMd.split(/\s+/).filter(Boolean).length,
  });
}

export function collectionPageJsonLd(input: {
  name: string;
  description: string;
  path: string;
  locale?: string | SalvyaLocale;
}): JsonLd {
  const l = loc(input.locale);
  return withContext({
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url: pageUrl(input.path, l),
    isPartOf: { "@id": `${getSiteUrl()}/#website` },
  });
}

export function itemListJsonLd(input: {
  name: string;
  path: string;
  locale?: string | SalvyaLocale;
  items: Array<{ name: string; path: string; image?: string | null }>;
}): JsonLd {
  const l = loc(input.locale);
  return withContext({
    "@type": "ItemList",
    name: input.name,
    url: pageUrl(input.path, l),
    numberOfItems: input.items.length,
    itemListElement: input.items.slice(0, 24).map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: pageUrl(item.path, l),
      ...(item.image ? { image: localizedAbsoluteUrl(item.image, l) } : {}),
    })),
  });
}

/** Strip undefined keys for valid JSON output. */
export function compactJsonLd(node: JsonLd): JsonLd {
  return JSON.parse(JSON.stringify(node)) as JsonLd;
}
