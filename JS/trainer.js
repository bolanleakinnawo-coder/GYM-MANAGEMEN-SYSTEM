// TRAINER DASHBOARD JS - WITH FIREBASE
// ============================================

// ============================================
// FIREBASE REFERENCE
// ============================================
let db = window.db;

// ============================================
// STORED DATA - Will be loaded from Firebase
// ============================================
let allMembers = [];
let classDetails = [];
let attendanceRecords = [];
let trainerDetails = [];

// ============================================
// SECURITY CHECK - FIXED
// ============================================

let currentUser = JSON.parse(localStorage.getItem("currentUser"));

// If no user is logged in, go to login page
if (!currentUser) {
  window.location.href = "login.html";
  throw new Error("Access denied. Please login first.");
}

// If logged in but NOT trainer, go to login page
if (currentUser.role !== "trainer") {
  // Clear the invalid session
  localStorage.removeItem("currentUser");
  localStorage.removeItem("currentMember");
  // Redirect to login page
  window.location.href = "login.html";
  throw new Error("Unauthorized access. Please login as trainer.");
}

console.log("✅ Logged in as Trainer:", currentUser.name);

// CURRENT TRAINER
let currentTrainer = JSON.parse(localStorage.getItem("currentUser"));

// AUTH CHECK
if (!currentTrainer || currentTrainer.role !== "trainer") {
  window.location.href = "login.html";
}

// GET TRAINER FULL DATA
let loggedInTrainer = null;

// ============================================
// LOAD DATA FROM FIREBASE
// ============================================

async function loadFirebaseData() {
  console.log("Loading trainer data from Firebase...");

  const membersSnapshot = await get(child(ref(db), "members"));
  if (membersSnapshot.exists()) {
    allMembers = membersSnapshot.val();
  }

  const classesSnapshot = await get(child(ref(db), "classes"));
  if (classesSnapshot.exists()) {
    classDetails = classesSnapshot.val();
  }

  const attendanceSnapshot = await get(child(ref(db), "attendance"));
  if (attendanceSnapshot.exists()) {
    attendanceRecords = attendanceSnapshot.val();
  }

  const trainersSnapshot = await get(child(ref(db), "trainers"));
  if (trainersSnapshot.exists()) {
    trainerDetails = trainersSnapshot.val();
  }

  // Find logged in trainer
  for (let trainer of trainerDetails) {
    if (trainer.traineruserName === currentTrainer.name) {
      loggedInTrainer = trainer;
      break;
    }
  }

  console.log("Trainer data loaded from Firebase!");

  // Initialize dashboard after data is loaded
  init();
}

// ============================================
// SAVE DATA TO FIREBASE
// ============================================

async function saveTrainersToFirebase() {
  await set(ref(db, "trainers"), trainerDetails);
  console.log("Trainers saved to Firebase");
}

async function saveAttendanceToFirebase() {
  await set(ref(db, "attendance"), attendanceRecords);
  console.log("Attendance saved to Firebase");
}

// HELPER: Get trainer's full name
const getTrainerFullName = () => {
  if (loggedInTrainer) {
    return `${loggedInTrainer.trainerfirstName} ${loggedInTrainer.trainerlastName}`;
  }
  return currentTrainer.name || "Trainer";
};

// HELPER: Get trainer's specialisation
const getTrainerSpec = () => {
  return loggedInTrainer ? loggedInTrainer.trainerSpec : "Fitness Trainer";
};

// HELPER: Get trainer's email
const getTrainerEmail = () => {
  return loggedInTrainer ? loggedInTrainer.traineremail : "";
};

// HELPER: Get trainer's phone
const getTrainerPhone = () => {
  return loggedInTrainer ? loggedInTrainer.trainerphone : "";
};

// HELPER: Get classes assigned to this trainer
const getMyClasses = () => {
  const trainerName = getTrainerFullName();
  return classDetails.filter((cls) => cls.classTrainer === trainerName);
};

