let db = window.db;

// STORED DATA from Firebase
let allMembers = [];
let trainerDetails = [];
let classDetails = [];
let savePaymentDetails = [];
let attendanceRecords = [];

//Security Check

let currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser) {
  window.location.href = "login.html";
  throw new Error("Access denied. Please login first.");
}
if (currentUser.role !== "admin") {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("currentMember");

  window.location.href = "login.html";
  throw new Error("Unauthorized access. Please login as admin.");
}

//GLOBAL VARIABLES
let type = "";
let deleteIndex = null;
let editIndex = null;
let editClassIndex = null;
let selectedPlan = "";
let selectedPlanPrice = "";

// REGEX PATTERNS
let phoneRegex = /^(070|071|080|081|082|090|091)\d{8}$/;
let usernameRegex = /^[a-zA-Z0-9_]{4,}$/;
let passwordRegex = /^.{8,}$/;
let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// FIREBASE FUNCTIONS

async function loadAllDataFromFirebase() {
  const membersSnapshot = await get(child(ref(db), "members"));
  if (membersSnapshot.exists()) {
    allMembers = membersSnapshot.val();
  }

  const trainersSnapshot = await get(child(ref(db), "trainers"));
  if (trainersSnapshot.exists()) {
    trainerDetails = trainersSnapshot.val();
  }

  const classesSnapshot = await get(child(ref(db), "classes"));
  if (classesSnapshot.exists()) {
    classDetails = classesSnapshot.val();
  }

  const paymentsSnapshot = await get(child(ref(db), "payments"));
  if (paymentsSnapshot.exists()) {
    savePaymentDetails = paymentsSnapshot.val();
  }

  const attendanceSnapshot = await get(child(ref(db), "attendance"));
  if (attendanceSnapshot.exists()) {
    attendanceRecords = attendanceSnapshot.val();
  }

  refreshAllDisplays();
}

async function saveMembersToFirebase() {
  await set(ref(db, "members"), allMembers);
}

async function saveTrainersToFirebase() {
  await set(ref(db, "trainers"), trainerDetails);
}

async function saveClassesToFirebase() {
  await set(ref(db, "classes"), classDetails);
}

async function savePaymentsToFirebase() {
  await set(ref(db, "payments"), savePaymentDetails);
}

async function saveAttendanceToFirebase() {
  await set(ref(db, "attendance"), attendanceRecords);
}

//Check if username is taken for members and trainer

function isUsernameTaken(username, excludeIndex = -1) {
  return allMembers.some(
    (member, idx) =>
      idx !== excludeIndex &&
      member.loginInfo.userName.toLowerCase() === username.toLowerCase(),
  );
}

function isTrainerUsernameTaken(username, excludeIndex = -1) {
  return trainerDetails.some(
    (trainer, idx) =>
      idx !== excludeIndex &&
      trainer.traineruserName.toLowerCase() === username.toLowerCase(),
  );
}

// Close sidebar button
const closeSidebarBtn = document.getElementById("closeSidebarBtn");
if (closeSidebarBtn) {
  closeSidebarBtn.addEventListener("click", () => {
    document.getElementById("sidebar").classList.remove("open");
  });
}

// Click outside sidebar to close
document.addEventListener("click", (e) => {
  const sidebar = document.getElementById("sidebar");
  const menuToggle = document.getElementById("menuToggle");
  if (sidebar && sidebar.classList.contains("open")) {
    if (!sidebar.contains(e.target) && !menuToggle?.contains(e.target)) {
      sidebar.classList.remove("open");
    }
  }
});

function getMembershipDetails(member) {
  let startDate = new Date(member.membership.startDate);
  let expiryDate = new Date(startDate);
  let plan = member.membership.selectedPlan;

  if (plan === "basic") expiryDate.setDate(expiryDate.getDate() + 30);
  else if (plan === "premium") expiryDate.setDate(expiryDate.getDate() + 30);
  else if (plan === "elite") expiryDate.setDate(expiryDate.getDate() + 30);

  let today = new Date();
  let status = today >= expiryDate ? "Expired" : "Active";

  return { startDate, expiryDate, status };
}

function getTrainerFullNameByUsername(username) {
  let trainer = trainerDetails.find((t) => t.traineruserName === username);
  if (trainer) {
    return `${trainer.trainerfirstName} ${trainer.trainerlastName}`;
  }
  return username;
}

function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  const toastText = document.getElementById("toastText");
  const toastIcon = document.getElementById("toastIcon");

  if (!toast) return;

  toastText.innerText = message;
  if (isError) {
    toast.classList.add("error");
    toastIcon.className = "fa-solid fa-circle-exclamation";
    toast.style.borderColor = "rgba(232, 85, 85, 0.3)";
  } else {
    toast.classList.add("success");
    toastIcon.className = "fa-solid fa-circle-check";
    toast.style.borderColor = "rgba(30, 201, 154, 0.3)";
  }
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.remove("success", "error");
  }, 3000);
}

//MODAL
const addMember = () => {
  editIndex = null;
  const modal = document.getElementById("memberModal");
  if (modal) modal.classList.add("open");

  const title = document.getElementById("memberModalTitle");
  const saveBtn = document.getElementById("saveMemberBtn");
  if (title) title.innerHTML = "Add <em>New Member</em>";
  if (saveBtn)
    saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Save Member';

  // Clear form
  const fields = [
    "mFirstName",
    "mLastName",
    "mEmail",
    "mPhone",
    "mTrainer",
    "mGender",
    "mDob",
    "mUsername",
    "mPassword",
  ];
  fields.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  document
    .querySelectorAll(".form-error")
    .forEach((el) => el.classList.remove("visible"));
};

const closeModal = () => {
  const modal = document.getElementById("memberModal");
  if (modal) modal.classList.remove("open");
  editIndex = null;
};

const addTrainer = () => {
  editIndex = null;
  const modal = document.getElementById("trainerModal");
  if (modal) modal.classList.add("open");

  const title = document.getElementById("trainerModalTitle");
  const saveBtn = document.getElementById("saveTrainerBtn");
  if (title) title.innerHTML = "Add <em>New Trainer</em>";
  if (saveBtn)
    saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Save Trainer';

  const fields = [
    "tFirstName",
    "tLastName",
    "tEmail",
    "tPhone",
    "tSpec",
    "tUsername",
    "tPassword",
    "tBio",
  ];
  fields.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  document
    .querySelectorAll(".form-error")
    .forEach((el) => el.classList.remove("visible"));
};

const closeTrainerModal = () => {
  const modal = document.getElementById("trainerModal");
  if (modal) modal.classList.remove("open");
  editIndex = null;
};

const recordPayment = () => {
  editIndex = null;
  const modal = document.getElementById("paymentModal");
  if (modal) modal.classList.add("open");

  const fields = ["payMember", "payPlan", "payMethod", "payAmount", "payNotes"];
  fields.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  const dateEl = document.getElementById("payDate");
  if (dateEl) dateEl.value = new Date().toISOString().split("T")[0];
};

const closeSavePayment = () => {
  const modal = document.getElementById("paymentModal");
  if (modal) modal.classList.remove("open");
  editIndex = null;
};

const addClass = () => {
  editClassIndex = null;
  const modal = document.getElementById("classModal");
  if (modal) modal.classList.add("open");

  const title = document.getElementById("classModalTitle");
  const saveBtn = document.getElementById("saveClassBtn");
  if (title) title.innerHTML = "Add <em>New Class</em>";
  if (saveBtn)
    saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Save Class';

  const fields = [
    "clsName",
    "clsType",
    "clsTrainer",
    "clsDay",
    "clsTime",
    "clsDuration",
    "clsCapacity",
  ];
  fields.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  document
    .querySelectorAll(".form-error")
    .forEach((el) => (el.style.display = "none"));
};

const closeClassModal = () => {
  const modal = document.getElementById("classModal");
  if (modal) modal.classList.remove("open");
  editClassIndex = null;
};

const closeDeleteModal = () => {
  const modal = document.getElementById("deleteModal");
  if (modal) modal.classList.remove("open");
  deleteIndex = null;
  type = "";
};

// TOPBAR & SIDEBAR

const setTopbarBreadcrumb = (text) => {
  const el = document.getElementById("topbarBreadcrumb");
  if (el) el.innerText = text;
};

const setActiveSidebarLink = (pageName) => {
  const links = document.querySelectorAll(".sb-link");
  links.forEach((link) => link.classList.remove("active"));
  const activeLink = document.querySelector(
    `.sb-link[data-page="${pageName}"]`,
  );
  if (activeLink) activeLink.classList.add("active");
};

// PAGE NAVIGATION

const overview = () => {
  document
    .querySelectorAll(".page-panel")
    .forEach((page) => page.classList.remove("active"));
  const panel = document.getElementById("page-overview");
  if (panel) panel.classList.add("active");
  setActiveSidebarLink("overview");
  setTopbarBreadcrumb("Overview");
  updateRecentActivity();
  updateExpiredList();
};

const memberManagement = () => {
  document
    .querySelectorAll(".page-panel")
    .forEach((page) => page.classList.remove("active"));
  const panel = document.getElementById("page-members");
  if (panel) panel.classList.add("active");
  setActiveSidebarLink("members");
  setTopbarBreadcrumb("Member Management");
  displayMembersTable();
};

const trainerManagement = () => {
  document
    .querySelectorAll(".page-panel")
    .forEach((page) => page.classList.remove("active"));
  const panel = document.getElementById("page-trainers");
  if (panel) panel.classList.add("active");
  setActiveSidebarLink("trainers");
  setTopbarBreadcrumb("Trainer Management");
  displayTrainerCards();
  displayTrainerTable();
};

