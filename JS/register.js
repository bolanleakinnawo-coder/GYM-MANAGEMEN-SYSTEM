// REGISTER.JS - Complete Fixed Version
// ============================================

let allMembers = JSON.parse(localStorage.getItem("memberDetailsArray")) || [];
let phoneRegex = /^(070|071|080|081|082|090|091)\d{8}$/;
let usernameRegex = /^[a-zA-Z0-9_]{4,}$/;
let passwordRegex = /^.{8,}$/;
let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let memberDetails = {
  personalInfo: {},
  loginInfo: {},
  membership: {},
};

let selectedPlan = "";
let selectedPlanPrice = "";

// Clear errors on page load
document
  .querySelectorAll(".form-error")
  .forEach((err) => err.classList.remove("visible"));

// ============================================
// STEP 1 - PERSONAL INFO
// ============================================

const nextStep1 = () => {
  let isValid = true;
  document
    .querySelectorAll(".form-error")
    .forEach((err) => err.classList.remove("visible"));

  let firstName = document.getElementById("firstName").value;
  let lastName = document.getElementById("lastName").value;
  let phone = document.getElementById("phone").value;
  let email = document.getElementById("email").value;
  let dob = document.getElementById("dob").value;
  let gender = document.getElementById("gender").value;

  let validEmail = emailRegex.test(email);
  let validPhoneNo = phoneRegex.test(phone);

  if (firstName === "") {
    document.getElementById("firstNameError").classList.add("visible");
    document.getElementById("firstNameError").innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Please enter your first name';
    isValid = false;
  } else if (firstName.length < 5) {
    document.getElementById("firstNameError").classList.add("visible");
    document.getElementById("firstNameError").innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> First name should be at least 5 characters';
    isValid = false;
  } else {
    document.getElementById("firstNameError").classList.remove("visible");
  }

  if (lastName === "") {
    document.getElementById("lastNameError").classList.add("visible");
    document.getElementById("lastNameError").innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Please enter your last name';
    isValid = false;
  } else {
    document.getElementById("lastNameError").classList.remove("visible");
  }

  if (!validEmail) {
    document.getElementById("emailError").classList.add("visible");
    document.getElementById("emailError").innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Please enter a valid email address';
    isValid = false;
  } else {
    document.getElementById("emailError").classList.remove("visible");
  }

  if (!validPhoneNo) {
    document.getElementById("phoneError").classList.add("visible");
    document.getElementById("phoneError").innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Please enter a valid phone number (070/080/081/090/091...)';
    isValid = false;
  } else {
    document.getElementById("phoneError").classList.remove("visible");
  }

  if (dob === "") {
    document.getElementById("dobError").classList.add("visible");
    document.getElementById("dobError").innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Please enter your date of birth';
    isValid = false;
  } else {
    document.getElementById("dobError").classList.remove("visible");
  }

  if (gender === "") {
    document.getElementById("genderError").classList.add("visible");
    document.getElementById("genderError").innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Please select your gender';
    isValid = false;
  } else {
    document.getElementById("genderError").classList.remove("visible");
  }

  if (!isValid) return;

  memberDetails.personalInfo = {
    firstName,
    lastName,
    phone,
    email,
    dob,
    gender,
  };
  localStorage.setItem("memberDetailsTemp", JSON.stringify(memberDetails));

  // Move to step 2
  document.getElementById("step1").classList.remove("active");
  document.getElementById("step2").classList.add("active");
  document.getElementById("stepCircle1").classList.remove("active");
  document.getElementById("stepCircle1").classList.add("done");
  document.getElementById("stepCircle2").classList.add("active");
  document.getElementById("stepLabel1").classList.remove("active");
  document.getElementById("stepLabel1").classList.add("done");
  document.getElementById("stepLabel2").classList.add("active");
  document.getElementById("stepLine1").classList.add("done");
  document.getElementById("formEyebrow").innerText = "Step 2 of 3";
  document.getElementById("formTitle").innerHTML =
    "Create Your <em>Account</em>";
  document.getElementById("formSubtitle").innerText =
    "Set up your login credentials to securely access your membership.";
};

