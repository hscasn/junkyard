import { isValidPassword } from '../../lib/validation';

(() => {
  // Fields and buttons
  const currentPwdField = <HTMLInputElement | undefined>document.getElementById('cpwd');
  const passwordField1  = <HTMLInputElement | undefined>document.getElementById('pwd1');
  const passwordField2  = <HTMLInputElement | undefined>document.getElementById('pwd2');
  const formElement     = <HTMLFormElement  | undefined>document.getElementById('changePwd-form');

  // Messages
  const passwordsMatchMessageElement    = <HTMLElement | undefined>document.getElementById('alert-password-match');
  const passwordsInvalidMessageElement  = <HTMLElement | undefined>document.getElementById('alert-password-invalid');
  const currentPwdInvalidMessageElement = <HTMLElement | undefined>document.getElementById('alert-cpassword-invalid');

  // Turning off messages
  toggleCurrentPasswordInvalidMessage(false);
  togglePasswordsInvalidMessage(false);
  togglePasswordsMatchMessage(false);

  // Functions to turn messages on/off
  function toggleCurrentPasswordInvalidMessage(show: boolean): void {
    if (!currentPwdInvalidMessageElement) { return; }
    if (show) {
      currentPwdInvalidMessageElement.style.display = 'block';
    } else {
      currentPwdInvalidMessageElement.style.display = 'none';
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

  if (formElement && currentPwdField && passwordField1 && passwordField2) {

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

      if (isValidPassword(currentPwdField.value)) {
        toggleCurrentPasswordInvalidMessage(false);
      } else {
        toggleCurrentPasswordInvalidMessage(true);
        return false;
      }

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
