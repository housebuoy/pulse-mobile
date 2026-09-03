// @ts-ignore
/// <reference types="nativewind/types" />

// TS 6 (TS2882) requires type declarations for side-effect-only imports.
// global.css is imported in src/app/_layout.tsx (NativeWind v4) — without this,
// `npx tsc --noEmit` fails the README verification gate.
declare module '*.css';