const classSchedulling = () => {
  document
    .querySelectorAll(".page-panel")
    .forEach((page) => page.classList.remove("active"));
  const panel = document.getElementById("page-classes");
  if (panel) panel.classList.add("active");
  setActiveSidebarLink("classes");
  setTopbarBreadcrumb("Class Scheduling");
  displayClassTable();
  updateClassStats();
};

const paymentRecording = () => {
  document
    .querySelectorAll(".page-panel")
    .forEach((page) => page.classList.remove("active"));
  const panel = document.getElementById("page-payments");
  if (panel) panel.classList.add("active");
  setActiveSidebarLink("payments");
  setTopbarBreadcrumb("Payment Recording");
  displayPaymentTable();
  totalRevenue(["payTotalRevenue", "ovTotalRevenue"]);
  totalPayment();
  thisMonthPay();
  revByPlan();
  populateMemberDropdown("payMember");
};

const reports = () => {
  document
    .querySelectorAll(".page-panel")
    .forEach((page) => page.classList.remove("active"));
  const panel = document.getElementById("page-reports");
  if (panel) panel.classList.add("active");
  setActiveSidebarLink("reports");
  setTopbarBreadcrumb("Reports & Analytics");
  displayReports();
};

const attendanceTracking = () => {
  document
    .querySelectorAll(".page-panel")
    .forEach((page) => page.classList.remove("active"));
  const panel = document.getElementById("page-attendance");
  if (panel) panel.classList.add("active");
  setActiveSidebarLink("attendance");
  setTopbarBreadcrumb("Attendance Tracking");
  updateAttendanceStats();
  memberChecklist();
  displayAttendanceLog();
  populateAttendanceMemberFilter();
};

const markAttendance = () => {
  attendanceTracking();
};

// WELCOME & DATE

const setWelcomeDate = () => {
  let today = new Date();
  let options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  let formattedDate = today.toLocaleDateString("en-US", options);
  const wsDate = document.getElementById("wsDate");
  const topbarDate = document.getElementById("topbarDate");
  if (wsDate) wsDate.innerText = formattedDate;
  if (topbarDate) topbarDate.innerText = formattedDate;

  let hour = today.getHours();
  let greeting =
    hour >= 5 && hour < 12
      ? "Morning"
      : hour >= 12 && hour < 18
        ? "Afternoon"
        : "Evening";
  const topbarGreeting = document.getElementById("topbarGreeting");
  if (topbarGreeting) topbarGreeting.innerText = greeting;
};

setWelcomeDate();

const loadAdminProfile = () => {
  let name = currentUser.name || "Admin";
  const sbAdminName = document.getElementById("sbAdminName");
  const wsAdminName = document.getElementById("wsAdminName");
  const sbAdminAv = document.getElementById("sbAdminAv");
  if (sbAdminName) sbAdminName.innerText = name;
  if (wsAdminName) wsAdminName.innerHTML = name;
  if (sbAdminAv) sbAdminAv.innerText = (name.charAt(0) || "A").toUpperCase();
};

loadAdminProfile();

// MEMBER MANAGEMENT - VALIDATIONS

const firstNameCheck = () => {
  let firstName = document.getElementById("mFirstName").value;
  let errorEl = document.getElementById("firstNameError");
  if (!errorEl) return;
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
  let lastName = document.getElementById("mLastName").value;
  let errorEl = document.getElementById("lastNameError");
  if (!errorEl) return;
  if (lastName === "") {
    errorEl.classList.add("visible");
    errorEl.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Please enter your last name';
  } else {
    errorEl.classList.remove("visible");
  }
};

const emailCheck = () => {
  let email = document.getElementById("mEmail").value;
  let errorEl = document.getElementById("emailError");
  if (!errorEl) return;
  if (email === "") {
    errorEl.classList.add("visible");
    errorEl.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Please enter your email address';
  } else if (!emailRegex.test(email)) {
    errorEl.classList.add("visible");
    errorEl.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Please enter a valid email address';
  } else {
    errorEl.classList.remove("visible");
  }
};

const phoneCheck = () => {
  let phone = document.getElementById("mPhone").value;
  let errorEl = document.getElementById("phoneError");
  if (!errorEl) return;
  if (!phoneRegex.test(phone)) {
    errorEl.classList.add("visible");
    errorEl.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Please enter a valid phone number';
  } else {
    errorEl.classList.remove("visible");
  }
};

const dobCheck = () => {
  let dob = document.getElementById("mDob").value;
  let errorEl = document.getElementById("dobError");
  if (!errorEl) return;
  if (dob === "") {
    errorEl.classList.add("visible");
    errorEl.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Please enter date of birth';
  } else {
    errorEl.classList.remove("visible");
  }
};

const genderCheck = () => {
  let gender = document.getElementById("mGender").value;
  let errorEl = document.getElementById("genderError");
  if (!errorEl) return;
  if (gender === "") {
    errorEl.classList.add("visible");
    errorEl.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Please select gender';
  } else {
    errorEl.classList.remove("visible");
  }
};

const usernameCheck = () => {
  let username = document.getElementById("mUsername").value;
  let errorEl = document.getElementById("usernameError");
  if (!errorEl) return;
  if (username === "") {
    errorEl.classList.add("visible");
    errorEl.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Username is required';
  } else if (!usernameRegex.test(username)) {
    errorEl.classList.add("visible");
    errorEl.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Username must be at least 4 characters (letters, numbers, underscores only)';
  } else if (isUsernameTaken(username, editIndex)) {
    errorEl.classList.add("visible");
    errorEl.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Username already exists';
  } else {
    errorEl.classList.remove("visible");
  }
};

const passwordCheck = () => {
  let password = document.getElementById("mPassword").value;
  let errorEl = document.getElementById("passwordError");
  if (!errorEl) return;
  if (password === "") {
    errorEl.classList.add("visible");
    errorEl.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Password is required';
  } else if (!passwordRegex.test(password)) {
    errorEl.classList.add("visible");
    errorEl.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Password must be at least 8 characters';
  } else {
    errorEl.classList.remove("visible");
  }
};

const selectPlan = (plan) => {
  selectedPlan = plan;
  const mSelectedPlan = document.getElementById("mSelectedPlan");
  if (mSelectedPlan) mSelectedPlan.value = plan;

  const basicPlan = document.getElementById("basicplan");
  const premiumPlan = document.getElementById("premiumplan");
  const elitePlan = document.getElementById("eliteplan");

  if (basicPlan) basicPlan.classList.remove("selected");
  if (premiumPlan) premiumPlan.classList.remove("selected");
  if (elitePlan) elitePlan.classList.remove("selected");

  if (plan === "basic") {
    if (basicPlan) basicPlan.classList.add("selected");
    selectedPlanPrice = 8000;
  } else if (plan === "premium") {
    if (premiumPlan) premiumPlan.classList.add("selected");
    selectedPlanPrice = 15000;
  } else if (plan === "elite") {
    if (elitePlan) elitePlan.classList.add("selected");
    selectedPlanPrice = 25000;
  }
};

async function saveMember() {
  let isValid = true;

  let firstName = document.getElementById("mFirstName").value;
  let lastName = document.getElementById("mLastName").value;
  let email = document.getElementById("mEmail").value;
  let phone = document.getElementById("mPhone").value;
  let assignedTrainerUsername = document.getElementById("mTrainer").value;
  let gender = document.getElementById("mGender").value;
  let dob = document.getElementById("mDob").value;
  let userName = document.getElementById("mUsername").value;
  let userPassword = document.getElementById("mPassword").value;
  let membershipPlan = document.getElementById("mSelectedPlan").value;

  if (firstName === "" || firstName.length < 5) {
    firstNameCheck();
    isValid = false;
  }
  if (lastName === "") {
    lastNameCheck();
    isValid = false;
  }
  if (!emailRegex.test(email)) {
    emailCheck();
    isValid = false;
  }
  if (!phoneRegex.test(phone)) {
    phoneCheck();
    isValid = false;
  }
  if (dob === "") {
    dobCheck();
    isValid = false;
  }
  if (gender === "") {
    genderCheck();
    isValid = false;
  }
  if (
    userName === "" ||
    !usernameRegex.test(userName) ||
    isUsernameTaken(userName, editIndex)
  ) {
    usernameCheck();
    isValid = false;
  }
  if (userPassword === "" || !passwordRegex.test(userPassword)) {
    passwordCheck();
    isValid = false;
  }
  if (membershipPlan === "") {
    const planError = document.getElementById("planError");
    if (planError) planError.classList.add("visible");
    isValid = false;
  }

  if (!isValid) return;

  document
    .querySelectorAll(".form-error")
    .forEach((el) => el.classList.remove("visible"));
  const planError = document.getElementById("planError");
  if (planError) planError.classList.remove("visible");

  let assignedTrainerFullName = assignedTrainerUsername
    ? getTrainerFullNameByUsername(assignedTrainerUsername)
    : "";

  const newMember = {
    personalInfo: {
      firstName,
      lastName,
      phone,
      email,
      dob,
      gender,
      assignedTrainer: assignedTrainerFullName,
      assignedTrainerUsername: assignedTrainerUsername,
    },
    loginInfo: { userName, userPassword },
    membership: {
      selectedPlan: membershipPlan,
      startDate: new Date().toISOString(),
    },
  };

  if (editIndex === null) {
    allMembers.push(newMember);
    showToast("Member added successfully!");
  } else {
    if (!userPassword || userPassword === "") {
      newMember.loginInfo.userPassword =
        allMembers[editIndex].loginInfo.userPassword;
    }
    newMember.membership.startDate = allMembers[editIndex].membership.startDate;
    allMembers[editIndex] = newMember;
    showToast("Member updated successfully!");
  }

  await saveMembersToFirebase();
  closeModal();
  refreshAllDisplays();
  editIndex = null;
}

