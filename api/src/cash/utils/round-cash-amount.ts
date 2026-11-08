/**
 * Redondeo de caja: solo aplica a movimientos en efectivo (tarjeta y
 * transferencia nunca redondean, el banco liquida el monto exacto).
 * `unit` es la unidad del local (ej. 0.50, 1); 0 o negativa desactiva el
 * redondeo. Redondea al multiplo mas cercano, con correccion de punto
 * flotante a 2 decimales.
 */
export function roundCashAmount(amount: number, unit: number): number {
  if (!unit || unit <= 0) return amount;
  return Math.round(Math.round(amount / unit) * unit * 100) / 100;
}
