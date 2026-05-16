// LOGIN.JS - Complete Fixed Version
// ============================================

// ============================================
// SECURITY: Redirect if already logged in
// ============================================
let alreadyLoggedIn = JSON.parse(localStorage.getItem("currentUser"));

if (alreadyLoggedIn) {
  if (alreadyLoggedIn.role === "admin") {
    window.location.href = "admin-dashboard.html";
  } else if (alreadyLoggedIn.role === "trainer") {
    window.location.href = "trainer-dashboard.html";
  } else if (alreadyLoggedIn.role === "member") {
    window.location.href = "member-dashboard.html";
  }
  throw new Error("Already logged in");
}

// ============================================
// REST OF YOUR EXISTING CODE (keep everything below)
// ============================================

let roleText = document.getElementById("roleBannerText");
let adminDetails = [];
let selectedRole = "member";
let loginBtnText = document.getElementById("loginBtnText");
let loginBtn = document.getElementById("loginBtn");

// Initialize admin if not exists
const adminInfo = () => {
  let adminName = "Rokibats";
  let adminPassword = "rokibat12";
  let adminObj = { adminName, adminPassword };
  adminDetails.push(adminObj);
  localStorage.setItem("adminDetails", JSON.stringify(adminDetails));
};

if (!localStorage.getItem("adminDetails")) {
  adminInfo();
}

// ... KEEP ALL YOUR EXISTING CODE FROM HERE ...
// (roleSelector, validateFields, login, etc. - everything you already have)

// ============================================
// ROLE SELECTOR - UPDATED WITH FULL UI
// ============================================

const roleSelector = (role) => {
  selectedRole = role;

  // Update hidden input
  document.getElementById("selectedRole").value = role;

  // Get DOM elements
  let tabMember = document.getElementById("tabMember");
  let tabTrainer = document.getElementById("tabTrainer");
  let tabAdmin = document.getElementById("tabAdmin");
  let roleBanner = document.getElementById("roleBanner");
  let loginBtn = document.getElementById("loginBtn");
  let loginBtnTextSpan = document.getElementById("loginBtnText");
  let registerLink = document.getElementById("registerLink");
  let loginForm = document.getElementById("loginForm");

  // Remove active class from all tabs
  tabMember.classList.remove("active");
  tabTrainer.classList.remove("active");
  tabAdmin.classList.remove("active");

  // Remove role classes from banner and button
  roleBanner.classList.remove("member", "trainer", "admin");
  loginBtn.classList.remove("member", "trainer", "admin");
  loginForm.classList.remove("role-member", "role-trainer", "role-admin");

  // Apply role-specific styling
  if (role === "member") {
    tabMember.classList.add("active");
    roleBanner.classList.add("member");
    loginBtn.classList.add("member");
    loginForm.classList.add("role-member");
    roleBanner.innerHTML = `<i class="fa-solid fa-id-card"></i><div class="role-banner-text">Signing in as a <strong>Gym Member</strong> — access your membership, classes &amp; attendance.</div>`;
    if (loginBtnTextSpan)
      loginBtnTextSpan.innerHTML =
        '<i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In as Member';

    // Show register link only for members
    if (registerLink) registerLink.style.display = "block";
  } else if (role === "trainer") {
    tabTrainer.classList.add("active");
    roleBanner.classList.add("trainer");
    loginBtn.classList.add("trainer");
    loginForm.classList.add("role-trainer");
    roleBanner.innerHTML = `<i class="fa-solid fa-person-running"></i><div class="role-banner-text">Signing in as a <strong>Gym Trainer</strong> — manage your classes &amp; track attendance.</div>`;
    if (loginBtnTextSpan)
      loginBtnTextSpan.innerHTML =
        '<i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In as Trainer';

    // Hide register link for trainers
    if (registerLink) registerLink.style.display = "none";
  } else if (role === "admin") {
    tabAdmin.classList.add("active");
    roleBanner.classList.add("admin");
    loginBtn.classList.add("admin");
    loginForm.classList.add("role-admin");
    roleBanner.innerHTML = `<i class="fa-solid fa-shield-halved"></i><div class="role-banner-text">Signing in as a <strong>System Admin</strong> — full access to manage gym operations.</div>`;
    if (loginBtnTextSpan)
      loginBtnTextSpan.innerHTML =
        '<i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In as Admin';

    // Hide register link for admins
    if (registerLink) registerLink.style.display = "none";
  }

  // Clear any error messages when switching roles
  hideAlert();
  clearFieldErrors();
};

