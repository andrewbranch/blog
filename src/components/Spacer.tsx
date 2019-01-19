import * as React from 'react';
import { margin, Side, flex } from '../styles/utils';

export interface SpacerProps extends React.HTMLAttributes<HTMLElement> {
  space: number;
  vertical?: boolean;
}

export const Spacer = React.memo<SpacerProps>(({ space, vertical, ...props }) => (
  <div
    {...props}
    css={[
      flex.verticallyCenter,
      margin(-space / 2, vertical ? Side.Vertical : Side.Horizontal),
      {
        flexDirection: vertical ? 'column' : 'row',
        '& > *': margin(space / 2, vertical ? Side.Vertical : Side.Horizontal),
      },
    ]}
  />
));

Spacer.displayName = 'Spacer';
