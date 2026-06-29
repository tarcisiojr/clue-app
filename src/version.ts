// Informação de versão/build, injetada em tempo de build (ver vite.config.ts).
// Exibida na UI para confirmar que o app atualizou.
export const APP_VERSION = __APP_VERSION__
export const BUILD_TIME = __BUILD_TIME__

/** Rótulo curto, ex.: "v1.0.0 · 2026-06-28 21:00". */
export const VERSION_LABEL = `v${APP_VERSION} · ${BUILD_TIME}`