// HELPER: Get members assigned to this trainer
const getMyMembers = () => {
  const trainerName = getTrainerFullName();
  return allMembers.filter(
    (member) => member.personalInfo.assignedTrainer === trainerName,
  );
};

// HELPER: Get membership details (same as admin)
function getMembershipDetails(member) {
  let startDate = new Date(member.membership.startDate);
  let expiryDate = new Date(startDate);
  let plan = member.membership.selectedPlan;

  if (plan === "basic") expiryDate.setDate(expiryDate.getDate() + 30);
  else if (plan == "premium") expiryDate.setDate(expiryDate.getDate() + 30);
  else if (plan == "elite") expiryDate.setDate(expiryDate.getDate() + 30);

  let today = new Date();
  let status = today >= expiryDate ? "Expired" : "Active";

  return { startDate, expiryDate, status };
}

// ============================================
// SET WELCOME DATE & TIME
// ============================================
const setDate = () => {
  let today = new Date();
  let options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  document.getElementById("tbDate").innerText = today.toLocaleDateString(
    "en-US",
    options,
  );
  document.getElementById("todayLabel").innerText = today.toLocaleDateString(
    "en-US",
    { weekday: "long", month: "long", day: "numeric" },
  );
};
setDate();

// ============================================
// LOAD TRAINER PROFILE
// ============================================
const loadTrainerProfile = () => {
  const fullName = getTrainerFullName();
  const initials = (fullName.charAt(0) || "T").toUpperCase();
  const spec = getTrainerSpec();

  // Sidebar
  document.getElementById("sbAv").innerText = initials;
  document.getElementById("sbName").innerText =
    fullName.split(" ")[0] || "Trainer";
  document.getElementById("sbSpec").innerText = spec;

  // Welcome banner
  document.getElementById("wbName").innerText = fullName;
  document.getElementById("pmAv").innerText = initials;
  document.getElementById("pmName").innerText = fullName;
  document.getElementById("pmSpec").innerText = spec;

  // Profile page
  document.getElementById("profAv").innerText = initials;
  document.getElementById("profNm").innerText = fullName;
  document.getElementById("profUsername").innerText = currentTrainer.name;
  document.getElementById("profEmail").innerText = getTrainerEmail() || "—";
  document.getElementById("profPhone").innerText = getTrainerPhone() || "—";
  document.getElementById("profSpec").innerText = spec;

  // Profile form
  if (loggedInTrainer) {
    document.getElementById("editFirst").value =
      loggedInTrainer.trainerfirstName || "";
    document.getElementById("editLast").value =
      loggedInTrainer.trainerlastName || "";
    document.getElementById("editEmail").value =
      loggedInTrainer.traineremail || "";
    document.getElementById("editPhone").value =
      loggedInTrainer.trainerphone || "";
    document.getElementById("editSpec").value =
      loggedInTrainer.trainerSpec || "";
    document.getElementById("editBio").value = loggedInTrainer.trainerBio || "";
  }
};

// ============================================
// SIDEBAR & NAVIGATION
// ============================================
const setActiveSidebarLink = (pageName) => {
  document
    .querySelectorAll(".sb-link")
    .forEach((link) => link.classList.remove("active"));
  const activeLink = document.querySelector(
    `.sb-link[data-page="${pageName}"]`,
  );
  if (activeLink) activeLink.classList.add("active");
  document.getElementById("tbCrumb").innerText =
    document.querySelector(`.sb-link[data-page="${pageName}"] .sb-link-text`)
      ?.innerText || pageName;
};

const showPage = (pageName) => {
  document
    .querySelectorAll(".page-panel")
    .forEach((page) => page.classList.remove("active"));
  document.getElementById(`page-${pageName}`).classList.add("active");
  setActiveSidebarLink(pageName);

  // Refresh data when switching pages
  if (pageName === "overview") refreshOverview();
  else if (pageName === "classes") renderMyClasses();
  else if (pageName === "members") renderMyMembers();
  else if (pageName === "attendance") {
    renderCalendar();
    renderAttendanceLog();
    updateAttendanceStats();
  }
};

