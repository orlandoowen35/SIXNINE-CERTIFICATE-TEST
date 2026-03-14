const DISCORD_WEBHOOK = "WEBHOOK_KAMU";

let pursuitTime = 1200000;
let vcbTime = 180000;

let pursuitInterval;
let vcbInterval;

let vcbCount = 0;
let logs = [];
let resultStatus = "UNSET";

const pDisp = document.getElementById("pursuitDisplay");
const vDisp = document.getElementById("vcbDisplay");

const vCountDisp = document.getElementById("vcbCountDisplay");

const btnStart = document.getElementById("btnStartPursuit");
const btnStop = document.getElementById("btnStopPursuit");

const btnVCB = document.getElementById("btnVCB");
const btnFound = document.getElementById("btnFound");

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

}else{

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

}else{

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

function adjustPursuit(ms){

pursuitTime = Math.max(0, pursuitTime + ms);
pDisp.innerHTML = formatTime(pursuitTime);

}

function adjustVCB(ms){

vcbTime = Math.max(0, vcbTime + ms);
vDisp.innerHTML = formatTime(vcbTime);

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

title:"🚓 SIXNINE CERTIFICATION REPORT",

color: resultStatus==="PASS"?3066993:15158332,

fields:[

{name:"👤 Prospect",value:`\`${pName}\``,inline:true},
{name:"👮 Instructor",value:`\`${iName}\``,inline:true},
{name:"📊 VCB Count",value:`\`${vcbCount}\``,inline:true},

{name:"🏁 RESULT",
value:resultStatus==="PASS"?"🟢 PASS":resultStatus==="FAILED"?"🔴 FAILED":"⚪ UNSET"}

],

description:`**📜 CERTIFICATE TEST**\n\`\`\`\n${logText}\n\`\`\``,

footer:{text:"Six Nine Certification System"},
timestamp:new Date()

};

fetch(DISCORD_WEBHOOK,{

method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({embeds:[embed]})

});

}

document.getElementById("btnSave").onclick = () => syncDiscord();

updateUI();