
// School Sathi - Aggregate Result Dashboard
(function () {
  const results = {
    "July 2026": [
      {c:6,p:63.47,n:10},
      {c:7,p:54.05,n:13},
      {c:8,p:54.61,n:11}
    ],
    "August 2026": [
      {c:6,p:64.13,n:10},
      {c:7,p:59.21,n:13},
      {c:8,p:68.06,n:11}
    ],
    "Quarterly September 2026": [
      {c:6,p:58.53,n:10},
      {c:7,p:51.99,n:13},
      {c:8,p:68.15,n:11}
    ],
    "October 2026": [
      {c:6,p:73.47,n:10},
      {c:7,p:59.45,n:13},
      {c:8,p:70.00,n:11}
    ]
  };

  function initResultDashboard() {
    const output = document.getElementById("resultOutput");
    if (!output) return;

    output.innerHTML = `
      <div style="margin-top:25px;text-align:left">
        <h3>विद्यालय का सामूहिक परीक्षा परिणाम 2026–27</h3>
        <label for="aggregateExam">परीक्षा चुनें</label>
        <select id="aggregateExam" style="width:100%;padding:12px;margin:10px 0">
          ${Object.keys(results).map(x => `<option>${x}</option>`).join("")}
        </select>
        <div id="aggregateTable"></div>
        <hr style="margin:25px 0">
        <h3>चारों परीक्षाओं की तुलनात्मक प्रगति</h3>
        <p style="font-size:13px">कक्षा-वार औसत प्रतिशत</p>
        <div id="progressChart"></div>
        <p style="font-size:13px;margin-top:12px">
          कक्षा 7 में 13 विद्यार्थी उपस्थित और 2 अनुपस्थित थे।
          जुलाई में 2 विषयों के अंक दर्ज नहीं हैं।
          यह सामूहिक रिपोर्ट है, व्यक्तिगत अंक नहीं।
        </p>
      </div>`;

    const select = document.getElementById("aggregateExam");

    function showResult() {
      const rows = results[select.value];

      document.getElementById("aggregateTable").innerHTML = `
        <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <th style="border:1px solid #ccc;padding:10px">कक्षा</th>
            <th style="border:1px solid #ccc;padding:10px">औसत प्रतिशत</th>
            <th style="border:1px solid #ccc;padding:10px">विद्यार्थी</th>
          </tr>
          ${rows.map(r => `
            <tr>
              <td style="border:1px solid #ccc;padding:10px;text-align:center">कक्षा ${r.c}</td>
              <td style="border:1px solid #ccc;padding:10px;text-align:center;font-weight:bold">${r.p.toFixed(2)}%</td>
              <td style="border:1px solid #ccc;padding:10px;text-align:center">${r.n}</td>
            </tr>`).join("")}
        </table></div>`;
    }

    const chart = document.getElementById("progressChart");
    const colors = {6:"#2878d0",7:"#e39b27",8:"#299b68"};

    chart.innerHTML = Object.entries(results).map(([exam, rows]) => `
      <div style="margin:18px 0">
        <b>${exam}</b>
        ${rows.map(r => `
          <div style="margin:10px 0">
            <div style="display:flex;justify-content:space-between;font-size:13px">
              <span>कक्षा ${r.c}</span><b>${r.p.toFixed(2)}%</b>
            </div>
            <div style="height:13px;background:#e8e8e8;border-radius:8px;overflow:hidden">
              <div style="height:13px;width:${r.p}%;background:${colors[r.c]};border-radius:8px"></div>
            </div>
          </div>`).join("")}
      </div>`).join("");

    select.addEventListener("change", showResult);
    showResult();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initResultDashboard);
  } else {
    initResultDashboard();
  }
})();
