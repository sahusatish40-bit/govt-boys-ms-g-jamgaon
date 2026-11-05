// GOVT BOYS MS G-JAMGAON
// Firebase Admin Login & Online Notice Board

const firebaseConfig = {
  apiKey: "AIzaSyAGPlqFFNCmQIj9ROjF9Ujj4C9a8Z5f9cQ",
  authDomain: "govt-boys-ms-g-jamgaon.firebaseapp.com",
  projectId: "govt-boys-ms-g-jamgaon",
  storageBucket: "govt-boys-ms-g-jamgaon.firebasestorage.app",
  messagingSenderId: "1076919620059",
  appId: "1:1076919620059:web:b1c1bfcdb1d9e260d8d7fe",
  measurementId: "G-7CCE542ZGG"
};

const ADMIN_UID = "Y79AJ2xs8mTjaWepHml1lA74fj83";

const langBtn = document.getElementById("langBtn");
let lang = "hi";

function setLang(next) {
  lang = next;
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-hi]").forEach(el => {
    el.textContent = el.dataset[lang];
  });

  langBtn.textContent = lang === "hi" ? "English" : "हिंदी";
}

langBtn.addEventListener("click", () => {
  setLang(lang === "hi" ? "en" : "hi");
});

// Load Firebase SDK
function loadFirebase(url) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = url;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function startSchoolWebsite() {
  try {
    await loadFirebase(
      "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"
    );

    await loadFirebase(
      "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js"
    );

    await loadFirebase(
      "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js"
    );

    firebase.initializeApp(firebaseConfig);

    const auth = firebase.auth();
    const db = firebase.firestore();

    const adminBox = document.querySelector(".adminbox");
    const noticeList = document.getElementById("noticeList");

    adminBox.innerHTML = `
      <p>Authorized School Admin Login</p>

      <div id="loginBox">
        <label>Admin Email</label>
        <input id="adminEmail" type="email"
        placeholder="Enter admin email">

        <label>Password</label>
        <input id="adminPassword" type="password"
        placeholder="Enter password">

        <button id="loginBtn">Login</button>
        <p id="loginMessage"></p>
      </div>

      <div id="adminTools" hidden>
        <h3>Admin Dashboard</h3>

        <button id="logoutBtn">Logout</button>

        <label>New School Notice</label>
        <input id="noticeInput"
        maxlength="180"
        placeholder="Write a notice">

        <button id="addNotice">
        Publish Notice
        </button>

        <p id="adminMessage"></p>
      </div>

      <small>Only authorized school admin can publish notices.</small>
    `;

    const loginBox = document.getElementById("loginBox");
    const adminTools = document.getElementById("adminTools");
    const loginMessage = document.getElementById("loginMessage");
    const adminMessage = document.getElementById("adminMessage");

    function showMessage(element, message) {
      element.textContent = message;
    }

    function renderNotices(snapshot) {
      noticeList.innerHTML = "";

      if (snapshot.empty) {
        noticeList.textContent = "अभी कोई नई सूचना उपलब्ध नहीं है।";
        return;
      }

      snapshot.forEach(doc => {
        const data = doc.data();

        const article = document.createElement("article");
        article.className = "notice";

        const date = document.createElement("time");
        date.textContent = data.createdAt
          ? data.createdAt.toDate().toLocaleDateString("hi-IN")
          : "NOTICE";

        const content = document.createElement("div");
        const title = document.createElement("b");
        title.textContent = data.text || "";

        content.appendChild(title);
        article.append(date, content);

        if (auth.currentUser &&
            auth.currentUser.uid === ADMIN_UID) {

          const del = document.createElement("button");
          del.textContent = "हटाएँ";

          del.onclick = async () => {
            if (confirm("क्या यह सूचना