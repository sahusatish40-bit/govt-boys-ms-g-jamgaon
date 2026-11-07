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

    const auth = firebase.auth();
    const db = firebase.firestore();

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

      ["विद्यार्थी", "रोल नंबर", ...exam.subjects.map(s =>
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
    });      // रिजल्ट और मार्कशीट
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

      area.appendChild(resultBtn);

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

startSchoolWebsite();
