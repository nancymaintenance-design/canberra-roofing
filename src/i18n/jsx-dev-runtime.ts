import { jsxDEV as original, Fragment } from 'react/jsx-dev-runtime';
import { localizeProps } from './runtime';
export { Fragment };
export type { JSX } from 'react/jsx-runtime';
export const jsxDEV = (type: any, props: any, key: any, isStatic: boolean, source: any, self: any) => original(type, localizeProps(type, props), key, isStatic, source, self);
