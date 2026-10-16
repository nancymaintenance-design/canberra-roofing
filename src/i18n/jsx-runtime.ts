import { jsx as originalJsx, jsxs as originalJsxs, Fragment } from 'react/jsx-runtime';
import { localizeProps } from './runtime';
export { Fragment };
export type { JSX } from 'react/jsx-runtime';
export const jsx = (type: any, props: any, key?: any) => originalJsx(type, localizeProps(type, props), key);
export const jsxs = (type: any, props: any, key?: any) => originalJsxs(type, localizeProps(type, props), key);
