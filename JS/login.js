// LOGIN JS - WITH FIREBASE
// ============================================

// ============================================
// FIREBASE REFERENCE
// ============================================
let db = window.db;

// ============================================
// STORED DATA - Will be loaded from Firebase
// ============================================
let allMembers = [];
let trainerDetails = [];
let adminDetails = [];

// ============================================
// SECURITY: Only redirect if already logged in AND on login page
// ============================================

let alreadyLoggedIn = JSON.parse(localStorage.getItem("currentUser"));

// IMPORTANT FIX: Only redirect if user is logged in AND we're on login page
// This prevents infinite loops
if (alreadyLoggedIn && window.location.pathname.includes("login.html")) {
  // Clear the stored user to allow fresh login
  // This ensures the login page shows properly
  localStorage.removeItem("currentUser");
  localStorage.removeItem("currentMember");
  alreadyLoggedIn = null;
}

// Rest of your code starts here
let roleText = document.getElementById("roleBannerText");
let selectedRole = "member";
let loginBtnText = document.getElementById("loginBtnText");
let loginBtn = document.getElementById("loginBtn");

// ============================================
// LOAD DATA FROM FIREBASE
// ============================================

async function loadFirebaseData() {
  console.log("Loading login data from Firebase...");

  // Load members
  const membersSnapshot = await get(child(ref(db), "members"));
  if (membersSnapshot.exists()) {
    allMembers = membersSnapshot.val();
  }

  // Load trainers
  const trainersSnapshot = await get(child(ref(db), "trainers"));
  if (trainersSnapshot.exists()) {
    trainerDetails = trainersSnapshot.val();
  }

  console.log("Login data loaded from Firebase!");
}

// ============================================
// INITIALIZE ADMIN IN FIREBASE (Run once)
// ============================================

async function initAdminInFirebase() {
  // Check if admin already exists in Firebase
  const adminSnapshot = await get(child(ref(db), "admin"));

  if (!adminSnapshot.exists()) {
    // Create default admin
    const defaultAdmin = {
      adminName: "Rokibats",
      adminPassword: "rokibat12",
    };
    await set(ref(db, "admin"), defaultAdmin);
    console.log("Default admin created in Firebase");
  }
}

// ============================================
// ROLE SELECTOR - UPDATED WITH FULL UI
// ============================================

