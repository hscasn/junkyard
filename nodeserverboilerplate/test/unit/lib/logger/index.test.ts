// tslint:disable:no-unused-expression
import { expect } from 'chai';
import * as Bunyan from 'bunyan';
import * as BunyanFormat from 'bunyan-format';

import { makeLogger, getFormattedStream } from '../../../../src/lib/logger';

const formattedStream = new BunyanFormat({ outputMode: 'short' });

describe(`lib/logger unit tests`, () => {

  it('should fail to create a logger with bad arguments', () => {
    expect(() => makeLogger('no' as any, Bunyan.createLogger, {} as any)).to.throw();
    expect(() => makeLogger(fs, null as any, {} as any)).to.throw();
    expect(() => makeLogger(fs, Bunyan.createLogger, 'no' as any)).to.throw();
  });

  it('should create a logger', () => {
    expect(() => makeLogger(fs, Bunyan.createLogger, config)).to.not.throw();
    expect(makeLogger(fs, Bunyan.createLogger, config).NAME).to.eql('logger');
  });

  it('should not crash when receiving streams', () => {
    expect(() => makeLogger(fs, (() => {}) as any, configStreams)).to.not.throw();
    expect(makeLogger(fs, Bunyan.createLogger, config).NAME).to.eql('logger');
  });

  it('should not crash when receiving streams, even for a non-existing file', () => {
    expect(() => makeLogger(fsNoFile, (() => {}) as any, configStreams)).to.not.throw();
    expect(makeLogger(fs, Bunyan.createLogger, config).NAME).to.eql('logger');
  });

  describe('server logger', () => {

    it(`should call method for fatal`, (done) => {
      const logger = makeLogger(fs, makeMockedLogger('fatal', () => done()), config);
      logger.fatal('message');
    });

    it(`should call method for error`, (done) => {
      const logger = makeLogger(fs, makeMockedLogger('error', () => done()), config);
      logger.error('message');
    });

    it(`should call method for warn`, (done) => {
      const logger = makeLogger(fs, makeMockedLogger('warn', () => done()), config);
      logger.warn('message');
    });

    it(`should call method for info`, (done) => {
      const logger = makeLogger(fs, makeMockedLogger('info', () => done()), config);
      logger.info('message');
    });

    it(`should call method for debug`, (done) => {
      const logger = makeLogger(fs, makeMockedLogger('debug', () => done()), config);
      logger.debug('message');
    });

    it(`should call method for trace`, (done) => {
      const logger = makeLogger(fs, makeMockedLogger('trace', () => done()), config);
      logger.trace('message');
    });

  });

  describe('client logger', () => {

    it(`should call method for error`, (done) => {
      const logger = makeLogger(fs, makeMockedLogger('error', () => done()), config);
      logger.clientError('message');
    });

    it(`should call method for warn`, (done) => {
      const logger = makeLogger(fs, makeMockedLogger('warn', () => done()), config);
      logger.clientWarn('message');
    });

    it(`should call method for info`, (done) => {
      const logger = makeLogger(fs, makeMockedLogger('info', () => done()), config);
      logger.clientInfo('message');
    });

    it(`should call method for debug`, (done) => {
      const logger = makeLogger(fs, makeMockedLogger('debug', () => done()), config);
      logger.clientDebug('message');
    });

    it(`should call method for trace`, (done) => {
      const logger = makeLogger(fs, makeMockedLogger('trace', () => done()), config);
      logger.clientTrace('message');
    });

  });

  it('should create a visit recorder middleware', (done) => {
    let receivedMessage = false;
    let terminate = false;
    const logger = makeLogger(fs, makeMockedLogger('info', loggerCb), config);
    const recorder = logger.visitRecorder();
    recorder({} as any, {} as any, nextFunction);
    function loggerCb(message: string) {
      if (typeof message === 'string' && message.length > 0) {
        receivedMessage = true;
      } else {
        done('Message received by the callback is empty or not a string');
        terminate = true;
      }
    }
    function nextFunction() {
      if (terminate)
        return;

      if (receivedMessage) {
        done();
      } else {
        done('Next function called, but no message was logged');
      }
    }
  });

  it('middleware should attach a logger object', (done) => {
    const logger = makeLogger(fs, makeMockedLogger('info', (() => {}) as any), config);
    const req: any = {};
    logger.middleware(req, {} as any, () => {
      if (req.logger && req.logger.NAME === 'logger') {
        done();
      } else {
        done('Service was not attached to request or is not a logger');
      }
    });
  });

  it('should get a formatted stream', () => {
    expect(() => getFormattedStream()).to.not.throw();
    expect(typeof getFormattedStream()).to.eql('object');
  });

});

const makeMockedLogger: any = (level: string, fn: (a: any) => void) => {
  return () => ({ [level]: (a: any) => fn(a)});
};

const fs: any = {
  accessSync: () => true,
  existsSync: () => true,
  constants:  {},
};

const fsNoFile: any = {
  accessSync: () => true,
  existsSync: () => false,
  constants:  {},
};

const config: any = {
  messages: {
    name: 'logger_messages',
    streams: [{
      type:    'raw',
      period:  '1d',
      level:   'warn',
      count:   365,
    }, {
      stream: formattedStream,
      level: 'warn',
    }],
  },
  requests: {
    name: 'requests_messages',
    streams: [{
      type:    'raw',
      period:  '1d',
      level:   'warn',
      count:   365,
    }, {
      stream: formattedStream,
      level: 'warn',
    }],
  },
  client: {
    name: 'client_messages',
    streams: [{
      type:    'raw',
      period:  '1d',
      level:   'warn',
      count:   365,
    }, {
      stream: formattedStream,
      level: 'warn',
    }],
  },
};

const configStreams: any = {
  messages: {
    name: 'logger_messages',
    streams: [{
      type:    'raw',
      period:  '1d',
      level:   'warn',
      count:   365,
      path:    '/tmp1',
    }, {
      stream: formattedStream,
      level: 'warn',
    }],
  },
  requests: {
    name: 'requests_messages',
    streams: [{
      type:    'raw',
      period:  '1d',
      level:   'warn',
      count:   365,
      path:    '/tmp2',
    }, {
      stream: formattedStream,
      level: 'warn',
    }],
  },
  client: {
    name: 'client_messages',
    streams: [{
      type:    'raw',
      period:  '1d',
      level:   'warn',
      count:   365,
      path:    '/tmp3',
    }, {
      stream: formattedStream,
      level: 'warn',
    }],
  },
};
