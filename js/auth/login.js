import { login, getCurrentProfile } from "./auth.service.js";

const form = document.getElementById("loginForm");
const emailInput = document.getElementById("userEmail");
const passwordInput = document.getElementById("userPassword");
const loginBtn = document.getElementById("loginBtn");
const errorBox = document.getElementById("loginError");

// Where each role goes after login
const dashboardRoutes = {
  owner: "../dashboards/owner.html",
  admin: "../dashboards/adminDashboard.html",
  trainer: "../dashboards/trainer.html",
  member: "../dashboards/member.html"
};

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.add("visible");
}

function clearError() {
  errorBox.textContent = "";
  errorBox.classList.remove("visible");
  emailInput.classList.remove("input-error");
  passwordInput.classList.remove("input-error");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault(); // stop page reload
  clearError();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // 1. Basic validation BEFORE calling Supabase
  if (!email || !password) {
    showError("Please enter both email and password.");
    if (!email) emailInput.classList.add("input-error");
    if (!password) passwordInput.classList.add("input-error");
    return;
  }

  // 2. Loading state
  loginBtn.disabled = true;
  const originalHTML = loginBtn.innerHTML;
  loginBtn.textContent = "Signing in...";

  try {
    // 3. Authenticate with Supabase
    await login(email, password);

    // 4. Fetch role from profiles table (RLS allows own-profile read)
    const profile = await getCurrentProfile();
   console.log("PROFILE FROM DATABASE:", profile);

    if (!profile || !dashboardRoutes[profile.role]) {
      showError("No dashboard found for your role. Contact the gym owner.");
      return;
    }

    // 5. Redirect to the correct dashboard
    window.location.replace(dashboardRoutes[profile.role]);

  } catch (err) {
    // 6. Wrong credentials or network error
    showError("Invalid email or password. Please try again.");
    emailInput.classList.add("input-error");
    passwordInput.classList.add("input-error");
  } finally {
    loginBtn.disabled = false;
    loginBtn.innerHTML = originalHTML;
  }
});

// Password show/hide toggle
document.getElementById("togglePassword").addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
});