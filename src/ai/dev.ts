
'use server';
/**
 * @fileoverview This is the development entrypoint for the Genkit service.
 *
 * It is not used in production.
 */
import { nextDev } from '@genkit-ai/next';
import { defineDevApp } from 'genkit';

export default defineDevApp({
  plugins: [
    nextDev({
      appPath: '.',
      watch: ['.'],
      ignore: ['.next/**'],
    }),
  ],
});
