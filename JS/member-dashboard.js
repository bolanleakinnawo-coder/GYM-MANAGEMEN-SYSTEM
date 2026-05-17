let currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser) {
  window.location.href = "login.html";
  throw new Error("Access denied. Please login first.");
}

if (currentUser.role !== "member") {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("currentMember");

  window.location.href = "login.html";
  throw new Error("Unauthorized access. Please login as member.");
}

// FIREBASE REFERENCE

let db = window.db;
let allMembers = [];
let attendanceRecords = [];
let classDetails = [];
let currentMember = null;

// LOAD DATA FROM FIREBASE

async function loadFirebaseData() {
  console.log("Loading member data from Firebase...");

  try {
    // Load members
    const membersSnapshot = await get(child(ref(db), "members"));
    if (membersSnapshot.exists()) {
      allMembers = membersSnapshot.val();

      // Find current member by username
      currentMember = allMembers.find(
        (m) => m.loginInfo.userName === currentUser.name,
      );

      if (currentMember) {
        localStorage.setItem("currentMember", JSON.stringify(currentMember));
      } else {
        window.location.href = "login.html";
        return;
      }
    }

    // Load attendance
    const attendanceSnapshot = await get(child(ref(db), "attendance"));
    if (attendanceSnapshot.exists()) {
      attendanceRecords = attendanceSnapshot.val();
    }

    // Load classes
    const classesSnapshot = await get(child(ref(db), "classes"));
    if (classesSnapshot.exists()) {
      classDetails = classesSnapshot.val();
    }

    initializeAllDisplays();
  } catch (error) {
    showToast("Error loading data. Please refresh the page.", false);
  }
}

// INITIALIZE ALL DISPLAYS

function initializeAllDisplays() {
  setGreeting();
  setNavUser();
  displayWelcomeName();
  showInfo();
  initMembershipCard();
  membershipDetailsDisplay();
  loadProfileForm();
  renderCalendar();
  renderAttendanceTable();
  updateAttendanceSummary();
  renderClassSchedule("all");
  renderUpcomingClasses();
  setupTabListeners();
  setupLogout();
}

// TOAST NOTIFICATION

const showToast = (message, success = true) => {
  let toast = document.getElementById("toast");
  let toastText = document.getElementById("toastText");
  if (!toast || !toastText) {
    alert(message);
    return;
  }
  toastText.innerText = message;
  toast.className = "toast show";
  if (success) {
    toast.classList.add("success");
  } else {
    toast.classList.add("error");
  }
  setTimeout(() => toast.classList.remove("show"), 3500);
};

const getInitials = (first, last) => {
  if (!first || !last) return "PF";
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
};

const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// GREETING

const setGreeting = () => {
  let hour = new Date().getHours();
  let greeting;

  if (hour < 12) {
    greeting = "Good morning";
  } else if (hour < 18) {
    greeting = "Good afternoon";
  } else {
    greeting = "Good evening";
  }

  let wbGreeting = document.getElementById("wbGreeting");
  if (wbGreeting) wbGreeting.innerText = greeting;
};

// NAV USER

const setNavUser = () => {
  let navAvatar = document.getElementById("navAvatar");
  let navUserName = document.getElementById("navUserName");

  if (!currentMember || !currentMember.personalInfo) return;

  if (navAvatar) {
    navAvatar.innerText = getInitials(
      currentMember.personalInfo.firstName,
      currentMember.personalInfo.lastName,
    );
  }
  if (navUserName) {
    navUserName.innerText =
      currentMember.personalInfo.firstName +
      " " +
      currentMember.personalInfo.lastName.trim();
  }
};

// WELCOME BANNER

const displayWelcomeName = () => {
  if (!currentMember || !currentMember.personalInfo) {
    let wbFirstName = document.getElementById("wbFirstName");
    let wbDeco = document.getElementById("wbDeco");
    if (wbFirstName) wbFirstName.innerText = "Guest";
    if (wbDeco) wbDeco.innerText = "PF";
    return;
  }

  let firstName = currentMember.personalInfo.firstName;
  let lastName = currentMember.personalInfo.lastName;

  let wbFirstName = document.getElementById("wbFirstName");
  let wbDeco = document.getElementById("wbDeco");
  if (wbFirstName) wbFirstName.innerText = firstName;

  let initials = firstName.charAt(0) + lastName.charAt(0);
  if (wbDeco) wbDeco.innerText = initials.toUpperCase();
};

// PERSONAL INFO DISPLAY

