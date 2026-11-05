// GOVT BOYS MS G-JAMGAON
// Firebase Admin Login & Online Notice Board

const firebaseConfig = {
  apiKey: "AIzaSyAGPlqFFNCmQIj9ROjF9Ujj4C9a8Z5f9cQ",
  authDomain: "govt-boys-ms-g-jamgaon.firebaseapp.com",
  projectId: "govt-boys-ms-g-jamgaon",
  storageBucket: "govt-boys-ms-g-jamgaon.firebasestorage.app",
  messagingSenderId: "1076919620059",
  appId: "1:1076919620059:web:b1c1bfcdb1d9e260d8d7fe",
  measurementId: "G-7CCE542ZGG",
};

const ADMIN_UID = "Y79AJ2xs8mTjaWepHml1lA74fj83";
const langBtn = document.getElementById("langBtn");
let currentLang = "hi";

function setLang(next) {
  currentLang = next;
  document.documentElement.lang = currentLang;
  document.querySelectorAll("[data-hi]").forEach((el) => {
    if (el.dataset[currentLang] !== undefined)
      el.textContent = el.dataset[currentLang];
  });
  if (langBtn) langBtn.textContent = currentLang === "hi" ? "English" : "हिंदी";
}
if (langBtn)
  langBtn.addEventListener("click", () =>
    setLang(currentLang === "hi" ? "en" : "hi")
  );

function loadFirebase(url) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = url;
    s.onload = resolve;
    s.onerror = () => reject(new Error("Firebase SDK लोड नहीं हुआ"));
    document.head.appendChild(s);
  });
}

async function startSchoolWebsite() {
  const adminBox = document.querySelector(".adminbox");
  const noticeList = document.getElementById("noticeList");
  try {
    if (adminBox) adminBox.innerHTML = "<p>Firebase लोड हो रहा है…</p>";
    await loadFirebase(
      "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"
    );
    await loadFirebase(
      "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js"
    );
    await loadFirebase(
      "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js"
    );
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

    const auth = firebase.auth();
    const db = firebase.firestore();

    if (adminBox)
      adminBox.innerHTML = `
      <p><strong>विद्यालय एडमिन लॉगिन</strong></p>
      <div id="loginBox">
        <label for="adminEmail">Admin Email</label>
        <input id="adminEmail" type="email" autocomplete="username" placeholder="अपना ईमेल लिखें">
        <label for="adminPassword">Password</label>
        <input id="adminPassword" type="password" autocomplete="current-password" placeholder="अपना पासवर्ड लिखें">
        <button id="loginBtn" type="button">Login</button>
        <p id="loginMessage" role="status"></p>
      </div>
      <div id="adminTools" hidden>
        <h3>Admin Dashboard</h3>
        <button id="logoutBtn" type="button">Logout</button>
        <label for="noticeInput">नई विद्यालयीन सूचना</label>
        <input id="noticeInput" maxlength="180" placeholder="सूचना लिखें">
        <button id="addNotice" type="button">Publish Notice</button>
        <p id="adminMessage" role="status"></p>
      </div>
      <small>केवल अधिकृत विद्यालय एडमिन सूचना प्रकाशित कर सकता है।</small>`;

    const loginBox = document.getElementById("loginBox");
    const adminTools = document.getElementById("adminTools");
    const loginMessage = document.getElementById("loginMessage");
    const adminMessage = document.getElementById("adminMessage");
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const addNoticeBtn = document.getElementById("addNotice");

    const show = (el, msg) => {
      if (el) el.textContent = msg;
    };

    function renderNotices(snapshot) {
      if (!noticeList) return;
      noticeList.innerHTML = "";
      if (snapshot.empty) {
        noticeList.textContent = "अभी कोई नई सूचना उपलब्ध नहीं है।";
        return;
      }
      snapshot.forEach((doc) => {
        const data = doc.data();
        const article = document.createElement("article");
        article.className = "notice";
        const date = document.createElement("time");
        date.textContent = data.createdAt
          ? data.createdAt.toDate().toLocaleDateString("hi-IN")
          : "नई सूचना";
        const content = document.createElement("div");
        const title = document.createElement("b");
        title.textContent = data.text || "";
        content.appendChild(title);
        article.append(date, content);
        if (auth.currentUser && auth.currentUser.uid === ADMIN_UID) {
          const del = document.createElement("button");
          del.type = "button";
          del.textContent = "हटाएँ";
          del.addEventListener("click", async () => {
            if (!confirm("क्या आप यह सूचना हटाना चाहते हैं?")) return;
            try {
              await db.collection("notices").doc(doc.id).delete();
            } catch (e) {
              alert("सूचना हटाई नहीं जा सकी: " + e.message);
            }
          });
          article.appendChild(del);
        }
        noticeList.appendChild(article);
      });
    }

    db.collection("notices")
      .orderBy("createdAt", "desc")
      .limit(30)
      .onSnapshot(renderNotices, (e) => {
        console.error(e);
        if (noticeList) noticeList.textContent = "सूचनाएँ लोड नहीं हो सकीं।";
      });

    loginBtn.addEventListener("click", async () => {
      const email = document.getElementById("adminEmail").value.trim();
      const password = document.getElementById("adminPassword").value;
      if (!email || !password)
        return show(loginMessage, "ईमेल और पासवर्ड भरें।");
      loginBtn.disabled = true;
      show(loginMessage, "लॉगिन हो रहा है…");
      try {
        const result = await auth.signInWithEmailAndPassword(email, password);
        if (result.user.uid !== ADMIN_UID) {
          await auth.signOut();
          show(loginMessage, "यह अकाउंट अधिकृत स्कूल एडमिन नहीं है।");
        }
      } catch (e) {
        show(loginMessage, "लॉगिन असफल: " + e.message);
      } finally {
        loginBtn.disabled = false;
      }
    });

    logoutBtn.addEventListener("click", () => auth.signOut());

    addNoticeBtn.addEventListener("click", async () => {
      const input = document.getElementById("noticeInput");
      const text = input.value.trim();
      if (!text) return show(adminMessage, "पहले सूचना लिखें।");
      if (!auth.currentUser || auth.currentUser.uid !== ADMIN_UID)
        return show(adminMessage, "पहले अधिकृत एडमिन लॉगिन करें।");
      addNoticeBtn.disabled = true;
      try {
        await db.collection("notices").add({
          text,
          createdBy: auth.currentUser.uid,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        input.value = "";
        show(adminMessage, "सूचना सफलतापूर्वक प्रकाशित हो गई।");
      } catch (e) {
        show(adminMessage, "सूचना प्रकाशित नहीं हुई: " + e.message);
      } finally {
        addNoticeBtn.disabled = false;
      }
    });

    auth.onAuthStateChanged((user) => {
      const isAdmin = !!user && user.uid === ADMIN_UID;
      loginBox.hidden = isAdmin;
      adminTools.hidden = !isAdmin;
    });
  } catch (e) {
    console.error("Website initialization error:", e);
    if (adminBox)
      adminBox.innerHTML =
        "<p>Firebase लोड नहीं हो पाया। इंटरनेट कनेक्शन जाँचकर पेज फिर खोलें।</p>";
  }
}
startSchoolWebsite();