// DISPLAY MEMBERS TABLE

const displayMembersTable = () => {
  let members = [...allMembers];
  let planFilter =
    (document.getElementById("memberPlanFilter") &&
      document.getElementById("memberPlanFilter").value) ||
    "all";

  let statusFilter =
    (document.getElementById("memberStatusFilter") &&
      document.getElementById("memberStatusFilter").value) ||
    "all";

  let searchValue =
    (document.getElementById("memberSearch") &&
      document.getElementById("memberSearch").value.toLowerCase()) ||
    "";

  if (planFilter !== "all") {
    members = members.filter((m) => m.membership.selectedPlan === planFilter);
  }
  if (statusFilter !== "all") {
    members = members.filter((m) => {
      let details = getMembershipDetails(m);
      return details.status.toLowerCase() === statusFilter;
    });
  }
  if (searchValue) {
    members = members.filter(
      (m) =>
        m.personalInfo.firstName.toLowerCase().includes(searchValue) ||
        m.personalInfo.lastName.toLowerCase().includes(searchValue) ||
        m.personalInfo.email.toLowerCase().includes(searchValue) ||
        m.personalInfo.phone.includes(searchValue),
    );
  }

  let show = "";
  members.forEach((member, idx) => {
    const details = getMembershipDetails(member);
    const statusClass =
      details.status === "Active" ? "pill-active" : "pill-expired";
    const realIndex = allMembers.findIndex(
      (m) => m.loginInfo.userName === member.loginInfo.userName,
    );

    show += `<tr>
            <td class="td-main">${idx + 1}</td>
            <td class="td-main">${member.personalInfo.firstName} ${member.personalInfo.lastName}<div class="td-sub">${member.loginInfo.userName}</div></td>
            <td>${member.personalInfo.email}</td>
            <td>${member.personalInfo.phone}</td>
            <td>${member.membership.selectedPlan}</td>
            <td>${details.startDate.toDateString()}</td>
            <td>${details.expiryDate.toDateString()}</td>
            <td><span class="pill ${statusClass}"><span class="dot"></span>${details.status}</span></td>
            <td class="tbl-actions">
                <button class="tbl-btn tbl-btn-edit" onclick="editMember(${realIndex})"><i class="fa-solid fa-pen"></i> Edit</button>
                <button class="tbl-btn tbl-btn-delete" onclick="deleteModal(${realIndex}, 'allMembers')"><i class="fa-solid fa-trash"></i> Delete</button>
                <button class="tbl-btn tbl-btn-view" onclick="viewMember(${realIndex})"><i class="fa-solid fa-eye"></i> View</button>
            </td>
        </tr>`;
  });

  const tbody = document.getElementById("membersTableBody");
  const emptyEl = document.getElementById("membersEmpty");
  if (tbody) tbody.innerHTML = show;
  if (emptyEl) emptyEl.style.display = members.length === 0 ? "flex" : "none";

  let activeCount = 0,
    expiredCount = 0;
  allMembers.forEach((m) => {
    let details = getMembershipDetails(m);
    if (details.status === "Active") activeCount++;
    else expiredCount++;
  });

  const memTotal = document.getElementById("memTotal");
  const memActive = document.getElementById("memActive");
  const memExpired = document.getElementById("memExpired");
  if (memTotal) memTotal.innerText = allMembers.length;
  if (memActive) memActive.innerText = activeCount;
  if (memExpired) memExpired.innerText = expiredCount;
};

const planCategory = (plan) => {
  displayMembersTable();
};
const statusCategory = (status) => {
  displayMembersTable();
};
const searchMember = () => {
  displayMembersTable();
};

const editMember = (index) => {
  editIndex = index;
  let member = allMembers[index];

  document.getElementById("mFirstName").value = member.personalInfo.firstName;
  document.getElementById("mLastName").value = member.personalInfo.lastName;
  document.getElementById("mEmail").value = member.personalInfo.email;
  document.getElementById("mPhone").value = member.personalInfo.phone;
  document.getElementById("mGender").value = member.personalInfo.gender;
  document.getElementById("mDob").value = member.personalInfo.dob;
  document.getElementById("mUsername").value = member.loginInfo.userName;
  document.getElementById("mPassword").value = "";
  document.getElementById("mSelectedPlan").value =
    member.membership.selectedPlan;

  selectPlan(member.membership.selectedPlan);

  let trainerSelect = document.getElementById("mTrainer");
  if (trainerSelect && member.personalInfo.assignedTrainerUsername) {
    trainerSelect.value = member.personalInfo.assignedTrainerUsername;
  }

  document.getElementById("memberModalTitle").innerHTML =
    "Edit <em>Member</em>";
  document.getElementById("saveMemberBtn").innerHTML =
    '<i class="fa-solid fa-check"></i> Update Member';
  document.getElementById("memberModal").classList.add("open");
};

const viewMember = (index) => {
  let member = allMembers[index];
  let details = getMembershipDetails(member);

  let initials = (
    member.personalInfo.firstName.charAt(0) +
    member.personalInfo.lastName.charAt(0)
  ).toUpperCase();
  const vmAvatar = document.getElementById("vmAvatar");
  const vmFullName = document.getElementById("vmFullName");
  const vmUsername = document.getElementById("vmUsername");
  if (vmAvatar) vmAvatar.innerText = initials;
  if (vmFullName)
    vmFullName.innerText = `${member.personalInfo.firstName} ${member.personalInfo.lastName}`;
  if (vmUsername) vmUsername.innerText = `@${member.loginInfo.userName}`;

  let pill = document.getElementById("vmStatusPill");
  let statusText = document.getElementById("vmStatusText");
  if (pill && statusText) {
    if (details.status === "Active") {
      pill.className = "pill pill-active";
      statusText.innerText = "Active";
    } else {
      pill.className = "pill pill-expired";
      statusText.innerText = "Expired";
    }
  }

  const vmEmail = document.getElementById("vmEmail");
  const vmPhone = document.getElementById("vmPhone");
  const vmGender = document.getElementById("vmGender");
  const vmDob = document.getElementById("vmDob");
  const vmPlan = document.getElementById("vmPlan");
  const vmStartDate = document.getElementById("vmStartDate");
  const vmExpiry = document.getElementById("vmExpiry");
  const vmTrainer = document.getElementById("vmTrainer");

  if (vmEmail) vmEmail.innerText = member.personalInfo.email;
  if (vmPhone) vmPhone.innerText = member.personalInfo.phone;
  if (vmGender) vmGender.innerText = member.personalInfo.gender;
  if (vmDob) vmDob.innerText = new Date(member.personalInfo.dob).toDateString();
  if (vmPlan) vmPlan.innerText = member.membership.selectedPlan;
  if (vmStartDate) vmStartDate.innerText = details.startDate.toDateString();
  if (vmExpiry) vmExpiry.innerText = details.expiryDate.toDateString();
  if (vmTrainer)
    vmTrainer.innerText =
      member.personalInfo.assignedTrainer || "No trainer assigned";

  window.currentViewIndex = index;
  const modal = document.getElementById("viewMemberModal");
  if (modal) modal.classList.add("open");
};

const closeViewMemberModal = () => {
  const modal = document.getElementById("viewMemberModal");
  if (modal) modal.classList.remove("open");
};

// TRAINER MANAGEMENT

const tFirstNameCheck = () => {
  let val = document.getElementById("tFirstName").value;
  let errorEl = document.getElementById("tFirstNameError");
  if (!errorEl) return;
  if (val === "" || val.length < 2) {
    errorEl.classList.add("visible");
  } else {
    errorEl.classList.remove("visible");
  }
};

const tLastNameCheck = () => {
  let val = document.getElementById("tLastName").value;
  let errorEl = document.getElementById("tLastNameError");
  if (!errorEl) return;
  if (val === "") {
    errorEl.classList.add("visible");
  } else {
    errorEl.classList.remove("visible");
  }
};

const tEmailCheck = () => {
  let val = document.getElementById("tEmail").value;
  let errorEl = document.getElementById("tEmailError");
  if (!errorEl) return;
  if (val === "" || !emailRegex.test(val)) {
    errorEl.classList.add("visible");
  } else {
    errorEl.classList.remove("visible");
  }
};

const tPhoneCheck = () => {
  let val = document.getElementById("tPhone").value;
  let errorEl = document.getElementById("tPhoneError");
  if (!errorEl) return;
  if (val !== "" && !phoneRegex.test(val)) {
    errorEl.classList.add("visible");
  } else {
    errorEl.classList.remove("visible");
  }
};

const tSpecCheck = () => {
  let val = document.getElementById("tSpec").value;
  let errorEl = document.getElementById("tSpecError");
  if (!errorEl) return;
  if (val === "") {
    errorEl.classList.add("visible");
  } else {
    errorEl.classList.remove("visible");
  }
};

const tUsernameCheck = () => {
  let val = document.getElementById("tUsername").value;
  let errorEl = document.getElementById("tUsernameError");
  if (!errorEl) return;
  if (!usernameRegex.test(val) || isTrainerUsernameTaken(val, editIndex)) {
    errorEl.classList.add("visible");
    errorEl.innerHTML =
      '<i class="fa-solid fa-circle-exclamation"></i> Username already exists or invalid format';
  } else {
    errorEl.classList.remove("visible");
  }
};

