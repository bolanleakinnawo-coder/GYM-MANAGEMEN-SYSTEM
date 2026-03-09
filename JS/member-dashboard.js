let infoFullName = document.getElementById("infoFullName");
let infoEmail = document.getElementById("infoEmail");
let infoPhone = document.getElementById("infoPhone");
let infoGender = document.getElementById("infoGender");
let infoDob = document.getElementById("infoDob");
let infoAddress = document.getElementById("infoAddress");

const showInfo = () => {
  let memberData = JSON.parse(localStorage.getItem("memberData"));

  infoFullName.innerText = memberData.personalInfo.firstName;
  infoEmail.innerText = memberData.personalInfo.email;
  infoPhone.innerText = memberData.personalInfo.phone;
  infoGender.innerText = memberData.personalInfo.gender;
  infoDob.innerText = memberData.personalInfo.dob;
  infoAddress.innerText = memberData.personalInfo.address;
};

showInfo();

let editFirstName = document.getElementById("editFirstName");
let editLastName = document.getElementById("editLastName");
let editEmail = document.getElementById("editEmail");
let editPhone = document.getElementById("editPhone");
let editGender = document.getElementById("editGender");
let editDob = document.getElementById("editDob");
let editAddress = document.getElementById("editAddress");

const editProfile = () => {
  document.getElementById("panel-profile").classList.add("active");
  document.getElementById("tabProfile").classList.add("active");
  document.getElementById("tabOverview").classList.remove("active");
  document.getElementById("panel-overview").classList.remove("active");

  let memberData = JSON.parse(localStorage.getItem("memberData"));

  editFirstName.value = memberData.personalInfo.firstName;
  editLastName.value = memberData.personalInfo.lastName;
  editEmail.value = memberData.personalInfo.email;
  editPhone.value = memberData.personalInfo.phone;
  editGender.value = memberData.personalInfo.gender;
  editDob.value = memberData.personalInfo.dob;
  editAddress.value = memberData.personalInfo.address;

  console.log(memberData.personalInfo.firstName);
};

console.log(showInfo());

const saveChanges = () => {
  let memberData = JSON.parse(localStorage.getItem("memberData"));

  // let newfirstName = document.getElementById("firstName").value;
  // let newlastName = document.getElementById("lastName").value;
  // let newphone = document.getElementById("phone").value;
  // let newemail = document.getElementById("email").value;
  // let newdob = document.getElementById("dob").value;
  // let newgender = document.getElementById("gender").value;
  // let newaddress = document.getElementById("address").value;

  let newFirstName = editFirstName.value;
  let newLastName = editLastName.value;
  let newEmail = editEmail.value;
  let newPhone = editPhone.value;
  let newGender = editGender.value;
  let newDob = editDob.value;
  let newAddress = editAddress.value;

  memberData.personalInfo.firstName = newFirstName;
  memberData.personalInfo.lastName = newLastName;
  memberData.personalInfo.email = newEmail;
  memberData.personalInfo.phone = newPhone;
  memberData.personalInfo.gender = newGender;
  memberData.personalInfo.dob = newDob;
  memberData.personalInfo.address = newAddress;

  localStorage.setItem("memberData", JSON.stringify(memberData));
};

const updatePassword = () => {
  let memberData = JSON.parse(localStorage.getItem("memberData"));
  let editCurrentPw = document.getElementById("editCurrentPw").value;
  let editNewPw = document.getElementById("editNewPw").value;
  let editConfirmPw = document.getElementById("editConfirmPw").value;

  let currentPassword = memberData.loginInfo.userPassword;
  if (currentPassword !== editCurrentPw) {
    alert("This is not your old password");
  } else if (editNewPw !== editConfirmPw) {
    alert("Password do not match");
  } else {
    memberData.loginInfo.userPassword = editNewPw;
    document.getElementById("panel-profile").classList.remove("active");
    document.getElementById("tabProfile").classList.remove("active");
    document.getElementById("tabOverview").classList.add("active");
    document.getElementById("panel-overview").classList.add("active");
    document.getElementById("toast").classList.add("show");
  }

  localStorage.setItem("memberData", JSON.stringify(memberData));
  console.log(currentPassword);
};

let memberData = JSON.parse(localStorage.getItem("memberData"));
let JoinDate = document.getElementById("mcJoinDate");

let startDay = memberData.membership.startDate;
let startDateObj = new Date(startDay);

JoinDate.innerHTML = startDateObj.toDateString();

let expiryDateObj = new Date(startDay);
expiryDateObj.setDate(expiryDateObj.getDate() + 30);

let mcExpiry = document.getElementById("mcExpiry");
mcExpiry.innerHTML = expiryDateObj.toDateString();

let todayDate = new Date();
console.log();

if (todayDate >= expiryDateObj) {
  let status = document.getElementById("mcStatusPill");
  status.classList.remove("pill-active");
  status.classList.add("pill-expired");
  status.innerHTML = "Expired";
} else {
  let status = document.getElementById("mcStatusPill");
  status.classList.add("pill-active");
  status.classList.remove("pill-expired");
  status.innerHTML = "Active";
}

let countDownDate = new Date(expiryDateObj).getTime();
let countUpdate = setInterval(() => {
  todayDate = new Date().getTime();

  let distance = countDownDate - todayDate;

  if (distance <= 0) {
    clearInterval(countUpdate);
    document.getElementById("statDaysLeft").innerHTML = "Expired";
    return;
  }
  let days = Math.floor(distance / (1000 * 60 * 60 * 24));
  let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  let seconds = Math.floor((distance % (1000 * 60)) / 1000);

  document.getElementById("statDaysLeft").innerHTML =
    days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
}, 1000);

const membershipDetailsDisplay = () => {
  let profileFullName = document.getElementById("profileFullName");
  let pqsJoinDate = document.getElementById("pqsJoinDate");
  let pqsExpiry = document.getElementById("pqsExpiry");
  let pqsGoal = document.getElementById("pqsGoal");
  let profilePlanLabel = document.getElementById("profilePlanLabel");
  let memberData = JSON.parse(localStorage.getItem("memberData"));

  profileFullName.innerText = `${memberData.personalInfo.firstName} ${memberData.personalInfo.lastName}`;

  pqsJoinDate.innerText = JoinDate.innerHTML;
  pqsExpiry.innerText = mcExpiry.innerHTML;

  profilePlanLabel.innerText = memberData.membership.selectedPlan;

  pqsGoal.innerText = memberData.membership.fitnessGoal;
};

membershipDetailsDisplay();
