/**
 * Validates emails
 * @param value
 * @returns {boolean}
 */
export function isEmail(value: any): boolean {
  const v: string = value + '';
  return /^[A-Z0-9._-]+@[A-Z0-9.-]+\.[A-Z0-9.-]+$/i.test(v) && v.length <= 60 && v.length > 5;
}

/**
 * Validates passwords
 * @param value
 * @returns {boolean}
 */
export function isValidPassword(value: any): boolean {
  const v: string = value + '';
  return /[a-zA-Z]/.test(v) && /[0-9]/.test(v) && v.length >= 8 && v.length <= 40;
}

/**
 * Wraps a validation function into a wrapper that can be used by schema-inspector exec
 */
export function inspectorWrapper(func: (a: any) => boolean, errorMessage?: string) {
  return function (this: any, schema: any, value: any) {
    if (!func(value)) {
      if (typeof errorMessage !== 'string' || errorMessage.length < 1) {
        switch (func) {
          case isValidPassword: errorMessage = 'Invalid password'; break;
          case isEmail:         errorMessage = 'Invalid email';    break;
          default:              errorMessage = 'Invalid input';    break;
        }
      }

      this.report(errorMessage);
    }
  };
}