const tPasswordCheck = () => {
  let val = document.getElementById("tPassword").value;
  let errorEl = document.getElementById("tPasswordError");
  if (!errorEl) return;
  if (!passwordRegex.test(val)) {
    errorEl.classList.add("visible");
  } else {
    errorEl.classList.remove("visible");
  }
};

async function saveTrainer() {
  let isValid = true;

  let trainerfirstName = document.getElementById("tFirstName").value;
  let trainerlastName = document.getElementById("tLastName").value;
  let traineremail = document.getElementById("tEmail").value;
  let trainerphone = document.getElementById("tPhone").value;
  let trainerSpec = document.getElementById("tSpec").value;
  let traineruserName = document.getElementById("tUsername").value;
  let trainerPassword = document.getElementById("tPassword").value;
  let trainerBio = document.getElementById("tBio").value;

  if (trainerfirstName === "" || trainerfirstName.length < 2) {
    tFirstNameCheck();
    isValid = false;
  }
  if (trainerlastName === "") {
    tLastNameCheck();
    isValid = false;
  }
  if (!emailRegex.test(traineremail)) {
    tEmailCheck();
    isValid = false;
  }
  if (trainerphone !== "" && !phoneRegex.test(trainerphone)) {
    tPhoneCheck();
    isValid = false;
  }
  if (trainerSpec === "") {
    tSpecCheck();
    isValid = false;
  }
  if (
    !usernameRegex.test(traineruserName) ||
    isTrainerUsernameTaken(traineruserName, editIndex)
  ) {
    tUsernameCheck();
    isValid = false;
  }
  if (editIndex === null && !passwordRegex.test(trainerPassword)) {
    tPasswordCheck();
    isValid = false;
  }

  if (!isValid) return;

  const trainerObj = {
    trainerfirstName,
    trainerlastName,
    traineremail,
    trainerphone,
    trainerSpec,
    traineruserName,
    trainerPassword,
    trainerBio,
  };

  if (editIndex === null) {
    trainerDetails.push(trainerObj);
    showToast("Trainer added successfully!");
  } else {
    if (!trainerPassword || trainerPassword === "") {
      trainerObj.trainerPassword = trainerDetails[editIndex].trainerPassword;
    }
    trainerDetails[editIndex] = trainerObj;
    showToast("Trainer updated successfully!");
  }

  await saveTrainersToFirebase();
  closeTrainerModal();
  refreshAllDisplays();
}

const displayTrainerCards = () => {
  const container = document.getElementById("trainerCards");
  const emptyEl = document.getElementById("trainersEmpty");

  if (!container) return;

  if (trainerDetails.length === 0) {
    if (emptyEl) emptyEl.style.display = "flex";
    container.innerHTML = "";
    return;
  }
  if (emptyEl) emptyEl.style.display = "none";

  let show = "";
  trainerDetails.forEach((trainer, index) => {
    let initials = (
      trainer.trainerfirstName.charAt(0) + trainer.trainerlastName.charAt(0)
    ).toUpperCase();
    let colorClass =
      index % 3 === 0 ? "gold" : index % 3 === 1 ? "teal" : "purple";

    show += `
            <div class="trainer-card">
                <div class="tc-head ${colorClass}">
                    <div class="tc-av ${colorClass}">${initials}</div>
                    <div class="tc-name">${trainer.trainerfirstName} ${trainer.trainerlastName}</div>
                    <div class="tc-spec">${trainer.trainerSpec}</div>
                </div>
                <div class="tc-body">
                    <div class="tc-detail"><i class="fa-solid fa-envelope"></i> ${trainer.traineremail}</div>
                    <div class="tc-detail"><i class="fa-solid fa-phone"></i> ${trainer.trainerphone || "N/A"}</div>
                    <div class="tc-detail"><i class="fa-solid fa-at"></i> @${trainer.traineruserName}</div>
                    <div class="tc-actions">
                        <button class="tbl-btn tbl-btn-edit" onclick="editTrainer(${index})"><i class="fa-solid fa-pen"></i> Edit</button>
                        <button class="tbl-btn tbl-btn-delete" onclick="deleteModal(${index}, 'trainerDetails')"><i class="fa-solid fa-trash"></i> Delete</button>
                        <button class="tbl-btn tbl-btn-view" onclick="viewTrainer(${index})"><i class="fa-solid fa-eye"></i> View</button>
                    </div>
                </div>
            </div>
        `;
  });
  container.innerHTML = show;
};

const displayTrainerTable = () => {
  const tbody = document.getElementById("trainerAssignBody");
  const emptyEl = document.getElementById("trainerAssignEmpty");

  if (!tbody) return;

  if (trainerDetails.length === 0) {
    if (emptyEl) emptyEl.style.display = "flex";
    tbody.innerHTML = "";
    return;
  }
  if (emptyEl) emptyEl.style.display = "none";

  let show = "";
  trainerDetails.forEach((trainer) => {
    let trainerFullName = `${trainer.trainerfirstName} ${trainer.trainerlastName}`;
    let assignedMembers = allMembers.filter(
      (m) => m.personalInfo.assignedTrainer === trainerFullName,
    );
    let memberNames =
      assignedMembers
        .map((m) => `${m.personalInfo.firstName} ${m.personalInfo.lastName}`)
        .join(", ") || "No members yet";

    let scheduledClasses = classDetails.filter(
      (c) => c.classTrainerUsername === trainer.traineruserName,
    );
    let classNames =
      scheduledClasses.map((c) => c.className).join(", ") || "No classes";

    let status =
      assignedMembers.length > 0 || scheduledClasses.length > 0
        ? "Active"
        : "Idle";
    let statusClass = status === "Active" ? "pill-active" : "pill-expired";

    show += `<tr>
            <td class="td-main">${trainer.trainerfirstName} ${trainer.trainerlastName}<div class="td-sub">@${trainer.traineruserName}</div></td>
            <td>${trainer.trainerSpec}</td>
            <td>${memberNames}</td>
            <td>${classNames}</td>
            <td><span class="pill ${statusClass}"><span class="dot"></span>${status}</span></td>
            <td class="tbl-actions">
                <button class="tbl-btn tbl-btn-edit" onclick="editTrainer(${trainerDetails.indexOf(trainer)})">Edit</button>
                <button class="tbl-btn tbl-btn-delete" onclick="deleteModal(${trainerDetails.indexOf(trainer)}, 'trainerDetails')">Delete</button>
                <button class="tbl-btn tbl-btn-view" onclick="viewTrainer(${trainerDetails.indexOf(trainer)})">View</button>
            </td>
        </td>`;
  });
  tbody.innerHTML = show;
};

const editTrainer = (index) => {
  editIndex = index;
  let trainer = trainerDetails[index];

  document.getElementById("tFirstName").value = trainer.trainerfirstName;
  document.getElementById("tLastName").value = trainer.trainerlastName;
  document.getElementById("tEmail").value = trainer.traineremail;
  document.getElementById("tPhone").value = trainer.trainerphone || "";
  document.getElementById("tSpec").value = trainer.trainerSpec;
  document.getElementById("tUsername").value = trainer.traineruserName;
  document.getElementById("tPassword").value = "";
  document.getElementById("tBio").value = trainer.trainerBio || "";

  document.getElementById("trainerModalTitle").innerHTML =
    "Edit <em>Trainer</em>";
  document.getElementById("saveTrainerBtn").innerHTML =
    '<i class="fa-solid fa-check"></i> Update Trainer';
  document.getElementById("trainerModal").classList.add("open");
};

const viewTrainer = (index) => {
  let trainer = trainerDetails[index];
  let fullName = `${trainer.trainerfirstName} ${trainer.trainerlastName}`;
  let initials = (
    trainer.trainerfirstName.charAt(0) + trainer.trainerlastName.charAt(0)
  ).toUpperCase();

  const tvAvatar = document.getElementById("tvAvatar");
  const tvFullName = document.getElementById("tvFullName");
  const tvUsername = document.getElementById("tvUsername");
  const tvEmail = document.getElementById("tvEmail");
  const tvPhone = document.getElementById("tvPhone");
  const tvSpec = document.getElementById("tvSpec");
  const tvMembersCount = document.getElementById("tvMembersCount");
  const tvStatusPill = document.getElementById("tvStatusPill");

  if (tvAvatar) tvAvatar.innerText = initials;
  if (tvFullName) tvFullName.innerText = fullName;
  if (tvUsername) tvUsername.innerText = `@${trainer.traineruserName}`;
  if (tvEmail) tvEmail.innerText = trainer.traineremail;
  if (tvPhone) tvPhone.innerText = trainer.trainerphone || "N/A";
  if (tvSpec) tvSpec.innerText = trainer.trainerSpec;

  let assignedMembers = allMembers.filter(
    (m) => m.personalInfo.assignedTrainer === fullName,
  );
  if (tvMembersCount) tvMembersCount.innerText = assignedMembers.length;

  if (tvStatusPill) {
    if (assignedMembers.length > 0) {
      tvStatusPill.className = "pill pill-active";
      tvStatusPill.innerHTML = `<span class="dot"></span> Active`;
    } else {
      tvStatusPill.className = "pill pill-expired";
      tvStatusPill.innerHTML = `<span class="dot"></span> Idle`;
    }
  }

  const modal = document.getElementById("viewTrainerModal");
  if (modal) modal.classList.add("open");
};

const closeViewTrainerModal = () => {
  const modal = document.getElementById("viewTrainerModal");
  if (modal) modal.classList.remove("open");
};