const showInfo = () => {
  if (!currentMember || !currentMember.personalInfo) return;

  let p = currentMember.personalInfo;
  let infoFullName = document.getElementById("infoFullName");
  let infoEmail = document.getElementById("infoEmail");
  let infoPhone = document.getElementById("infoPhone");
  let infoGender = document.getElementById("infoGender");
  let infoDob = document.getElementById("infoDob");

  if (infoFullName) infoFullName.innerText = p.firstName + " " + p.lastName;
  if (infoEmail) infoEmail.innerText = p.email;
  if (infoPhone) infoPhone.innerText = p.phone;
  if (infoGender) infoGender.innerText = capitalize(p.gender);
  if (infoDob) infoDob.innerText = new Date(p.dob).toDateString();
};

// MEMBERSHIP CARD + COUNTDOWN

const initMembershipCard = () => {
  let joinDateElement = document.getElementById("mcJoinDate");
  let expiryDateElement = document.getElementById("mcExpiry");
  let planNameElement = document.getElementById("mcPlanName");
  let statusPillElement = document.getElementById("mcStatusPill");
  let daysLeftElement = document.getElementById("statDaysLeft");
  let renewalBannerElement = document.getElementById("renewalBanner");

  if (
    !currentMember ||
    !currentMember.membership ||
    !currentMember.membership.startDate
  ) {
    if (joinDateElement) joinDateElement.innerHTML = "Not set";
    if (expiryDateElement) expiryDateElement.innerHTML = "Not set";
    return;
  }

  let startDate = currentMember.membership.startDate;
  let startDateObject = new Date(startDate);

  let expiryDateObject = new Date(startDate);
  expiryDateObject.setDate(expiryDateObject.getDate() + 30);

  if (joinDateElement)
    joinDateElement.innerHTML = startDateObject.toDateString();
  if (expiryDateElement)
    expiryDateElement.innerHTML = expiryDateObject.toDateString();

  let plan = currentMember.membership.selectedPlan;
  if (planNameElement)
    planNameElement.innerText = plan.charAt(0).toUpperCase() + plan.slice(1);

  let today = new Date();
  let isExpired = today >= expiryDateObject;

  if (statusPillElement) {
    if (isExpired) {
      statusPillElement.className = "status-pill pill-expired";
      statusPillElement.innerHTML = "<span class='dot'></span> Expired";
    } else {
      statusPillElement.className = "status-pill pill-active";
      statusPillElement.innerHTML = "<span class='dot'></span> Active";
    }
  }

  if (renewalBannerElement) {
    renewalBannerElement.style.display = isExpired ? "flex" : "none";
  }

  if (daysLeftElement) {
    if (isExpired) {
      daysLeftElement.innerHTML = "Expired";
    } else {
      if (window.countdownTimer) clearInterval(window.countdownTimer);

      window.countdownTimer = setInterval(function () {
        let now = new Date().getTime();
        let timeLeft = expiryDateObject.getTime() - now;

        if (timeLeft <= 0) {
          clearInterval(window.countdownTimer);
          if (daysLeftElement) daysLeftElement.innerHTML = "Expired";
          if (renewalBannerElement) renewalBannerElement.style.display = "flex";
          if (statusPillElement) {
            statusPillElement.className = "status-pill pill-expired";
            statusPillElement.innerHTML = "<span class='dot'></span> Expired";
          }
          return;
        }

        let days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        let hours = Math.floor(
          (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        let minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        daysLeftElement.innerHTML =
          days + "d " + hours + "h " + minutes + "m " + seconds + "s";
      }, 1000);
    }
  }
};

// MEMBERSHIP DETAILS DISPLAY

const membershipDetailsDisplay = () => {
  if (!currentMember || !currentMember.personalInfo) return;

  let p = currentMember.personalInfo;
  let m = currentMember.membership;

  let profileAvatarBig = document.getElementById("profileAvatarBig");
  let profileFullName = document.getElementById("profileFullName");
  let profileMemberId = document.getElementById("profileMemberId");
  let profilePlanLabel = document.getElementById("profilePlanLabel");
  let pqsJoinDate = document.getElementById("pqsJoinDate");
  let pqsExpiry = document.getElementById("pqsExpiry");
  let pqsStatus = document.getElementById("pqsStatus");
  let pqsGoal = document.getElementById("pqsGoal");

  let firstName = p.firstName;
  let lastName = p.lastName;
  let initials = firstName.charAt(0) + lastName.charAt(0);
  if (profileAvatarBig) profileAvatarBig.innerText = initials.toUpperCase();
  if (profileFullName) profileFullName.innerText = firstName + " " + lastName;

  let memberIndex = allMembers.findIndex(
    (mem) => mem.loginInfo.userName === currentMember.loginInfo.userName,
  );
  let memberNumber = memberIndex + 1;
  if (profileMemberId)
    profileMemberId.innerText =
      "Member ID: PF-" + memberNumber.toString().padStart(3, "0");

  let plan = m.selectedPlan;
  if (profilePlanLabel)
    profilePlanLabel.innerText = plan.charAt(0).toUpperCase() + plan.slice(1);

  let startDateObj = new Date(m.startDate);
  let expiryDateObj = new Date(m.startDate);
  expiryDateObj.setDate(expiryDateObj.getDate() + 30);

  if (pqsJoinDate) pqsJoinDate.innerText = startDateObj.toDateString();
  if (pqsExpiry) pqsExpiry.innerText = expiryDateObj.toDateString();

  let today = new Date();
  if (pqsStatus) {
    if (today >= expiryDateObj) {
      pqsStatus.className = "status-pill pill-expired";
      pqsStatus.innerHTML = "<span class='dot'></span> Expired";
    } else {
      pqsStatus.className = "status-pill pill-active";
      pqsStatus.innerHTML = "<span class='dot'></span> Active";
    }
  }

  let goal = m.fitnessGoal || "Not set";
  if (pqsGoal) pqsGoal.innerText = goal;
};

// LOAD PROFILE FORM

const loadProfileForm = () => {
  if (!currentMember || !currentMember.personalInfo) return;

  let p = currentMember.personalInfo;
  let editFirstName = document.getElementById("editFirstName");
  let editLastName = document.getElementById("editLastName");
  let editEmail = document.getElementById("editEmail");
  let editPhone = document.getElementById("editPhone");
  let editGender = document.getElementById("editGender");
  let editDob = document.getElementById("editDob");

  if (editFirstName) editFirstName.value = p.firstName;
  if (editLastName) editLastName.value = p.lastName;
  if (editEmail) editEmail.value = p.email;
  if (editPhone) editPhone.value = p.phone;
  if (editGender) editGender.value = p.gender;
  if (editDob) editDob.value = p.dob;

  membershipDetailsDisplay();
};

// SAVE PROFILE CHANGES

const saveChanges = async () => {
  let newFirstName = document.getElementById("editFirstName").value;
  let newLastName = document.getElementById("editLastName").value;
  let newEmail = document.getElementById("editEmail").value;
  let newPhone = document.getElementById("editPhone").value;
  let newGender = document.getElementById("editGender").value;
  let newDob = document.getElementById("editDob").value;

  currentMember.personalInfo.firstName = newFirstName;
  currentMember.personalInfo.lastName = newLastName;
  currentMember.personalInfo.email = newEmail;
  currentMember.personalInfo.phone = newPhone;
  currentMember.personalInfo.gender = newGender;
  currentMember.personalInfo.dob = newDob;

  localStorage.setItem("currentMember", JSON.stringify(currentMember));

  let memberIndex = allMembers.findIndex(
    (member) => member.loginInfo.userName === currentMember.loginInfo.userName,
  );

  if (memberIndex !== -1) {
    allMembers[memberIndex].personalInfo = currentMember.personalInfo;
    await set(ref(db, "members"), allMembers);
  }

  showInfo();
  setNavUser();
  displayWelcomeName();
  membershipDetailsDisplay();
  loadProfileForm();

  showToast("Profile updated successfully!");
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// UPDATE PASSWORD

const updatePassword = async () => {
  let currentPw = document.getElementById("editCurrentPw").value;
  let newPw = document.getElementById("editNewPw").value;
  let confirmPw = document.getElementById("editConfirmPw").value;

  if (currentMember.loginInfo.userPassword !== currentPw) {
    showToast("Current password is incorrect.", false);
    return;
  }

  if (newPw.length < 8) {
    showToast("New password must be at least 8 characters.", false);
    return;
  }

  if (newPw !== confirmPw) {
    showToast("New passwords do not match.", false);
    return;
  }

  currentMember.loginInfo.userPassword = newPw;
  localStorage.setItem("currentMember", JSON.stringify(currentMember));

  let memberIndex = allMembers.findIndex(
    (member) => member.loginInfo.userName === currentMember.loginInfo.userName,
  );
  allMembers[memberIndex].loginInfo.userPassword = newPw;
  await set(ref(db, "members"), allMembers);

  document.getElementById("editCurrentPw").value = "";
  document.getElementById("editNewPw").value = "";
  document.getElementById("editConfirmPw").value = "";

  showToast("Password updated successfully!");
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// EDIT PROFILE

const editProfile = () => {
  let allTabButtons = document.querySelectorAll(".tab-btn");
  let allPanels = document.querySelectorAll(".tab-panel");

  for (let i = 0; i < allTabButtons.length; i++) {
    allTabButtons[i].classList.remove("active");
  }
  for (let i = 0; i < allPanels.length; i++) {
    allPanels[i].classList.remove("active");
  }

  let tabProfile = document.getElementById("tabProfile");
  let panelProfile = document.getElementById("panel-profile");
  if (tabProfile) tabProfile.classList.add("active");
  if (panelProfile) panelProfile.classList.add("active");

  loadProfileForm();
};

// ATTENDANCE FUNCTIONS

let calYear = new Date().getFullYear();
let calMonth = new Date().getMonth();

const getMyAttendanceDates = () => {
  if (!currentMember || !currentMember.personalInfo) return [];

  let firstName = currentMember.personalInfo.firstName;
  let lastName = currentMember.personalInfo.lastName;
  let myFullName = firstName + " " + lastName;

  let myRecords = [];
  for (let i = 0; i < attendanceRecords.length; i++) {
    if (attendanceRecords[i].memberName === myFullName) {
      myRecords.push(attendanceRecords[i].date);
    }
  }
  return myRecords;
};

const renderCalendar = () => {
  let monthNames = [
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

  let calTitle = document.getElementById("calMonthTitle");
  if (calTitle) calTitle.innerText = monthNames[calMonth] + " " + calYear;

  let grid = document.getElementById("calendarGrid");
  if (!grid) return;
  grid.innerHTML = "";

  let presentDates = getMyAttendanceDates();
  let today = new Date();

  let firstDayOfMonth = new Date(calYear, calMonth, 1).getDay();
  let daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  for (let i = 0; i < firstDayOfMonth; i++) {
    let emptyCell = document.createElement("div");
    emptyCell.className = "cal-day empty";
    grid.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    let cell = document.createElement("div");
    cell.className = "cal-day";
    cell.innerText = day;

    let monthNumber = String(calMonth + 1).padStart(2, "0");
    let dayNumber = String(day).padStart(2, "0");
    let dateString = calYear + "-" + monthNumber + "-" + dayNumber;

    let isToday =
      day === today.getDate() &&
      calMonth === today.getMonth() &&
      calYear === today.getFullYear();
    let cellDate = new Date(calYear, calMonth, day);
    let todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    let isPast = cellDate < todayDate;

    if (isToday) cell.classList.add("today");

    let didAttend = presentDates.includes(dateString);

    if (didAttend) {
      cell.classList.add("present");
    } else if (isPast && !isToday) {
      cell.classList.add("absent");
    }

    grid.appendChild(cell);
  }
};

const renderAttendanceTable = (filterMonth = "all") => {
  if (!currentMember || !currentMember.personalInfo) return;

  let firstName = currentMember.personalInfo.firstName;
  let lastName = currentMember.personalInfo.lastName;
  let myFullName = firstName + " " + lastName;

  let myRecords = attendanceRecords.filter(
    (record) => record.memberName === myFullName,
  );

  if (filterMonth !== "all") {
    myRecords = myRecords.filter((record) => {
      let recordDate = new Date(record.date);
      return recordDate.getMonth() + 1 === Number(filterMonth);
    });
  }

  myRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

  let tbody = document.getElementById("attendanceTableBody");
  let emptyMessage = document.getElementById("attendanceEmpty");

  if (!tbody) return;

  if (myRecords.length === 0) {
    tbody.innerHTML = "";
    if (emptyMessage) emptyMessage.style.display = "flex";
    return;
  }

  if (emptyMessage) emptyMessage.style.display = "none";

  let dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  let html = "";

  for (let i = 0; i < myRecords.length; i++) {
    let record = myRecords[i];
    let date = new Date(record.date);
    let dayName = dayNames[date.getDay()];
    let displayDate = date.toDateString();

    html += `<tr>
      <td>${i + 1}</td>
      <td><span class="td-main">${displayDate}</span></td>
      <td>${dayName}</td>
      <td>—</td>
      <td>—</td>
      <td>${record.plan}</td>
      <td><span class="status-pill pill-active"><span class="dot"></span> Present</span></td>
    </tr>`;
  }

  tbody.innerHTML = html;
};

const updateAttendanceSummary = () => {
  let presentDates = getMyAttendanceDates();
  let totalVisits = presentDates.length;
  let now = new Date();

  let visitsThisMonth = presentDates.filter((date) => {
    let d = new Date(date);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }).length;

  let streak = 0;
  let checkDate = new Date(now);
  checkDate.setHours(0, 0, 0, 0);

  let dateSet = {};
  presentDates.forEach((date) => {
    dateSet[date] = true;
  });

  while (true) {
    let year = checkDate.getFullYear();
    let month = String(checkDate.getMonth() + 1).padStart(2, "0");
    let day = String(checkDate.getDate()).padStart(2, "0");
    let dateString = year + "-" + month + "-" + day;

    if (dateSet[dateString]) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  let joinDate = new Date(currentMember.membership.startDate);
  let daysSinceJoin = Math.floor((now - joinDate) / (1000 * 60 * 60 * 24)) + 1;
  let attendanceRate = Math.min(
    100,
    Math.round((totalVisits / daysSinceJoin) * 100),
  );

  let attTotal = document.getElementById("attTotal");
  let attThisMonth = document.getElementById("attThisMonth");
  let attStreak = document.getElementById("attStreak");
  let attRate = document.getElementById("attRate");

  if (attTotal) attTotal.innerText = totalVisits;
  if (attThisMonth) attThisMonth.innerText = visitsThisMonth;
  if (attStreak) attStreak.innerText = streak;
  if (attRate) attRate.innerText = attendanceRate + "%";
};

// CLASS SCHEDULE FUNCTIONS
const renderClassSchedule = (dayFilter = "all") => {
  let container = document.getElementById("classList");
  let emptyMessage = document.getElementById("scheduleEmpty");

  let filteredClasses =
    dayFilter === "all"
      ? [...classDetails]
      : classDetails.filter((cls) => cls.classDay === dayFilter);

  if (!container) return;

  if (filteredClasses.length === 0) {
    container.innerHTML = "";
    if (emptyMessage) emptyMessage.style.display = "flex";
    return;
  }

  if (emptyMessage) emptyMessage.style.display = "none";

  let html = "";

  for (let cls of filteredClasses) {
    let typeClass = "yoga";
    let tagClass = "tag-yoga";
    let typeLabel = cls.classType;

    if (cls.classType === "yoga") {
      typeClass = "yoga";
      tagClass = "tag-yoga";
      typeLabel = "Yoga";
    } else if (cls.classType === "zumba") {
      typeClass = "hiit";
      tagClass = "tag-hiit";
      typeLabel = "Zumba";
    } else if (cls.classType === "weight") {
      typeClass = "strength";
      tagClass = "tag-strength";
      typeLabel = "Weight Training";
    }

    let endTimeDisplay = "";
    if (cls.classTime && cls.classDuration) {
      let timeParts = cls.classTime.split(":");
      let hour = Number(timeParts[0]);
      let minute = Number(timeParts[1]);
      let totalMinutes = hour * 60 + minute + Number(cls.classDuration);
      let endHour = Math.floor(totalMinutes / 60) % 24;
      let endMinute = totalMinutes % 60;
      endTimeDisplay =
        String(endHour).padStart(2, "0") +
        ":" +
        String(endMinute).padStart(2, "0");
    }

    let formattedDay = cls.classDay
      ? cls.classDay.charAt(0).toUpperCase() + cls.classDay.slice(1)
      : "";

    html += `
      <div class="class-item ${typeClass}" data-day="${cls.classDay}">
        <div class="class-time">
          <div class="class-time-start">${cls.classTime || "--:--"}</div>
          <div class="class-time-end">${endTimeDisplay}</div>
          <div class="class-time-end" style="font-size:10px;margin-top:4px;color:var(--w35)">${formattedDay}</div>
        </div>
        <div class="class-info">
          <div class="class-name">${cls.className || "—"}</div>
          <div class="class-trainer"><i class="fa-solid fa-user-tie"></i> ${cls.classTrainer || "TBA"}</div>
          <div class="class-tags"><span class="class-tag ${tagClass}">${typeLabel}</span></div>
        </div>
        <div class="class-slots">
          <div class="class-slots-num">${cls.classCapacity || "—"}</div>
          <div class="class-slots-label">capacity</div>
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
};

const renderUpcomingClasses = () => {
  let container = document.getElementById("upcomingList");
  let emptyMessage = document.getElementById("upcomingEmpty");

  if (!container) return;

  if (classDetails.length === 0) {
    if (emptyMessage) emptyMessage.style.display = "flex";
    container.innerHTML = "";
    return;
  }

  let dayOrder = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  let todayIndex = new Date().getDay();

  let sortedClasses = [...classDetails];
  sortedClasses.sort((a, b) => {
    let aIndex = dayOrder.indexOf(a.classDay);
    let bIndex = dayOrder.indexOf(b.classDay);
    let aDaysAhead = (aIndex - todayIndex + 7) % 7;
    let bDaysAhead = (bIndex - todayIndex + 7) % 7;
    return aDaysAhead - bDaysAhead;
  });

  let upcomingClasses = sortedClasses.slice(0, 3);

  if (upcomingClasses.length === 0) {
    if (emptyMessage) emptyMessage.style.display = "flex";
    container.innerHTML = "";
    return;
  }

  if (emptyMessage) emptyMessage.style.display = "none";

  let shortDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let html = "";

  for (let cls of upcomingClasses) {
    let dayIndex = dayOrder.indexOf(cls.classDay);
    let daysAhead = (dayIndex - todayIndex + 7) % 7;

    let targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysAhead);

    html += `
      <div class="upcoming-item">
        <div class="upcoming-day">
          <div class="upcoming-day-num">${targetDate.getDate()}</div>
          <div class="upcoming-day-label">${shortDayNames[targetDate.getDay()]}</div>
        </div>
        <div class="upcoming-divider"></div>
        <div class="upcoming-info">
          <div class="upcoming-name">${cls.className || "—"}</div>
          <div class="upcoming-meta">
            <i class="fa-solid fa-user-tie" style="color:var(--gold);margin-right:4px;font-size:11px"></i>
            ${cls.classTrainer || "TBA"} &nbsp;·&nbsp; ${cls.classDuration || "—"} min
          </div>
        </div>
        <div class="upcoming-time">${cls.classTime || "--:--"}</div>
      </div>
    `;
  }

  container.innerHTML = html;
};

// TAB LISTENERS
function setupTabListeners() {
  let allTabButtons = document.querySelectorAll(".tab-btn");
  let allPanels = document.querySelectorAll(".tab-panel");

  for (let i = 0; i < allTabButtons.length; i++) {
    allTabButtons[i].addEventListener("click", function () {
      let tabName = this.dataset.tab;

      for (let j = 0; j < allTabButtons.length; j++) {
        allTabButtons[j].classList.remove("active");
      }
      for (let j = 0; j < allPanels.length; j++) {
        allPanels[j].classList.remove("active");
      }

      this.classList.add("active");

      let panelToShow = document.getElementById("panel-" + tabName);
      if (panelToShow) panelToShow.classList.add("active");

      if (tabName === "attendance") {
        renderCalendar();
        renderAttendanceTable();
        updateAttendanceSummary();
      }
      if (tabName === "schedule") {
        renderClassSchedule("all");
        let dayTabs = document.querySelectorAll(".day-tab");
        for (let k = 0; k < dayTabs.length; k++) {
          dayTabs[k].classList.remove("active");
        }
        let allDayTab = document.querySelector('.day-tab[data-day="all"]');
        if (allDayTab) allDayTab.classList.add("active");
      }
      if (tabName === "profile") {
        loadProfileForm();
      }
    });
  }

  // Set Overview as active on page load
  let panelOverview = document.getElementById("panel-overview");
  if (panelOverview) panelOverview.classList.add("active");

  let tabOverview = document.getElementById("tabOverview");
  if (tabOverview) tabOverview.classList.add("active");
}

// DAY TABS FOR SCHEDULE

function setupDayTabs() {
  let dayTabs = document.querySelectorAll(".day-tab");
  for (let i = 0; i < dayTabs.length; i++) {
    dayTabs[i].addEventListener("click", function () {
      for (let j = 0; j < dayTabs.length; j++) {
        dayTabs[j].classList.remove("active");
      }
      this.classList.add("active");
      renderClassSchedule(this.dataset.day);
    });
  }
}

// MONTH FILTER FOR ATTENDANCE
function setupMonthFilter() {
  let attMonthFilter = document.getElementById("attMonthFilter");
  if (attMonthFilter) {
    attMonthFilter.value = String(new Date().getMonth() + 1);
    attMonthFilter.addEventListener("change", function (e) {
      renderAttendanceTable(e.target.value);
    });
  }
}

// CALENDAR NAVIGATION

function setupCalendarNav() {
  let calPrevBtn = document.getElementById("calPrev");
  let calNextBtn = document.getElementById("calNext");

  if (calPrevBtn) {
    calPrevBtn.addEventListener("click", function () {
      calMonth--;
      if (calMonth < 0) {
        calMonth = 11;
        calYear--;
      }
      renderCalendar();
    });
  }

  if (calNextBtn) {
    calNextBtn.addEventListener("click", function () {
      calMonth++;
      if (calMonth > 11) {
        calMonth = 0;
        calYear++;
      }
      renderCalendar();
    });
  }
}

// LOGOUT

function setupLogout() {
  let logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem("currentMember");
      localStorage.removeItem("currentUser");
      window.location.href = "login.html";
    });
  }
}

// GO TO SCHEDULE BUTTON

function setupGoToSchedule() {
  let goToScheduleBtn = document.getElementById("goToSchedule");
  let allTabButtons = document.querySelectorAll(".tab-btn");
  let allPanels = document.querySelectorAll(".tab-panel");
  let dayTabs = document.querySelectorAll(".day-tab");

  if (goToScheduleBtn) {
    goToScheduleBtn.addEventListener("click", function () {
      for (let i = 0; i < allTabButtons.length; i++) {
        allTabButtons[i].classList.remove("active");
      }
      for (let i = 0; i < allPanels.length; i++) {
        allPanels[i].classList.remove("active");
      }

      let tabSchedule = document.getElementById("tabSchedule");
      let panelSchedule = document.getElementById("panel-schedule");
      if (tabSchedule) tabSchedule.classList.add("active");
      if (panelSchedule) panelSchedule.classList.add("active");

      for (let i = 0; i < dayTabs.length; i++) {
        dayTabs[i].classList.remove("active");
      }
      let allDayTab = document.querySelector('.day-tab[data-day="all"]');
      if (allDayTab) allDayTab.classList.add("active");

      renderClassSchedule("all");
    });
  }
}

// CHANGE PLAN BUTTON

let selectedNewPlanId = "";

function setupChangePlan() {
  let changePlanBtn = document.getElementById("changePlanBtn");
  if (changePlanBtn) {
    changePlanBtn.addEventListener("click", showPlanSelector);
  }

  let renewBtn = document.getElementById("renewBtn");
  if (renewBtn) {
    renewBtn.addEventListener("click", function () {
      editProfile();
      setTimeout(showPlanSelector, 300);
    });
  }
}

const showPlanSelector = () => {
  let existingSelector = document.getElementById("inlinePlanSelector");
  if (existingSelector) {
    existingSelector.remove();
    return;
  }

  let currentPlan = currentMember.membership.selectedPlan;

  let selectorHTML = `
    <div id="inlinePlanSelector" style="margin-top:16px;background:var(--dark3);border:1px solid var(--border);border-radius:var(--r-md);padding:20px;">
      <div style="font-size:13px;color:var(--w50);margin-bottom:14px;">Select a plan — your 30-day period restarts from today.</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px;">
        <div onclick="selectNewPlan('basic')" id="planOption_basic" style="padding:14px;border:1.5px solid var(--border);border-radius:var(--r-md);cursor:pointer;background:var(--dark4);">
          <div style="font-size:14px;font-weight:600;color:var(--white);margin-bottom:4px;">Basic</div>
          <div style="font-family:var(--ff-display);font-size:20px;font-weight:600;color:var(--gold-bright);">₦8,000</div>
          <div style="font-size:11px;color:var(--w35);">per month</div>
        </div>
        <div onclick="selectNewPlan('premium')" id="planOption_premium" style="padding:14px;border:1.5px solid var(--border);border-radius:var(--r-md);cursor:pointer;background:var(--dark4);">
          <div style="font-size:14px;font-weight:600;color:var(--white);margin-bottom:4px;">Premium</div>
          <div style="font-family:var(--ff-display);font-size:20px;font-weight:600;color:var(--gold-bright);">₦15,000</div>
          <div style="font-size:11px;color:var(--w35);">per month</div>
        </div>
        <div onclick="selectNewPlan('elite')" id="planOption_elite" style="padding:14px;border:1.5px solid var(--border);border-radius:var(--r-md);cursor:pointer;background:var(--dark4);">
          <div style="font-size:14px;font-weight:600;color:var(--white);margin-bottom:4px;">Elite</div>
          <div style="font-family:var(--ff-display);font-size:20px;font-weight:600;color:var(--gold-bright);">₦25,000</div>
          <div style="font-size:11px;color:var(--w35);">per month</div>
        </div>
      </div>
      <div style="display:flex;gap:10px;justify-content:flex-end;">
        <button onclick="document.getElementById('inlinePlanSelector').remove()" style="padding:9px 18px;background:transparent;border:1px solid var(--border);border-radius:var(--r-sm);color:var(--w50);cursor:pointer;">Cancel</button>
        <button onclick="confirmPlanChange()" style="padding:9px 18px;background:var(--gold);border:none;border-radius:var(--r-sm);color:#000;font-weight:700;cursor:pointer;">Confirm Change</button>
      </div>
    </div>
  `;

  let sidebar = document.querySelector(".profile-sidebar");
  if (sidebar) sidebar.insertAdjacentHTML("beforeend", selectorHTML);

  if (currentPlan === "basic") {
    let opt = document.getElementById("planOption_basic");
    if (opt) {
      opt.style.border = "1.5px solid var(--gold)";
      opt.style.background = "var(--gold-dim)";
    }
    selectedNewPlanId = "basic";
  } else if (currentPlan === "premium") {
    let opt = document.getElementById("planOption_premium");
    if (opt) {
      opt.style.border = "1.5px solid var(--gold)";
      opt.style.background = "var(--gold-dim)";
    }
    selectedNewPlanId = "premium";
  } else if (currentPlan === "elite") {
    let opt = document.getElementById("planOption_elite");
    if (opt) {
      opt.style.border = "1.5px solid var(--gold)";
      opt.style.background = "var(--gold-dim)";
    }
    selectedNewPlanId = "elite";
  }
};

window.selectNewPlan = (planId) => {
  selectedNewPlanId = planId;

  let basicOpt = document.getElementById("planOption_basic");
  let premiumOpt = document.getElementById("planOption_premium");
  let eliteOpt = document.getElementById("planOption_elite");

  if (basicOpt) {
    basicOpt.style.border = "1.5px solid var(--border)";
    basicOpt.style.background = "var(--dark4)";
  }
  if (premiumOpt) {
    premiumOpt.style.border = "1.5px solid var(--border)";
    premiumOpt.style.background = "var(--dark4)";
  }
  if (eliteOpt) {
    eliteOpt.style.border = "1.5px solid var(--border)";
    eliteOpt.style.background = "var(--dark4)";
  }

  let selectedOpt = document.getElementById("planOption_" + planId);
  if (selectedOpt) {
    selectedOpt.style.border = "1.5px solid var(--gold)";
    selectedOpt.style.background = "var(--gold-dim)";
  }
};

const confirmPlanChange = async () => {
  if (selectedNewPlanId === "") {
    showToast("Please select a plan.", false);
    return;
  }

  currentMember.membership.selectedPlan = selectedNewPlanId;
  currentMember.membership.startDate = new Date().toISOString();
  localStorage.setItem("currentMember", JSON.stringify(currentMember));

  let memberIndex = allMembers.findIndex(
    (member) => member.loginInfo.userName === currentMember.loginInfo.userName,
  );
  allMembers[memberIndex].membership.selectedPlan = selectedNewPlanId;
  allMembers[memberIndex].membership.startDate =
    currentMember.membership.startDate;
  await set(ref(db, "members"), allMembers);

  let selector = document.getElementById("inlinePlanSelector");
  if (selector) selector.remove();

  if (window.countdownTimer) {
    clearInterval(window.countdownTimer);
  }
  initMembershipCard();
  membershipDetailsDisplay();

  let planName =
    selectedNewPlanId.charAt(0).toUpperCase() + selectedNewPlanId.slice(1);
  showToast("Plan changed to " + planName + "!");
  selectedNewPlanId = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
};

async function startApp() {
  if (window.db && window.get && window.child && window.ref) {
    db = window.db;
    await loadFirebaseData();
  } else {
    const waitForFirebase = setInterval(async () => {
      if (window.db && window.get && window.child && window.ref) {
        db = window.db;
        clearInterval(waitForFirebase);
        await loadFirebaseData();
      }
    }, 100);

    setTimeout(() => {
      if (!db) {
        console.error("Firebase not loaded!");
        showToast("Error loading data. Please refresh the page.", false);
      }
    }, 5000);
  }

  setupDayTabs();
  setupMonthFilter();
  setupCalendarNav();
  setupGoToSchedule();
  setupChangePlan();
}

startApp();

window.saveChanges = saveChanges;
window.updatePassword = updatePassword;
window.editProfile = editProfile;
window.selectPlan = window.selectNewPlan;
window.confirmPlanChange = confirmPlanChange;
window.showPlanSelector = showPlanSelector;