// Sidebar click handlers
document.querySelectorAll(".sb-link").forEach((link) => {
  link.addEventListener("click", () => {
    const page = link.getAttribute("data-page");
    if (page) showPage(page);
  });
});

// Quick nav from overview
document.querySelectorAll(".sec-lbl-a").forEach((link) => {
  link.addEventListener("click", () => {
    const page = link.getAttribute("data-page");
    if (page) showPage(page);
  });
});

// Mobile menu toggle
document.getElementById("menuToggle")?.addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
});

// Logout
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
});

// ============================================
// UPDATE COUNTS (Sidebar badges)
// ============================================
const updateCounts = () => {
  const myClasses = getMyClasses();
  const myMembers = getMyMembers();

  document.getElementById("sbCntClasses").innerText = myClasses.length;
  document.getElementById("sbCntMembers").innerText = myMembers.length;
  document.getElementById("pmClasses").innerText = myClasses.length;
  document.getElementById("pmMembers").innerText = myMembers.length;
  document.getElementById("profClasses").innerText = myClasses.length;
  document.getElementById("profMembers").innerText = myMembers.length;
};

// ============================================
// OVERVIEW PAGE
// ============================================
const refreshOverview = () => {
  const myClasses = getMyClasses();
  const myMembers = getMyMembers();
  const trainerName = getTrainerFullName();

  // Stats
  document.getElementById("ovClasses").innerText = myClasses.length;
  document.getElementById("ovMembers").innerText = myMembers.length;

  // Today's classes
  const today = new Date();
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const todayName = days[today.getDay()];

  const todayClasses = myClasses.filter((cls) => cls.classDay === todayName);
  document.getElementById("ovToday").innerText = todayClasses.length;

  // This week's classes (all classes for weekdays)
  document.getElementById("ovWeek").innerText = myClasses.length;

  // Today's schedule list
  const todayList = document.getElementById("todayList");
  const todayEmpty = document.getElementById("todayEmpty");

  if (todayClasses.length === 0) {
    todayEmpty.style.display = "flex";
    todayList.innerHTML = "";
    todayList.appendChild(todayEmpty);
  } else {
    todayEmpty.style.display = "none";
    todayList.innerHTML = "";
    todayClasses.forEach((cls) => {
      const typeClass = getClassTypeClass(cls.classType);
      const badgeClass = getBadgeClass(cls.classType);
      const typeLabel = getTypeLabel(cls.classType);
      const endTime = getEndTime(cls.classTime, cls.classDuration);

      const div = document.createElement("div");
      div.className = `tc-item ${typeClass}`;
      div.innerHTML = `
                <div class="tci-time">
                    <div class="tci-start">${cls.classTime || "--:--"}</div>
                    <div class="tci-end">${endTime}</div>
                </div>
                <div class="tci-div"></div>
                <div class="tci-info">
                    <div class="tci-name">${cls.className}</div>
                    <div class="tci-det"><i class="fa-solid fa-clock"></i> ${cls.classDuration || 0} min</div>
                </div>
                <div class="tci-members">
                    <div class="tci-num">—</div>
                    <div class="tci-lbl">capacity ${cls.classCapacity || 0}</div>
                </div>
            `;
      todayList.appendChild(div);
    });
  }

  // Quick members list (first 5)
  const quickMembers = document.getElementById("quickMembers");
  const quickEmpty = document.getElementById("quickMembersEmpty");

  if (myMembers.length === 0) {
    quickEmpty.style.display = "flex";
    quickMembers.innerHTML = "";
    quickMembers.appendChild(quickEmpty);
  } else {
    quickEmpty.style.display = "none";
    quickMembers.innerHTML = "";
    const displayMembers = myMembers.slice(0, 5);
    displayMembers.forEach((member) => {
      const details = getMembershipDetails(member);
      const statusClass =
        details.status === "Active" ? "pill-active" : "pill-expired";
      const statusText = details.status;
      const initials = (
        member.personalInfo.firstName.charAt(0) +
        member.personalInfo.lastName.charAt(0)
      ).toUpperCase();

      const div = document.createElement("div");
      div.className = "info-row";
      div.innerHTML = `
                <span class="info-key"><i class="fa-solid fa-user"></i> ${member.personalInfo.firstName} ${member.personalInfo.lastName}</span>
                <span class="info-val"><span class="pill ${statusClass}" style="font-size:10px;"><span class="dot"></span>${statusText}</span></span>
            `;
      quickMembers.appendChild(div);
    });
    if (myMembers.length > 5) {
      const moreDiv = document.createElement("div");
      moreDiv.className = "info-row";
      moreDiv.innerHTML = `<span class="info-key"><i class="fa-solid fa-ellipsis"></i> +${myMembers.length - 5} more members</span>`;
      quickMembers.appendChild(moreDiv);
    }
  }

  // Week schedule table
  renderWeekTable(myClasses);
};