// ============================================
// FIELD VALIDATION
// ============================================

const validateFields = () => {
  let isValid = true;
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;
  let usernameError = document.getElementById("usernameError");
  let passwordError = document.getElementById("passwordError");

  // Clear previous errors
  usernameError.classList.remove("visible");
  passwordError.classList.remove("visible");

  if (!username || username.trim() === "") {
    usernameError.classList.add("visible");
    isValid = false;
  }

  if (!password || password.trim() === "") {
    passwordError.classList.add("visible");
    isValid = false;
  }

  return isValid;
};

const clearFieldErrors = () => {
  document.getElementById("usernameError")?.classList.remove("visible");
  document.getElementById("passwordError")?.classList.remove("visible");
};

const showAlert = (message) => {
  let alertBox = document.getElementById("alertBox");
  let alertMessage = document.getElementById("alertMessage");
  if (alertMessage) alertMessage.innerText = message;
  if (alertBox) alertBox.classList.add("visible");

  // Auto-hide after 4 seconds
  setTimeout(() => {
    if (alertBox) alertBox.classList.remove("visible");
  }, 4000);
};

const hideAlert = () => {
  let alertBox = document.getElementById("alertBox");
  if (alertBox) alertBox.classList.remove("visible");
};

// ============================================
// LOADING STATE
// ============================================

const setLoading = (isLoading) => {
  let btn = document.getElementById("loginBtn");
  if (!btn) return;

  if (isLoading) {
    btn.classList.add("loading");
    btn.disabled = true;
  } else {
    btn.classList.remove("loading");
    btn.disabled = false;
  }
};

// ============================================
// LOGIN FUNCTION - COMPLETE
// ============================================

