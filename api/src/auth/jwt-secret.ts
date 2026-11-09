// Sin fallback: un JWT_SECRET ausente firmaria/verificaria tokens con un
// secreto publico y predecible (ver audit de seguridad).
export function requireJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET no esta definida");
  }
  return secret;
}