const getClassTypeClass = (type) => {
  const map = {
    yoga: "yoga",
    zumba: "zumba",
    weight: "weight",
    aerobics: "aerobics",
    hiit: "hiit",
  };
  return map[type] || "yoga";
};

const getBadgeClass = (type) => {
  const map = {
    yoga: "pill-yoga",
    zumba: "pill-zumba",
    weight: "pill-weight",
    aerobics: "pill-aerobics",
    hiit: "pill-hiit",
  };
  return map[type] || "pill-yoga";
};

const getTypeLabel = (type) => {
  const map = {
    yoga: "Yoga",
    zumba: "Zumba",
    weight: "Weight Training",
    aerobics: "Aerobics",
    hiit: "HIIT",
  };
  return map[type] || type;
};

const getEndTime = (startTime, duration) => {
  if (!startTime || !duration) return "";
  const [h, m] = startTime.split(":").map(Number);
  const endTotal = h * 60 + m + Number(duration);
  const endH = Math.floor(endTotal / 60) % 24;
  const endM = endTotal % 60;
  return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
};

const renderWeekTable = (classes) => {
  const tbody = document.getElementById("weekBody");
  const weekEmpty = document.getElementById("weekEmpty");
  const dayOrder = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const dayNames = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  if (classes.length === 0) {
    weekEmpty.style.display = "flex";
    tbody.innerHTML = "";
    return;
  }
  weekEmpty.style.display = "none";

  let html = "";
  classes.forEach((cls) => {
    const dayIndex = dayOrder.indexOf(cls.classDay);
    const dayName = dayNames[dayIndex] || cls.classDay;
    const typeLabel = getTypeLabel(cls.classType);
    const badgeClass = getBadgeClass(cls.classType);

    html += `<tr>
            <td class="tdm">${dayName}</td>
            <td>${cls.className}</td>
            <td><span class="pill ${badgeClass}" style="font-size:10px;">${typeLabel}</span></td>
            <td>${cls.classTime || "--:--"}</td>
            <td>${cls.classDuration || 0} min</td>
            <td>—</td>
            <td>${cls.classCapacity || 0}</td>
        </tr>`;
  });
  tbody.innerHTML = html;
};

