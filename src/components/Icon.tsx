import * as React from 'react';

export type CommonIconProps = React.ImgHTMLAttributes<HTMLImageElement>;
export interface SrcIconPropsFragment {
  src: string;
  size: string | number;
}

export type IconProps = CommonIconProps & SrcIconPropsFragment;

const Icon = (props: IconProps) => {
  const { src, size, ...passthrough } = props;
  return (
    <img
      src={src}
      css={{ margin: 0, userSelect: 'none', flexShrink: 0, width: size, height: size }}
      {...passthrough}
    />
  );
};

Icon.displayName = 'Icon';
Icon.defaultProps = {
  size: 24,
};

const MemoizedIcon = React.memo(Icon);
export { MemoizedIcon as Icon };
