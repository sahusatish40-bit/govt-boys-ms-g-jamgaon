// GOVT BOYS MS G-JAMGAON
// Firebase Admin Login, Notice Board & Private Student Management

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

        <hr>
        <h3>नई विद्यालयीन सूचना</h3>
        <input id="noticeInput" maxlength="180" placeholder="सूचना लिखें">
        <button id="addNotice" type="button">Publish Notice</button>
        <p id="adminMessage" role="status"></p>

        <hr>
        <h3>विद्यार्थी प्रबंधन (केवल एडमिन)</h3>
        <label for="studentName">विद्यार्थी का नाम *</label>
        <input id="studentName" maxlength="80" placeholder="पूरा नाम">
        <label for="studentClass">कक्षा *</label>
        <select id="studentClass">
          <option value="6">कक्षा 6वीं</option>
          <option value="7">कक्षा 7वीं</option>
          <option value="8">कक्षा 8वीं</option>
        </select>
        <label for="studentRoll">रोल नंबर *</label>
        <input id="studentRoll" maxlength="20" placeholder="रोल नंबर">
        <label for="guardianName">अभिभावक का नाम (वैकल्पिक)</label>
        <input id="guardianName" maxlength="80" placeholder="अभिभावक का नाम">
        <button id="saveStudent" type="button">विद्यार्थी जोड़ें</button>
        <p id="studentMessage" role="status"></p>
        <label for="studentFilter">कक्षा के अनुसार सूची</label>
        <select id="studentFilter">
          <option value="all">सभी कक्षाएँ</option>
          <option value="6">कक्षा 6वीं</option>
          <option value="7">कक्षा 7वीं</option>
          <option value="8">कक्षा 8वीं</option>
        </select>
        <div id="studentList" aria-live="polite">विद्यार्थी सूची लोड हो रही है…</div>
      </div>
      <small>विद्यार्थियों का निजी डेटा केवल अधिकृत एडमिन को दिखाई देता है। सार्वजनिक वेबसाइट पर विद्यार्थी सूची नहीं दिखाई जाएगी।</small>`;

    const loginBox = document.getElementById("loginBox");
    const adminTools = document.getElementById("adminTools");
    const loginMessage = document.getElementById("loginMessage");
    const adminMessage = document.getElementById("adminMessage");
    const studentMessage = document.getElementById("studentMessage");
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const addNoticeBtn = document.getElementById("addNotice");
    const saveStudentBtn = document.getElementById("saveStudent");
    const studentList = document.getElementById("studentList");
    const studentFilter = document.getElementById("studentFilter");
    let allStudents = [];

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

    function renderStudents() {
      if (!studentList) return;
      studentList.innerHTML = "";
      const selected = studentFilter.value;
      const rows = allStudents.filter(
        (s) => selected === "all" || s.className === selected
      );
      if (!rows.length) {
        studentList.textContent =
          "इस कक्षा में अभी कोई विद्यार्थी दर्ज नहीं है।";
        return;
      }
      const table = document.createElement("table");
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";
      const head = document.createElement("tr");
      ["कक्षा", "रोल नं.", "विद्यार्थी का नाम", "अभिभावक", "कार्यवाही"].forEach(
        (label) => {
          const th = document.createElement("th");
          th.textContent = label;
          th.style.textAlign = "left";
          th.style.padding = "8px 4px";
          head.appendChild(th);
        }
      );
      table.appendChild(head);
      rows.forEach((s) => {
        const tr = document.createElement("tr");
        [s.className, s.rollNo, s.name, s.guardianName || "—"].forEach(
          (value) => {
            const td = document.createElement("td");
            td.textContent = value;
            td.style.padding = "8px 4px";
            td.style.borderTop = "1px solid #ddd";
            tr.appendChild(td);
          }
        );
        const action = document.createElement("td");
        action.style.padding = "8px 4px";
        action.style.borderTop = "1px solid #ddd";
        const remove = document.createElement("button");
        remove.type = "button";
        remove.textContent = "हटाएँ";
        remove.addEventListener("click", async () => {
          if (!confirm(`क्या ${s.name} का रिकॉर्ड हटाना चाहते हैं?`)) return;
          try {
            await db.collection("students").doc(s.id).delete();
            show(studentMessage, "विद्यार्थी रिकॉर्ड हटा दिया गया।");
          } catch (e) {
            show(studentMessage, "रिकॉर्ड नहीं हट सका: " + e.message);
          }
        });
        action.appendChild(remove);
        tr.appendChild(action);
        table.appendChild(tr);
      });
      studentList.appendChild(table);
    }

    let unsubscribeStudents = null;
    function beginStudentFeed() {
      if (unsubscribeStudents) unsubscribeStudents();
      unsubscribeStudents = db
        .collection("students")
        .orderBy("className")
        .onSnapshot(
          (snapshot) => {
            allStudents = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            allStudents.sort(
              (a, b) =>
                a.className.localeCompare(b.className) ||
                a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true })
            );
            renderStudents();
          },
          (error) => {
            console.error(error);
            show(
              studentMessage,
              "विद्यार्थी सूची लोड नहीं हुई: " + error.message
            );
          }
        );
    }

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

    saveStudentBtn.addEventListener("click", async () => {
      const name = document.getElementById("studentName").value.trim();
      const className = document.getElementById("studentClass").value;
      const rollNo = document.getElementById("studentRoll").value.trim();
      const guardianName = document.getElementById("guardianName").value.trim();
      if (!name || !rollNo)
        return show(studentMessage, "विद्यार्थी का नाम और रोल नंबर भरें।");
      if (!auth.currentUser || auth.currentUser.uid !== ADMIN_UID)
        return show(studentMessage, "पहले अधिकृत एडमिन लॉगिन करें।");
      saveStudentBtn.disabled = true;
      try {
        await db.collection("students").add({
          name,
          className,
          rollNo,
          guardianName,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          createdBy: auth.currentUser.uid,
        });
        document.getElementById("studentName").value = "";
        document.getElementById("studentRoll").value = "";
        document.getElementById("guardianName").value = "";
        show(studentMessage, "विद्यार्थी सफलतापूर्वक जोड़ दिया गया।");
      } catch (e) {
        show(studentMessage, "विद्यार्थी सेव नहीं हुआ: " + e.message);
      } finally {
        saveStudentBtn.disabled = false;
      }
    });

    studentFilter.addEventListener("change", renderStudents);

    auth.onAuthStateChanged((user) => {
      const isAdmin = !!user && user.uid === ADMIN_UID;
      loginBox.hidden = isAdmin;
      adminTools.hidden = !isAdmin;
      if (isAdmin) beginStudentFeed();
      else if (unsubscribeStudents) {
        unsubscribeStudents();
        unsubscribeStudents = null;
        allStudents = [];
      }
    });
  } catch (e) {
    console.error("Website initialization error:", e);
    if (adminBox)
      adminBox.innerHTML =
        "<p>Firebase लोड नहीं हो पाया। इंटरनेट कनेक्शन जाँचकर पेज फिर खोलें।</p>";
  }
}
startSchoolWebsite();