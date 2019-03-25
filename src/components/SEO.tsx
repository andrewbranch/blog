import React from 'react';
import Helmet from 'react-helmet';
import { StaticQuery, graphql } from 'gatsby';
import { isSSR } from '../utils/ssr';

export interface SEOProps {
  description?: string;
  lang: string;
  meta: { name: string, content: string }[];
  keywords: string[];
  title: string;
  image?: string;
}

const SEO = ({ description, lang, meta, keywords, title, image }: SEOProps) => {
  return (
    <StaticQuery
      query={detailsQuery}
      render={data => {
        function absoluteURL(path: string | undefined) {
          return path ?
            (isSSR ? data.site.siteMetadata.siteUrl : location.origin) + path
            : undefined;
        }
        const metaDescription =
          description || data.site.siteMetadata.description;
        return (
          <Helmet
            htmlAttributes={{
              lang,
            }}
            title={title}
            titleTemplate={`%s ・ ${data.site.siteMetadata.title}`}
            meta={[
              {
                name: 'description',
                content: metaDescription,
              },
              {
                property: 'og:title',
                content: `${title} ・ ${data.site.siteMetadata.title}`,
              },
              {
                property: 'og:image',
                content: absoluteURL(image),
              },
              {
                property: 'og:description',
                content: metaDescription,
              },
              {
                property: 'og:type',
                content: 'website',
              },
              {
                name: 'twitter:card',
                content: 'summary',
              },
              {
                name: 'twitter:site',
                content: '@atcb',
              },
              {
                name: 'twitter:creator',
                content: '@atcb',
              },
              {
                name: 'twitter:image',
                content: absoluteURL(image),
              },
              {
                name: 'twitter:title',
                content: `${title} ・ ${data.site.siteMetadata.title}`,
              },
              {
                name: 'twitter:description',
                content: metaDescription,
              },
            ]
              .concat(
                keywords.length > 0
                  ? {
                      name: 'keywords',
                      content: keywords.join(', '),
                    }
                  : [],
              )
              .concat(meta)}
          />
        );
      }}
    />
  );
};

SEO.defaultProps = {
  lang: 'en',
  meta: [],
  keywords: [],
};

export default SEO;

const detailsQuery = graphql`
  query DefaultSEOQuery {
    site {
      siteMetadata {
        title
        siteUrl
        description
        author
      }
    }
  }
`;
