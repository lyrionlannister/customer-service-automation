// Vitest no carga .env automaticamente. JWT_SECRET ya no tiene fallback en
// codigo (ver api/src/auth/jwt-secret.ts) asi que los tests que firman/
// verifican JWT necesitan uno propio, separado de cualquier secreto real.
process.env.JWT_SECRET ??= "test-only-jwt-secret-do-not-use-in-prod";