// Step 1 validations
const firstNameCheck = () => {
  let firstName = document.getElementById("firstName").value;
  let errorEl = document.getElementById("firstNameError");
  if (firstName === "") {
    errorEl.classList.add("visible");
    errorEl.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Please enter your first name';
  } else if (firstName.length < 5) {
    errorEl.classList.add("visible");
    errorEl.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> First name should be at least 5 characters';
  } else {
    errorEl.classList.remove("visible");
  }
};

const lastNameCheck = () => {
  let lastName = document.getElementById("lastName").value;
  let errorEl = document.getElementById("lastNameError");
  if (lastName === "") {
    errorEl.classList.add("visible");
    errorEl.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Please enter your last name';
  } else {
    errorEl.classList.remove("visible");
  }
};

const emailCheck = () => {
  let email = document.getElementById("email").value;
  let errorEl = document.getElementById("emailError");
  let validEmail = emailRegex.test(email);
  if (email === "") {
    errorEl.classList.add("visible");
    errorEl.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Please enter your email address';
  } else if (!validEmail) {
    errorEl.classList.add("visible");
    errorEl.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Please enter a valid email address';
  } else {
    errorEl.classList.remove("visible");
  }
};

const phoneCheck = () => {
  let phone = document.getElementById("phone").value;
  let errorEl = document.getElementById("phoneError");
  let validPhoneNo = phoneRegex.test(phone);
  if (!validPhoneNo) {
    errorEl.classList.add("visible");
    errorEl.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Please enter a valid phone number';
  } else {
    errorEl.classList.remove("visible");
  }
};

const dobCheck = () => {
  let dob = document.getElementById("dob").value;
  let errorEl = document.getElementById("dobError");
  if (dob === "") {
    errorEl.classList.add("visible");
    errorEl.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Please enter your date of birth';
  } else {
    errorEl.classList.remove("visible");
  }
};

const genderCheck = () => {
  let gender = document.getElementById("gender").value;
  let errorEl = document.getElementById("genderError");
  if (gender === "") {
    errorEl.classList.add("visible");
    errorEl.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Please select your gender';
  } else {
    errorEl.classList.remove("visible");
  }
};

// ============================================
// STEP 2 - ACCOUNT SETUP
// ============================================

