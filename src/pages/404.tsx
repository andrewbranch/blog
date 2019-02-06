import React from 'react';
import { graphql } from 'gatsby';
import Img, { ImageData } from 'gatsby-image';

import Layout from '../components/Layout';
import SEO from '../components/SEO';

const NotFoundPage = ({ data }: { data: ImageData }) => (
  <Layout>
    <SEO title="404: Not found" />
    <h1>Page not found.</h1>
    <p>Bummer. Here’s a sad train to share in your sadness.</p>
    <Img fluid={data.file.childImageSharp.fluid} alt="Sad train" />
  </Layout>
);

export default NotFoundPage;

export const query = graphql`
  query {
    file(relativePath: { eq: "404.jpeg" }) {
      childImageSharp {
        fluid {
          ...GatsbyImageSharpFluid
        }
      }
    }
  }`;
