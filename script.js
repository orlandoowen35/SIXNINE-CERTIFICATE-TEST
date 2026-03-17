let pursuitTime = 1200000, vcbTime = 180000;
let pursuitInterval, vcbInterval;
let vcbCount = 0, logs = [], resultStatus = "UNSET";

// Variabel Pagination
let currentPage = 1;
const rowsPerPage = 5; 

const pDisp = document.getElementById("pursuitDisplay");
const vDisp = document.getElementById("vcbDisplay");
const vCountDisp = document.getElementById("vcbCountDisplay");
const btnStart = document.getElementById("btnStartPursuit");
const btnStop = document.getElementById("btnStopPursuit");
const btnVCB = document.getElementById("btnVCB");
const btnFound = document.getElementById("btnFound");

function formatTime(ms){
    const totalSeconds = Math.floor(ms/1000);
    const m = Math.floor(totalSeconds/60), s = totalSeconds % 60;
    const milli = Math.floor((ms%1000)/10);
    return `${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}<span class="ms-small">.${milli.toString().padStart(2,"0")}</span>`;
}

function formatLogTime(ms){
    const totalSeconds = Math.floor(ms/1000);
    return `${Math.floor(totalSeconds/60).toString().padStart(2,"0")}:${(totalSeconds % 60).toString().padStart(2,"0")}`;
}

function updateUI(){ pDisp.innerHTML = formatTime(pursuitTime); vDisp.innerHTML = formatTime(vcbTime); }

btnStart.onclick = () => { stopVCB(); startPursuit(); };
btnStop.onclick = () => stopPursuit();

function startPursuit(){
    if(pursuitInterval) return;
    btnStart.disabled = true; btnStop.disabled = false; btnVCB.disabled = false;
    addLog(`START @ ${formatLogTime(pursuitTime)}`);
    pursuitInterval = setInterval(()=>{
        if(pursuitTime > 0){ pursuitTime -= 10; pDisp.innerHTML = formatTime(pursuitTime); }
        else { stopPursuit(); addLog("EXPIRED"); }
    },10);
}

function stopPursuit(){
    clearInterval(pursuitInterval); pursuitInterval = null;
    btnStop.disabled = true; btnStart.disabled = false;
    addLog(`PAUSE @ ${formatLogTime(pursuitTime)}`);
}

btnVCB.onclick = () => {
    stopPursuit(); vcbCount++; vCountDisp.innerText = vcbCount;
    btnVCB.disabled = true; btnFound.disabled = false;
    addLog(`10-99 START (#${vcbCount})`);
    vcbInterval = setInterval(()=>{
        if(vcbTime > 0){ vcbTime -= 10; vDisp.innerHTML = formatTime(vcbTime); }
        else { stopVCB(); addLog("10-99 EXPIRED"); }
    },10);
};

btnFound.onclick = () => stopVCB();
function stopVCB(){
    clearInterval(vcbInterval); vcbInterval = null;
    btnFound.disabled = true; btnVCB.disabled = false;
    addLog(`10-99 STOP`);
}

function adjustPursuit(ms){ pursuitTime = Math.max(0, pursuitTime + ms); pDisp.innerHTML = formatTime(pursuitTime); }
function adjustVCB(ms){ vcbTime = Math.max(0, vcbTime + ms); vDisp.innerHTML = formatTime(vcbTime); }
function changeVcbCount(n){ vcbCount = Math.max(0, vcbCount + n); vCountDisp.innerText = vcbCount; }
function setResult(res){ resultStatus = res; addLog(`RESULT: ${res}`); }
function addLog(msg){
    const logEntry = `> ${msg}`;
    document.getElementById("logArea").innerHTML += `<div>${logEntry}</div>`;
    logs.push(logEntry);
    document.getElementById("logArea").scrollTop = 9999;
}

// LOGIKA HISTORY & PAGINATION
function saveToLocal() {
    const pName = document.getElementById("prospectName").value || "Unknown";
    const iName = document.getElementById("instructorName").value || "Unknown";
    const unit = document.getElementById("certType").value;
    let data = JSON.parse(localStorage.getItem("sixnine_history")) || [];

    data.push({
        date: new Date().toLocaleString('id-ID'),
        prospect: pName, instructor: iName,
        vcb: vcbCount, pursuitRemain: formatLogTime(pursuitTime),
        vcbRemain: formatLogTime(vcbTime), result: resultStatus
    });

    localStorage.setItem("sixnine_history", JSON.stringify(data));
    alert("DATA SAVED!");
}

function showHistory() {
    const data = JSON.parse(localStorage.getItem("sixnine_history")) || [];
    const sortedData = data.slice().reverse();
    const body = document.getElementById("historyBody");
    body.innerHTML = "";

    // Kalkulasi data yang muncul di page ini
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedItems = sortedData.slice(start, end);

    paginatedItems.forEach(item => {
        body.innerHTML += `<tr>
            <td>${item.date}</td>
            <td>${item.prospect}</td>
            <td>${item.instructor}</td>
            <td>${item.vcb}</td>
            <td>${item.pursuitRemain}</td>
            <td>${item.vcbRemain}</td>
            <td class="${item.result === 'PASS' ? 'res-pass' : 'res-fail'}">${item.result}</td>
        </tr>`;
    });

    document.getElementById("pageInfo").innerText = `PAGE ${currentPage}`;
    document.getElementById("btnPrev").disabled = (currentPage === 1);
    document.getElementById("btnNext").disabled = (end >= sortedData.length);
    document.getElementById("historyModal").classList.remove("hidden");
}

function nextPage() { currentPage++; showHistory(); }
function prevPage() { currentPage--; showHistory(); }

function closeHistory() { document.getElementById("historyModal").classList.add("hidden"); currentPage = 1; }
function clearHistory() { if(confirm("WIPE ALL DATA?")) { localStorage.removeItem("sixnine_history"); showHistory(); } }

document.getElementById("btnSave").onclick = saveToLocal;
document.getElementById("btnHistory").onclick = showHistory;
updateUI();