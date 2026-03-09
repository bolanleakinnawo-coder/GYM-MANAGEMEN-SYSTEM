let memberData = {
  personalInfo: {},
  loginInfo: {},
  membership: {},
};

const nextStep1 = () => {
  let firstName = document.getElementById("firstName").value;
  let lastName = document.getElementById("lastName").value;
  let phone = document.getElementById("phone").value;
  let email = document.getElementById("email").value;
  let dob = document.getElementById("dob").value;
  let gender = document.getElementById("gender").value;
  let address = document.getElementById("address").value;

  if (
    firstName == "" ||
    lastName == "" ||
    phone == "" ||
    email == "" ||
    dob == "" ||
    gender == "" ||
    address == ""
  ) {
    alert("All fields are required");
    return;
  }

  memberData.personalInfo = {
    firstName,
    lastName,
    phone,
    email,
    dob,
    gender,
    address,
  };

  localStorage.setItem("memberData", JSON.stringify(memberData));

  console.log(memberData);

  document.getElementById("step1").classList.remove("active");
  document.getElementById("step2").classList.add("active");
  document.getElementById("stepCircle1").classList.remove("active");
  document.getElementById("stepCircle2").classList.add("active");
  document.getElementById("stepLabel1").classList.remove("active");
  document.getElementById("stepLabel2").classList.add("active");
  document.getElementById("formEyebrow").innerText = "Step 2 of 3";
  document.getElementById("formTitle").innerText = "Create Your Account";
  document.getElementById("formSubtitle").innerText =
    "Set up your login credentials so you can securely access your membership.";
};

const nextStep2 = () => {
  let userName = document.getElementById("username").value;
  let userPassword = document.getElementById("password").value;
  let confirmPassword = document.getElementById("confirmPassword").value;
  let emergencyContact = document.getElementById("emergencyContact").value;
  let emergencyPhone = document.getElementById("emergencyPhone").value;

  if (
    userName == "" ||
    userPassword == "" ||
    confirmPassword == "" ||
    emergencyContact == "" ||
    emergencyPhone == ""
  ) {
    alert("All fields are required");
    return;
  }

  if (userPassword !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  memberData.loginInfo = {
    userName,
    userPassword,
    emergencyContact,
    emergencyPhone,
  };

  localStorage.setItem("memberData", JSON.stringify(memberData));

  console.log(memberData);

  document.getElementById("step1").classList.remove("active");
  document.getElementById("step2").classList.remove("active");
  document.getElementById("step3").classList.add("active");
  document.getElementById("stepCircle1").classList.remove("active");
  document.getElementById("stepCircle2").classList.remove("active");
  document.getElementById("stepCircle3").classList.add("active");
  document.getElementById("stepLabel1").classList.remove("active");
  document.getElementById("stepLabel2").classList.remove("active");
  document.getElementById("stepLabel3").classList.add("active");
};

let selectedPlan = "";
let selectedPlanPrice = "";
let startDate = "";

const selectPlan = (plan) => {
  selectedPlan = plan;

  if (selectedPlan == "basic") {
    document.getElementById("planBasic").classList.add("selected");
    document.getElementById("planPremium").classList.remove("selected");
    document.getElementById("planElite").classList.remove("selected");
    selectedPlanPrice = 8000;
  } else if (selectedPlan == "premium") {
    document.getElementById("planBasic").classList.remove("selected");
    document.getElementById("planPremium").classList.add("selected");
    document.getElementById("planElite").classList.remove("selected");
    selectedPlanPrice = 15000;
  } else {
    document.getElementById("planBasic").classList.remove("selected");
    document.getElementById("planPremium").classList.remove("selected");
    document.getElementById("planElite").classList.add("selected");
    selectedPlanPrice = 25000;
  }
};

const completeReg = () => {
  let startDate = document.getElementById("startDate").value;
  let fitnessGoal = document.getElementById("fitnessGoal").value;
  memberData.membership = {
    selectedPlan,
    selectedPlanPrice,
    startDate,
    fitnessGoal,
  };

  localStorage.setItem("memberData", JSON.stringify(memberData));

  console.log(memberData);

  document.getElementById("successState").classList.add("visible");
  document.getElementById("step3").classList.remove("active");
};
const showPasswordToogle = () => {
  let password = document.getElementById("password");
  if (password.type == "password") {
    password.type = "text";
  } else {
    password.type = "password";
  }
};

const showPasswordToogle2 = () => {
  let password = document.getElementById("confirmPassword");
  if (password.type == "password") {
    password.type = "text";
  } else {
    password.type = "password";
  }
};

const backStep2 = () => {
  document.getElementById("firstName").value =
    memberData.personalInfo.firstName || "";
  document.getElementById("lastName").value =
    memberData.personalInfo.lastName || "";
  document.getElementById("phone").value = memberData.personalInfo.phone || "";
  document.getElementById("email").value = memberData.personalInfo.email || "";
  document.getElementById("dob").value = memberData.personalInfo.dob || "";
  document.getElementById("gender").value =
    memberData.personalInfo.gender || "";
  document.getElementById("address").value =
    memberData.personalInfo.address || "";

  document.getElementById("step1").classList.add("active");
  document.getElementById("step2").classList.remove("active");
  document.getElementById("stepCircle1").classList.add("active");
  document.getElementById("stepCircle2").classList.remove("active");
  document.getElementById("stepLabel1").classList.add("active");
  document.getElementById("stepLabel2").classList.remove("active");

  localStorage.setItem("memberData", JSON.stringify(memberData));
};