const nextStep2 = () => {
  document
    .querySelectorAll(".form-error")
    .forEach((err) => err.classList.remove("visible"));
  let isValid = true;

  let tempDetails = JSON.parse(localStorage.getItem("memberDetailsTemp")) || {
    personalInfo: {},
    loginInfo: {},
    membership: {},
  };

  let userName = document.getElementById("username").value;
  let userPassword = document.getElementById("password").value;
  let confirmPassword = document.getElementById("confirmPassword").value;
  let emergencyContact = document.getElementById("emergencyContact").value;
  let emergencyPhone = document.getElementById("emergencyPhone").value;

  let validUsername = usernameRegex.test(userName);
  let validPassword = passwordRegex.test(userPassword);

  let existingUser = allMembers.find(
    (member) => member.loginInfo.userName === userName,
  );

  if (userName === "") {
    document.getElementById("usernameError").classList.add("visible");
    document.getElementById("usernameError").innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Username is required';
    isValid = false;
  } else if (!validUsername) {
    document.getElementById("usernameError").classList.add("visible");
    document.getElementById("usernameError").innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Username must be at least 4 characters (letters, numbers, underscores only)';
    isValid = false;
  } else if (existingUser) {
    document.getElementById("usernameError").classList.add("visible");
    document.getElementById("usernameError").innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Username already exists';
    isValid = false;
  } else {
    document.getElementById("usernameError").classList.remove("visible");
  }

  if (userPassword === "") {
    document.getElementById("passwordError").classList.add("visible");
    document.getElementById("passwordError").innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Password is required';
    isValid = false;
  } else if (!validPassword) {
    document.getElementById("passwordError").classList.add("visible");
    document.getElementById("passwordError").innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Password must be at least 8 characters';
    isValid = false;
  } else {
    document.getElementById("passwordError").classList.remove("visible");
  }

  if (userPassword !== confirmPassword) {
    document.getElementById("confirmPasswordError").classList.add("visible");
    document.getElementById("confirmPasswordError").innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Passwords do not match';
    isValid = false;
  } else {
    document.getElementById("confirmPasswordError").classList.remove("visible");
  }

  if (!isValid) return;

  tempDetails.loginInfo = {
    userName,
    userPassword,
    emergencyContact,
    emergencyPhone,
  };
  localStorage.setItem("memberDetailsTemp", JSON.stringify(tempDetails));

  // Move to step 3
  document.getElementById("step2").classList.remove("active");
  document.getElementById("step3").classList.add("active");
  document.getElementById("stepCircle2").classList.remove("active");
  document.getElementById("stepCircle2").classList.add("done");
  document.getElementById("stepCircle3").classList.add("active");
  document.getElementById("stepLabel2").classList.remove("active");
  document.getElementById("stepLabel2").classList.add("done");
  document.getElementById("stepLabel3").classList.add("active");
  document.getElementById("stepLine2").classList.add("done");
  document.getElementById("formEyebrow").innerText = "Step 3 of 3";
  document.getElementById("formTitle").innerHTML =
    "Choose Your <em>Membership</em>";
  document.getElementById("formSubtitle").innerText =
    "Select the plan that fits your fitness goals and budget.";
};

const usernameCheck = () => {
  let userName = document.getElementById("username").value;
  let errorEl = document.getElementById("usernameError");
  let validUsername = usernameRegex.test(userName);
  let existingUser = allMembers.find(
    (member) =>
      member.loginInfo.userName.toLowerCase().trim() ===
      userName.toLowerCase().trim(),
  );

  if (userName === "") {
    errorEl.classList.add("visible");
    errorEl.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Username is required';
  } else if (!validUsername) {
    errorEl.classList.add("visible");
    errorEl.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Username must be at least 4 characters';
  } else if (existingUser) {
    errorEl.classList.add("visible");
    errorEl.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Username already exists';
  } else {
    errorEl.classList.remove("visible");
  }
};

const passwordCheck = () => {
  let userPassword = document.getElementById("password").value;
  let errorEl = document.getElementById("passwordError");
  let validPassword = passwordRegex.test(userPassword);

  if (userPassword === "") {
    errorEl.classList.add("visible");
    errorEl.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Password is required';
  } else if (!validPassword) {
    errorEl.classList.add("visible");
    errorEl.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Password must be at least 8 characters';
  } else {
    errorEl.classList.remove("visible");
  }

  // Update password strength indicator
  updatePasswordStrength(userPassword);
};

const confirmPasswordCheck = () => {
  let userPassword = document.getElementById("password").value;
  let confirmPassword = document.getElementById("confirmPassword").value;
  let errorEl = document.getElementById("confirmPasswordError");

  if (userPassword !== confirmPassword) {
    errorEl.classList.add("visible");
    errorEl.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Passwords do not match';
  } else {
    errorEl.classList.remove("visible");
  }
};