// POPULATE DROPDOWNS

const populateTrainerDropdowns = () => {
  const memberTrainerSelect = document.getElementById("mTrainer");
  if (memberTrainerSelect) {
    memberTrainerSelect.innerHTML =
      '<option value="">No trainer assigned</option>';
    trainerDetails.forEach((trainer) => {
      const option = document.createElement("option");
      option.value = trainer.traineruserName;
      option.textContent = `${trainer.trainerfirstName} ${trainer.trainerlastName} (@${trainer.traineruserName})`;
      memberTrainerSelect.appendChild(option);
    });
  }

  const classTrainerSelect = document.getElementById("clsTrainer");
  if (classTrainerSelect) {
    classTrainerSelect.innerHTML = '<option value="">Select trainer</option>';
    trainerDetails.forEach((trainer) => {
      const option = document.createElement("option");
      option.value = trainer.traineruserName;
      option.textContent = `${trainer.trainerfirstName} ${trainer.trainerlastName} (${trainer.trainerSpec})`;
      classTrainerSelect.appendChild(option);
    });
  }
};

const populateMemberDropdown = (id) => {
  const select = document.getElementById(id);
  if (!select) return;

  select.innerHTML = '<option value="">Select Member</option>';
  allMembers.forEach((member) => {
    const fullName = `${member.personalInfo.firstName} ${member.personalInfo.lastName}`;
    const option = document.createElement("option");
    option.value = fullName;
    option.textContent = fullName;
    option.setAttribute("data-plan", member.membership.selectedPlan);
    select.appendChild(option);
  });
};

const setupPaymentAutoFill = () => {
  const payMemberSelect = document.getElementById("payMember");
  if (!payMemberSelect) return;

  payMemberSelect.removeEventListener("change", setupPaymentAutoFill.handler);
  setupPaymentAutoFill.handler = function () {
    const selectedOption = this.options[this.selectedIndex];
    const memberPlan = selectedOption.getAttribute("data-plan");
    const payPlanSelect = document.getElementById("payPlan");
    const payAmountInput = document.getElementById("payAmount");

    if (memberPlan && payPlanSelect) {
      payPlanSelect.value = memberPlan;
      let amount =
        memberPlan === "basic"
          ? 8000
          : memberPlan === "premium"
            ? 15000
            : 25000;
      if (payAmountInput) payAmountInput.value = amount;
    }
  };
  payMemberSelect.addEventListener("change", setupPaymentAutoFill.handler);
};

// PAYMENT RECORDING

const isDuplicatePayment = (memberName, paymentDate) => {
  const paymentDateObj = new Date(paymentDate);
  const paymentMonth = paymentDateObj.getMonth();
  const paymentYear = paymentDateObj.getFullYear();

  return savePaymentDetails.some((payment) => {
    const existingDate = new Date(payment.payDate);
    return (
      payment.payMember === memberName &&
      existingDate.getMonth() === paymentMonth &&
      existingDate.getFullYear() === paymentYear
    );
  });
};

const showReceipt = (payment) => {
  const receiptId = document.getElementById("receiptId");
  const rcptMember = document.getElementById("rcptMember");
  const rcptPlan = document.getElementById("rcptPlan");
  const rcptMethod = document.getElementById("rcptMethod");
  const rcptAmount = document.getElementById("rcptAmount");
  const rcptFrom = document.getElementById("rcptFrom");
  const rcptDuration = document.getElementById("rcptDuration");
  const rcptUntil = document.getElementById("rcptUntil");
  const receiptArea = document.getElementById("receiptArea");

  if (receiptId) receiptId.innerText = "RCPT-" + Date.now();
  if (rcptMember) rcptMember.innerText = payment.payMember;
  if (rcptPlan) rcptPlan.innerText = payment.payPlan;
  if (rcptMethod) rcptMethod.innerText = payment.payMethod;
  if (rcptAmount)
    rcptAmount.innerText = "₦" + Number(payment.payAmount).toLocaleString();
  if (rcptFrom) rcptFrom.innerText = payment.payDate;
  if (rcptDuration) rcptDuration.innerText = "30 days";

  let endDate = new Date(payment.payDate);
  endDate.setDate(endDate.getDate() + 30);
  if (rcptUntil) rcptUntil.innerText = endDate.toDateString();
  if (receiptArea) receiptArea.style.display = "block";
};

function printReceipt() {
  let content = document.getElementById("receiptCard")?.innerHTML;
  if (!content) return;
  let printWindow = window.open("", "", "width=800,height=600");
  printWindow.document.write(`
        <html><head><title>Receipt</title>
        <style>body{font-family:Arial;padding:20px;}</style>
        </head><body>${content}</body></html>
    `);
  printWindow.document.close();
  printWindow.print();
  printWindow.close();
}

async function savePayment() {
  let payMember = document.getElementById("payMember").value;
  let payPlan = document.getElementById("payPlan").value;
  let payMethod = document.getElementById("payMethod").value;
  let payDate = document.getElementById("payDate").value;
  let payAmount = document.getElementById("payAmount").value;
  let payNotes = document.getElementById("payNotes").value;

  if (!payMember || !payPlan || !payMethod || !payDate || !payAmount) {
    showToast("Please fill all required fields", true);
    return;
  }

  if (editIndex === null && isDuplicatePayment(payMember, payDate)) {
    showToast(`Payment for ${payMember} already recorded for this month`, true);
    return;
  }

  let savePaymentObj = {
    payMember,
    payDate,
    payPlan,
    payMethod,
    payAmount: Number(payAmount),
    payNotes,
  };

  if (editIndex === null) {
    savePaymentDetails.push(savePaymentObj);
    showReceipt(savePaymentObj);
    showToast("Payment recorded successfully!");
  } else {
    savePaymentDetails[editIndex] = savePaymentObj;
    editIndex = null;
    showToast("Payment updated successfully!");
  }

  await savePaymentsToFirebase();
  closeSavePayment();
  refreshAllDisplays();
}

const displayPaymentTable = () => {
  let show = "";
  savePaymentDetails.forEach((payDetail, index) => {
    show += `<tr>
            <td class="td-main">${index + 1}</td>
            <td class="td-main">${payDetail.payMember}</td>
            <td>${payDetail.payPlan}</td>
            <td>₦${payDetail.payAmount.toLocaleString()}</td>
            <td>${payDetail.payMethod}</td>
            <td>${payDetail.payDate}</td>
            <td class="tbl-actions">
                <button class="tbl-btn tbl-btn-edit" onclick="editPayment(${index})">Edit</button>
                <button class="tbl-btn tbl-btn-delete" onclick="deletePayment(${index})">Delete</button>
            </td>
        </tr>`;
  });

  const tbody = document.getElementById("paymentTableBody");
  const emptyEl = document.getElementById("paymentsEmpty");
  if (tbody) tbody.innerHTML = show;
  if (emptyEl)
    emptyEl.style.display = savePaymentDetails.length === 0 ? "flex" : "none";
};

const editPayment = (index) => {
  let pay = savePaymentDetails[index];
  document.getElementById("payMember").value = pay.payMember;
  document.getElementById("payPlan").value = pay.payPlan;
  document.getElementById("payMethod").value = pay.payMethod;
  document.getElementById("payDate").value = pay.payDate;
  document.getElementById("payAmount").value = pay.payAmount;
  document.getElementById("payNotes").value = pay.payNotes;
  editIndex = index;
  document.getElementById("paymentModal").classList.add("open");
};

async function deletePayment(index) {
  savePaymentDetails.splice(index, 1);
  await savePaymentsToFirebase();
  refreshAllDisplays();
  showToast("Payment deleted successfully!");
}

const payMonthCategory = (value) => {
  if (value === "all") {
    displayPaymentTable();
    return;
  }

  const selectedMonth = Number(value);
  const filteredPayments = savePaymentDetails.filter((pay) => {
    const payDate = new Date(pay.payDate);
    return payDate.getMonth() + 1 === selectedMonth;
  });

  let show = "";
  filteredPayments.forEach((pay, index) => {
    show += `<tr>
            <td class="td-main">${index + 1}</td>
            <td class="td-main">${pay.payMember}</td>
            <td>${pay.payPlan}</td>
            <td>₦${pay.payAmount.toLocaleString()}</td>
            <td>${pay.payMethod}</td>
            <td>${pay.payDate}</td>
            <td class="tbl-actions">
                <button class="tbl-btn tbl-btn-edit" onclick="editPayment(${savePaymentDetails.indexOf(pay)})">Edit</button>
                <button class="tbl-btn tbl-btn-delete" onclick="deletePayment(${savePaymentDetails.indexOf(pay)})">Delete</button>
            </td>
        </tr>`;
  });

  const tbody = document.getElementById("paymentTableBody");
  const emptyEl = document.getElementById("paymentsEmpty");
  if (tbody) tbody.innerHTML = show;
  if (emptyEl)
    emptyEl.style.display = filteredPayments.length === 0 ? "flex" : "none";
};

const totalRevenue = (ids) => {
  let rev = savePaymentDetails.reduce((sum, p) => sum + Number(p.payAmount), 0);
  ids.forEach((id) => {
    let el = document.getElementById(id);
    if (el) el.innerText = `₦${rev.toLocaleString()}`;
  });
};

const totalPayment = () => {
  let el = document.getElementById("payTotalCount");
  if (el) el.innerText = savePaymentDetails.length;
};

const thisMonthPay = () => {
  const today = new Date();
  let total = savePaymentDetails
    .filter((p) => {
      let d = new Date(p.payDate);
      return (
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      );
    })
    .reduce((sum, p) => sum + Number(p.payAmount), 0);

  let el = document.getElementById("payThisMonth");
  if (el) el.innerText = `₦${total.toLocaleString()}`;
};

