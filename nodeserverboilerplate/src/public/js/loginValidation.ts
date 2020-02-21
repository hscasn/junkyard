import { isEmail, isValidPassword } from '../../lib/validation';

(() => {
  // Fields and buttons
  const emailField    = <HTMLInputElement | undefined>document.getElementById('login-email');
  const passwordField = <HTMLInputElement | undefined>document.getElementById('login-password');
  const formElement   = <HTMLFormElement  | undefined>document.getElementById('login-form');

  // Messages
  const emailInvalidMessageElement = <HTMLElement | undefined>document.getElementById('alert-email-invalid');
  const passwordInvalidMessageElement = <HTMLElement | undefined>document.getElementById('alert-password-invalid');

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
  function togglePasswordInvalidMessage(show: boolean): void {
    if (!passwordInvalidMessageElement) { return; }
    if (show) {
      passwordInvalidMessageElement.style.display = 'block';
    } else {
      passwordInvalidMessageElement.style.display = 'none';
    }
  }

  if (emailField && passwordField && formElement) {
    formElement.onsubmit = () => {
      if (isEmail(emailField.value)) {
        toggleEmailInvalidMessage(false);
      } else {
        toggleEmailInvalidMessage(true);
        return false;
      }

      if (isValidPassword(passwordField.value)) {
        togglePasswordInvalidMessage(false);
      } else {
        togglePasswordInvalidMessage(true);
        return false;
      }

      return true;
    };
  } else {
    logError(new Error(
      `Parts of the form were not found at 'Add resource model': the validation was aborted`), 'error');
  }

  function logError(err: Error, level: 'error' | 'warn' | 'info' | 'debug' | 'trace') {
    const r: XMLHttpRequest = new XMLHttpRequest();
    r.open('POST', `/api/clientLog/${level}`, true);
    r.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    r.send(encodeURI(`error=${err}`));
  }

})();