// ============================================
// MY CLASSES PAGE
// ============================================
const renderMyClasses = (dayFilter = "all") => {
  let myClasses = getMyClasses();
  const container = document.getElementById("classList");
  const empty = document.getElementById("classEmpty");

  if (dayFilter !== "all") {
    myClasses = myClasses.filter((cls) => cls.classDay === dayFilter);
  }

  if (myClasses.length === 0) {
    empty.style.display = "flex";
    container.innerHTML = "";
    container.appendChild(empty);
    return;
  }
  empty.style.display = "none";
  container.innerHTML = "";

  // Update stats
  const today = new Date();
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const todayName = days[today.getDay()];
  const todayClasses = myClasses.filter((cls) => cls.classDay === todayName);

  let totalEnrolled = 0;
  myClasses.forEach(
    (cls) =>
      (totalEnrolled +=
        Math.floor(Math.random() * (cls.classCapacity || 20)) + 5),
  );

  document.getElementById("clsTotal").innerText = myClasses.length;
  document.getElementById("clsToday").innerText = todayClasses.length;
  document.getElementById("clsWeek").innerText = myClasses.length;
  document.getElementById("clsEnrolled").innerText = totalEnrolled;

  // Render cards
  myClasses.forEach((cls) => {
    const typeClass = getClassTypeClass(cls.classType);
    const badgeClass = getBadgeClass(cls.classType);
    const typeLabel = getTypeLabel(cls.classType);
    const endTime = getEndTime(cls.classTime, cls.classDuration);
    const enrolled = Math.floor(Math.random() * (cls.classCapacity || 20)) + 5;

    const card = document.createElement("div");
    card.className = `cls-card ${typeClass}`;
    card.setAttribute("data-day", cls.classDay);
    card.innerHTML = `
            <div class="cc-time">
                <div class="cc-ts">${cls.classTime || "--:--"}</div>
                <div class="cc-te">${endTime}</div>
            </div>
            <div>
                <div class="cc-badge ${badgeClass}">${typeLabel}</div>
                <div class="cc-name">${cls.className}</div>
                <div class="cc-dets">
                    <div class="cc-det"><i class="fa-solid fa-calendar"></i> ${capitalizeFirst(cls.classDay)}</div>
                    <div class="cc-det"><i class="fa-solid fa-clock"></i> ${cls.classDuration} mins</div>
                </div>
            </div>
            <div class="cc-right">
                <div class="cc-num">${enrolled}</div>
                <div class="cc-lbl">enrolled</div>
                <div class="cc-cap">of ${cls.classCapacity} slots</div>
            </div>
        `;
    container.appendChild(card);
  });
};

const capitalizeFirst = (str) => {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
};

// Day filter tabs
document.querySelectorAll(".day-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document
      .querySelectorAll(".day-tab")
      .forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    renderMyClasses(tab.getAttribute("data-day"));
  });
});

// ============================================
// MY MEMBERS PAGE
// ============================================
const renderMyMembers = () => {
  let myMembers = getMyMembers();
  const searchValue =
    document.getElementById("memSearch")?.value.toLowerCase() || "";
  const statusFilter = document.getElementById("memStatus")?.value || "all";
  const planFilter = document.getElementById("memPlan")?.value || "all";

  // Apply filters
  let filtered = [...myMembers];
  if (searchValue) {
    filtered = filtered.filter(
      (m) =>
        m.personalInfo.firstName.toLowerCase().includes(searchValue) ||
        m.personalInfo.lastName.toLowerCase().includes(searchValue) ||
        m.personalInfo.email.toLowerCase().includes(searchValue),
    );
  }

  filtered = filtered.filter((m) => {
    const details = getMembershipDetails(m);
    if (statusFilter !== "all" && details.status.toLowerCase() !== statusFilter)
      return false;
    if (planFilter !== "all" && m.membership.selectedPlan !== planFilter)
      return false;
    return true;
  });

  // Stats
  let activeCount = 0,
    expiredCount = 0;
  myMembers.forEach((m) => {
    const details = getMembershipDetails(m);
    if (details.status === "Active") activeCount++;
    else expiredCount++;
  });

  document.getElementById("memTotal").innerText = myMembers.length;
  document.getElementById("memActive").innerText = activeCount;
  document.getElementById("memExpired").innerText = expiredCount;

  // Cards view
  const cardsContainer = document.getElementById("memCards");
  const cardsEmpty = document.getElementById("memEmpty");

  if (filtered.length === 0) {
    cardsEmpty.style.display = "flex";
    cardsContainer.innerHTML = "";
    cardsContainer.appendChild(cardsEmpty);
  } else {
    cardsEmpty.style.display = "none";
    cardsContainer.innerHTML = "";
    filtered.forEach((member) => {
      const details = getMembershipDetails(member);
      const statusClass =
        details.status === "Active" ? "pill-active" : "pill-expired";
      const statusText = details.status;
      const initials = (
        member.personalInfo.firstName.charAt(0) +
        member.personalInfo.lastName.charAt(0)
      ).toUpperCase();
      const planDisplay =
        member.membership.selectedPlan.charAt(0).toUpperCase() +
        member.membership.selectedPlan.slice(1);

      const card = document.createElement("div");
      card.className = "mem-card";
      card.innerHTML = `
                <div class="mc-top">
                    <div class="mc-av">${initials}</div>
                    <div>
                        <div class="mc-nm">${member.personalInfo.firstName} ${member.personalInfo.lastName}</div>
                        <div class="mc-id">${member.loginInfo.userName}</div>
                    </div>
                </div>
                <div class="mc-body">
                    <div class="mc-row"><span class="mc-key"><i class="fa-solid fa-star"></i>Plan</span><span class="mc-val">${planDisplay}</span></div>
                    <div class="mc-row"><span class="mc-key"><i class="fa-solid fa-calendar-xmark"></i>Expires</span><span class="mc-val">${details.expiryDate.toDateString()}</span></div>
                    <div class="mc-row"><span class="mc-key"><i class="fa-solid fa-circle-dot"></i>Status</span><span class="mc-val"><span class="pill ${statusClass}"><span class="dot"></span>${statusText}</span></span></div>
                    <div class="mc-row"><span class="mc-key"><i class="fa-solid fa-phone"></i>Phone</span><span class="mc-val">${member.personalInfo.phone || "—"}</span></div>
                </div>
            `;
      cardsContainer.appendChild(card);
    });
  }

  // Table view
  renderMembersTable(filtered);
};