const roleSelector = (role) => {
  selectedRole = role;

  // Update hidden input
  let selectedRoleInput = document.getElementById("selectedRole");
  if (selectedRoleInput) selectedRoleInput.value = role;

  // Get DOM elements
  let tabMember = document.getElementById("tabMember");
  let tabTrainer = document.getElementById("tabTrainer");
  let tabAdmin = document.getElementById("tabAdmin");
  let roleBanner = document.getElementById("roleBanner");
  let loginBtn = document.getElementById("loginBtn");
  let loginBtnTextSpan = document.getElementById("loginBtnText");
  let registerLink = document.getElementById("registerLink");
  let loginForm = document.getElementById("loginForm");

  if (!tabMember || !tabTrainer || !tabAdmin) return;

  // Remove active class from all tabs
  tabMember.classList.remove("active");
  tabTrainer.classList.remove("active");
  tabAdmin.classList.remove("active");

  // Remove role classes from banner and button
  if (roleBanner) {
    roleBanner.classList.remove("member", "trainer", "admin");
  }
  if (loginBtn) {
    loginBtn.classList.remove("member", "trainer", "admin");
  }
  if (loginForm) {
    loginForm.classList.remove("role-member", "role-trainer", "role-admin");
  }

  // Apply role-specific styling
  if (role === "member") {
    tabMember.classList.add("active");
    if (roleBanner) {
      roleBanner.classList.add("member");
      roleBanner.innerHTML = `<i class="fa-solid fa-id-card"></i><div class="role-banner-text">Signing in as a <strong>Gym Member</strong> — access your membership, classes &amp; attendance.</div>`;
    }
    if (loginBtn) loginBtn.classList.add("member");
    if (loginForm) loginForm.classList.add("role-member");
    if (loginBtnTextSpan) {
      loginBtnTextSpan.innerHTML =
        '<i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In as Member';
    }
    // Show register link only for members
    if (registerLink) registerLink.style.display = "block";
  } else if (role === "trainer") {
    tabTrainer.classList.add("active");
    if (roleBanner) {
      roleBanner.classList.add("trainer");
      roleBanner.innerHTML = `<i class="fa-solid fa-person-running"></i><div class="role-banner-text">Signing in as a <strong>Gym Trainer</strong> — manage your classes &amp; track attendance.</div>`;
    }
    if (loginBtn) loginBtn.classList.add("trainer");
    if (loginForm) loginForm.classList.add("role-trainer");
    if (loginBtnTextSpan) {
      loginBtnTextSpan.innerHTML =
        '<i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In as Trainer';
    }
    // Hide register link for trainers
    if (registerLink) registerLink.style.display = "none";
  } else if (role === "admin") {
    tabAdmin.classList.add("active");
    if (roleBanner) {
      roleBanner.classList.add("admin");
      roleBanner.innerHTML = `<i class="fa-solid fa-shield-halved"></i><div class="role-banner-text">Signing in as a <strong>System Admin</strong> — full access to manage gym operations.</div>`;
    }
    if (loginBtn) loginBtn.classList.add("admin");
    if (loginForm) loginForm.classList.add("role-admin");
    if (loginBtnTextSpan) {
      loginBtnTextSpan.innerHTML =
        '<i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In as Admin';
    }
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

  if (usernameError) usernameError.classList.remove("visible");
  if (passwordError) passwordError.classList.remove("visible");

  if (!username || username.trim() === "") {
    if (usernameError) usernameError.classList.add("visible");
    isValid = false;
  }

  if (!password || password.trim() === "") {
    if (passwordError) passwordError.classList.add("visible");
    isValid = false;
  }

  return isValid;
};

const clearFieldErrors = () => {
  let usernameError = document.getElementById("usernameError");
  let passwordError = document.getElementById("passwordError");
  if (usernameError) usernameError.classList.remove("visible");
  if (passwordError) passwordError.classList.remove("visible");
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
// LOGIN FUNCTION - WITH FIREBASE
// ============================================

async function login() {
  // Validate fields first
  if (!validateFields()) {
    showAlert("Please enter both username/email and password.");
    return;
  }

  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;

  setLoading(true);

  try {
    if (selectedRole === "trainer") {
      // Trainer login from Firebase
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
      // Admin login from Firebase
      const adminSnapshot = await get(child(ref(db), "admin"));
      let adminData = null;

      if (adminSnapshot.exists()) {
        adminData = adminSnapshot.val();
      }

      if (
        adminData &&
        adminData.adminName === username &&
        adminData.adminPassword === password
      ) {
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            role: "admin",
            name: adminData.adminName,
          }),
        );
        window.location.href = "admin-dashboard.html";
      } else {
        showAlert("Invalid admin credentials. Please try again.");
        setLoading(false);
      }
    } else {
      // Member login from Firebase
      let memberFound = allMembers.find(
        (member) =>
          (member.loginInfo.userName.toLowerCase() === username.toLowerCase() ||
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
    let usernameInput = document.getElementById("username");
    if (usernameInput) usernameInput.value = rememberedUser;
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

const initLoginPage = async () => {
  // Wait for Firebase to be ready
  if (window.db) {
    db = window.db;
    await initAdminInFirebase();
    await loadFirebaseData();
  } else {
    // Wait for Firebase to initialize
    const waitForFirebase = setInterval(async () => {
      if (window.db) {
        db = window.db;
        clearInterval(waitForFirebase);
        await initAdminInFirebase();
        await loadFirebaseData();
      }
    }, 100);
  }

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

  // Set default role via hidden input
  let selectedRoleInput = document.getElementById("selectedRole");
  if (selectedRoleInput) selectedRoleInput.value = "member";
};

// Make login function available globally
window.login = login;

// Run initialization when DOM is ready
document.addEventListener("DOMContentLoaded", initLoginPage);
