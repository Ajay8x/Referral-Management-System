// Auth client-side script for Login and Register pages

function togglePasswordVisibility(fieldId, btn) {
  const input = document.getElementById(fieldId);
  if (!input) return;
  const icon = btn.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

function showAlert(elementId, message, type = 'error') {
  const alertEl = document.getElementById(elementId);
  if (!alertEl) return;
  alertEl.className = `alert-box alert-${type}`;
  alertEl.innerHTML = `
    <i class="fa-solid ${type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i>
    <span>${message}</span>
  `;
  alertEl.style.display = 'flex';
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn = document.getElementById('btnLogin');
  const mobile = form.mobile.value.trim();
  const password = form.password.value;

  if (mobile.length !== 10) {
    showAlert('loginAlert', 'Please enter a valid 10-digit mobile number.');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span>Signing in...</span>';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, password })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Login failed. Please verify credentials.');
    }

    // Success -> redirect to dashboard
    showAlert('loginAlert', 'Login successful! Redirecting...', 'success');
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 500);
  } catch (err) {
    showAlert('loginAlert', err.message || 'An error occurred during login.');
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> <span>Sign In</span>';
  }
}

async function handleRegisterSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn = document.getElementById('btnRegister');
  const name = form.name.value.trim();
  const mobile = form.mobile.value.trim();
  const password = form.password.value;

  if (mobile.length !== 10) {
    showAlert('registerAlert', 'Please enter a valid 10-digit mobile number.');
    return;
  }

  if (password.length < 6) {
    showAlert('registerAlert', 'Password must be at least 6 characters.');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span>Creating account...</span>';

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, mobile, password })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Registration failed. Please try again.');
    }

    // Success -> redirect to dashboard
    showAlert('registerAlert', 'Account registered successfully! Redirecting...', 'success');
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 500);
  } catch (err) {
    showAlert('registerAlert', err.message || 'An error occurred during registration.');
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-user-plus"></i> <span>Create Account & Sign In</span>';
  }
}
