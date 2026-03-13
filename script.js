const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1481941862162890824/U6fXw57q0dDAdKNBMA-ghE-iEF-botjRy0jb7YXrTQyFmS77q7En6iMUfKvRx15U0z5M";

let pursuitTime = 1200000,
    vcbTime = 180000,
    pursuitInterval,
    vcbInterval,
    vcbCount = 0,
    logs = [],
    resultStatus = "UNSET";

const pDisp = document.getElementById("pursuitDisplay"),
      vDisp = document.getElementById("vcbDisplay"),
      vCountDisp = document.getElementById("vcbCountDisplay"),
      btnStart = document.getElementById("btnStartPursuit"),
      btnStop = document.getElementById("btnStopPursuit"),
      btnVCB = document.getElementById("btnVCB"),
      btnFound = document.getElementById("btnFound");

function formatTime(ms){
    const totalSeconds = Math.floor(ms/1000);
    const m = Math.floor(totalSeconds/60);
    const s = totalSeconds % 60;
    const milli = Math.floor((ms%1000)/10);

    return `${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}<span class="ms-small">.${milli.toString().padStart(2,"0")}</span>`;
}

function formatLogTime(ms){
    const totalSeconds = Math.floor(ms/1000);
    const m = Math.floor(totalSeconds/60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
}

function updateUI(){
    pDisp.innerHTML = formatTime(pursuitTime);
    vDisp.innerHTML = formatTime(vcbTime);
}

btnStart.onclick = () => {
    stopVCB();
    startPursuit();
};

btnStop.onclick = () => stopPursuit();

function startPursuit(){
    if(pursuitInterval) return;

    btnStart.disabled = true;
    btnStop.disabled = false;
    btnVCB.disabled = false;

    addLog(`START PURSUIT @ ${formatLogTime(pursuitTime)}`);

    pursuitInterval = setInterval(()=>{
        if(pursuitTime > 0){
            pursuitTime -= 10;
            pDisp.innerHTML = formatTime(pursuitTime);
        } else {
            stopPursuit();
            addLog("PURSUIT TIME EXPIRED");
        }
    },10);
}

function stopPursuit(){
    if(!pursuitInterval) return;

    clearInterval(pursuitInterval);
    pursuitInterval = null;

    btnStop.disabled = true;
    btnStart.disabled = false;

    addLog(`PAUSE PURSUIT @ ${formatLogTime(pursuitTime)}`);
}

btnVCB.onclick = () => {
    stopPursuit();

    vcbCount++;
    vCountDisp.innerText = vcbCount;

    btnVCB.disabled = true;
    btnFound.disabled = false;

    addLog(`10-99 START (#${vcbCount}) @ ${formatLogTime(pursuitTime)}`);

    vcbInterval = setInterval(()=>{
        if(vcbTime > 0){
            vcbTime -= 10;
            vDisp.innerHTML = formatTime(vcbTime);
        } else {
            stopVCB();
            addLog("10-99 TIMER EXPIRED");
        }
    },10);
};

btnFound.onclick = () => stopVCB();

function stopVCB(){
    if(!vcbInterval) return;

    clearInterval(vcbInterval);
    vcbInterval = null;

    btnFound.disabled = true;
    btnVCB.disabled = false;

    addLog(`10-99 STOP (Remaining: ${formatLogTime(vcbTime)})`);
}

function changeVcbCount(n){
    vcbCount = Math.max(0, vcbCount + n);
    vCountDisp.innerText = vcbCount;
}

function setResult(res){
    resultStatus = res;
    addLog(`RESULT: ${res}`);
}

function addLog(msg){
    const logEntry = `> ${msg}`;

    document.getElementById("logArea").innerHTML += `<div>${logEntry}</div>`;
    logs.push(logEntry);

    document.getElementById("logArea").scrollTop = 9999;
}

async function syncDiscord(){
    if(!DISCORD_WEBHOOK) return;

    const pName = document.getElementById("prospectName").value || "Unknown";
    const iName = document.getElementById("instructorName").value || "Unknown";
    const logText = logs.join("\n") || "No activity recorded";

    const embed = {
        title: "🚓 SIXNINE CERTIFICATION REPORT",
        color: resultStatus === "PASS" ? 3066993 : 15158332,

        fields: [
            { name:"👤 Prospect", value:`\`${pName}\``, inline:true },
            { name:"👮 Instructor", value:`\`${iName}\``, inline:true },
            { name:"📊 VCB Count", value:`\`${vcbCount}\``, inline:true },
            { 
                name:"🏁 RESULT",
                value: resultStatus==="PASS"
                    ? "🟢 **PASS**"
                    : resultStatus==="FAILED"
                    ? "🔴 **FAILED**"
                    : "⚪ UNSET",
                inline:false
            }
        ],

        description:`**📜 CERTIFICATE TEST**\n\`\`\`\n${logText}\n\`\`\``,

        footer:{ text:"Six Nine Certification System" },
        timestamp: new Date()
    };

    fetch(DISCORD_WEBHOOK,{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ embeds:[embed] })
    });
}

document.getElementById("btnSave").onclick = () => syncDiscord();

updateUI();