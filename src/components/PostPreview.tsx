import React from 'react';
import { margin, Side, resets } from '../styles/utils';
import { Link } from 'gatsby';

export interface PostPreviewProps {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
}

export const PostPreview = React.memo<PostPreviewProps>(({ title, slug, excerpt }) => {
  return (
    <Link to={slug} css={resets.unanchor}>
      <h3 css={margin(0.5, Side.Bottom)}>{title}</h3>
      <div dangerouslySetInnerHTML={{ __html: excerpt }} />
    </Link>
  );
});
