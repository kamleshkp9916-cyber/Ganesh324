
/**
 * @fileoverview This file is the entry point for the Genkit developer UI.
 *
 * To run this file, run `genkit start`.
 */

import { nextDev } from '@genkit-ai/next';
import { defineDevApp } from '@genkit-ai/app';

export default defineDevApp({
  plugins: [
    nextDev({
      // These are required for the dev UI to work with Next.js.
      // You can probably leave these as is.
      appPath: '.',
      watch: ['.'],
    }),
  ],
});
