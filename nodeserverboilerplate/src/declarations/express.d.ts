import * as express from 'express';

import { UserModel } from '../models/User';
import { Emailer } from '../lib/emailer';
import { Auth } from '../lib/auth';
import { Logger } from '../lib/logger';
import { Ranks } from '../lib/userRanks';
import { Connection } from 'typeorm';

declare global {
  export namespace Express {
    export interface User extends UserModel {}
    export interface Request {
      user?:      User;
      emailer?:   Emailer;
      auth?:      Auth;
      userRankIs: (ranks: Ranks[]) => boolean;
      logger:     Logger;
      db:         Connection;
    }
    export interface Response {
      image:          (mediaType: string, mediaContent: string) => void;
      error:          (error: number, loggerMessage?: string, message?: string) => void;
      messageSuccess: (code: number, message?: string) => void;
      messageError:   (code: number, message?: string) => void;
      messageWarning: (code: number, message?: string) => void;
      messageInfo:    (code: number, message?: string) => void;
    }
  }
}
