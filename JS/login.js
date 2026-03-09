const passwordToggle = () => {
  let password = document.getElementById("password");
  if (password.type == "password") {
    password.type = "text";
  } else {
    password.type = "password";
  }
};

const remember = () => {
  if (document.getElementById("rememberBox").classList.contains("checked")) {
    document.getElementById("rememberBox").classList.remove("checked");
  } else {
    document.getElementById("rememberBox").classList.add("checked");
  }
};

function login() {
  let loginUsername = document.getElementById("username").value;
  let loginPassword = document.getElementById("password").value;

  let memberData = JSON.parse(localStorage.getItem("memberData"));

  if (
    memberData &&
    memberData.loginInfo.userName === loginUsername &&
    memberData.loginInfo.userPassword === loginPassword
  ) {
    window.location.href = "member-dashboard.html";
  } else {
    alert("Invalid username or password");
  }
}

function displayWelcomeName() {
  let welcomeName = document.getElementById("wbFirstName");


  let memberData = JSON.parse(localStorage.getItem("memberData"));

  if (memberData && memberData.loginInfo.userName) {
    welcomeName.innerText = memberData.loginInfo.userName;
  }
}

displayWelcomeName();
