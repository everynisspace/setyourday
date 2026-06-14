const overlay = document.getElementById("overlay");
const listEl = document.getElementById("list");

const palette = [
"#ffe6c8",
"#ffcfba",
"#ffcb8d",
"#e8d0c6",
"#edc4a8"
];

function timeToMinutes(time){
  const [h,m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToAngle(min){
  return (min / 1440) * 360;
}

function saveToLocal(){
  localStorage.setItem("activities", JSON.stringify(activities));
}

function loadFromLocal(){
  const data = localStorage.getItem("activities");
  return data ? JSON.parse(data) : [];
}

let activities = loadFromLocal();

const clockWrap = document.querySelector(".clock-wrap");

for(let i=0;i<24;i++){

  const tick = document.createElement("div");
  tick.className = "tick";

  const angle = i * 15 + 90;

  tick.style.transform =
  `translate(-50%, -50%) rotate(${angle}deg)`;

  tick.innerHTML = `
    <div class="label">
      ${i === 0 ? 24 : i}
    </div>
  `;

  tick.querySelector(".label").style.transform =
  `rotate(${-angle}deg)`;

  clockWrap.appendChild(tick);
}

function renderOverlay(){

  overlay.innerHTML = "";

  activities.forEach((act,idx)=>{

    const wedge = document.createElement("div");
    wedge.className = "wedge";

    const color = palette[idx % palette.length];

    const startMin = timeToMinutes(act.start);
    const endMin = timeToMinutes(act.end);

    const startAngle = minutesToAngle(startMin);

    let sweep =
      endMin >= startMin
      ? endMin - startMin
      : 1440 - startMin + endMin;

    const sweepAngle = minutesToAngle(sweep);

    wedge.style.background = `
      conic-gradient(
        from ${startAngle}deg,
        ${color} 0deg ${sweepAngle}deg,
        transparent ${sweepAngle}deg 360deg
      )
    `;

    overlay.appendChild(wedge);

  });
}

function refreshList(){

  listEl.innerHTML = "";

  activities.forEach((act,idx)=>{

    const color = palette[idx % palette.length];

    const item = document.createElement("div");
    item.className = "activity-item";

    item.style.background = color;

   item.innerHTML = `
  <div style="display:flex;align-items:center;gap:20px;">


    <div class="meta">
     ${act.start} . ${act.end} 
       <div style="font-size:14px;color:#ab6816;margin-top:10px;"> ${act.title}</div>
      
    </div>
  </div>

  <button data-i="${idx}">delete</button>
`;

    listEl.appendChild(item);

  });

  listEl.querySelectorAll("button").forEach(btn=>{

    btn.addEventListener("click",e=>{

      const i = Number(e.currentTarget.dataset.i);

      activities.splice(i,1);

      saveToLocal();
      renderOverlay();
      refreshList();

    });

  });

}

document.getElementById("openPopup")
.addEventListener("click",()=>{

  popup.classList.add("show");

});

document.getElementById("closePopup")
.addEventListener("click",()=>{

  popup.classList.remove("show");

});

document.getElementById("addBtn")
.addEventListener("click",()=>{

  const title =
  document.getElementById("title").value.trim();

  const start =
  document.getElementById("start").value;

  const end =
  document.getElementById("end").value;

  if(!title || !start || !end){
    alert("Isi semua data!");
    return;
  }

  const startMin = timeToMinutes(start);
  const endMin = timeToMinutes(end);

  const conflict = activities.some(a=>{

    const aStart = timeToMinutes(a.start);
    const aEnd = timeToMinutes(a.end);

    return (
      startMin < aEnd &&
      endMin > aStart
    );

  });

  if(conflict){
    alert("Jam bentrok!");
    return;
  }

  activities.push({
    title,
    start,
    end
  });

  saveToLocal();

  renderOverlay();
  refreshList();

  document.getElementById("title").value = "";
  document.getElementById("start").value = "";
  document.getElementById("end").value = "";

  popup.classList.remove("show");

});

let lastActivity = "";

function updateHand(){

  const now = new Date();

  const totalMinutes =
    now.getHours() * 60 + now.getMinutes();

  const angle =
    minutesToAngle(totalMinutes);

  document.getElementById("hand").style.transform =
  `translate(-50%, -100%) rotate(${angle}deg)`;

  let current = null;

  activities.forEach(act=>{

    const s = timeToMinutes(act.start);
    const e = timeToMinutes(act.end);

    if(totalMinutes >= s && totalMinutes < e){
      current = act;
    }

  });

  const box = document.getElementById("nowAct");

  if(current){

    box.textContent =
    `It's time to ${current.title}`;

    
    // popup + sound saat activity baru dimulai
    if(lastActivity !== current.title){

      lastActivity = current.title;

      showActivityPopup(current.title);

      playNotificationSound();
    }

  }else{

    box.textContent = "It's free time!";

    lastActivity = "";
  }

}
document.getElementById("deleteAll").addEventListener("click", () => {

  const confirmDelete = confirm("Delete all activities?");

  if(confirmDelete){
    activities = [];

    saveToLocal();
    renderOverlay();
    refreshList();
    updateHand();
  }

});

function showActivityPopup(title){

  const popup = document.createElement("div");

  popup.style.position = "fixed";
  popup.style.inset = "0";
  popup.style.background = "rgba(0,0,0,0.4)";
  popup.style.display = "flex";
  popup.style.justifyContent = "center";
  popup.style.alignItems = "center";
  popup.style.zIndex = "99999";

  popup.innerHTML = `
    <div style="
      background:white;
      padding:30px;
      border-radius:30px;
      text-align:center;
      width:300px;
      animation:pop .3s ease;
    ">
      <div style="
        font-size:18px;
        margin-bottom:10px;
      ">
        ⏰
      </div>

      <h2 style="
        margin:0;
        color:#bd6d4c;
        font-size:16px;
      ">
        Activity Started
      </h2>

      <p style="
        margin-top:10px;
        font-size:22px;
      ">
        ${title}
      </p>
    </div>
  `;

  document.body.appendChild(popup);

  setTimeout(()=>{
    popup.remove();
  },3000);

}
function playNotificationSound(){

  const audio = new Audio(
    "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
  );

  audio.play();

}
renderOverlay();
refreshList();

updateHand();

setInterval(updateHand,1000);