const revByPlan = () => {
  let basic = 0,
    premium = 0,
    elite = 0;
  savePaymentDetails.forEach((p) => {
    if (p.payPlan === "basic") basic += Number(p.payAmount);
    else if (p.payPlan === "premium") premium += Number(p.payAmount);
    else if (p.payPlan === "elite") elite += Number(p.payAmount);
  });

  let total = basic + premium + elite || 1;
  const revBasic = document.getElementById("revBasic");
  const revPremium = document.getElementById("revPremium");
  const revElite = document.getElementById("revElite");
  const revBasicBar = document.getElementById("revBasicBar");
  const revPremiumBar = document.getElementById("revPremiumBar");
  const revEliteBar = document.getElementById("revEliteBar");

  if (revBasic) revBasic.innerText = "₦" + basic;
  if (revPremium) revPremium.innerText = "₦" + premium;
  if (revElite) revElite.innerText = "₦" + elite;
  if (revBasicBar) revBasicBar.style.width = (basic / total) * 100 + "%";
  if (revPremiumBar) revPremiumBar.style.width = (premium / total) * 100 + "%";
  if (revEliteBar) revEliteBar.style.width = (elite / total) * 100 + "%";
};

const closeReceiptBtn = document.getElementById("closeReceiptBtn");
if (closeReceiptBtn) {
  closeReceiptBtn.addEventListener("click", () => {
    const receiptArea = document.getElementById("receiptArea");
    if (receiptArea) receiptArea.style.display = "none";
  });
}

// CLASS MANAGEMENT

const displayClassTable = () => {
  let typeFilter = document.getElementById("classTypeFilter")?.value || "all";
  let filtered =
    typeFilter === "all"
      ? [...classDetails]
      : classDetails.filter((c) => c.classType === typeFilter);

  let show = "";
  filtered.forEach((cls, idx) => {
    let realIndex = classDetails.findIndex(
      (c) => c.className === cls.className && c.classTime === cls.classTime,
    );
    let trainerFullName = cls.classTrainerUsername
      ? getTrainerFullNameByUsername(cls.classTrainerUsername)
      : cls.classTrainer || "—";

    show += `<tr>
            <td class="td-main">${idx + 1}</td>
            <td class="td-main">${cls.className}</td>
            <td>${cls.classType}</td>
            <td>${trainerFullName}</td>
            <td>${cls.classDay}</td>
            <td>${cls.classTime}</td>
            <td>${cls.classDuration} min</td>
            <td class="td-main">${cls.classCapacity}</td>
            <td class="tbl-actions">
                <button class="tbl-btn tbl-btn-edit" onclick="editClassInfo(${realIndex})"><i class="fa-solid fa-pen"></i> Edit</button>
                <button class="tbl-btn tbl-btn-delete" onclick="deleteModal(${realIndex}, 'classDetails')"><i class="fa-solid fa-trash"></i> Delete</button>
            </td>
        </tr>`;
  });

  const tbody = document.getElementById("classTableBody");
  const emptyEl = document.getElementById("classTableEmpty");
  if (tbody) tbody.innerHTML = show;
  if (emptyEl) emptyEl.style.display = filtered.length === 0 ? "flex" : "none";
};

const updateClassStats = () => {
  const clsTotal = document.getElementById("clsTotal");
  const clsYoga = document.getElementById("clsYoga");
  const clsZumba = document.getElementById("clsZumba");
  const clsStrength = document.getElementById("clsStrength");

  if (clsTotal) clsTotal.innerText = classDetails.length;
  if (clsYoga)
    clsYoga.innerText = classDetails.filter(
      (c) => c.classType === "yoga",
    ).length;
  if (clsZumba)
    clsZumba.innerText = classDetails.filter(
      (c) => c.classType === "zumba",
    ).length;
  if (clsStrength)
    clsStrength.innerText = classDetails.filter(
      (c) => c.classType === "weight",
    ).length;
};

const classNameCheck = () => {
  let val = document.getElementById("clsName").value;
  let errorEl = document.getElementById("clsNameError");
  if (errorEl) {
    if (val === "") {
      errorEl.style.display = "block";
      return false;
    }
    errorEl.style.display = "none";
  }
  return true;
};

const classTypeCheck = () => {
  let val = document.getElementById("clsType").value;
  let errorEl = document.getElementById("clsTypeError");
  if (errorEl) {
    if (val === "") {
      errorEl.style.display = "block";
      return false;
    }
    errorEl.style.display = "none";
  }
  return true;
};

const classTrainerCheck = () => {
  let val = document.getElementById("clsTrainer").value;
  let errorEl = document.getElementById("clsTrainerError");
  if (errorEl) {
    if (val === "") {
      errorEl.style.display = "block";
      return false;
    }
    errorEl.style.display = "none";
  }
  return true;
};

const classDayCheck = () => {
  let val = document.getElementById("clsDay").value;
  let errorEl = document.getElementById("clsDayError");
  if (errorEl) {
    if (val === "") {
      errorEl.style.display = "block";
      return false;
    }
    errorEl.style.display = "none";
  }
  return true;
};

const classTimeCheck = () => {
  let val = document.getElementById("clsTime").value;
  let errorEl = document.getElementById("clsTimeError");
  if (errorEl) {
    if (val === "") {
      errorEl.style.display = "block";
      return false;
    }
    errorEl.style.display = "none";
  }
  return true;
};

const classDurationCheck = () => {
  let val = document.getElementById("clsDuration").value;
  let errorEl = document.getElementById("clsDurationError");
  if (errorEl) {
    if (val === "" || val < 15) {
      errorEl.style.display = "block";
      return false;
    }
    errorEl.style.display = "none";
  }
  return true;
};

const classCapacityCheck = () => {
  let val = document.getElementById("clsCapacity").value;
  let errorEl = document.getElementById("clsCapacityError");
  if (errorEl) {
    if (val === "" || val < 1) {
      errorEl.style.display = "block";
      return false;
    }
    errorEl.style.display = "none";
  }
  return true;
};

async function saveClass() {
  let isValid = true;
  let className = document.getElementById("clsName").value;
  let classType = document.getElementById("clsType").value;
  let classTrainerUsername = document.getElementById("clsTrainer").value;
  let classDay = document.getElementById("clsDay").value;
  let classTime = document.getElementById("clsTime").value;
  let classDuration = document.getElementById("clsDuration").value;
  let classCapacity = document.getElementById("clsCapacity").value;

  if (!classNameCheck()) isValid = false;
  if (!classTypeCheck()) isValid = false;
  if (!classTrainerCheck()) isValid = false;
  if (!classDayCheck()) isValid = false;
  if (!classTimeCheck()) isValid = false;
  if (!classDurationCheck()) isValid = false;
  if (!classCapacityCheck()) isValid = false;

  if (!isValid) return;

  let classTrainerFullName = classTrainerUsername
    ? getTrainerFullNameByUsername(classTrainerUsername)
    : "";

  let classDetailsObj = {
    className,
    classType,
    classCapacity: Number(classCapacity),
    classDuration: Number(classDuration),
    classDay,
    classTime,
    classTrainer: classTrainerFullName,
    classTrainerUsername,
  };

  if (editClassIndex !== null) {
    classDetails[editClassIndex] = classDetailsObj;
    showToast("Class updated successfully!");
  } else {
    classDetails.push(classDetailsObj);
    showToast("Class added successfully!");
  }

  await saveClassesToFirebase();
  closeClassModal();
  refreshAllDisplays();
}

const editClassInfo = (index) => {
  editClassIndex = index;
  let cls = classDetails[index];

  document.getElementById("clsName").value = cls.className;
  document.getElementById("clsType").value = cls.classType;
  document.getElementById("clsTrainer").value = cls.classTrainerUsername || "";
  document.getElementById("clsDay").value = cls.classDay;
  document.getElementById("clsTime").value = cls.classTime;
  document.getElementById("clsDuration").value = cls.classDuration;
  document.getElementById("clsCapacity").value = cls.classCapacity;

  document.getElementById("classModalTitle").innerHTML = "Edit <em>Class</em>";
  document.getElementById("saveClassBtn").innerHTML =
    '<i class="fa-solid fa-check"></i> Update Class';
  document.getElementById("classModal").classList.add("open");
};

const classTypeCategory = (value) => {
  displayClassTable();
};

// ATTENDANCE TRACKING

const updateAttendanceStats = () => {
  let today = new Date();
  let todayCount = attendanceRecords.filter((r) => {
    let d = new Date(r[2]);
    return d.toDateString() === today.toDateString();
  }).length;

  const attTodayCount = document.getElementById("attTodayCount");
  const attTotalRecords = document.getElementById("attTotalRecords");
  const attAvgRate = document.getElementById("attAvgRate");

  if (attTodayCount) attTodayCount.innerText = todayCount;
  if (attTotalRecords) attTotalRecords.innerText = attendanceRecords.length;

  let rate =
    allMembers.length > 0
      ? Math.round((todayCount / allMembers.length) * 100)
      : 0;
  if (attAvgRate) attAvgRate.innerText = rate + "%";
};

