import React from 'react';
import { css } from '@emotion/core';
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

const styles = css([
  resets.unanchor,
  {
    '.gatsby-resp-image-wrapper': { display: 'none !important' },
    p: textColor.muted,
 },
]);

const dateStyles = css([
  textColor.secondary,
  { fontStyle: 'italic', fontSize: '0.8rem' },
]);

const headerstyles = css([
  margin(0.25, Side.Vertical),
  { lineHeight: 1.4 },
]);

const MemoizedPostPreview = React.memo<PostPreviewProps>(function PostPreview({
  title,
  subtitle,
  slug,
  date,
  excerpt,
}) {
  return (
    <Link to={slug} css={styles}>
      <div css={dateStyles}>{date}</div>
      <h3 css={headerstyles}>{formatTitle(title, subtitle)}</h3>
      <div css={{ '*': { margin: 0 } }} dangerouslySetInnerHTML={{ __html: removeLinksAndImages(excerpt) }} />
    </Link>
  );
});

export { MemoizedPostPreview as PostPreview };