// Password strength indicator
const updatePasswordStrength = (password) => {
  let strength = 0;
  let bars = document.querySelectorAll(".pw-bar");
  let label = document.getElementById("pwLabel");

  if (password.length >= 8) strength++;
  if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
  if (password.match(/[0-9]/)) strength++;
  if (password.match(/[^a-zA-Z0-9]/)) strength++;

  for (let i = 0; i < bars.length; i++) {
    bars[i].classList.remove("weak", "fair", "strong");
    if (i < strength) {
      if (strength <= 2) bars[i].classList.add("weak");
      else if (strength === 3) bars[i].classList.add("fair");
      else bars[i].classList.add("strong");
    }
  }

  if (strength === 0) {
    label.innerText = "Enter a password";
    label.className = "pw-label";
  } else if (strength <= 2) {
    label.innerText = "Weak password";
    label.className = "pw-label weak";
  } else if (strength === 3) {
    label.innerText = "Fair password";
    label.className = "pw-label fair";
  } else {
    label.innerText = "Strong password!";
    label.className = "pw-label strong";
  }
};

// ============================================
// STEP 3 - MEMBERSHIP
// ============================================

const selectPlan = (plan) => {
  selectedPlan = plan;
  document.getElementById("selectedPlan").value = plan;

  // Update UI
  let basicPlan = document.getElementById("planBasic");
  let premiumPlan = document.getElementById("planPremium");
  let elitePlan = document.getElementById("planElite");

  basicPlan.classList.remove("selected");
  premiumPlan.classList.remove("selected");
  elitePlan.classList.remove("selected");

  if (plan === "basic") {
    basicPlan.classList.add("selected");
    selectedPlanPrice = 8000;
  } else if (plan === "premium") {
    premiumPlan.classList.add("selected");
    selectedPlanPrice = 15000;
  } else if (plan === "elite") {
    elitePlan.classList.add("selected");
    selectedPlanPrice = 25000;
  }

  // Hide plan error if visible
  document.getElementById("planError").classList.remove("visible");
};

const startDateCheck = () => {
  let startDate = document.getElementById("startDate").value;
  let errorEl = document.getElementById("startDateError");
  if (startDate === "") {
    errorEl.classList.add("visible");
    errorEl.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Please select a start date';
  } else {
    errorEl.classList.remove("visible");
  }
};

const completeReg = () => {
  let tempDetails = JSON.parse(localStorage.getItem("memberDetailsTemp")) || {
    personalInfo: {},
    loginInfo: {},
    membership: {},
  };

  let startDate = document.getElementById("startDate").value;
  let fitnessGoal = document.getElementById("fitnessGoal").value;

  // Check plan selection
  if (selectedPlan === "") {
    document.getElementById("planError").classList.add("visible");
    document.getElementById("planError").innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Please select a membership plan';
    return;
  }

  // Check start date
  if (startDate === "") {
    document.getElementById("startDateError").classList.add("visible");
    document.getElementById("startDateError").innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Please select a start date';
    return;
  }

  // Check terms agreement
  let termsChecked = document
    .getElementById("termsCheckbox")
    .classList.contains("checked");
  if (!termsChecked) {
    document.getElementById("termsError").classList.add("visible");
    document.getElementById("termsError").innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> You must agree to the terms and conditions';
    return;
  }

  tempDetails.membership = {
    selectedPlan,
    selectedPlanPrice,
    startDate,
    fitnessGoal,
  };

  allMembers.push(tempDetails);
  localStorage.setItem("memberDetailsArray", JSON.stringify(allMembers));
  localStorage.setItem("currentMember", JSON.stringify(tempDetails));

  // Show success state
  document.getElementById("successState").classList.add("visible");
  document.getElementById("step3").classList.remove("active");
  document.getElementById("signinLink").style.display = "none";

  // Clear temp data
  localStorage.removeItem("memberDetailsTemp");
};

// ============================================
// BACK BUTTONS
// ============================================

