import { isEmail } from '../../lib/validation';

(() => {
  // Fields and buttons
  const emailField  = <HTMLInputElement | undefined>document.getElementById('email');
  const formElement = <HTMLFormElement  | undefined>document.getElementById('pwdRecovery-form');

  // Messages
  const emailInvalidMessageElement = <HTMLElement | undefined>document.getElementById('alert-email-invalid');

  // Turning off messages
  toggleEmailInvalidMessage(false);

  // Functions to turn messages on/off
  function toggleEmailInvalidMessage(show: boolean): void {
    if (!emailInvalidMessageElement) { return; }
    if (show) {
      emailInvalidMessageElement.style.display = 'block';
    } else {
      emailInvalidMessageElement.style.display = 'none';
    }
  }

  if (formElement && emailField) {

    formElement.onsubmit = () => {
      if (isEmail(emailField.value)) {
        toggleEmailInvalidMessage(false);
      } else {
        toggleEmailInvalidMessage(true);
        return false;
      }

      return true;
    };

  } else {
    logError(new Error(`Parts of the form were not found at 'Password recovery': the validation was aborted`), 'error');
  }

  function logError(err: Error, level: 'error' | 'warn' | 'info' | 'debug' | 'trace') {
    const r: XMLHttpRequest = new XMLHttpRequest();
    r.open('POST', `/api/clientLog/${level}`, true);
    r.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    r.send(encodeURI(`error=${err}`));
  }

})();
