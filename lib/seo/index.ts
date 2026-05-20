export {
  SITE_NAME,
  SITE_TAGLINE,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE_PATH,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  getSiteUrl,
  absoluteUrl,
  localePath,
  localizedAbsoluteUrl,
  resolveSalvyaLocale,
} from "./site";

export { ROBOTS_PUBLIC, ROBOTS_PRIVATE, ROBOTS_NOINDEX_FOLLOW } from "./robots";

export { buildPageMetadata, buildPrivatePageMetadata, rootSiteMetadata } from "./metadata";

export {
  organizationJsonLd,
  websiteJsonLd,
  breadcrumbJsonLd,
  artistProfileJsonLd,
  productJsonLd,
  articleJsonLd,
  collectionPageJsonLd,
  itemListJsonLd,
  compactJsonLd,
} from "./json-ld";

export {
  productPageTitle,
  productPageDescription,
  buildProductPageMetadata,
  type ProductSeoFields,
} from "./product-page";