const backStep2 = () => {
  let tempDetails = JSON.parse(localStorage.getItem("memberDetailsTemp")) || {
    personalInfo: {},
    loginInfo: {},
    membership: {},
  };

  document.getElementById("firstName").value =
    tempDetails.personalInfo.firstName || "";
  document.getElementById("lastName").value =
    tempDetails.personalInfo.lastName || "";
  document.getElementById("phone").value = tempDetails.personalInfo.phone || "";
  document.getElementById("email").value = tempDetails.personalInfo.email || "";
  document.getElementById("dob").value = tempDetails.personalInfo.dob || "";
  document.getElementById("gender").value =
    tempDetails.personalInfo.gender || "";

  document.getElementById("step1").classList.add("active");
  document.getElementById("step2").classList.remove("active");
  document.getElementById("stepCircle1").classList.add("active");
  document.getElementById("stepCircle1").classList.remove("done");
  document.getElementById("stepCircle2").classList.remove("active", "done");
  document.getElementById("stepLabel1").classList.add("active");
  document.getElementById("stepLabel1").classList.remove("done");
  document.getElementById("stepLabel2").classList.remove("active", "done");
  document.getElementById("stepLine1").classList.remove("done");
  document.getElementById("formEyebrow").innerText = "Step 1 of 3";
  document.getElementById("formTitle").innerHTML =
    "Tell Us About <em>Yourself</em>";
  document.getElementById("formSubtitle").innerText =
    "We'd love to get to know you. Fill in your personal details to get started.";
};

// Back from step 3 to step 2
document.getElementById("backStep3")?.addEventListener("click", () => {
  document.getElementById("step3").classList.remove("active");
  document.getElementById("step2").classList.add("active");
  document.getElementById("stepCircle3").classList.remove("active");
  document.getElementById("stepCircle2").classList.add("active");
  document.getElementById("stepCircle2").classList.remove("done");
  document.getElementById("stepLabel3").classList.remove("active");
  document.getElementById("stepLabel2").classList.add("active");
  document.getElementById("stepLabel2").classList.remove("done");
  document.getElementById("stepLine2").classList.remove("done");
  document.getElementById("formEyebrow").innerText = "Step 2 of 3";
  document.getElementById("formTitle").innerHTML =
    "Create Your <em>Account</em>";
  document.getElementById("formSubtitle").innerText =
    "Set up your login credentials so you can securely access your membership.";
});

// ============================================
// TERMS CHECKBOX
// ============================================

document.getElementById("termsGroup")?.addEventListener("click", () => {
  let checkbox = document.getElementById("termsCheckbox");
  checkbox.classList.toggle("checked");
  document.getElementById("termsError").classList.remove("visible");
});

// ============================================
// PASSWORD TOGGLE FUNCTIONS
// ============================================

const showPasswordToogle = () => {
  let password = document.getElementById("password");
  let icon = document.getElementById("pwToggleIcon1");
  if (password.type === "password") {
    password.type = "text";
    icon.className = "fa-regular fa-eye-slash";
  } else {
    password.type = "password";
    icon.className = "fa-regular fa-eye";
  }
};

const showPasswordToogle2 = () => {
  let password = document.getElementById("confirmPassword");
  let icon = document.getElementById("pwToggleIcon2");
  if (password.type === "password") {
    password.type = "text";
    icon.className = "fa-regular fa-eye-slash";
  } else {
    password.type = "password";
    icon.className = "fa-regular fa-eye";
  }
};

// ============================================
// SET DEFAULT START DATE (tomorrow)
// ============================================

const setDefaultDate = () => {
  let tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  let year = tomorrow.getFullYear();
  let month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  let day = String(tomorrow.getDate()).padStart(2, "0");
  document.getElementById("startDate").value = `${year}-${month}-${day}`;
};

setDefaultDate();

// ============================================
// INITIALIZE PLAN SELECTION (Premium as default)
// ============================================

selectPlan("premium");

// ============================================
// PASSWORD STRENGTH LISTENER
// ============================================

document.getElementById("password")?.addEventListener("input", (e) => {
  updatePasswordStrength(e.target.value);
  passwordCheck();
  confirmPasswordCheck();
});

document.getElementById("confirmPassword")?.addEventListener("input", () => {
  confirmPasswordCheck();
});
