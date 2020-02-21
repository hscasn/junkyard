import { isValidPassword } from '../../lib/validation';

(() => {
  // Fields and buttons
  const passwordField1 = <HTMLInputElement | undefined>document.getElementById('pwd1');
  const passwordField2 = <HTMLInputElement | undefined>document.getElementById('pwd2');
  const emailField     = <HTMLInputElement | undefined>document.getElementById('pwdReset-email');
  const tokenField     = <HTMLInputElement | undefined>document.getElementById('pwdReset-token');
  const formElement    = <HTMLFormElement  | undefined>document.getElementById('pwdReset-form');

  // Messages
  const passwordsMatchMessageElement   = <HTMLElement | undefined>document.getElementById('alert-password-match');
  const passwordsInvalidMessageElement = <HTMLElement | undefined>document.getElementById('alert-password-invalid');
  const emailInvalidMessageElement     = <HTMLElement | undefined>document.getElementById('alert-email-invalid');
  const tokenInvalidMessageElement     = <HTMLElement | undefined>document.getElementById('alert-token-invalid');
  const unknownErrorMessageElement     = <HTMLElement | undefined>document.getElementById('alert-unknown-error');

  // Turning off messages
  togglePasswordsInvalidMessage(false);
  toggleEmailInvalidMessage(false);
  toggleTokenInvalidMessage(false);
  togglePasswordsMatchMessage(false);
  toggleUnknownErrorMessage(false);

  // Functions to turn messages on/off
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
  function toggleEmailInvalidMessage(show: boolean): void {
    if (!emailInvalidMessageElement) {
      return;
    }
    if (show) {
      emailInvalidMessageElement.style.display = 'block';
    } else {
      emailInvalidMessageElement.style.display = 'none';
    }
  }
  function toggleTokenInvalidMessage(show: boolean): void {
    if (!tokenInvalidMessageElement) {
      return;
    }
    if (show) {
      tokenInvalidMessageElement.style.display = 'block';
    } else {
      tokenInvalidMessageElement.style.display = 'none';
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
  function toggleUnknownErrorMessage(show: boolean): void {
    if (!unknownErrorMessageElement) {
      return;
    }
    if (show) {
      unknownErrorMessageElement.style.display = 'block';
    } else {
      unknownErrorMessageElement.style.display = 'none';
    }
  }

  if (formElement && passwordField1 && passwordField2 && emailField && tokenField) {

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

      return true;
    };

  } else {
    logError(new Error(`Parts of the form were not found at 'Password reset': the validation was aborted`), 'error');
  }

  function logError(err: Error, level: 'error' | 'warn' | 'info' | 'debug' | 'trace') {
    const r: XMLHttpRequest = new XMLHttpRequest();
    r.open('POST', `/api/clientLog/${level}`, true);
    r.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    r.send(encodeURI(`error=${err}`));
  }

})();
