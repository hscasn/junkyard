import { isEmail, isValidPassword } from '../../lib/validation';

(() => {
  // Fields and buttons
  const emailField     = <HTMLInputElement | undefined>document.getElementById('email');
  const passwordField1 = <HTMLInputElement | undefined>document.getElementById('pwd1');
  const passwordField2 = <HTMLInputElement | undefined>document.getElementById('pwd2');
  const formElement    = <HTMLFormElement  | undefined>document.getElementById('signup-form');

  // Messages
  const passwordsMatchMessageElement   = <HTMLElement | undefined>document.getElementById('alert-password-match');
  const passwordsInvalidMessageElement = <HTMLElement | undefined>document.getElementById('alert-password-invalid');
  const emailInvalidMessageElement     = <HTMLElement | undefined>document.getElementById('alert-email-invalid');

  // Turning off messages
  toggleEmailInvalidMessage(false);
  togglePasswordsInvalidMessage(false);
  togglePasswordsMatchMessage(false);

  // Functions to turn messages on/off
  function toggleEmailInvalidMessage(show: boolean): void {
    if (!emailInvalidMessageElement) { return; }
    if (show) {
      emailInvalidMessageElement.style.display = 'block';
    } else {
      emailInvalidMessageElement.style.display = 'none';
    }
  }

  function togglePasswordsInvalidMessage(show: boolean): void {
    if (!passwordsInvalidMessageElement) {
      return;
    }
    if (show) {
      passwordsInvalidMessageElement.style.display = 'block';
    } else {
      passwordsInvalidMessageElement.style.display = 'none';
    }
  }

  function togglePasswordsMatchMessage(show: boolean): void {
    if (!passwordsMatchMessageElement) {
      return;
    }
    if (show) {
      passwordsMatchMessageElement.style.display = 'block';
    } else {
      passwordsMatchMessageElement.style.display = 'none';
    }
  }

  if (formElement && emailField && passwordField1 && passwordField2) {

    formElement.onsubmit = () => {
      if (passwordField1.value.trim() === passwordField2.value.trim()) {
        togglePasswordsMatchMessage(false);
      } else {
        togglePasswordsMatchMessage(true);
        return false;
      }

      if (isValidPassword(passwordField1.value)) {
        togglePasswordsInvalidMessage(false);
      } else {
        togglePasswordsInvalidMessage(true);
        return false;
      }

      if (isEmail(emailField.value)) {
        toggleEmailInvalidMessage(false);
      } else {
        toggleEmailInvalidMessage(true);
        return false;
      }
      return true;
    };

  } else {
    logError(new Error(`Parts of the form were not found at 'Sign up': the validation was aborted`), 'error');
  }

  function logError(err: Error, level: 'error' | 'warn' | 'info' | 'debug' | 'trace') {
    const r: XMLHttpRequest = new XMLHttpRequest();
    r.open('POST', `/api/clientLog/${level}`, true);
    r.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    r.send(encodeURI(`error=${err}`));
  }

})();
