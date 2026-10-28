
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'GoBRC Image Tools';
const SITE_URL = 'https://image.brchub.tech';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

interface SEOProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
}

export default function SEO({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  noIndex = false,
}: SEOProps) {
  const canonicalUrl = new URL(path, SITE_URL).href;

  return (
    <Helmet>
      <title>{title}</title>

      <meta name="description" content={description} />

      <link rel="canonical" href={canonicalUrl} />

      <meta
        name="robots"
        content={
          noIndex
            ? 'noindex, nofollow'
            : 'index, follow, max-image-preview:large'
        }
      />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
