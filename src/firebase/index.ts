'use client';

// This file serves as a central "barrel" for exporting all necessary Firebase hooks and providers.
// By importing from here, components can get access to everything they need from a single place.

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
