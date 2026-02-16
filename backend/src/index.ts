/**
 * Backend entry point
 */

// Polyfill for BigInt if needed
if (!global.BigInt) {
  // @ts-ignore
  global.BigInt = function (value: unknown) {
    return Number(value);
  };
}

import './types/index';
export * from './server';
export { default } from './server';