const renderMembersTable = (members) => {
  const tbody = document.getElementById("memTableBody");
  const tableEmpty = document.getElementById("memTableEmpty");

  if (members.length === 0) {
    tableEmpty.style.display = "flex";
    tbody.innerHTML = "";
    return;
  }
  tableEmpty.style.display = "none";

  let html = "";
  members.forEach((member, idx) => {
    const details = getMembershipDetails(member);
    const statusClass =
      details.status === "Active" ? "pill-active" : "pill-expired";

    html += `<tr>
            <td class="tdm">${idx + 1}</td>
            <td class="tdm">${member.personalInfo.firstName} ${member.personalInfo.lastName}</td>
            <td>${member.personalInfo.email}</td>
            <td>${member.personalInfo.phone || "—"}</td>
            <td>${member.membership.selectedPlan}</td>
            <td>${details.startDate.toDateString()}</td>
            <td>${details.expiryDate.toDateString()}</td>
            <td><span class="pill ${statusClass}"><span class="dot"></span>${details.status}</span></td>
        </tr>`;
  });
  tbody.innerHTML = html;
};

// Filter event listeners
document
  .getElementById("memSearch")
  ?.addEventListener("input", () => renderMyMembers());
document
  .getElementById("memStatus")
  ?.addEventListener("change", () => renderMyMembers());
document
  .getElementById("memPlan")
  ?.addEventListener("change", () => renderMyMembers());

// ============================================
// ATTENDANCE PAGE
// ============================================
let currentCalYear = new Date().getFullYear();
let currentCalMonth = new Date().getMonth();

const getDaysWithClasses = () => {
  const myClasses = getMyClasses();
  const daysWithClasses = new Set();
  myClasses.forEach((cls) => daysWithClasses.add(cls.classDay));
  return daysWithClasses;
};

