import { css } from '@emotion/core';
import './themes.css';
import { type } from '../../styles/utils';

export enum SyntacticColors {
  Function = 'var(--function)',
  Types = 'var(--types)',
  ControlFlow = 'var(--controlflow)',
  VariableName = 'var(--variablename)',
  RegExp = 'var(--regexp)',
  Comment = 'var(--comment)',
  Keyword = 'var(--keyword)',
  Numeric = 'var(--numeric)',
  String = 'var(--string)',
  Property = 'var(--property)',
  Punctuation = 'var(--punctuation)',
  Operator = 'var(--operator)',
}

export const commonBlockStyles = css([type.mono, {
  fontSize: '80%',
  borderRadius: 3,
  overflow: 'auto',
  whiteSpace: 'nowrap',
  WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
}]);
