import { css } from '@emotion/core';
import { monoFamily } from '../../utils/typography';
import './themes.css';

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

export const commonBlockStyles = css({
  fontFamily: monoFamily.join(', '),
  fontVariantLigatures: 'none',
  fontFeatureSettings: 'normal',
  fontSize: '80%',
  borderRadius: 3,
  overflow: 'auto',
  whiteSpace: 'nowrap',
});
