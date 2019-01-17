import React from 'react';
import { StaticQuery, graphql } from 'gatsby';

import Header from './Header';
import { rhythm } from '../utils/typography';

const Layout: React.FunctionComponent = ({ children }) => (
  <StaticQuery
    query={graphql`
      query SiteTitleQuery {
        site {
          siteMetadata {
            title
          }
        }
      }
    `}
    render={data => (
      <div
        css={{
          maxWidth: 720,
          padding: `0 ${rhythm(0.5)}`,
          margin: '0 auto',
        }}
      >
        <Header siteTitle={data.site.siteMetadata.title} />
        <div>
          {children}
          <footer>
            © {new Date().getFullYear()}. All rights reserved.
          </footer>
        </div>
      </div>
    )}
  />
);

export default Layout;
