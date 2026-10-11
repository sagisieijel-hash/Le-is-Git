(() => {
  const $ = (id) => document.getElementById(id);

  const headline = $("headline");
  const sub = $("sub");
  const tabsEl = document.querySelector(".tabs");
  const tabs = document.querySelectorAll(".tab");
  const profileForm = $("profile-form");
  const chosenRow = $("chosen");
  const authForm = $("auth-form");
  const forgotForm = $("forgot-form");
  const authSubmit = $("auth-submit");
  const passwordInput = $("password");
  const backLink = $("back-link");
  const status = $("status");

  // Copy for each view
  const views = {
    profile: {
      title: "Choose your profile",
      text: "Pick the picture that will show on your home screen.",
    },
    login: {
      title: "Welcome Back!",
      text: "Log in to access your energy usage, device readings and saved reports.",
      button: "Login",
      autocomplete: "current-password",
    },
    signin: {
      title: "Welcome Back!",
      text: "Sign in to access your energy usage, device readings and saved reports.",
      button: "Sign In",
      autocomplete: "new-password",
    },
    forgot: {
      title: "Forgot Password?",
      text: "Enter a new password below to regain access to your account.",
    },
  };

  /* ---------- Profile picker ---------- */
  let avatar = W.AVATARS[0].id;
  const checkIcon =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  $("avatars").innerHTML = W.AVATARS.map(
    (a, i) => `
      <label class="avatar-opt">
        <input class="sr" type="radio" name="avatar" value="${a.id}" aria-label="${a.label}"${i === 0 ? " checked" : ""}>
        <span class="avatar-face">${W.avatarSVG(a.id)}</span>
        <span class="avatar-badge">${checkIcon}</span>
      </label>`
  ).join("");

  $("avatars").addEventListener("change", (e) => {
    if (e.target.name === "avatar") avatar = e.target.value;
  });

  profileForm.addEventListener("submit", (e) => {
    e.preventDefault();
    showView("login");
    $("username").focus();
  });

  $("change-profile").addEventListener("click", () => showView("profile"));

  /* ---------- Helpers ---------- */
  function setStatus(message = "", ok = false) {
    status.textContent = message;
    status.classList.toggle("is-ok", ok);
  }

  function setError(input, message) {
    const err = $(`${input.id}-error`);
    err.textContent = message;
    input.setAttribute("aria-invalid", message ? "true" : "false");
    if (message) input.setAttribute("aria-describedby", err.id);
    else input.removeAttribute("aria-describedby");
    return !message;
  }

  function clearErrors(form) {
    form.querySelectorAll("input").forEach((i) => setError(i, ""));
  }

  /* ---------- View switching ---------- */
  function showView(name) {
    const v = views[name];
    $("app").dataset.view = name;
    headline.textContent = v.title;
    sub.textContent = v.text;
    setStatus();

    const isProfile = name === "profile";
    const isForgot = name === "forgot";
    const isAuth = !isProfile && !isForgot;

    profileForm.hidden = !isProfile;
    chosenRow.hidden = isProfile;
    tabsEl.hidden = !isAuth;
    authForm.hidden = !isAuth;
    forgotForm.hidden = !isForgot;
    backLink.hidden = !isForgot;

    if (!isProfile) $("chosen-avatar").innerHTML = W.avatarSVG(avatar);

    if (isAuth) {
      tabs.forEach((t) => {
        const active = t.dataset.target === name;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", String(active));
      });
      authSubmit.textContent = v.button;
      passwordInput.autocomplete = v.autocomplete;
      clearErrors(authForm);
    } else if (isForgot) {
      clearErrors(forgotForm);
    }
  }

  tabs.forEach((t) => t.addEventListener("click", () => showView(t.dataset.target)));
  $("forgot-link").addEventListener("click", () => {
    showView("forgot");
    $("new-password").focus();
  });
  backLink.addEventListener("click", () => showView("login"));

  /* ---------- Login / Sign in ---------- */
  authForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = $("username");
    const pass = $("password");

    const okUser = setError(user, user.value.trim() ? "" : "Enter your username.");
    const okPass = setError(
      pass,
      !pass.value ? "Enter your password." : pass.value.length < 6 ? "Use at least 6 characters." : ""
    );
    if (!okUser || !okPass) {
      setStatus();
      (okUser ? pass : user).focus();
      return;
    }

    // TODO: replace with a real request to your backend, then save the name
    // it returns. For now we keep the username typed in the form.
    try {
      W.setSession({ name: user.value.trim(), avatar });
    } catch (_) {
      setStatus("Your browser is blocking storage, so we can't keep you signed in.");
      return;
    }
    window.location.href = W.paths.home;
  });

  /* ---------- Forgot password ---------- */
  forgotForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const a = $("new-password");
    const b = $("confirm-password");

    const okA = setError(
      a,
      !a.value ? "Enter a new password." : a.value.length < 6 ? "Use at least 6 characters." : ""
    );
    const okB = setError(b, b.value === a.value ? "" : "Passwords don't match.");
    if (!okA || !okB) {
      (okA ? b : a).focus();
      return;
    }

    // TODO: replace with a real request to your backend
    forgotForm.reset();
    showView("login");
    setStatus("Password changed. You can log in now.", true);
  });

  // Clear a field's error as soon as the person edits it
  document.querySelectorAll(".field input").forEach((i) =>
    i.addEventListener("input", () => setError(i, ""))
  );

  showView("profile");
})();