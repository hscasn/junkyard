import { Request, Response, NextFunction } from 'express';

export enum Ranks {
  Admin   = 0,
  Super   = 1,
  Regular = 2,

  // Special
  S_NotRegistered = -1,
  S_Registered = -2,
  S_Any = -3,
}

export async function bindRankCheck(req: Request, res: Response, next?: NextFunction) {
  req.userRankIs = function (ranks: Ranks[]): boolean {
    if (!req || !req.user || !req.isAuthenticated()) {
      return is(Ranks.S_NotRegistered, ranks); // Not authenticated
    } else {
      return is(req.user.rank, ranks);
    }
  };
  if (next)
    await next();
}

/**
 * Checks if a user is an administrator (based on the context)
 */
export function isAdmin(req: Request): boolean {
  return (!!req && !!req.user && req.user.rank === Ranks.Admin);
}

/**
 * Checks if a user (curr) fits into one of the required ranks provided
 */
export function is(rank: Ranks, required: Ranks[]): boolean {
  for (const r of required) {
    // Any
    if (r === Ranks.S_Any)
      return true;

    // Requiring registered and we are registered
    if ((r === Ranks.S_Registered) && (rank >= 0 || rank === Ranks.S_Registered)) {
      return true;
    }

    // Match the exact rank
    if (rank in Ranks && rank === r) {
      return true;
    }
  }
  return false;
}

export function getRankName(r: number): string {
  switch (Number.parseInt(r as any, 10)) {
    case Ranks.Admin:   return 'Administrator';
    case Ranks.Super:   return 'Super';
    case Ranks.Regular: return 'Regular';

    case Ranks.S_Registered:    return 'Registered';
    case Ranks.S_NotRegistered: return 'Visitor';

    default:
    case Ranks.S_Any:           return 'Unknown';
  }
}
