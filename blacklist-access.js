(() => {
  const form = document.querySelector('[data-blacklist-login]');
  const passwordInput = document.querySelector('#blacklist-password');
  const submitButton = document.querySelector('[data-blacklist-submit]');
  const status = document.querySelector('[data-blacklist-status]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const setStatus = (message, state = '') => {
    status.textContent = message;
    status.className = `access-status${state ? ` is-${state}` : ''}`;
  };

  const alreadyAuthenticated = async () => {
    try {
      const response = await fetch('/api/blacklist/session', { credentials: 'same-origin', cache: 'no-store' });
      if (response.ok) window.location.replace('/blacklist');
    } catch {
      // The form remains available; server responses determine access.
    }
  };

  form?.addEventListener('submit', async event => {
    event.preventDefault();
    const password = passwordInput.value;
    if (!password || password.length > 128) {
      setStatus('ACCESS DENIED', 'denied');
      passwordInput.focus();
      return;
    }

    submitButton.disabled = true;
    setStatus('VERIFYING IDENTITY…', 'pending');
    try {
      const response = await fetch('/api/blacklist/login', {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ password })
      });
      passwordInput.value = '';
      if (!response.ok) {
        setStatus('ACCESS DENIED', 'denied');
        passwordInput.focus();
        return;
      }
      setStatus('ACCESS GRANTED\nIDENTITY OVERRIDDEN', 'granted');
      window.setTimeout(() => window.location.assign('/blacklist'), reduceMotion ? 0 : 680);
    } catch {
      setStatus('ACCESS DENIED', 'denied');
      passwordInput.value = '';
      passwordInput.focus();
    } finally {
      submitButton.disabled = false;
    }
  });

  alreadyAuthenticated();
})();