const renderCalendar = () => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  document.getElementById("calTitle").innerText =
    `${monthNames[currentCalMonth]} ${currentCalYear}`;

  const grid = document.getElementById("calGrid");
  grid.innerHTML = "";

  const daysWithClasses = getDaysWithClasses();
  const today = new Date();
  const firstDay = new Date(currentCalYear, currentCalMonth, 1).getDay();
  const daysInMonth = new Date(
    currentCalYear,
    currentCalMonth + 1,
    0,
  ).getDate();

  // Map day numbers to day names
  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  // Empty cells
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "cal-day empty";
    grid.appendChild(empty);
  }

  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement("div");
    cell.className = "cal-day";
    cell.innerText = d;

    const date = new Date(currentCalYear, currentCalMonth, d);
    const dayName = dayNames[date.getDay()];

    const isToday =
      d === today.getDate() &&
      currentCalMonth === today.getMonth() &&
      currentCalYear === today.getFullYear();
    const hasClass = daysWithClasses.has(dayName);

    if (isToday) cell.classList.add("today");
    if (hasClass) cell.classList.add("has-cls");

    grid.appendChild(cell);
  }
};

document.getElementById("calPrev")?.addEventListener("click", () => {
  currentCalMonth--;
  if (currentCalMonth < 0) {
    currentCalMonth = 11;
    currentCalYear--;
  }
  renderCalendar();
});

document.getElementById("calNext")?.addEventListener("click", () => {
  currentCalMonth++;
  if (currentCalMonth > 11) {
    currentCalMonth = 0;
    currentCalYear++;
  }
  renderCalendar();
});

const updateAttendanceStats = () => {
  const myClasses = getMyClasses();
  const classNames = myClasses.map((c) => c.className);

  // Filter attendance for trainer's classes
  const myAttendance = attendanceRecords.filter((record) =>
    classNames.includes(record[1]),
  );

  // Today's attendance
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const todayAtt = myAttendance.filter((a) => a[2] === todayStr).length;
  document.getElementById("attToday").innerText = todayAtt;
  document.getElementById("attTotal").innerText = myAttendance.length;

  // Attendance rate (approximate)
  const rate =
    myAttendance.length > 0
      ? Math.min(
          100,
          Math.round((myAttendance.length / (myClasses.length * 10)) * 100),
        )
      : 0;
  document.getElementById("attRate").innerText = rate + "%";

  // Populate class filter dropdown
  const classFilter = document.getElementById("attClassFilter");
  classFilter.innerHTML = '<option value="all">All Classes</option>';
  myClasses.forEach((cls) => {
    const option = document.createElement("option");
    option.value = cls.className;
    option.innerText = cls.className;
    classFilter.appendChild(option);
  });
};

const renderAttendanceLog = () => {
  const myClasses = getMyClasses();
  const classNames = myClasses.map((c) => c.className);
  let filteredRecords = attendanceRecords.filter((record) =>
    classNames.includes(record[1]),
  );

  // Apply filters
  const classFilter = document.getElementById("attClassFilter")?.value || "all";
  const monthFilter = document.getElementById("attMonthFilter")?.value || "all";

  if (classFilter !== "all") {
    filteredRecords = filteredRecords.filter((r) => r[1] === classFilter);
  }
  if (monthFilter !== "all") {
    filteredRecords = filteredRecords.filter((r) => {
      const date = new Date(r[2]);
      return date.getMonth() + 1 === parseInt(monthFilter);
    });
  }

  const tbody = document.getElementById("attBody");
  const empty = document.getElementById("attEmpty");

  if (filteredRecords.length === 0) {
    empty.style.display = "flex";
    tbody.innerHTML = "";
    return;
  }
  empty.style.display = "none";

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  let html = "";
  filteredRecords.forEach((record, idx) => {
    const date = new Date(record[2]);
    const dayName = dayNames[date.getDay()];
    html += `<tr>
            <td class="tdm">${idx + 1}</td>
            <td class="tdm">${record[0]}</td>
            <td>${record[1]}</td>
            <td>${record[2]}</td>
            <td>${dayName}</td>
            <td><span class="pill pill-active"><span class="dot"></span>Present</span></td>
        </tr>`;
  });
  tbody.innerHTML = html;
};

document
  .getElementById("attClassFilter")
  ?.addEventListener("change", renderAttendanceLog);
document
  .getElementById("attMonthFilter")
  ?.addEventListener("change", renderAttendanceLog);

