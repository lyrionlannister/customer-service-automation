import type { ValidationIssue } from "../types/auth.types.js";

export function getValidationMessages(errors: ValidationIssue[]): string {
  return errors.flatMap((err) => Object.values(err.constraints || {})).join(", ");
}
