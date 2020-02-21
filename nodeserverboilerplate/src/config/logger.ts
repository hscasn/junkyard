import { getFormattedStream } from '../lib/logger';
import { Config } from '../interfaces';

import { getVar, isTrue } from '../lib/env';
import { LogLevel, Stream } from 'bunyan';

const formattedStream = getFormattedStream();

const messageStreams: Stream[] = [{
  stream: formattedStream,
  level: getVar('LOG_SERVER_CONSOLE_LEVEL') as LogLevel,
}];

const requestStreams: Stream[] = [{
  stream: formattedStream,
  level: getVar('LOG_REQUEST_CONSOLE_LEVEL') as LogLevel,
}];

const clientStreams: Stream[] = [{
  stream: formattedStream,
  level: getVar('LOG_CLIENT_CONSOLE_LEVEL') as LogLevel,
}];

const enableFileStream = isTrue('LOG_SERVER_PERIOD', false);
if (enableFileStream) {
  messageStreams.push({
    type:    getVar('LOG_SERVER_TYPE'),
    path:    getVar('LOG_SERVER_PATH'),
    period:  getVar('LOG_SERVER_PERIOD'),
    level:   getVar('LOG_SERVER_LEVEL') as LogLevel,
    count:  +getVar('LOG_SERVER_COUNT'),
  });

  requestStreams.push({
    type:    getVar('LOG_REQUEST_TYPE'),
    path:    getVar('LOG_REQUEST_PATH'),
    period:  getVar('LOG_REQUEST_PERIOD'),
    level:   getVar('LOG_REQUEST_LEVEL') as LogLevel,
    count:  +getVar('LOG_REQUEST_COUNT'),
  });

  clientStreams.push({
    type:    getVar('LOG_CLIENT_TYPE'),
    path:    getVar('LOG_CLIENT_PATH'),
    period:  getVar('LOG_CLIENT_PERIOD'),
    level:   getVar('LOG_CLIENT_LEVEL') as LogLevel,
    count:  +getVar('LOG_CLIENT_COUNT'),
  });
}

const logger: Config['logger'] = {
  messages: {
    name: getVar('LOG_SERVER_NAME'),
    streams: messageStreams,
  },
  requests: {
    name: getVar('LOG_REQUEST_NAME'),
    streams: requestStreams,
  },
  client: {
    name: getVar('LOG_CLIENT_NAME'),
    streams: clientStreams,
  },
};

export { logger };