// ============================================
// PROFILE PAGE - SAVE FUNCTIONS (UPDATED FOR FIREBASE)
// ============================================
const showToast = (message, isError = false) => {
  const toast = document.getElementById("toast");
  const toastText = document.getElementById("toastText");
  toastText.innerText = message;
  toast.classList.add("show");
  if (isError) toast.style.borderColor = "var(--red)";
  else toast.style.borderColor = "rgba(30,201,154,.3)";
  setTimeout(() => toast.classList.remove("show"), 3000);
};

document.getElementById("saveProfile")?.addEventListener("click", async () => {
  if (!loggedInTrainer) {
    showToast("Trainer data not found", true);
    return;
  }

  const updatedTrainer = {
    ...loggedInTrainer,
    trainerfirstName: document.getElementById("editFirst").value,
    trainerlastName: document.getElementById("editLast").value,
    traineremail: document.getElementById("editEmail").value,
    trainerphone: document.getElementById("editPhone").value,
    trainerSpec: document.getElementById("editSpec").value,
    trainerBio: document.getElementById("editBio").value,
  };

  // Update in trainerDetails array
  const index = trainerDetails.findIndex(
    (t) => t.traineruserName === loggedInTrainer.traineruserName,
  );
  if (index !== -1) {
    trainerDetails[index] = updatedTrainer;
    await saveTrainersToFirebase();
    loggedInTrainer = updatedTrainer;
    loadTrainerProfile();
    showToast("Profile updated successfully!");
  } else {
    showToast("Error updating profile", true);
  }
});

document.getElementById("savePw")?.addEventListener("click", async () => {
  const currentPw = document.getElementById("editCurPw").value;
  const newPw = document.getElementById("editNewPw").value;
  const confirmPw = document.getElementById("editConfPw").value;

  if (!loggedInTrainer || loggedInTrainer.trainerPassword !== currentPw) {
    showToast("Current password is incorrect", true);
    return;
  }

  if (newPw.length < 8) {
    showToast("Password must be at least 8 characters", true);
    return;
  }

  if (newPw !== confirmPw) {
    showToast("New passwords do not match", true);
    return;
  }

  const index = trainerDetails.findIndex(
    (t) => t.traineruserName === loggedInTrainer.traineruserName,
  );
  if (index !== -1) {
    trainerDetails[index].trainerPassword = newPw;
    await saveTrainersToFirebase();
    loggedInTrainer.trainerPassword = newPw;
    showToast("Password updated successfully!");
    document.getElementById("editCurPw").value = "";
    document.getElementById("editNewPw").value = "";
    document.getElementById("editConfPw").value = "";
  }
});

// ============================================
// INITIALIZE DASHBOARD
// ============================================
const init = () => {
  loadTrainerProfile();
  updateCounts();
  refreshOverview();
  renderMyClasses();
  renderMyMembers();
  renderCalendar();
  updateAttendanceStats();
  renderAttendanceLog();
};

// ============================================
// START: Wait for Firebase then load data
// ============================================
async function startTrainerDashboard() {
  if (window.db) {
    db = window.db;
    await loadFirebaseData();
  } else {
    const waitForFirebase = setInterval(async () => {
      if (window.db) {
        db = window.db;
        clearInterval(waitForFirebase);
        await loadFirebaseData();
      }
    }, 100);
  }
}

startTrainerDashboard();

console.log("Trainer dashboard with Firebase initialized");

// Close sidebar button functionality
const closeSidebarBtn = document.getElementById("closeSidebarBtn");
if (closeSidebarBtn) {
  closeSidebarBtn.addEventListener("click", function () {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      sidebar.classList.remove("open");
    }
  });
}

// Optional: Close sidebar when clicking outside on mobile
document.addEventListener("click", function (e) {
  const sidebar = document.getElementById("sidebar");
  const menuToggle = document.getElementById("menuToggle");

  if (
    window.innerWidth <= 768 &&
    sidebar &&
    sidebar.classList.contains("open")
  ) {
    if (!sidebar.contains(e.target) && !menuToggle?.contains(e.target)) {
      sidebar.classList.remove("open");
    }
  }
});
