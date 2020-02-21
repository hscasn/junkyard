import { Request, Response } from 'express';
import { NextFunction } from 'express-serve-static-core';
import * as HttpStatus from 'http-status-codes';

import { Props as ErrorProps } from '../../views/routes/httpError';
import { Props as MessageProps, MessageType } from '../../views/routes/message';
import { Middleware } from '../../interfaces';

export function acceptsImage(req: Request): boolean {
  return !!(req.accepts('image') || (req.headers && req.headers.accept === '*/*'));
}

export function image(req: Request, res: Response, mediaType: string, mediaContent: string): void {
  res.type(mediaType);
  res.send(mediaContent);
}

export function error(req: Request, res: Response, e: number, message: string = '', loggerMessage?: string): void {
  /* istanbul ignore next: istanbul ignores this line, for some reason */
  if (loggerMessage) {
    req.logger.error(loggerMessage);
  }
  const p: ErrorProps = {
    req,
    message,
    httpCode: e,
  };
  res.status(+e).render('httpError', p);
}

export function messageSuccess(req: Request, res: Response, code: number, message: string = ''): void {
  const p: MessageProps = {
    req,
    message,
    httpCode: code,
    messageType: MessageType.Success,
  };
  res.status(HttpStatus.OK).render('message', p);
}

export function messageError(req: Request, res: Response, code: number, message: string = ''): void {
  const p: MessageProps = {
    req,
    message,
    httpCode: code,
    messageType: MessageType.Error,
  };
  res.status(HttpStatus.OK).render('message', p);
}

export function messageWarning(req: Request, res: Response, code: number, message: string = '') {
  const p: MessageProps = {
    req,
    message,
    httpCode: code,
    messageType: MessageType.Warn,
  };
  res.status(HttpStatus.OK).render('message', p);
}

export function messageInfo(req: Request, res: Response, code: number, message: string = '') {
  const p: MessageProps = {
    req,
    message,
    httpCode: code,
    messageType: MessageType.Info,
  };
  res.status(HttpStatus.OK).render('message', p);
}

export function attach(): Middleware {
  return async (req: Request, res: Response, next: NextFunction) => {
    res.error          = error.bind({}, req, res);
    res.messageSuccess = messageSuccess.bind({}, req, res);
    res.messageWarning = messageWarning.bind({}, req, res);
    res.messageError   = messageError.bind({}, req, res);
    res.messageInfo    = messageInfo.bind({}, req, res);
    res.image          = image.bind({}, req, res);
    next();
  };
}
