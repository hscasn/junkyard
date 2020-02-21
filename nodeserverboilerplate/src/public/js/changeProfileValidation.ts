(() => {
  // Fields and buttons
  const displayNameField = <HTMLInputElement | undefined>document.getElementById('displayName');
  const formElement      = <HTMLFormElement  | undefined>document.getElementById('changeProfile-form');

  // Messages

  // Turning off messages

  // Functions to turn messages on/off

  if (formElement && displayNameField) {

    formElement.onsubmit = () => {
      return true;
    };

  } else {
    logError(new Error(`Parts of the form were not found at 'Change Password': the validation was aborted`), 'error');
  }

  function logError(err: Error, level: 'error' | 'warn' | 'info' | 'debug' | 'trace') {
    const r: XMLHttpRequest = new XMLHttpRequest();
    r.open('POST', `/api/clientLog/${level}`, true);
    r.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    r.send(encodeURI(`error=${err}`));
  }

})();
