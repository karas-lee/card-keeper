export interface PasswordRules {
  hasMinLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export function validatePasswordRules(password: string): PasswordRules {
  return {
    hasMinLength: password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
}

export function getPasswordStrength(password: string): "weak" | "medium" | "strong" {
  const rules = validatePasswordRules(password);
  const passed = Object.values(rules).filter(Boolean).length;

  if (passed <= 2) return "weak";
  if (passed === 3) return "medium";
  return "strong";
}
