export enum Modes { Production, Development, Testing }

/**
 * Gets the mode as a string
 */
export function getModeString(): string {
  switch (getMode()) {
    case Modes.Production:  return 'Production';
    case Modes.Development: return 'Development';
    case Modes.Testing:     return 'Testing';
  }
}

/**
 * Gets the mode as an enum
 */
export function getMode(): Modes {
  switch (getVar('NODE_ENV', 'development').toLowerCase()) {
    case 'development': return Modes.Development;
    case 'testing':     return Modes.Testing;
    default:            return Modes.Production;
  }
}

/**
 * Gets a variable from the env
 */
export function getVar(varName: string, def?: string): string {
  const v = process.env[varName] || '';
  if (v.length > 0) {
    return v;
  } else if (typeof def === 'string') {
    return def;
  } else {
    throw new Error(`Environment variable ${varName} not found`);
  }
}

/**
 * Gets if a variable is 'true' from the env
 */
export function isTrue(varName: string, allowUndefined: boolean = false): boolean {
  return ['true', true].includes(getVar(varName, (allowUndefined) ? 'false' : undefined).toLowerCase());
}
