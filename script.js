// School Sathi: Admin, Notices, Students and Exams

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
let currentLang = "hi";

function setLang(next) {
  currentLang = next;
  document.documentElement.lang = next;

  document.querySelectorAll("[data-hi]").forEach(e => {
    if (e.dataset[next] !== undefined) {
      e.textContent = e.dataset[next];
    }
  });

  if (langBtn) {
    langBtn.textContent = next === "hi" ? "English" : "हिंदी";
  }
}

if (langBtn) {
  langBtn.addEventListener("click", () => {
    setLang(currentLang === "hi" ? "en" : "hi");
  });
}

function loadFirebase(url) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = url;
    s.onload = resolve;
    s.onerror = () => reject(Error("Firebase SDK लोड नहीं हुआ"));
    document.head.appendChild(s);
  });
}

async function startSchoolWebsite() {
  const adminBox = document.querySelector(".adminbox");
  const noticeList = document.getElementById("noticeList");

  try {
    if (adminBox) {
      adminBox.innerHTML = "<p>Firebase लोड हो रहा है…</p>";
    }

    await loadFirebase(
      "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"
    );

    await loadFirebase(
      "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js"
    );

    await loadFirebase(
      "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js"
    );

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
await loadFirebase(
  "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
);
    const auth = firebase.auth();
    const db = firebase.firestore();

    // सभी लोगों के लिए सार्वजनिक शिक्षक सूची
    const publicTeacherBox = document.getElementById("publicTeacherList");

    if (publicTeacherBox) {
      db.collection("teachers_public").onSnapshot(
        snap => {
          publicTeacherBox.innerHTML = "";

          if (snap.empty) {
            publicTeacherBox.textContent =
              "शिक्षकों की जानकारी शीघ्र उपलब्ध होगी।";
            return;
          }

          snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
            .forEach(t => {
              const card = document.createElement("article");
              card.className = "card";

              if (t.photo) {
                const img = document.createElement("img");
                img.src = t.photo;
                img.alt = t.name || "शिक्षक";
                img.style.cssText =
                  "width:100%;height:180px;object-fit:cover;border-radius:10px";
                card.appendChild(img);
              }

              const name = document.createElement("h3");
              name.textContent = t.name || "शिक्षक";
              card.appendChild(name);

              const post = document.createElement("p");
              post.textContent = "पद: " + (t.post || "—");
              card.appendChild(post);

              const subject = document.createElement("p");
              subject.textContent = "विषय: " + (t.subject || "—");
              card.appendChild(subject);

              publicTeacherBox.appendChild(card);
            });
        },
        error => {
          publicTeacherBox.textContent =
            "शिक्षक सूची लोड नहीं हुई: " + error.message;
        }
      );
    }

    if (adminBox) {
      adminBox.innerHTML = `
        <p><strong>विद्यालय एडमिन लॉगिन</strong></p>

        <div id="loginBox">
          <label>Admin Email</label>
          <input id="adminEmail" type="email"
            autocomplete="username" placeholder="अपना ईमेल लिखें">

          <label>Password</label>
          <input id="adminPassword" type="password"
            autocomplete="current-password" placeholder="अपना पासवर्ड लिखें">

          <button id="loginBtn" type="button">Login</button>
          <p id="loginMessage"></p>
        </div>

        <div id="adminTools" hidden>
          <h3>Admin Dashboard</h3>
          <button id="logoutBtn" type="button">Logout</button>
          <hr>

       <hr>
<h3>🖼️ Gallery Management</h3>
<p>विद्यालय की तस्वीरों का प्रबंधन</p>

<div id="adminGalleryList">
  <p>Gallery लोड हो रही है...</p>
</div>
<hr>
          <h3>नई विद्यालयीन सूचना</h3>
          <input id="noticeInput" maxlength="180" placeholder="सूचना लिखें">
          <button id="addNotice" type="button">Publish Notice</button>
          <p id="adminMessage"></p>
          <hr>

          <h3>विद्यार्थी प्रबंधन (केवल एडमिन)</h3>

          <label>विद्यार्थी का नाम *</label>
          <input id="studentName" maxlength="80" placeholder="पूरा नाम">

          <label>कक्षा *</label>
          <select id="studentClass">
            <option value="6">कक्षा 6वीं</option>
            <option value="7">कक्षा 7वीं</option>
            <option value="8">कक्षा 8वीं</option>
          </select>

          <label>रोल नंबर *</label>
          <input id="studentRoll" maxlength="20" placeholder="रोल नंबर">

          <label>अभिभावक का नाम</label>
          <input id="guardianName" maxlength="80" placeholder="अभिभावक का नाम">

          <label>जन्मतिथि</label>
          <input id="studentDob" type="date">

          <label>पूरा पता</label>
          <textarea id="studentAddress" maxlength="300"
            rows="2" placeholder="ग्राम, पोस्ट, तहसील, जिला"></textarea>

          <label>मोबाइल नंबर</label>
          <input id="studentMobile" type="tel"
            inputmode="numeric" maxlength="15"
            placeholder="अभिभावक का मोबाइल नंबर">

          <button id="saveStudent" type="button">विद्यार्थी जोड़ें</button>
          <p id="studentMessage"></p>

          <label>कक्षा के अनुसार सूची</label>
          <select id="studentFilter">
            <option value="all">सभी कक्षाएँ</option>
            <option value="6">कक्षा 6वीं</option>
            <option value="7">कक्षा 7वीं</option>
            <option value="8">कक्षा 8वीं</option>
          </select>

          <div id="studentList"></div>

<hr>
<section id="privateStudentDetails">
  <h3>🔒 निजी विद्यार्थी विवरण (केवल मुख्य Admin)</h3>

  <button id="loadPrivateStudents" type="button"

<div style="margin:12px 0">
  <label>विद्यार्थी खोजें</label>
  <input
    type="search"
    id="privateStudentSearch"
    placeholder="विद्यार्थी का नाम लिखें"
  >

  <label>कक्षा चुनें</label>
  <select id="privateClassFilter">
    <option value="all">सभी कक्षाएँ</option>
    <option value="6">कक्षा 6वीं</option>
    <option value="7">कक्षा 7वीं</option>
    <option value="8">कक्षा 8वीं</option>
  </select>
</div>

  onclick="document.getElementById('privateStudentMessage').textContent='बटन काम कर रहा है।';">
    निजी विवरण देखें
  </button>

  <p id="privateStudentMessage"></p>
  <div id="privateStudentList"></div>
</section>
<hr>


<hr>

<hr>
<section id="excelImport">
  <h3>📥 Excel से विद्यार्थी Import करें</h3>

  <p>केवल कक्षा 6वीं, 7वीं और 8वीं का डेटा लिया जाएगा।</p>

  <input
    type="file"
    id="studentExcelFile"
    accept=".xlsx,.xls"
  >

  <button id="previewExcel" type="button">
    Excel डेटा Preview करें
  </button>

  <p id="excelImportMessage"></p>
  <div id="excelPreview"></div>

  <button id="confirmExcelImport" type="button" hidden>
    पुष्टि करें और Firebase में सेव करें
  </button>
</section>
<hr>
<section id="teacherManagement">
  <h3>👨‍🏫 शिक्षक प्रबंधन</h3>

  <label>शिक्षक का नाम *</label>
  <input id="teacherName" maxlength="80"
    placeholder="शिक्षक का पूरा नाम">

  <label>पद</label>
  <input id="teacherPost" maxlength="80"
    placeholder="जैसे व्याख्याता / शिक्षक">

  <label>विषय</label>
  <input id="teacherSubject" maxlength="80"
    placeholder="जैसे हिंदी / अंग्रेजी / गणित">

  <label>मोबाइल नंबर</label>
  <input id="teacherMobile" type="tel"
    maxlength="15" placeholder="मोबाइल नंबर">

  <label>फोटो लिंक (वैकल्पिक)</label>
  <input id="teacherPhoto" type="url"
    placeholder="फोटो का URL">

  <button id="saveTeacher" type="button">
    शिक्षक जोड़ें
  </button>

  <p id="teacherMessage"></p>

  <h3>शिक्षकों की सूची</h3>
  <div id="teacherList"></div>
</section>
          <hr>

          <section>
            <h3>परीक्षा प्रबंधन (सत्र 2026–27)</h3>

            <label>परीक्षा का नाम *</label>
            <input id="examTitle" maxlength="100"
              placeholder="जैसे मासिक परीक्षा जुलाई 2026">

            <label>कक्षा *</label>
            <select id="examClass">
              <option value="6">कक्षा 6वीं</option>
              <option value="7">कक्षा 7वीं</option>
              <option value="8">कक्षा 8वीं</option>
            </select>

            <label>
              विषय और पूर्णांक — हर पंक्ति:
              विषय, थ्योरी अंक, प्रैक्टिकल अंक
            </label>

            <textarea id="examSubjects" rows="5"
              placeholder="हिंदी,20,5
अंग्रेजी,20,5
गणित,25,0"></textarea>

            <small>
              प्रैक्टिकल नहीं हो तो 0 लिखें।
              उदाहरण: गणित,25,0
            </small>

            <button id="createExam" type="button">परीक्षा बनाएँ</button>
            <p id="examMessage"></p>

            <label>मौजूदा परीक्षा चुनें</label>
            <select id="examSelect">
              <option value="">परीक्षा चुनें</option>
            </select>

            <div id="examMarksArea"></div>
          </section>
        </div>

        <small>
          विद्यार्थियों और परीक्षा के अंक केवल अधिकृत एडमिन को दिखाई देते हैं।
        </small>
      `;
    }

    const el = id => document.getElementById(id);
    const show = (n, m) => {
      if (n) n.textContent = m;
    };
    


async function loadAdminGallery() {
  const box = document.getElementById("adminGalleryList");
  if (!box) return;

  box.textContent = "फोटो लोड हो रही हैं...";

  try {
    const response = await fetch(
      "https://api.github.com/repos/sahusatish40-bit/govt-boys-ms-g-jamgaon/contents/images"
    );

    if (!response.ok) throw new Error("फोटो सूची नहीं मिली");

    const files = await response.json();
    const images = files.filter(file =>
      file.type === "file" &&
      /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name)
    );

    box.innerHTML = "";

    if (!images.length) {
      box.textContent = "कोई फोटो उपलब्ध नहीं है।";
      return;
    }

    images.forEach(file => {
      const card = document.createElement("div");
      card.style.cssText =
        "padding:12px;border:1px solid #ddd;margin:10px;border-radius:10px;display:inline-block;vertical-align:top;max-width:230px;width:100%;box-sizing:border-box";

      const img = document.createElement("img");
      img.src = file.download_url;
      img.alt = file.name;
      img.style.cssText =
        "width:100%;height:150px;object-fit:cover;border-radius:8px";

      const name = document.createElement("p");
      name.textContent = file.name;
      name.style.overflowWrap = "anywhere";

      const newName = document.createElement("input");
      newName.type = "text";
      newName.placeholder = "नया फोटो नाम लिखें";
      newName.style.cssText = "width:100%;padding:8px;box-sizing:border-box";

      const rename = document.createElement("button");
      rename.textContent = "✏️ Rename";
      rename.type = "button";
      rename.onclick = async () => {
        if (!newName.value.trim()) {
          alert("पहले नया नाम लिखें।");
          return;
        }

        try {
          await navigator.clipboard.writeText(file.name);
        } catch (e) {
          alert("पुराना नाम कॉपी नहीं हुआ: " + file.name);
        }

        alert(
          "पुराना नाम कॉपी किया गया। GitHub Actions में Filename में Paste करें और New filename में नया नाम लिखें: " +
          newName.value.trim()
        );

        window.open(
          "https://github.com/sahusatish40-bit/govt-boys-ms-g-jamgaon/actions/workflows/gallery-manager.yml",
          "_blank"
        );
      };

      const remove = document.createElement("button");
      remove.textContent = "🗑️ Delete";
      remove.type = "button";
      remove.onclick = async () => {
        if (!confirm("क्या यह फोटो हटानी है?\n" + file.name)) return;

        try {
          await navigator.clipboard.writeText(file.name);
        } catch (e) {
          alert("फोटो का नाम: " + file.name);
        }

        alert("GitHub Actions में Action = delete चुनें और Filename में फोटो का नाम Paste करें।");

        window.open(
          "https://github.com/sahusatish40-bit/govt-boys-ms-g-jamgaon/actions/workflows/gallery-manager.yml",
          "_blank"
        );
      };

      card.append(img, name, newName, rename, remove);
      box.appendChild(card);
    });

  } catch (error) {
    box.textContent = "त्रुटि: " + error.message;
  }
}


    const loginBox = el("loginBox");
    const adminTools = el("adminTools");
    const loginMessage = el("loginMessage");
    const adminMessage = el("adminMessage");
    const studentMessage = el("studentMessage");
    const studentList = el("studentList");
    const studentFilter = el("studentFilter");

    let students = [];
    let stopStudents = null;
    let exams = [];

    function renderNotices(snap) {
      if (!noticeList) return;

      noticeList.innerHTML = "";

      if (snap.empty) {
        noticeList.textContent = "अभी कोई नई सूचना उपलब्ध नहीं है।";
        return;
      }

      snap.forEach(doc => {
        const d = doc.data();
        const a = document.createElement("article");
        const t = document.createElement("b");
        const date = document.createElement("time");

        a.className = "notice";
        t.textContent = d.text || "";

        date.textContent = d.createdAt
          ? d.createdAt.toDate().toLocaleDateString("hi-IN")
          : "नई सूचना";

        a.append(date, t);

        if (auth.currentUser?.uid === ADMIN_UID) {
          const b = document.createElement("button");
          b.textContent = "हटाएँ";

          b.onclick = async () => {
            if (confirm("क्या यह सूचना हटाएँ?")) {
              try {
                await db.collection("notices").doc(doc.id).delete();
              } catch (e) {
                alert(e.message);
              }
            }
          };

          a.appendChild(b);
        }

        noticeList.appendChild(a);
      });
    }

    db.collection("notices")
      .orderBy("createdAt", "desc")
      .limit(30)
      .onSnapshot(
        renderNotices,
        e => {
          console.error(e);
          if (noticeList) {
            noticeList.textContent = "सूचनाएँ लोड नहीं हो सकीं।";
          }
        }
      );

    function renderStudents() {
      studentList.innerHTML = "";

      const list = students.filter(s =>
        studentFilter.value === "all" ||
        s.className === studentFilter.value
      );

      if (!list.length) {
        studentList.textContent =
          "इस कक्षा में विद्यार्थी उपलब्ध नहीं हैं।";
        return;
      }

      const table = document.createElement("table");
      table.style.cssText = "width:100%;border-collapse:collapse";

      const h = document.createElement("tr");

      ["कक्षा", "रोल नं.", "विद्यार्थी", "अभिभावक",
       "जन्मतिथि", "मोबाइल", "कार्यवाही"].forEach(x => {
        const th = document.createElement("th");
        th.textContent = x;
        h.appendChild(th);
      });

      table.appendChild(h);

      list.forEach(s => {
        const tr = document.createElement("tr");

        [s.className, s.rollNo, s.name,
         s.guardianName || "—", s.dob || "—",
         s.mobile || "—"].forEach(v => {
          const td = document.createElement("td");
          td.textContent = v;
          tr.appendChild(td);
        });

        const td = document.createElement("td");
        const edit = document.createElement("button");
        const del = document.createElement("button");

        edit.textContent = "Edit";
        del.textContent = "हटाएँ";
               edit.onclick = async () => {
          const fields = [
            ["name", "विद्यार्थी का नाम", s.name],
            ["className", "कक्षा (6, 7 या 8)", s.className],
            ["rollNo", "रोल नंबर", s.rollNo],
            ["guardianName", "अभिभावक का नाम", s.guardianName || ""],
            ["dob", "जन्मतिथि (YYYY-MM-DD)", s.dob || ""],
            ["address", "पूरा पता", s.address || ""],
            ["mobile", "मोबाइल नंबर", s.mobile || ""]
          ];

          const v = {};

          for (const [k, label, old] of fields) {
            v[k] = prompt(label, old);
            if (v[k] === null) return;
          }

          if (
            !v.name.trim() ||
            !v.rollNo.trim() ||
            !["6", "7", "8"].includes(v.className.trim())
          ) {
            return alert("नाम, सही कक्षा और रोल नंबर आवश्यक हैं।");
          }

          if (
            v.mobile.trim() &&
            !/^[0-9+() -]{8,15}$/.test(v.mobile.trim())
          ) {
            return alert("सही मोबाइल नंबर लिखें।");
          }

          try {
            const updated = {};

            Object.entries(v).forEach(([k, x]) => {
              updated[k] = x.trim();
            });

            await db.collection("students")
              .doc(s.id)
              .update(updated);

            alert("विद्यार्थी की जानकारी अपडेट हो गई।");
          } catch (e) {
            alert("अपडेट नहीं हुआ: " + e.message);
          }
        };

        del.onclick = async () => {
          if (confirm(`क्या ${s.name} का रिकॉर्ड हटाना चाहते हैं?`)) {
            try {
              await db.collection("students").doc(s.id).delete();
              show(studentMessage, "रिकॉर्ड हटा दिया गया।");
            } catch (e) {
              show(studentMessage, e.message);
            }
          }
        };

        td.append(edit, del);
        tr.appendChild(td);
        table.appendChild(tr);
      });

      studentList.appendChild(table);
    }

    function beginStudentFeed() {
      if (stopStudents) stopStudents();

      stopStudents = db.collection("students")
        .orderBy("className")
        .onSnapshot(
          snap => {
            students = snap.docs.map(d => ({
              id: d.id,
              ...d.data()
            }));

            students.sort((a, b) =>
              a.className.localeCompare(b.className) ||
              String(a.rollNo).localeCompare(
                String(b.rollNo),
                undefined,
                { numeric: true }
              )
            );

            renderStudents();
          },
          e => {
            show(
              studentMessage,
              "विद्यार्थी सूची लोड नहीं हुई: " + e.message
            );
          }
        );
    }

    studentFilter.addEventListener("change", renderStudents);


// मुख्य Admin के लिए निजी विद्यार्थी विवरण
let privateStudentRecords = [];

function renderPrivateStudents() {
  const list = el("privateStudentList");
  const search = el("privateStudentSearch");
  const classFilter = el("privateClassFilter");

  if (!list) return;

  list.innerHTML = "";

  const query = (search.value || "").trim().toLowerCase();
  const selectedClass = classFilter.value;

  const filtered = privateStudentRecords.filter(item => {
    const name = (item.name || "").toLowerCase();

    const matchName = name.includes(query);
    const matchClass =
      selectedClass === "all" ||
      item.className === selectedClass;

    return matchName && matchClass;
  });

  if (!filtered.length) {
    list.textContent = "कोई विद्यार्थी नहीं मिला।";
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement("div");
    card.style.cssText =
      "border:1px solid #bbb;padding:12px;margin:10px 0;border-radius:8px";

    const heading = document.createElement("h4");
    heading.textContent =
      item.name + " | कक्षा " + item.className +
      " | रोल नं. " + item.rollNo;
    card.appendChild(heading);

    item.fields.forEach(([label, value]) => {
      const row = document.createElement("p");
      row.textContent = label + ": " + (value || "—");
      card.appendChild(row);
    });

    list.appendChild(card);
  });
}

