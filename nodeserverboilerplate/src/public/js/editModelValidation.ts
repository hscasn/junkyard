(() => {
  // Fields and buttons
  const propertyField = <HTMLInputElement | undefined>document.getElementById('resource-property');
  const formElement   = <HTMLFormElement  | undefined>document.getElementById('resource-form');

  // Messages
  const propertyInvalidMessageElement = <HTMLElement | undefined>document.getElementById('alert-property-invalid');

  // Turning off messages
  togglePropertyInvalidMessage(false);

  // Functions to turn messages on/off
  function togglePropertyInvalidMessage(show: boolean): void {
    if (!propertyInvalidMessageElement) { return; }
    if (show) {
      propertyInvalidMessageElement.style.display = 'block';
    } else {
      propertyInvalidMessageElement.style.display = 'none';
    }
  }

  if (propertyField && formElement) {

    formElement.onsubmit = () => {
      if (propertyField.value && propertyField.value.trim().length > 5) {
        togglePropertyInvalidMessage(false);
      } else {
        togglePropertyInvalidMessage(true);
        return false;
      }

      return true;
    };
  } else {
    logError(new Error(`Parts of the form were not found at 'Edit model': the validation was aborted`), 'error');
  }

  function logError(err: Error, level: 'error' | 'warn' | 'info' | 'debug' | 'trace') {
    const r: XMLHttpRequest = new XMLHttpRequest();
    r.open('POST', `/api/clientLog/${level}`, true);
    r.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    r.send(encodeURI(`error=${err}`));
  }

})();
