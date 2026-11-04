"use strict";

// Login und Registrierung: schickt E-Mail und Passwort an die Java-API und leitet zum Dashboard weiter.
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("auth-form");
  const error = document.getElementById("form-error");
  const button = form.querySelector("button[type=submit]");
  const label = button.textContent;
  const isRegister = form.dataset.mode === "registrieren";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = form.email.value.trim();
    const password = form.password.value;
    if (!email || !password) return showError(error, "Bitte E-Mail und Passwort eingeben.");
    if (isRegister && password.length < 8) return showError(error, "Das Passwort muss mindestens 8 Zeichen haben.");

    showError(error, null);
    button.disabled = true;
    button.textContent = "Bitte warten …";
    try {
      await api(isRegister ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        body: { email, password },
        redirectOn401: false,
      });
      location.href = "/dashboard";
    } catch (e) {
      showError(error, e.message);
      button.disabled = false;
      button.textContent = label;
    }
  });
});
