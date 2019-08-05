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
      {
        flexDirection: vertical ? 'column' : 'row',
        '& > :not(:last-child)': [margin(space, vertical ? Side.Bottom : Side.Right), { flexShrink: 0 }],
      },
    ]}
  />
));

Spacer.displayName = 'Spacer';