function login() {
  // Validate fields first
  if (!validateFields()) {
    showAlert("Please enter both username/email and password.");
    return;
  }

  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;

  setLoading(true);

  // Simulate a tiny delay for better UX (optional)
  setTimeout(() => {
    try {
      if (selectedRole === "trainer") {
        let trainerDetails =
          JSON.parse(localStorage.getItem("TrainerDetails")) || [];

        let trainerFound = trainerDetails.find(
          (trainer) =>
            trainer.traineruserName.toLowerCase() === username.toLowerCase() &&
            trainer.trainerPassword === password,
        );

        if (trainerFound) {
          localStorage.setItem(
            "currentUser",
            JSON.stringify({
              role: "trainer",
              name: trainerFound.traineruserName,
              fullName: `${trainerFound.trainerfirstName} ${trainerFound.trainerlastName}`,
            }),
          );
          window.location.href = "trainer-dashboard.html";
        } else {
          showAlert("Invalid trainer username or password. Please try again.");
          setLoading(false);
        }
      } else if (selectedRole === "admin") {
        let adminDetails = JSON.parse(localStorage.getItem("adminDetails"));

        if (
          adminDetails &&
          adminDetails[0] &&
          adminDetails[0].adminName === username &&
          adminDetails[0].adminPassword === password
        ) {
          localStorage.setItem(
            "currentUser",
            JSON.stringify({
              role: "admin",
              name: adminDetails[0].adminName,
            }),
          );
          window.location.href = "admin-dashboard.html";
        } else {
          showAlert("Invalid admin credentials. Please try again.");
          setLoading(false);
        }
      } else {
        // Member login
        let allMembers =
          JSON.parse(localStorage.getItem("memberDetailsArray")) || [];

        let memberFound = allMembers.find(
          (member) =>
            (member.loginInfo.userName.toLowerCase() ===
              username.toLowerCase() ||
              member.personalInfo.email.toLowerCase() ===
                username.toLowerCase()) &&
            member.loginInfo.userPassword === password,
        );

        if (memberFound) {
          localStorage.setItem(
            "currentUser",
            JSON.stringify({
              role: "member",
              name: memberFound.loginInfo.userName,
            }),
          );
          localStorage.setItem("currentMember", JSON.stringify(memberFound));
          window.location.href = "member-dashboard.html";
        } else {
          showAlert(
            "Invalid member username/email or password. Please try again.",
          );
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      showAlert("An error occurred during login. Please try again.");
      setLoading(false);
    }
  }, 300);
}

// ============================================
// PASSWORD TOGGLE
// ============================================

const passwordToggle = () => {
  let password = document.getElementById("password");
  let icon = document.getElementById("pwToggleIcon");

  if (password.type === "password") {
    password.type = "text";
    if (icon) icon.className = "fa-regular fa-eye-slash";
  } else {
    password.type = "password";
    if (icon) icon.className = "fa-regular fa-eye";
  }
};

// ============================================
// REMEMBER ME FUNCTIONALITY
// ============================================

const remember = () => {
  let rememberBox = document.getElementById("rememberBox");
  if (!rememberBox) return;

  if (rememberBox.classList.contains("checked")) {
    rememberBox.classList.remove("checked");
    localStorage.removeItem("rememberedUser");
  } else {
    rememberBox.classList.add("checked");
    let username = document.getElementById("username").value;
    if (username) {
      localStorage.setItem("rememberedUser", username);
    }
  }
};

const loadRememberedUser = () => {
  let rememberedUser = localStorage.getItem("rememberedUser");
  let rememberBox = document.getElementById("rememberBox");

  if (rememberedUser && rememberBox) {
    document.getElementById("username").value = rememberedUser;
    rememberBox.classList.add("checked");
  }
};

// ============================================
// ENTER KEY SUPPORT
// ============================================

const setupEnterKey = () => {
  let usernameInput = document.getElementById("username");
  let passwordInput = document.getElementById("password");

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      login();
    }
  };

  if (usernameInput) usernameInput.addEventListener("keypress", handleEnter);
  if (passwordInput) passwordInput.addEventListener("keypress", handleEnter);
};

// ============================================
// FORGOT PASSWORD LINK
// ============================================

const setupForgotLink = () => {
  let forgotLink = document.getElementById("forgotLink");
  if (forgotLink) {
    forgotLink.addEventListener("click", (e) => {
      e.preventDefault();
      let role = selectedRole;
      if (role === "member") {
        showAlert(
          "Please contact the gym administrator to reset your password.",
        );
      } else if (role === "trainer") {
        showAlert(
          "Please contact the gym admin to reset your trainer password.",
        );
      } else {
        showAlert(
          "Please contact the system administrator for password reset.",
        );
      }
    });
  }
};

// ============================================
// INITIALIZE PAGE
// ============================================

const initLoginPage = () => {
  // Set default role to member
  roleSelector("member");

  // Load remembered username if exists
  loadRememberedUser();

  // Setup enter key support
  setupEnterKey();

  // Setup forgot password link
  setupForgotLink();

  // Clear any error messages on page load
  hideAlert();
  clearFieldErrors();

  // Update active tab styling on page load
  let activeTab = document.querySelector(".role-tab.active");
  if (!activeTab) {
    document.getElementById("tabMember")?.classList.add("active");
  }
};

// Run initialization when DOM is ready
document.addEventListener("DOMContentLoaded", initLoginPage);

// Also set default role via hidden input
document.getElementById("selectedRole").value = "member";
