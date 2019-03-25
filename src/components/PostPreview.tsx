import React from 'react';
import { margin, Side, resets, textColor } from '../styles/utils';
import { Link } from 'gatsby';
import { formatTitle } from '../utils/formatTitle';

export interface PostPreviewProps {
  slug: string;
  title: string;
  subtitle?: string;
  date: string;
  excerpt: string;
}

const anchorImgTagPattern = /<\/?a[^>]*?>/ig;

// Forgive me my sins
function removeLinksAndImages(html: string) {
  return html.replace(anchorImgTagPattern, '');
}

const MemoizedPostPreview = React.memo<PostPreviewProps>(function PostPreview({
  title,
  subtitle,
  slug,
  date,
  excerpt,
}) {
  return (
    <Link to={slug} css={[resets.unanchor, { '.gatsby-resp-image-wrapper': { display: 'none !important' } }]}>
      <div css={[textColor.secondary, { fontStyle: 'italic' }]}>{date}</div>
      <h3 css={margin(0.25, Side.Vertical)}>{formatTitle(title, subtitle)}</h3>
      <div css={{ '*': { margin: 0 } }} dangerouslySetInnerHTML={{ __html: removeLinksAndImages(excerpt) }} />
    </Link>
  );
});

export { MemoizedPostPreview as PostPreview };
