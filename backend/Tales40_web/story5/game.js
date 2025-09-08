// Drag and Drop.js — มี Corner (DemoData) + Guide (JSON) + Drag&Drop
document.addEventListener("DOMContentLoaded", () => {
  // ทำ active ให้เมนูเมื่อคลิก
  document.querySelectorAll('.nav-link').forEach(a => {
    a.addEventListener('click', (e) => {
      document.querySelectorAll('.nav-link').forEach(x => x.classList.remove('active'));
      e.currentTarget.classList.add('active');
    });
  });

  // ตั้งเวลา Countdown
  const guideToggle = document.getElementById("guide-toggle");
  let countdown = 10; // กำหนดเวลา 30 วินาที
  let countdownInterval;

  // ฟังก์ชันสำหรับเริ่มการนับถอยหลัง
  function startCountdown() {
    guideToggle.disabled = true;  // ทำให้ปุ่มไม่สามารถคลิกได้
    guideToggle.style.backgroundColor = "#aaa";  // ปรับสีปุ่มเป็นเทา

    countdownInterval = setInterval(() => {
      countdown--; 
      guideToggle.innerHTML = `${countdown} วินาที`;
      
      if (countdown <= 0) {
        clearInterval(countdownInterval);  // หยุดการนับถอยหลัง
        guideToggle.disabled = false;  // เปิดใช้งานปุ่ม
        guideToggle.style.backgroundColor = "#111";  // เปลี่ยนสีปุ่มกลับเป็นปกติ
        guideToggle.innerHTML = `<i class="fa-solid fa-question-circle"></i>`;  // เปลี่ยนข้อความบนปุ่ม
      }
    }, 1000);
  }

  // เริ่มการนับถอยหลังเมื่อโหลดหน้าเสร็จ
  startCountdown();

  /* =========================
     Corner panel (DemoData)
     ========================= */
  const cornerToggle = document.getElementById("corner-toggle");
  const cornerPanel = document.getElementById("corner-panel");
  const cornerCloseBtn = document.getElementById("corner-close");
  const cornerContent = document.getElementById("corner-content");
  let demoLoaded = false;

  function openCorner() {
    cornerPanel.classList.add("open");
    cornerPanel.setAttribute("aria-hidden", "false");
    cornerToggle.setAttribute("aria-expanded", "true");
    if (!demoLoaded) {
      cornerContent.textContent = "กำลังโหลดเนื้อหา…";
      fetch("../../../static/data/tale05.txt", { cache: "no-store" })
        .then(res => res.ok ? res.text() : Promise.reject(res.status + " " + res.statusText))
        .then(txt => { cornerContent.textContent = txt; demoLoaded = true; })
        .catch(err => { cornerContent.textContent = "โหลดข้อมูลไม่สำเร็จ: " + err; });
    }
  }

  function closeCorner() {
    cornerPanel.classList.remove("open");
    cornerPanel.setAttribute("aria-hidden", "true");
    cornerToggle.setAttribute("aria-expanded", "false");
  }

  if (cornerToggle) {
    cornerToggle.addEventListener("click", () => cornerPanel.classList.contains("open") ? closeCorner() : openCorner());
  }

  if (cornerCloseBtn) {
    cornerCloseBtn.addEventListener("click", closeCorner);
  }

  /* =========================
     Guide panel (JSON @ ซ้ายล่าง)
     ทำงานเหมือน Corner: toggle, ESC, aria, โหลดครั้งแรกครั้งเดียว
     ========================= */
  const guidePanel = document.getElementById("guide-panel");
  const guideCloseBtn = document.getElementById("guide-close");
  const guideContent = document.getElementById("guide-content");

  let guideLoaded = false;

  function openGuide() {
    guidePanel.classList.add("open");
    guidePanel.setAttribute("aria-hidden", "false");
    guideToggle.setAttribute("aria-expanded", "true");

    if (!guideLoaded) {
      guideContent.textContent = "กำลังโหลดคำแนะนำ…";
      fetch("../../../static/data/Summaries1-40/1-40summaries.json", { cache: "no-store" })
        .then(res => res.ok ? res.json() : Promise.reject(res.status + " " + res.statusText))
        .then(data => {
          guideLoaded = true;
          guideContent.innerHTML = generateGuideContent(data, "story_05");
        })
        .catch(err => {
          guideContent.textContent = "โหลดข้อมูลไม่สำเร็จ: " + err;
        });
    }
  }

  function closeGuide() {
    guidePanel.classList.remove("open");
    guidePanel.setAttribute("aria-hidden", "true");
    guideToggle.setAttribute("aria-expanded", "false");
  }

  function generateGuideContent(data, storyId) {
    const story = data.find(item => item.id === storyId); // ค้นหาตาม ID ของเรื่อง
    if (!story) {
      return `<p>ไม่พบข้อมูลของเรื่องที่เลือก</p>`;
    }

    // จัดการเนื้อหาของสรุปให้ดูดีขึ้น
    let formattedSummary = story.summary_6scenes
      .replace(/\*\*\s*ฉากที่ \d+: <.*?>\s*\*\*/g, '<h4>$&</h4>')  // เพิ่มหัวข้อสำหรับฉาก
      .replace(/\* \* \*/g, '')  // ลบ * * *
      .replace(/\n{2,}/g, '<br><br>')  // ลบการขึ้นบรรทัดใหม่ที่ไม่จำเป็น
      .trim();

    return `
      <div class="summary">
        <h3><strong>สรุป 6 ฉาก:</strong></h3>
        <p>${formattedSummary}</p>
      </div>
    `;
  }
  if (guideToggle) {
    guideToggle.addEventListener("click", () => guidePanel.classList.contains("open") ? closeGuide() : openGuide());
  }

  if (guideCloseBtn) {
    guideCloseBtn.addEventListener("click", closeGuide);
  }

  /* ===== ปุ่ม ESC ปิดทั้งสองแผง ===== */
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (cornerPanel?.classList.contains("open")) closeCorner();
    if (guidePanel?.classList.contains("open")) closeGuide();
  });

  /* =========================
     Drag & Drop
     ========================= */
  const scenes = [
    { id: "pic_1",    file: "1.png"},
    { id: "pic_2",    file: "2.png"},
    { id: "pic_3",    file: "3.png"},
    { id: "pic_4",    file: "4.png"},
    { id: "pic_5",    file: "5.png"},
    { id: "pic_6",    file: "6.png"}
  ];
  const IMG_BASES = [ "/static/images/Story_5/", "./static/images/Story_5/", "../static/images/Story_5/", "static/images/Story_5/" ];

  const draggableContainer = document.querySelector(".draggable-elements");
  const droppableElements  = document.querySelectorAll(".droppable");
  const shuffleBtn         = document.getElementById("shuffle-btn");

  function shuffle(arr){ for (let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr; }
  function setImgSrcWithFallback(imgEl, file, tryIdx=0){
    if(tryIdx>=IMG_BASES.length){
      Swal.fire({icon:"warning",title:"โหลดรูปไม่สำเร็จ",html:IMG_BASES.map(b=>b+file).join("<br>")});
      return;
    }
    const candidate = IMG_BASES[tryIdx] + file;
    imgEl.onerror = () => setImgSrcWithFallback(imgEl,file,tryIdx+1);
    imgEl.src = encodeURI(candidate);
  }

  function renderDraggables(){
    if(!draggableContainer) return;
    draggableContainer.innerHTML = "";
    shuffle([...scenes]).forEach(s=>{
      const img = document.createElement("img");
      img.className="draggable draggable-img";
      img.id=s.id; img.draggable=true; img.alt=s.label;
      setImgSrcWithFallback(img,s.file,0);
      img.addEventListener("dragstart", e=> e.dataTransfer.setData("text/plain", e.target.id));
      draggableContainer.appendChild(img);
    });
  }

  function resetBoard(){
    document.querySelectorAll(".draggable").forEach(d=>{ d.classList.remove("dragged"); d.setAttribute("draggable","true"); });
    droppableElements.forEach(box=>{
      box.classList.remove("droppable-hover","dropped");
      const ghost=box.querySelector(".ghost"); if(ghost) ghost.remove();
    });
  }

  droppableElements.forEach(box=>{
    box.addEventListener("dragenter", e=>{ const b=e.currentTarget; if(!b.classList.contains("dropped")) b.classList.add("droppable-hover"); });
    box.addEventListener("dragover",  e=>{ const b=e.currentTarget; if(!b.classList.contains("dropped")) e.preventDefault(); });
    box.addEventListener("dragleave", e=>{ const b=e.currentTarget; if(!b.classList.contains("dropped")) b.classList.remove("droppable-hover"); });
    box.addEventListener("drop", e=>{
      e.preventDefault();
      const b=e.currentTarget; b.classList.remove("droppable-hover");
      if(b.classList.contains("dropped")) return;

      const draggedId = e.dataTransfer.getData("text/plain");
      const expected  = b.getAttribute("data-draggable-id");

      if (draggedId === expected) {
          const dragged = document.getElementById(draggedId);
          const ghost = document.createElement("img");
          ghost.className = "ghost"; ghost.src = dragged.src; ghost.alt = "";
          b.prepend(ghost);
          b.classList.add("dropped");
          dragged.classList.add("dragged");
          dragged.setAttribute("draggable", "false");
      } else {
          Swal.fire({
              icon: "error",
              title: "ผิดช่อง!",
              text: "มาลองใหม่อีกครั้งกัน!!",
              confirmButtonText: "ตกลง"
          });
      }
    });
  });

  renderDraggables();
  if (shuffleBtn){ shuffleBtn.addEventListener("click", ()=>{ renderDraggables(); resetBoard(); }); }
});


