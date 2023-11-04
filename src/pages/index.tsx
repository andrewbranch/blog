import React from "react";
import { graphql } from "gatsby";
import Layout from "../components/Layout";
import { PostPreview } from "../components/PostPreview";
import SEO from "../components/SEO";
import { Spacer } from "../components/Spacer";

export interface IndexPageProps {
	data: {
		allMarkdownRemark: {
			totalCount: number;
			edges: {
				node: {
					id: string;
					frontmatter: {
						title: string;
						subtitle?: string;
						date: string;
					};
					fields: {
						slug: string;
					};
					excerpt: string;
				};
			}[];
		};
	};
}

export const query = graphql`
	query {
		allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
			totalCount
			edges {
				node {
					id
					frontmatter {
						title
						subtitle
						date(formatString: "MMMM D, YYYY")
					}
					fields {
						slug
					}
					excerpt(format: HTML, pruneLength: 240)
				}
			}
		}
	}
`;

const IndexPage = React.memo<IndexPageProps>(({ data }) => {
	return (
		<Layout>
			<SEO title="Blog Posts" />
			<Spacer vertical space={1}>
				{data.allMarkdownRemark.edges.map(({ node }) => (
					<PostPreview
						key={node.id}
						slug={node.fields.slug}
						title={node.frontmatter.title}
						subtitle={node.frontmatter.subtitle}
						date={node.frontmatter.date}
						excerpt={node.excerpt}
					/>
				))}
			</Spacer>
		</Layout>
	);
});

export default IndexPage;