const memberChecklist = () => {
  let searchValue =
    document.getElementById("attMemberSearch")?.value.toLowerCase() || "";
  let filtered = searchValue
    ? allMembers.filter(
        (m) =>
          m.personalInfo.firstName.toLowerCase().includes(searchValue) ||
          m.personalInfo.lastName.toLowerCase().includes(searchValue),
      )
    : allMembers;

  let show = "";
  filtered.forEach((member) => {
    let realIndex = allMembers.findIndex(
      (m) => m.loginInfo.userName === member.loginInfo.userName,
    );
    let details = getMembershipDetails(member);
    let statusClass =
      details.status === "Active" ? "pill-active" : "pill-expired";

    show += `<tr>
            <td class="td-main">${member.personalInfo.firstName} ${member.personalInfo.lastName}<div class="td-sub">${member.loginInfo.userName}</div></td>
            <td>${member.membership.selectedPlan}</td>
            <td><span class="pill ${statusClass}"><span class="dot"></span>${details.status}</span></td>
            <td style="text-align:center;"><input type="checkbox" class="att-check" data-member-id="${realIndex}" /></td>
        </tr>`;
  });

  const tbody = document.getElementById("attChecklistBody");
  const emptyEl = document.getElementById("attChecklistEmpty");
  if (tbody) tbody.innerHTML = show;
  if (emptyEl) emptyEl.style.display = filtered.length === 0 ? "flex" : "none";
};

async function saveAttendance() {
  let selectedDate = document.getElementById("attDatePicker").value;
  if (!selectedDate) {
    showToast("Please select a date", true);
    return;
  }

  let checkedBoxes = document.querySelectorAll(".att-check:checked");
  if (checkedBoxes.length === 0) {
    showToast("No members selected", true);
    return;
  }

  let newRecords = 0;
  checkedBoxes.forEach((box) => {
    let index = box.dataset.memberId;
    let member = allMembers[index];
    let recordName = `${member.personalInfo.firstName} ${member.personalInfo.lastName}`;
    let recordPlan = member.membership.selectedPlan;

    let alreadyExists = attendanceRecords.some(
      (r) => r[0] === recordName && r[2] === selectedDate,
    );
    if (!alreadyExists) {
      attendanceRecords.push([
        recordName,
        recordPlan,
        selectedDate,
        "Present",
        currentUser.name,
      ]);
      newRecords++;
    }
  });

  if (newRecords > 0) {
    await saveAttendanceToFirebase();
    showToast(`Attendance saved for ${newRecords} member(s)!`);
    refreshAllDisplays();
  } else {
    showToast("All selected members already marked for this date", true);
  }
}

const populateAttendanceMemberFilter = () => {
  let select = document.getElementById("attLogMemberFilter");
  if (!select) return;

  select.innerHTML = '<option value="all">All Members</option>';
  allMembers.forEach((member) => {
    let option = document.createElement("option");
    option.value = `${member.personalInfo.firstName} ${member.personalInfo.lastName}`;
    option.textContent = `${member.personalInfo.firstName} ${member.personalInfo.lastName}`;
    select.appendChild(option);
  });
};

const renderAttendanceLog = (data) => {
  let show = "";
  data.forEach((att, index) => {
    let date = new Date(att[2]);
    let dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    show += `<tr>
            <td class="td-main">${index + 1}</td>
            <td class="td-main">${att[0]}</td>
            <td>${att[2]}</td>
            <td>${dayNames[date.getDay()]}</td>
            <td>${att[4] || "Admin"}</td>
        </td>`;
  });

  const tbody = document.getElementById("attLogBody");
  const emptyEl = document.getElementById("attLogEmpty");
  if (tbody) tbody.innerHTML = show;
  if (emptyEl) emptyEl.style.display = data.length === 0 ? "flex" : "none";
};

const displayAttendanceLog = () => {
  let memberFilter =
    document.getElementById("attLogMemberFilter")?.value || "all";
  let monthFilter =
    document.getElementById("attLogMonthFilter")?.value || "all";

  let filtered = [...attendanceRecords];
  if (memberFilter !== "all") {
    filtered = filtered.filter((r) => r[0] === memberFilter);
  }
  if (monthFilter !== "all") {
    filtered = filtered.filter(
      (r) => new Date(r[2]).getMonth() + 1 === parseInt(monthFilter),
    );
  }

  renderAttendanceLog(filtered);
};

const attLogMonthCategory = (value) => {
  displayAttendanceLog();
};

const attMemberSearch = document.getElementById("attMemberSearch");
if (attMemberSearch)
  attMemberSearch.addEventListener("input", () => memberChecklist());

const attLogMemberFilter = document.getElementById("attLogMemberFilter");
if (attLogMemberFilter)
  attLogMemberFilter.addEventListener("change", () => displayAttendanceLog());

const attLogMonthFilter = document.getElementById("attLogMonthFilter");
if (attLogMonthFilter)
  attLogMonthFilter.addEventListener("change", () => displayAttendanceLog());

// ============================================
// REPORTS
// ============================================

const displayReports = () => {
  let active = 0,
    expired = 0,
    basic = 0,
    premium = 0,
    elite = 0;
  allMembers.forEach((m) => {
    let details = getMembershipDetails(m);
    if (details.status === "Active") active++;
    else expired++;
    if (m.membership.selectedPlan === "basic") basic++;
    else if (m.membership.selectedPlan === "premium") premium++;
    else if (m.membership.selectedPlan === "elite") elite++;
  });

  let totalRevenueAmt = savePaymentDetails.reduce(
    (sum, p) => sum + Number(p.payAmount),
    0,
  );
  let todayAtt = attendanceRecords.filter(
    (r) => new Date(r[2]).toDateString() === new Date().toDateString(),
  ).length;

  const rptTotalMembers = document.getElementById("rptTotalMembers");
  const rptActiveMembers = document.getElementById("rptActiveMembers");
  const rptExpiredMembers = document.getElementById("rptExpiredMembers");
  const rptTotalRevenue = document.getElementById("rptTotalRevenue");
  const rptTodayAtt = document.getElementById("rptTodayAtt");

  if (rptTotalMembers) rptTotalMembers.innerText = allMembers.length;
  if (rptActiveMembers) rptActiveMembers.innerText = active;
  if (rptExpiredMembers) rptExpiredMembers.innerText = expired;
  if (rptTotalRevenue)
    rptTotalRevenue.innerText = "₦" + totalRevenueAmt.toLocaleString();
  if (rptTodayAtt) rptTodayAtt.innerText = todayAtt;

  let classCount = {};
  classDetails.forEach(
    (c) => (classCount[c.className] = (classCount[c.className] || 0) + 1),
  );
  let topClass =
    Object.keys(classCount).length > 0
      ? Object.keys(classCount).reduce(
          (a, b) => (classCount[a] > classCount[b] ? a : b),
          "None",
        )
      : "None";
  const rptTopClass = document.getElementById("rptTopClass");
  if (rptTopClass) rptTopClass.innerText = topClass;

  let totalPlans = basic + premium + elite || 1;
  let basicPct = (basic / totalPlans) * 100;
  let premiumPct = (premium / totalPlans) * 100;
  let elitePct = (elite / totalPlans) * 100;

  const donutBasicPct = document.getElementById("donutBasicPct");
  const donutPremiumPct = document.getElementById("donutPremiumPct");
  const donutElitePct = document.getElementById("donutElitePct");
  const donutBasic = document.getElementById("donutBasic");
  const donutPremium = document.getElementById("donutPremium");
  const donutElite = document.getElementById("donutElite");

  if (donutBasicPct) donutBasicPct.innerText = basicPct.toFixed(0) + "%";
  if (donutPremiumPct) donutPremiumPct.innerText = premiumPct.toFixed(0) + "%";
  if (donutElitePct) donutElitePct.innerText = elitePct.toFixed(0) + "%";
  if (donutBasic) donutBasic.style.strokeDasharray = basicPct + " 100";
  if (donutPremium) donutPremium.style.strokeDasharray = premiumPct + " 100";
  if (donutElite) donutElite.style.strokeDasharray = elitePct + " 100";

  let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let counts = [0, 0, 0, 0, 0, 0, 0];
  attendanceRecords.forEach((r) => counts[new Date(r[2]).getDay()]++);
  let max = Math.max(...counts, 1);

  let html = "";
  for (let i = 0; i < days.length; i++) {
    let height = (counts[i] / max) * 100;
    html += `<div class="bar-col"><div class="bar-val">${counts[i]}</div><div class="bar-fill" style="background:var(--teal);height:${height}px;"></div><div class="bar-label">${days[i]}</div></div>`;
  }
  const attBarChart = document.getElementById("attBarChart");
  if (attBarChart) attBarChart.innerHTML = html;

  let basicRev = 0,
    premiumRev = 0,
    eliteRev = 0,
    basicCountP = 0,
    premiumCountP = 0,
    eliteCountP = 0;
  savePaymentDetails.forEach((p) => {
    if (p.payPlan === "basic") {
      basicRev += p.payAmount;
      basicCountP++;
    } else if (p.payPlan === "premium") {
      premiumRev += p.payAmount;
      premiumCountP++;
    } else if (p.payPlan === "elite") {
      eliteRev += p.payAmount;
      eliteCountP++;
    }
  });

  let totalRev = basicRev + premiumRev + eliteRev || 1;
  const revenueBreakdownBody = document.getElementById("revenueBreakdownBody");
  if (revenueBreakdownBody) {
    revenueBreakdownBody.innerHTML = `
            <tr><td class="td-main">Basic</td><td>${basicCountP}</td><td>₦8,000</td><td>₦${basicRev.toLocaleString()}</td><td>${((basicRev / totalRev) * 100).toFixed(1)}%</td>
            <tr><td class="td-main">Premium</td><td>${premiumCountP}</td><td>₦15,000</td><td>₦${premiumRev.toLocaleString()}</td><td>${((premiumRev / totalRev) * 100).toFixed(1)}%</td>
            <tr><td class="td-main">Elite</td><td>${eliteCountP}</td><td>₦25,000</td><td>₦${eliteRev.toLocaleString()}</td><td>${((eliteRev / totalRev) * 100).toFixed(1)}%</td>
        `;
  }

  let classPopHtml = "";
  classDetails.forEach((cls) => {
    let bookings = Math.floor(Math.random() * (cls.classCapacity || 20)) + 5;
    let fillRate = ((bookings / (cls.classCapacity || 20)) * 100).toFixed(1);
    classPopHtml += `<tr><td class="td-main">${cls.className}</td><td>${cls.classType}</td><td>${cls.classTrainer || "—"}</td><td>${bookings}</td><td>${cls.classCapacity || 20}</td><td>${fillRate}%</td></tr>`;
  });
  const classPopularityBody = document.getElementById("classPopularityBody");
  const classPopularityEmpty = document.getElementById("classPopularityEmpty");
  if (classPopularityBody) classPopularityBody.innerHTML = classPopHtml;
  if (classPopularityEmpty)
    classPopularityEmpty.style.display =
      classDetails.length === 0 ? "flex" : "none";
};

