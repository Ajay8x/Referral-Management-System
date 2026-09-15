// =========================================================
// SHREE RBSK - AUTH.JS (NODE.JS + MONGODB BACKEND)
// =========================================================

const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    && !(window.location.port === '5000' || window.location.port === '3000')
    ? 'http://localhost:5000/api'
    : '/api';

// COMMON HELPERS
function cleanMobile(value) {
    return String(value || "").replace(/\D/g, "");
}

function getMessageElement() {
    return (
        document.getElementById("loginMessage") ||
        document.getElementById("msg")
    );
}

function showMessage(message, type = "error") {
    const element = getMessageElement();
    if (!element) return;
    element.textContent = message;
    element.style.color = type === "success" ? "#15803d" : "#b91c1c";
}

function setButtonLoading(button, loading, normalText) {
    if (!button) return;
    button.disabled = loading;
    button.textContent = loading ? "Please wait..." : normalText;
}

async function parseJsonResponse(response) {
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        if (!response.ok) {
            throw new Error(`Server Error (${response.status}): Please ensure MONGO_URI and environment variables are configured in Vercel Settings.`);
        }
        throw new Error("Invalid server response format.");
    }
}

// =========================================================
// LOGIN
// =========================================================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const mobileInput = document.getElementById("mobile");
        const passwordInput = document.getElementById("password");
        const loginButton = document.getElementById("loginButton");

        const mobile = cleanMobile(mobileInput?.value);
        const password = passwordInput?.value || "";

        showMessage("");

        if (mobile.length !== 10) {
            showMessage("Please enter a valid 10 digit mobile number.");
            mobileInput?.focus();
            return;
        }

        if (!password) {
            showMessage("Please enter your password.");
            passwordInput?.focus();
            return;
        }

        const loginButton = loginForm.querySelector('button[type="submit"]');
        setButtonLoading(loginButton, true, "Login");
        showMessage("Signing in...", "success");

        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mobile, password })
            });

            const data = await parseJsonResponse(response);

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Invalid mobile number or password.");
            }

            // Save token and user info
            localStorage.setItem("rbsk_token", data.data.token);
            localStorage.setItem("rbsk_user", JSON.stringify(data.data));

            showMessage("Login successful. Opening dashboard...", "success");
            window.location.href = "dashboard.html";
        } catch (error) {
            console.error("RBSK Login Error:", error);
            showMessage(error.message || "Unable to sign in. Please try again.");
            const loginButton = loginForm.querySelector('button[type="submit"]');
            setButtonLoading(loginButton, false, "Login");
        }
    });
}

// =========================================================
// REGISTRATION
// =========================================================
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const nameInput = document.getElementById("name");
        const mobileInput = document.getElementById("mobile");
        const passwordInput = document.getElementById("password");
        const confirmInput = document.getElementById("confirm");

        const name = String(nameInput?.value || "").trim();
        const mobile = cleanMobile(mobileInput?.value);
        const password = passwordInput?.value || "";
        const confirmPassword = confirmInput?.value || "";

        showMessage("");

        if (!name) {
            showMessage("Please enter your name.");
            nameInput?.focus();
            return;
        }

        if (mobile.length !== 10) {
            showMessage("Please enter a valid 10 digit mobile number.");
            mobileInput?.focus();
            return;
        }

        if (password.length < 6) {
            showMessage("Password must contain at least 6 characters.");
            passwordInput?.focus();
            return;
        }

        if (password !== confirmPassword) {
            showMessage("Passwords do not match.");
            confirmInput?.focus();
            return;
        }

        const registerButton = registerForm.querySelector('button[type="submit"]');
        setButtonLoading(registerButton, true, "Create Account");
        showMessage("Creating your account...", "success");

        try {
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, mobile, password })
            });

            const data = await parseJsonResponse(response);

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Registration failed. Please try again.");
            }

            // Save token and user info
            localStorage.setItem("rbsk_token", data.data.token);
            localStorage.setItem("rbsk_user", JSON.stringify(data.data));

            showMessage("Account created successfully. Opening dashboard...", "success");
            window.location.href = "dashboard.html";
        } catch (error) {
            console.error("RBSK Registration Error:", error);
            showMessage(error.message || "Unable to create account. Please try again.");
            setButtonLoading(registerButton, false, "Create Account");
        }
    });
}

// =========================================================
// SHOW / HIDE PASSWORD
// =========================================================
const togglePassword = document.getElementById("togglePassword");
if (togglePassword) {
    togglePassword.addEventListener("click", function () {
        const passwordInput = document.getElementById("password");
        if (!passwordInput) return;

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            togglePassword.textContent = "Hide";
        } else {
            passwordInput.type = "password";
            togglePassword.textContent = "Show";
        }
    });
}

// Only digits for tel inputs
document.querySelectorAll('input[type="tel"]').forEach(function (input) {
    input.addEventListener("input", function () {
        this.value = this.value.replace(/\D/g, "").slice(0, 10);
    });
});
