export function stringifyError(err: any): string | undefined {
  if (err === null || err === undefined || (typeof err === 'string' && err.length < 1)) {
    return undefined;
  } else if (typeof err === 'object') {
    return JSON.stringify(err, Object.getOwnPropertyNames(err));
  } else {
    return JSON.stringify({
      message: err + '',
    });
  }
}