// DELETE MODAL

const deleteModal = (index, category) => {
  deleteIndex = index;
  type = category;
  const modal = document.getElementById("deleteModal");
  if (modal) modal.classList.add("open");
};

async function confirmDelete() {
  if (
    type === "allMembers" &&
    deleteIndex !== null &&
    allMembers[deleteIndex]
  ) {
    allMembers.splice(deleteIndex, 1);
    await saveMembersToFirebase();
    showToast("Member deleted successfully!");
    refreshAllDisplays();
  } else if (
    type === "trainerDetails" &&
    deleteIndex !== null &&
    trainerDetails[deleteIndex]
  ) {
    trainerDetails.splice(deleteIndex, 1);
    await saveTrainersToFirebase();
    showToast("Trainer deleted successfully!");
    refreshAllDisplays();
  } else if (
    type === "classDetails" &&
    deleteIndex !== null &&
    classDetails[deleteIndex]
  ) {
    classDetails.splice(deleteIndex, 1);
    await saveClassesToFirebase();
    showToast("Class deleted successfully!");
    refreshAllDisplays();
  }
  closeDeleteModal();
  deleteIndex = null;
  type = "";
}

// ============================================
// REFRESH ALL DISPLAYS
// ============================================

const refreshAllDisplays = () => {
  const sbBadgeMembers = document.getElementById("sbBadgeMembers");
  const sbBadgeTrainers = document.getElementById("sbBadgeTrainers");
  const sbBadgeClasses = document.getElementById("sbBadgeClasses");
  if (sbBadgeMembers) sbBadgeMembers.innerText = allMembers.length;
  if (sbBadgeTrainers) sbBadgeTrainers.innerText = trainerDetails.length;
  if (sbBadgeClasses) sbBadgeClasses.innerText = classDetails.length;

  let activeCount = 0,
    expiredCount = 0;
  allMembers.forEach((m) => {
    let details = getMembershipDetails(m);
    if (details.status === "Active") activeCount++;
    else expiredCount++;
  });

  const ovTotalMembers = document.getElementById("ovTotalMembers");
  const ovActiveMembers = document.getElementById("ovActiveMembers");
  const ovExpiredMembers = document.getElementById("ovExpiredMembers");
  const ovTrainers = document.getElementById("ovTrainers");
  const ovClasses = document.getElementById("ovClasses");

  if (ovTotalMembers) ovTotalMembers.innerText = allMembers.length;
  if (ovActiveMembers) ovActiveMembers.innerText = activeCount;
  if (ovExpiredMembers) ovExpiredMembers.innerText = expiredCount;
  if (ovTrainers) ovTrainers.innerText = trainerDetails.length;
  if (ovClasses) ovClasses.innerText = classDetails.length;

  let todayAtt = attendanceRecords.filter((r) => {
    let d = new Date(r[2]);
    let today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;
  const ovTodayAtt = document.getElementById("ovTodayAtt");
  if (ovTodayAtt) ovTodayAtt.innerText = todayAtt;

  const memTotal = document.getElementById("memTotal");
  const memActive = document.getElementById("memActive");
  const memExpired = document.getElementById("memExpired");
  if (memTotal) memTotal.innerText = allMembers.length;
  if (memActive) memActive.innerText = activeCount;
  if (memExpired) memExpired.innerText = expiredCount;

  totalRevenue(["payTotalRevenue", "ovTotalRevenue"]);
  totalPayment();
  thisMonthPay();
  revByPlan();

  populateTrainerDropdowns();
  populateMemberDropdown("payMember");
  setupPaymentAutoFill();
  populateAttendanceMemberFilter();

  displayMembersTable();
  displayTrainerCards();
  displayTrainerTable();
  displayClassTable();
  updateClassStats();
  displayPaymentTable();
  updateAttendanceStats();
  memberChecklist();
  displayAttendanceLog();
  displayReports();
  updateRecentActivity();
  updateExpiredList();
};

const todayAttendance = () => {
  let todayAtt = attendanceRecords.filter(
    (r) => new Date(r[2]).toDateString() === new Date().toDateString(),
  ).length;
  const ovTodayAtt = document.getElementById("ovTodayAtt");
  if (ovTodayAtt) ovTodayAtt.innerText = todayAtt;
};

// RECENT ACTIVITY & EXPIRED LIST

const updateRecentActivity = () => {
  let recent = [...savePaymentDetails].reverse().slice(0, 5);
  let feed = document.getElementById("activityFeed");
  let empty = document.getElementById("activityEmpty");

  if (!feed) return;

  if (recent.length === 0) {
    if (empty) empty.style.display = "flex";
    feed.innerHTML = "";
    return;
  }
  if (empty) empty.style.display = "none";
  feed.innerHTML = "";
  recent.forEach((p) => {
    let div = document.createElement("div");
    div.className = "activity-item";
    div.innerHTML = `
            <div class="act-icon gold"><i class="fa-solid fa-receipt"></i></div>
            <div class="act-info"><div class="act-text">Payment recorded for <strong>${p.payMember}</strong> — ₦${p.payAmount.toLocaleString()}</div><div class="act-time">${p.payDate}</div></div>
            <div class="act-badge pill-active">${p.payPlan}</div>
        `;
    feed.appendChild(div);
  });
};

const updateExpiredList = () => {
  let expired = allMembers
    .filter((m) => getMembershipDetails(m).status === "Expired")
    .slice(0, 5);
  let container = document.getElementById("expiredList");
  let empty = document.getElementById("expiredEmpty");

  if (!container) return;

  if (expired.length === 0) {
    if (empty) empty.style.display = "flex";
    container.innerHTML = "";
    return;
  }
  if (empty) empty.style.display = "none";
  container.innerHTML = "";
  expired.forEach((m) => {
    let details = getMembershipDetails(m);
    let initials = (
      m.personalInfo.firstName.charAt(0) + m.personalInfo.lastName.charAt(0)
    ).toUpperCase();
    let div = document.createElement("div");
    div.className = "expired-item";
    div.innerHTML = `
            <div class="expired-av">${initials}</div>
            <div><div class="expired-name">${m.personalInfo.firstName} ${m.personalInfo.lastName}</div><div class="expired-plan">${m.membership.selectedPlan} plan</div></div>
            <div class="expired-date">Expired ${details.expiryDate.toDateString()}</div>
        `;
    container.appendChild(div);
  });
};

// INITIALIZATION

document.addEventListener("DOMContentLoaded", async () => {
  if (window.db) {
    db = window.db;
    await loadAllDataFromFirebase();
  }

  updateRecentActivity();
  updateExpiredList();
  loadAdminProfile();

  let today = new Date().toISOString().split("T")[0];
  let datePicker = document.getElementById("attDatePicker");
  if (datePicker) datePicker.value = today;

  document.querySelectorAll(".sb-link").forEach((link) => {
    link.addEventListener("click", () => {
      const page = link.getAttribute("data-page");
      if (page === "overview") overview();
      else if (page === "members") memberManagement();
      else if (page === "trainers") trainerManagement();
      else if (page === "classes") classSchedulling();
      else if (page === "payments") paymentRecording();
      else if (page === "attendance") attendanceTracking();
      else if (page === "reports") reports();
    });
  });

  document
    .querySelectorAll(".ws-quick-btn, .sec-label-action")
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        const page = btn.getAttribute("data-page");
        if (page === "members") memberManagement();
        else if (page === "trainers") trainerManagement();
        else if (page === "classes") classSchedulling();
        else if (page === "attendance") attendanceTracking();
      });
    });

  const memberSearch = document.getElementById("memberSearch");
  const memberPlanFilter = document.getElementById("memberPlanFilter");
  const memberStatusFilter = document.getElementById("memberStatusFilter");

  if (memberSearch)
    memberSearch.addEventListener("input", () => displayMembersTable());
  if (memberPlanFilter)
    memberPlanFilter.addEventListener("change", () => displayMembersTable());
  if (memberStatusFilter)
    memberStatusFilter.addEventListener("change", () => displayMembersTable());

  const menuToggle = document.getElementById("menuToggle");
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      const sidebar = document.getElementById("sidebar");
      if (sidebar) sidebar.classList.toggle("open");
    });
  }

  const adminLogoutBtn = document.getElementById("adminLogoutBtn");
  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener("click", () => {
      localStorage.removeItem("currentUser");
      window.location.href = "login.html";
    });
  }

  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.remove("open");
    });
  });
});