el("privateStudentSearch").addEventListener(
  "input", renderPrivateStudents
);

el("privateClassFilter").addEventListener(
  "change", renderPrivateStudents
);

el("loadPrivateStudents").onclick = async () => {
  const message = el("privateStudentMessage");
  const btn = el("loadPrivateStudents");

  if (!auth.currentUser || auth.currentUser.uid !== ADMIN_UID) {
    return show(message, "केवल मुख्य Admin यह जानकारी देख सकता है।");
  }

  btn.disabled = true;
  show(message, "निजी विवरण लोड हो रहे हैं...");

  try {
    const [publicSnap, privateSnap] = await Promise.all([
      db.collection("students_public").get(),
      db.collection("students_private").get()
    ]);

    const publicMap = {};
    publicSnap.forEach(doc => {
      publicMap[doc.id] = doc.data();
    });

    privateStudentRecords = [];

    privateSnap.forEach(doc => {
      const p = doc.data();
      const s = publicMap[doc.id] || {};

      privateStudentRecords.push({
        name: s.name || "नाम उपलब्ध नहीं",
        className: s.className || "",
        rollNo: s.rollNo || "",
        fields: [
          ["पिता का नाम", p.guardianName],
          ["माता का नाम", p.motherName],
          ["जाति", p.caste],
          ["प्रवेश क्रमांक", p.admissionNo],
          ["प्रवेश दिनांक", p.admissionDate],
          ["जन्मतिथि", p.dob],
          ["मोबाइल", p.mobile],
          ["ग्राम", p.village],
          ["छात्रवृत्ति", p.scholarship],
          ["श्रम कार्ड", p.shramCard],
          ["जाति प्रमाण पत्र", p.casteCertificate],
          ["निवास प्रमाण पत्र", p.domicile],
          ["PEN नंबर", p.penNo],
          ["APAAR ID", p.apaarId]
        ]
      });
    });

    renderPrivateStudents();

    show(
      message,
      "कुल " + privateStudentRecords.length +
      " विद्यार्थियों का विवरण लोड हुआ।"
    );

  } catch (error) {
    console.error(error);
    show(message, "त्रुटि: " + error.message);
  } finally {
    btn.disabled = false;
  }
};



