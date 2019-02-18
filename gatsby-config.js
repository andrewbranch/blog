const path = require('path');

module.exports = {
  siteMetadata: {
    title: 'Andrew Branch',
    description: 'A blog about coding and maybe other stuff. Who knows?',
    author: '@atcb',
    siteUrl: 'https://blog.andrewbran.ch',
  },
  plugins: [
    'gatsby-plugin-typescript',
    'gatsby-plugin-typescript-checker',
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-emotion',
    'gatsby-plugin-catch-links',
    {
      resolve: 'gatsby-plugin-typography',
      options: {
        pathToConfigModule: 'src/utils/typography',
      },
    },
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'posts',
        path: `${__dirname}/posts`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: [
          `${__dirname}/gatsby-remark-annotate-code-blocks`,
          'gatsby-remark-katex',
          `${__dirname}/gatsby-remark-figure`,
          {
            resolve: 'gatsby-remark-images',
            options: {
              maxWidth: 760
            }
          },
          'gatsby-remark-static-images',
        ]
      }
    },
    {
      resolve: 'gatsby-plugin-webpack-bundle-analyzer',
      options: {
        openAnalyzer: false
      }
    },
    {
      resolve: 'gatsby-plugin-google-analytics',
      options: {
        trackingId: 'UA-47339312-2',
        anonymize: true,
        respectDNT: true,
      },
    },
    {
      resolve: 'gatsby-plugin-favicon',
      options: {
        background: 'transparent',
        icons: {
          android: true,
          appleIcon: true,
          appleStartup: true,
          coast: false,
          favicons: true,
          firefox: true,
          opengraph: false,
          twitter: true,
          yandex: false,
          windows: true
        }
      }
    },
    {
      resolve: 'gatsby-plugin-feed',
      options: {}
    }
  ],
}