document.addEventListener("DOMContentLoaded", () => {
  const backgroundMusic = new Audio('../../../static/audio/bg-s.mp3');
  backgroundMusic.loop = true; // Make the music loop
  backgroundMusic.volume = 0.2;
  backgroundMusic.play().catch(error => console.log('Error playing background music:', error)); // Play the music when the page loads
  
  // Create a button to toggle the music on/off
  const musicToggleButton = document.createElement('button');
  musicToggleButton.textContent = "🔇 ปิดเสียง";
  musicToggleButton.id = "music-toggle-button";  // Set the ID for targeting styles
  musicToggleButton.style.padding = "12px 24px";
  musicToggleButton.style.backgroundColor = "#444";
  musicToggleButton.style.color = "#fff";
  musicToggleButton.style.border = "none";
  musicToggleButton.style.borderRadius = "12px";
  musicToggleButton.style.cursor = "pointer";
  
  // Place the music toggle button next to the shuffle button
  const shuffleBtnContainer = document.querySelector(".bottom-actions");
  if (shuffleBtnContainer) {
    shuffleBtnContainer.appendChild(musicToggleButton);
    
    // เพิ่มระยะห่างระหว่างปุ่มโดยการตั้งค่า gap หรือ margin
    musicToggleButton.style.marginLeft = "50px"; // เพิ่มระยะห่างจากปุ่มสุ่ม
  }

  // Add event listener to toggle the background music
  musicToggleButton.addEventListener("click", () => {
    if (backgroundMusic.paused) {
      backgroundMusic.play();
      musicToggleButton.textContent = "🔇 ปิดเสียง"; // Update button text to "Mute"
    } else {
      backgroundMusic.pause();
      musicToggleButton.textContent = "🔊 เปิดเสียง"; // Update button text to "Play"
    }
  });

  // Handle click sounds on buttons
  const clickSound = new Audio('../../../static/audio/click.mp3');
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      clickSound.volume = 0.2
      clickSound.play().catch(error => console.log('Error playing click sound:', error)); // Play the click sound
    });
  });
});