// Excel विद्यार्थी डेटा Preview
let excelStudentData = [];

el("previewExcel").onclick = async () => {
  const file = el("studentExcelFile").files[0];
  const message = el("excelImportMessage");
  const preview = el("excelPreview");
  const confirmBtn = el("confirmExcelImport");

  preview.innerHTML = "";
  confirmBtn.hidden = true;
  excelStudentData = [];

  if (!file) {
    return show(message, "पहले Excel फाइल चुनें।");
  }

  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });

    const classSheets = [
      { name: "class 6th", className: "6" },
      { name: "class 7th", className: "7" },
      { name: "class 8 th", className: "8" }
    ];

    classSheets.forEach(item => {
      const sheet = workbook.Sheets[item.name];

      if (!sheet) return;

      const rows = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: ""
      });

      rows.slice(2).forEach(row => {
        const name = String(row[1] || "").trim();
        if (!name) return;

        excelStudentData.push({
          name,
          className: item.className,
          rollNo: String(row[0]).trim(),
          guardianName: String(row[2] || "").trim(),
          motherName: String(row[3] || "").trim(),
          caste: String(row[4] || "").trim(),
          admissionNo: String(row[5] || "").trim(),
          admissionDate: String(row[6] || "").trim(),
          dob: String(row[7] || "").trim(),
          mobile: String(row[9] || "").trim(),
          village: String(row[11] || "").trim(),
          scholarship: String(row[12] || "").trim(),
          shramCard: String(row[13] || "").trim(),
          casteCertificate: String(row[14] || "").trim(),
          domicile: String(row[15] || "").trim(),
          penNo: String(row[16] || "").trim(),
          apaarId: String(row[17] || "").trim()
        });
      });
    });

    if (!excelStudentData.length) {
      return show(message, "कोई विद्यार्थी रिकॉर्ड नहीं मिला।");
    }

    const table = document.createElement("table");
    table.style.cssText =
      "width:100%;border-collapse:collapse";

    table.innerHTML =
      "<tr><th>कक्षा</th><th>रोल नं.</th>" +
      "<th>विद्यार्थी का नाम</th></tr>";

    excelStudentData.forEach(student => {
      const tr = document.createElement("tr");
      [student.className, student.rollNo, student.name]
        .forEach(value => {
          const td = document.createElement("td");
          td.textContent = value;
          tr.appendChild(td);
        });
      table.appendChild(tr);
    });

    preview.appendChild(table);
confirmBtn.hidden = false;

    show(
      message,
      "Preview तैयार: " + excelStudentData.length +
      " विद्यार्थी। कक्षा 9वीं शामिल नहीं है।"
    );

  } catch (error) {
    show(message, "Excel पढ़ने में त्रुटि: " + error.message);
  }
};

// Excel डेटा को सुरक्षित रूप से Firebase में Import करना
el("confirmExcelImport").onclick = async () => {
  const message = el("excelImportMessage");
  const confirmBtn = el("confirmExcelImport");

  if (!auth.currentUser || auth.currentUser.uid !== ADMIN_UID) {
    return show(message, "केवल मुख्य Admin Import कर सकता है।");
  }

  if (!excelStudentData.length) {
    return show(message, "पहले Excel Preview करें।");
  }

  const ok = confirm(
    "क्या आप " + excelStudentData.length +
    " विद्यार्थियों का डेटा Firebase में सेव करना चाहते हैं?\n\n" +
    "सार्वजनिक जानकारी और निजी जानकारी अलग-अलग सेव होगी।\n" +
    "Aadhaar नंबर Import नहीं होगा।"
  );

  if (!ok) return;

  confirmBtn.disabled = true;
  show(message, "डेटा Firebase में सेव हो रहा है...");

  try {
    const existingSnap = await db.collection("students").get();

const existingByKey = new Map();

existingSnap.forEach(doc => {
  const d = doc.data();
  const key = d.className + "|" + String(d.rollNo).trim();
  existingByKey.set(key, doc.id);
});

const batch = db.batch();

    excelStudentData.forEach(student => {
      const safeRoll = String(student.rollNo)
        .trim()
        .replace(/[^a-zA-Z0-9_-]/g, "_");

      const docId =
        "class_" + student.className + "_roll_" + safeRoll;

      // सार्वजनिक जानकारी: केवल नाम, कक्षा और रोल नंबर
      const publicRef = db
        .collection("students_public")
        .doc(docId);

      batch.set(publicRef, {
        name: student.name,
        className: student.className,
        rollNo: student.rollNo,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // निजी जानकारी: केवल Admin के लिए
      const privateRef = db
        .collection("students_private")
        .doc(docId);

      batch.set(privateRef, {
        guardianName: student.guardianName,
        motherName: student.motherName,
        caste: student.caste,
        admissionNo: student.admissionNo,
        admissionDate: student.admissionDate,
        dob: student.dob,
        mobile: student.mobile,
        village: student.village,
        scholarship: student.scholarship,
        shramCard: student.shramCard,
        casteCertificate: student.casteCertificate,
        domicile: student.domicile,
        penNo: student.penNo,
        apaarId: student.apaarId,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    });

    await batch.commit();

    show(
      message,
      "सफलता! " + excelStudentData.length +
      " विद्यार्थियों का डेटा Firebase में सेव हो गया।"
    );

    confirmBtn.hidden = true;
    confirmBtn.disabled = false;

  } catch (error) {
    console.error("Excel Import Error:", error);
    show(message, "Import में त्रुटि: " + error.message);
    confirmBtn.disabled = false;
  }
};

// शिक्षक प्रबंधन: सूची, जोड़ना, एडिट और डिलीट

const teacherList = el("teacherList");
const teacherMessage = el("teacherMessage");

let teachers = [];

function renderTeachers() {
  teacherList.innerHTML = "";

  if (!teachers.length) {
    teacherList.textContent = "अभी कोई शिक्षक दर्ज नहीं है।";
    return;
  }

  teachers.forEach(t => {
    const box = document.createElement("div");
    box.style.cssText =
      "border:1px solid #ccc;padding:10px;margin:8px 0;border-radius:8px";

    const info = document.createElement("p");
    info.textContent =
      t.name + " | " + (t.post || "—") +
      " | " + (t.subject || "—") +
      " | " + (t.mobile || "—");

    const edit = document.createElement("button");
    edit.textContent = "Edit";

    edit.onclick = async () => {
      const name = prompt("शिक्षक का नाम", t.name);
      if (name === null) return;

      const post = prompt("पद", t.post || "");
      if (post === null) return;

      const subject = prompt("विषय", t.subject || "");
      if (subject === null) return;

      const mobile = prompt("मोबाइल नंबर", t.mobile || "");
      if (mobile === null) return;

      const photo = prompt("फोटो लिंक", t.photo || "");
      if (photo === null) return;

      if (!name.trim()) {
        alert("शिक्षक का नाम आवश्यक है।");
        return;
      }

      try {
        await db.collection("teachers").doc(t.id).update({
          name: name.trim(),
          post: post.trim(),
          subject: subject.trim(),
          mobile: mobile.trim(),
          photo: photo.trim()
        });

        show(teacherMessage, "शिक्षक की जानकारी अपडेट हो गई।");
      } catch (e) {
        show(teacherMessage, "त्रुटि: " + e.message);
      }
    };

    const del = document.createElement("button");
    del.textContent = "हटाएँ";

    del.onclick = async () => {
      if (!confirm("क्या इस शिक्षक का रिकॉर्ड हटाना चाहते हैं?")) return;

      try {
        await db.collection("teachers").doc(t.id).delete();
        show(teacherMessage, "शिक्षक का रिकॉर्ड हटा दिया गया।");
      } catch (e) {
        show(teacherMessage, "त्रुटि: " + e.message);
      }
    };

    box.append(info, edit, del);
    teacherList.appendChild(box);
  });
}

let stopTeachers = null;

function beginTeacherFeed() {
  if (stopTeachers) stopTeachers();

  stopTeachers = db.collection("teachers")
    .orderBy("name")
    .onSnapshot(
      snap => {
        teachers = snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));
        
// Admin की शिक्षक सूची को सार्वजनिक Collection में सुरक्षित रूप से कॉपी करें
const publicBatch = db.batch();

snap.docs.forEach(doc => {
  const t = doc.data();

  publicBatch.set(
    db.collection("teachers_public").doc(doc.id),
    {
      name: t.name || "",
      post: t.post || "",
      subject: t.subject || "",
      photo: t.photo || ""
    },
    { merge: true }
  );
});

publicBatch.commit().catch(error => {
  console.error("Public teacher sync error:", error);
});

        renderTeachers();
      },
      e => show(
        teacherMessage,
        "शिक्षक सूची लोड नहीं हुई: " + e.message
      )
    );
}

el("saveTeacher").onclick = async () => {
  const name = el("teacherName").value.trim();

  if (!name) {
    return show(teacherMessage, "शिक्षक का नाम लिखें।");
  }

  try {
    await db.collection("teachers").add({
      name,
      post: el("teacherPost").value.trim(),
      subject: el("teacherSubject").value.trim(),
      mobile: el("teacherMobile").value.trim(),
      photo: el("teacherPhoto").value.trim(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdBy: auth.currentUser.uid
    });

    [
      "teacherName",
      "teacherPost",
      "teacherSubject",
      "teacherMobile",
      "teacherPhoto"
    ].forEach(id => el(id).value = "");

    show(teacherMessage, "शिक्षक सफलतापूर्वक जोड़ दिया गया।");
  } catch (e) {
    show(teacherMessage, "सेव नहीं हुआ: " + e.message);
  }
};
    // विषय और पूर्णांक पढ़ना
    function parseSubjects() {
      return el("examSubjects").value
        .split("\n")
        .map(x => x.trim())
        .filter(Boolean)
        .map(line => {
          const p = line.split(",").map(x => x.trim());

          const theoryMax = Number(p[1]);
          const practicalMax = Number(p[2] || 0);

          if (
            !p[0] ||
            p.length < 2 ||
            !Number.isFinite(theoryMax) ||
!Number.isFinite(practicalMax) ||
theoryMax < 0 ||
practicalMax < 0 ||
theoryMax + practicalMax <= 0
) {
  throw Error("विषय की पंक्ति ऐसे लिखें: हिंदी,20,5");
}

return {
  name: p[0],
  theoryMax,
  practicalMax
};
});
}

// परीक्षा सूची लोड करना
async function loadExams() {
  if (auth.currentUser?.uid !== ADMIN_UID) return;

  try {
    const snap = await db.collection("exams")
      .orderBy("createdAt", "desc")
      .get();

    exams = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    el("examSelect").innerHTML =
      '<option value="">परीक्षा चुनें</option>';

    exams.forEach(x => {
      const o = document.createElement("option");
      o.value = x.id;
      o.textContent = x.title + " — कक्षा " + x.className;
      el("examSelect").appendChild(o);
    });

  } catch (e) {
    show(el("examMessage"), "परीक्षा सूची नहीं खुली: " + e.message);
  }
}

// नई परीक्षा बनाना
el("createExam").onclick = async () => {
  const title = el("examTitle").value.trim();

  if (!title) {
    return show(el("examMessage"), "परीक्षा का नाम लिखें।");
  }

  let subjects;

  try {
    subjects = parseSubjects();
  } catch (e) {
    return show(el("examMessage"), e.message);
  }

  if (!subjects.length) {
    return show(el("examMessage"), "कम से कम एक विषय जोड़ें।");
  }

  const b = el("createExam");
  b.disabled = true;

  try {
    await db.collection("exams").add({
      title,
      className: el("examClass").value,
      session: "2026-27",
      subjects,
      createdBy: auth.currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    el("examTitle").value = "";
    el("examSubjects").value = "";

    show(el("examMessage"), "परीक्षा बन गई।");
    await loadExams();

  } catch (e) {
    show(el("examMessage"), "परीक्षा सेव नहीं हुई: " + e.message);
  } finally {
    b.disabled = false;
  }
};
    el("examSelect").addEventListener("change", async () => {
      const examId = el("examSelect").value;
      const area = el("examMarksArea");

      area.innerHTML = "";

      if (!examId) return;

      const exam = exams.find(x => x.id === examId);
      if (!exam) return;

      const classStudents = students.filter(
        s => s.className === exam.className
      );

      if (!classStudents.length) {
        area.textContent = "इस कक्षा में विद्यार्थी उपलब्ध नहीं हैं।";
        return;
      }

      const heading = document.createElement("h3");
      heading.textContent = exam.title + " — कक्षा " + exam.className;
      area.appendChild(heading);

      const table = document.createElement("table");
      table.style.cssText =
        "width:100%;border-collapse:collapse;min-width:600px";

      const head = document.createElement("tr");

      ["विद्यार्थी", "रोल नंबर", "उपस्थिति", ...exam.subjects.map(s =>
        s.name + " (" + (s.theoryMax + s.practicalMax) + ")"
      )].forEach(x => {
        const th = document.createElement("th");
        th.textContent = x;
        head.appendChild(th);
      });

      table.appendChild(head);

      let savedMarks = {};

      try {
        const snap = await db.collection("exams")
          .doc(examId)
          .collection("marks")
          .get();

        snap.forEach(d => {
          savedMarks[d.id] = d.data();
        });
      } catch (e) {
        area.textContent = "अंक लोड नहीं हुए: " + e.message;
        return;
      }

      classStudents.forEach(student => {
        const tr = document.createElement("tr");

        const name = document.createElement("td");
        name.textContent = student.name;
        tr.appendChild(name);

        const roll = document.createElement("td");
        roll.textContent = student.rollNo;
        tr.appendChild(roll);
const attendance = document.createElement("select");
attendance.innerHTML =
  '<option value="P">उपस्थित (P)</option>' +
  '<option value="A">अनुपस्थित (A)</option>';

attendance.value = savedMarks[student.id]?.attendance || "P";

const attendanceTd = document.createElement("td");
attendanceTd.appendChild(attendance);
tr.appendChild(attendanceTd);
        exam.subjects.forEach((subject, index) => {
          const td = document.createElement("td");

          const old = savedMarks[student.id]?.marks?.[index] || {};

          const theory = document.createElement("input");
          theory.type = "number";
          theory.min = "0";
          theory.max = subject.theoryMax;
          theory.placeholder = "थ्योरी";
          theory.value = old.theory ?? "";
          theory.style.width = "65px";

          const practical = document.createElement("input");
          practical.type = "number";
          practical.min = "0";
          practical.max = subject.practicalMax;
          practical.placeholder = "प्रैक्टिकल";
          practical.value = old.practical ??
            "";
          practical.style.width = "75px";

          td.appendChild(theory);

          if (subject.practicalMax > 0) {
            td.appendChild(practical);
          }

          td.dataset.subjectIndex = index;
          td.appendChild(document.createElement("br"));

          tr.appendChild(td);
        });

        tr.dataset.studentId = student.id;
        table.appendChild(tr);
      });

      const wrapper = document.createElement("div");
      wrapper.style.overflowX = "auto";
      wrapper.appendChild(table);
      area.appendChild(wrapper);

      const saveButton = document.createElement("button");
      saveButton.textContent = "सभी अंक सेव करें";

      saveButton.onclick = async () => {
        saveButton.disabled = true;

        try {
          const batch = db.batch();

          for (const row of table.querySelectorAll("tr[data-student-id]")) {
            const studentId = row.dataset.studentId;
            const attendance = row.querySelector("select").value;
            const marks = [];

            for (const td of row.querySelectorAll("td[data-subject-index]")) {
              const index = Number(td.dataset.subjectIndex);
              const subject = exam.subjects[index];
              const inputs = td.querySelectorAll("input");

              const theory = Number(inputs[0].value || 0);
              const practical = subject.practicalMax > 0
                ? Number(inputs[1].value || 0)
                : 0;

              if (
                theory < 0 ||
                theory > subject.theoryMax ||
                practical < 0 ||
                practical > subject.practicalMax
              ) {
                throw Error("अंक पूर्णांक से अधिक नहीं हो सकते।");
              }

              marks.push({
                theory,
                practical,
                total: theory + practical
              });
            }

            const ref = db.collection("exams")
              .doc(examId)
              .collection("marks")
              .doc(studentId);

            batch.set(ref, {
              studentId,
              attendance,
              marks,
              updatedBy: auth.currentUser.uid,
              updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
          }

          await batch.commit();
          show(el("examMessage"), "सभी अंक सफलतापूर्वक सेव हो गए।");
          alert("अंक सेव हो गए।");

        } catch (e) {
          alert("अंक सेव नहीं हुए: " + e.message);
        } finally {
          saveButton.disabled = false;
        }
      };

      area.appendChild(saveButton);
         // रिजल्ट और मार्कशीट 
      const resultBtn = document.createElement("button");
      resultBtn.textContent = "रिजल्ट / मार्कशीट देखें";

      resultBtn.onclick = async () => {
        try {
          const snap = await db.collection("exams")
            .doc(examId).collection("marks").get();

          const data = {};
          snap.forEach(d => data[d.id] = d.data());

          const results = classStudents.map(student => {
            const saved = data[student.id] || {};
            let obtained = 0;
            let maximum = 0;

            const rows = exam.subjects.map((sub, i) => {
              const m = saved.marks?.[i] || {};
              const theory = Number(m.theory || 0);
              const practical = Number(m.practical || 0);
              const total = theory + practical;
              const max = sub.theoryMax + sub.practicalMax;

              obtained += total;
              maximum += max;

              return {
                name: sub.name,
                theory,
                practical,
                total,
                max,
                theoryMax: sub.theoryMax,
                practicalMax: sub.practicalMax
              };
            });

            const percent = maximum ? obtained / maximum * 100 : 0;

            const grade = percent >= 91 ? "A+" :
              percent >= 81 ? "A" :
              percent >= 71 ? "B+" :
              percent >= 61 ? "B" :
              percent >= 51 ? "C+" :
              percent >= 41 ? "C" :
              percent >= 33 ? "D" : "E";

            return {
              student, rows, obtained, maximum, percent, grade
            };
          });

          const box = document.createElement("div");
          box.innerHTML = "<h3>कक्षा " + exam.className +
            " — " + exam.title + " का रिजल्ट</h3>";

          const table = document.createElement("table");
          table.style.cssText =
            "width:100%;border-collapse:collapse;min-width:600px";

          table.innerHTML =
            "<tr><th>रोल नं.</th><th>विद्यार्थी</th>" +
            "<th>प्राप्तांक</th><th>पूर्णांक</th>" +
            "<th>प्रतिशत</th><th>ग्रेड</th><th>मार्कशीट</th></tr>";

          results.forEach(r => {
            const tr = document.createElement("tr");

            [
              r.student.rollNo,
              r.student.name,
              r.obtained,
              r.maximum,
              r.percent.toFixed(2) + "%",
              r.grade
            ].forEach(v => {
              const td = document.createElement("td");
              td.textContent = v;
              tr.appendChild(td);
            });

            const td = document.createElement("td");
            const btn = document.createElement("button");
            btn.textContent = "PDF / Print";

            btn.onclick = () => {
              const w = window.open("", "_blank");
              if (!w) {
                alert("Pop-up अनुमति दें।");
                return;
              }

              const subjectRows = r.rows.map(m =>
                "<tr><td>" + m.name + "</td><td>" +
                m.theory + "/" + m.theoryMax +
                "</td><td>" + m.practical + "/" +
                m.practicalMax + "</td><td>" +
                m.total + "/" + m.max + "</td></tr>"
              ).join("");

              w.document.write(
                "<html><head><meta charset='UTF-8'>" +
                "<title>अंकसूची</title>" +
                "<style>body{font-family:Arial;padding:20px}" +
                "h2,p{text-align:center}" +
                "table{width:100%;border-collapse:collapse;margin-top:20px}" +
                "td,th{border:1px solid;padding:8px;text-align:center}" +
                ".sign{margin-top:70px;display:flex;" +
                "justify-content:space-between}</style></head><body>" +

                "<h2>शासकीय उच्चतर माध्यमिक विद्यालय जी- जामगाँव (बालक माध्य.)</h2>" +
                "<p>वि.ख. कुरुद, जिला धमतरी (छ.ग.)</p>" +
                "<h2>अंकसूची सत्र 2026-27</h2>" +
                "<p>परीक्षा: " + exam.title + "</p>" +
                "<p>कक्षा: " + exam.className +
                " | रोल नंबर: " + r.student.rollNo + "</p>" +
                "<p>विद्यार्थी: " + r.student.name + "</p>" +

                "<table><tr><th>विषय</th><th>थ्योरी</th>" +
                "<th>प्रायोगिक</th><th>कुल</th></tr>" +
                subjectRows + "</table>" +

                "<h3>कुल अंक: " + r.obtained + "/" + r.maximum + "</h3>" +
                "<h3>प्रतिशत: " + r.percent.toFixed(2) +
                "% | ग्रेड: " + r.grade + "</h3>" +

                "<div class='sign'><span>कक्षा शिक्षक</span>" +
                "<span>प्रधानपाठक</span></div>" +
                "<script>window.onload=function(){window.print()}<\/script>" +
                "</body></html>"
              );

              w.document.close();
            };

            td.appendChild(btn);
            tr.appendChild(td);
            table.appendChild(tr);
          });

          box.appendChild(table);
          const old = area.querySelector(".resultBox");
          if (old) old.remove();
          box.className = "resultBox";
          area.appendChild(box);

        } catch (e) {
          alert("रिजल्ट त्रुटि: " + e.message);
        }
      };
      // पूरी कक्षा की A4 रिजल्ट शीट
      const classSheetBtn = document.createElement("button");
      classSheetBtn.textContent = "पूरी कक्षा की रिजल्ट शीट (A4)";

      classSheetBtn.onclick = async () => {
        try {
          const snap = await db.collection("exams")
            .doc(examId).collection("marks").get();

          const saved = {};
          snap.forEach(d => saved[d.id] = d.data());

          const results = classStudents.map(student => {
            let obtained = 0, maximum = 0;

            const subjects = exam.subjects.map((sub, i) => {
              const m = saved[student.id]?.marks?.[i] || {};
              const total = Number(m.theory || 0) +
                Number(m.practical || 0);
              const max = sub.theoryMax + sub.practicalMax;
              obtained += total;
              maximum += max;
              return { obtained: total, maximum: max };
            });

            const percent = maximum ? obtained / maximum * 100 : 0;
            const grade = percent >= 91 ? "A+" :
              percent >= 81 ? "A" :
              percent >= 71 ? "B+" :
              percent >= 61 ? "B" :
              percent >= 51 ? "C+" :
              percent >= 41 ? "C" :
              percent >= 33 ? "D" : "E";

            const attendance = saved[student.id]?.attendance || "P";
return { student, subjects, obtained, maximum, percent, grade, attendance };
          });

          results.sort((a, b) =>
  (a.attendance === "A") - (b.attendance === "A") ||
  b.percent - a.percent
);



         let rank = 0;
let last = -1;

results.forEach(r => {
  if (r.attendance === "A") {
    r.rank = "—";
    return;
  }
  if (r.percent !== last) rank++;
  r.rank = rank;
  last = r.percent;
});
          const presentCount = results.filter(r => r.attendance === "P").length;
const absentCount = results.filter(r => r.attendance === "A").length;

const passedCount = results.filter(
  r => r.attendance === "P" && r.percent >= 33
).length;

const failedCount = presentCount - passedCount;

const averagePercent = presentCount
  ? results.filter(r => r.attendance === "P")
      .reduce((sum, r) => sum + r.percent, 0) / presentCount
  : 0;

const topper = results.find(r => r.attendance === "P");

          const w = window.open("", "_blank");
          if (!w) {
            alert("Pop-up की अनुमति दें।");
            return;
          }

          const headers = exam.subjects.map(s =>
  "<th>" + s.name + " प्राप्तांक</th>" +
  "<th>" + s.name + " पूर्णांक</th>"
).join("");

          const body = results.map(r =>
            "<tr><td>" + r.rank + "</td><td>" +
            r.student.rollNo + "</td><td>" +
            r.student.name + "</td><td>" +
(r.attendance === "P" ? "उपस्थित" : "अनुपस्थित") + "</td>" +
            r.subjects.map(x =>
  "<td>" + x.obtained + "</td>" +
  "<td>" + x.maximum + "</td>"
).join("") +
"<td>" + r.obtained + "</td>" +
"<td>" + r.maximum + "</td>" +
"<td>" + r.percent.toFixed(2) +
            "%</td><td>" + r.grade + "</td></tr>"
          ).join("");

          w.document.write(
            "<html><head><meta charset='UTF-8'>" +
            "<title>कक्षा रिजल्ट</title>" +
            "<style>@page{size:A4 landscape;margin:10mm}" +
            "body{font-family:Arial}h2,p{text-align:center}" +
            "table{width:100%;border-collapse:collapse;font-size:10px}" +
            "th,td{border:1px solid;padding:5px;text-align:center}" +
            ".sign{display:flex;justify-content:space-between;margin-top:50px}" +
            "</style></head><body>" +
            "<h2>शासकीय उच्चतर माध्यमिक विद्यालय जी- जामगाँव (बालक माध्य.)</h2>" +
            "<p>वि.ख. कुरुद, जिला धमतरी (छ.ग.)</p>" +
            "<h2>सामूहिक परीक्षा परिणाम 2026-27</h2>" +
            "<p>परीक्षा: " + exam.title + " | कक्षा: " +
            exam.className + "</p>" +
            "<p>कुल विद्यार्थी: " + results.length +
" | उपस्थित: " + presentCount +
" | अनुपस्थित: " + absentCount +
" | उत्तीर्ण: " + passedCount +
" | अनुत्तीर्ण: " + failedCount +
" | औसत प्रतिशत: " + averagePercent.toFixed(2) +
"%</p>" +
(topper
  ? "<p>कक्षा टॉपर: " + topper.student.name +
    " (" + topper.percent.toFixed(2) + "%)</p>"
  : "") +
            "<table><tr><th>रैंक</th><th>रोल नं.</th>" +
            "<th>विद्यार्थी</th><th>उपस्थिति</th>" + headers +
            "<th>कुल प्राप्तांक</th><th>कुल पूर्णांक</th>" +
"<th>प्रतिशत</th><th>ग्रेड</th></tr>" +
            body + "</table>" +
            "<div class='sign'><span>कक्षा शिक्षक</span>" +
            "<span>प्रधानपाठक</span></div>" +
            "<script>window.onload=function(){window.print()}<\\/script>" +
            "</body></html>"
          );

          w.document.close();
        } catch (e) {
          alert("रिजल्ट त्रुटि: " + e.message);
        }
      };

      area.appendChild(classSheetBtn);
      area.appendChild(resultBtn);});

    el("loginBtn").onclick = async () => {
      const email = el("adminEmail").value.trim();
      const password = el("adminPassword").value;

      if (!email || !password) {
        return show(loginMessage, "ईमेल और पासवर्ड भरें।");
      }

      try {
        await auth.signInWithEmailAndPassword(email, password);
      } catch (e) {
        show(loginMessage, "Login Error: " + e.message);
      }
    };

    el("logoutBtn").onclick = () => auth.signOut();

    el("addNotice").onclick = async () => {
      const text = el("noticeInput").value.trim();

      if (!text) {
        return show(adminMessage, "सूचना लिखें।");
      }

      try {
        await db.collection("notices").add({
          text,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          createdBy: auth.currentUser.uid
        });

        el("noticeInput").value = "";
        show(adminMessage, "सूचना प्रकाशित हो गई।");

      } catch (e) {
        show(adminMessage, "Error: " + e.message);
      }
    };

    el("saveStudent").onclick = async () => {
      const name = el("studentName").value.trim();
      const className = el("studentClass").value;
      const rollNo = el("studentRoll").value.trim();

      if (!name || !rollNo) {
        return show(studentMessage, "नाम और रोल नंबर आवश्यक हैं।");
      }

      try {
        await db.collection("students").add({
          name,
          className,
          rollNo,
          guardianName: el("guardianName").value.trim(),
          dob: el("studentDob").value,
          address: el("studentAddress").value.trim(),
          mobile: el("studentMobile").value.trim(),
          createdBy: auth.currentUser.uid,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        [
          "studentName",
          "studentRoll",
          "guardianName",
          "studentDob",
          "studentAddress",
          "studentMobile"
        ].forEach(id => el(id).value = "");

        show(studentMessage, "विद्यार्थी जोड़ दिया गया।");

      } catch (e) {
        show(studentMessage, "Error: " + e.message);
      }
    };

    auth.onAuthStateChanged(async user => {
      if (user && user.uid === ADMIN_UID) {
        loginBox.hidden = true;
        adminTools.hidden = false;
     beginStudentFeed();
beginTeacherFeed();
loadAdminGallery();
await loadExams();

      } else {
        if (user) {
          await auth.signOut();
          show(loginMessage, "आपको एडमिन की अनुमति नहीं है।");
        }

        loginBox.hidden = false;
        adminTools.hidden = true;

        if (stopStudents)
{
  stopStudents();
  stopStudents = null;
}
if (stopTeachers) {
  stopTeachers();
  stopTeachers = null;
}
      }
    });

  } catch (e) {
    console.error("School Website Error:", e);

    if (adminBox) {
      adminBox.innerHTML =
        "<p style='color:red'>लोडिंग में त्रुटि: " +
        e.message +
        "</p>";
    }
  }
}


// GitHub images Folder से सभी फोटो अपने-आप लोड करें
async function loadAutoGallery() {
  const box = document.getElementById("autoGallery");
  if (!box) return;

  try {
    const response = await fetch(
      "https://api.github.com/repos/sahusatish40-bit/govt-boys-ms-g-jamgaon/contents/images"
    );

    if (!response.ok) {
      throw new Error("GitHub से फोटो सूची नहीं मिली।");
    }

    const files = await response.json();

    const images = files
      .filter(file =>
        file.type === "file" &&
        /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name)
      )
      .sort((a, b) => b.name.localeCompare(a.name));

    box.innerHTML = "";

    if (images.length === 0) {
      box.textContent = "अभी images Folder में कोई फोटो नहीं है।";
      return;
    }

    images.forEach(file => {
      const card = document.createElement("div");

      const img = document.createElement("img");
      img.src = file.download_url;
      img.alt = file.name;
      img.loading = "lazy";
      img.style.cssText = "width:100%;height:200px;object-fit:cover;border-radius:12px;";

      const caption = document.createElement("p");
      caption.textContent = file.name.replace(/\.[^.]+$/, "");

      card.append(img, caption);
      box.appendChild(card);
    });

  } catch (error) {
    box.textContent = "फोटो लोड नहीं हुईं: " + error.message;
  }
}

loadAutoGallery();

startSchoolWebsite();
