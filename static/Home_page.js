// ====== elements ======
const slider = document.querySelector('.slider');
const sliderList = slider.querySelector('.slider .list');

// ====== state ======
let __currentIndex = 1;          // แหล่งความจริงปัจจุบัน
let __isDragging = false;        // ระหว่างลากอยู่ไหม
let __programmatic = false;      // เราเป็นคนสั่งเลื่อนเองหรือไม่ (กัน onCycleTo ซ้ำ)
let __syncTimer = null;

// ====== helpers ======
function getCurrentSlideIndex() {
  const first = sliderList.querySelector('.item');
  return first ? Number(first.getAttribute('data-index')) || 1 : 1;
}

function commitSelection(idx) {
  if (!idx || idx === __currentIndex) return;

  sliderList.querySelectorAll('.item').forEach(el => {
    const isActive = Number(el.getAttribute('data-index')) === idx;
    el.style.opacity = isActive ? "1" : "0";
    el.style.zIndex  = isActive ? "1" : "-1";   // ✅ ไม่ให้มาบังคลิก
    el.classList.toggle("active", isActive);
  });

  __currentIndex = idx;
}

// function openStory(index) {
//   const base = window.location.origin;  // ใช้ base URL ปัจจุบันของเว็บไซต์
//   const url = `${base}/Tales40_web/story${index}/Tales.html`;  // เพิ่ม path ที่ต้องการไป
//   window.location.assign(url);
// }

function centerCarouselTo(idx) {
  const inst = window.__materializeCarousel__;
  if (!inst) return;

  const carEl = document.getElementById('story-carousel');
  const items = Array.from(carEl.querySelectorAll('.carousel-item'));
  const pos = items.findIndex(a => Number(a.getAttribute('data-index')) === idx);
  if (pos < 0) return;

  try {
    __programmatic = true;    // 🔒 ล็อกกัน onCycleTo ย้อนกลับ
    if (typeof inst.center === 'function') inst.center(pos);
    else if (typeof inst.set === 'function') inst.set(pos);
  } finally {
    // ปลดล็อกหลังทรานสิชันจบเล็กน้อย (อิง duration ของ carousel)
    const duration = (window.__carouselDurationMs || 160) + 40;
    setTimeout(() => { __programmatic = false; }, duration);
  }
}

// ให้สไลด์ใหญ่ ↔ carousel ตรงกัน (เรียกเมื่อจำเป็นเท่านั้น)
function syncCarouselToCurrent() {
  centerCarouselTo(__currentIndex);
}

// ====== public: เลือกภาพ (คลิก/คำสั่ง) ======
function showSlide(targetIdx) {
  if (!targetIdx) return;
  // 1) คอมมิต index → ย้ายสไลด์ใหญ่
  commitSelection(targetIdx);
  // 2) จัด carousel ให้ชี้ไปยังอันเดียวกัน
  syncCarouselToCurrent();
}

// ====== drag lifecycle ======
function attachDragLifecycle() {
  const carEl = document.getElementById('story-carousel');
  if (!carEl) return;

  const setDragging = v => { __isDragging = v; };

  carEl.addEventListener('pointerdown', () => setDragging(true), { passive: true });
  carEl.addEventListener('mousedown',   () => setDragging(true), { passive: true });
  carEl.addEventListener('touchstart',  () => setDragging(true), { passive: true });

  const endDrag = () => {
    setDragging(false);
    clearTimeout(__syncTimer);

    // รอ inertia จบสั้นๆ แล้วค่อยคอมมิต active ปัจจุบัน
    __syncTimer = setTimeout(() => {
      const active = carEl.querySelector('.carousel-item.active');
      const idx = Number(active?.getAttribute('data-index')) || null;
      if (!idx) return;

      // คอมมิต → ย้ายสไลด์ใหญ่
      commitSelection(idx);
      // แล้วล็อกเล็กน้อย กัน onCycleTo ที่ยังหลงเหลือ
      syncCarouselToCurrent();
    }, 120);
  };

  ['pointerup','mouseup','mouseleave','touchend','touchcancel']
    .forEach(ev => carEl.addEventListener(ev, endDrag, { passive: true }));
}

// ====== onCycleTo handler (เรียกจาก init) ======
function handleCycleTo(el, dragged) {
  if (!el) return;
  if (__programmatic) return;  // เราเป็นคนสั่งเลื่อนเอง → ไม่ต้องทำอะไร
  if (__isDragging)  return;   // กำลังลาก → รอ endDrag ค่อยคอมมิต

  // ไม่ได้ลาก และไม่ใช่การสั่งเอง → เปลี่ยนเพราะคลิก/คีย์/ลูกศร
  const idx = Number(el.getAttribute('data-index')) || null;
  if (!idx) return;

  // คอมมิตและซิงก์ (ใช้ดีเลย์สั้นกันอีเวนต์ติดกันหลายตัว)
  clearTimeout(__syncTimer);
  __syncTimer = setTimeout(() => {
    commitSelection(idx);
    syncCarouselToCurrent();
  }, dragged ? 60 : 40);
}

// ====== click to jump ======
function attachClickToJump() {
  const carEl = document.getElementById('story-carousel');
  if (!carEl) return;

  // กันรูปถูกลากออกนอกหน้า
  carEl.querySelectorAll('img').forEach(img => {
    img.setAttribute('draggable', 'false');
  });

  carEl.addEventListener('click', (e) => {
    const a = e.target.closest('.carousel-item');
    if (!a) return;
    e.preventDefault();

    const target = Number(a.getAttribute('data-index')) || null;
    if (!target) return;

    // จัด carousel ไปยังตำแหน่งนั้นก่อน (เพื่อหยุด inertia ปัจจุบัน)
    centerCarouselTo(target);

    // แล้วคอมมิตสไลด์ใหญ่ + ซิงก์ย้อนเพื่อตอกย้ำ
    clearTimeout(__syncTimer);
    __syncTimer = setTimeout(() => {
      commitSelection(target);
      syncCarouselToCurrent();
    }, 80);
  });
}

// ====== boot ======
document.addEventListener('DOMContentLoaded', () => {
  // ตั้งค่า index เริ่มต้นจาก DOM จริง
  __currentIndex = getCurrentSlideIndex();

  attachDragLifecycle();
  attachClickToJump();

  // export ถ้าต้องเรียกจากที่อื่น
  window.showSlide = showSlide;
  window.handleCycleTo = handleCycleTo;
});

// เปิดหน้าเรื่องด้วยพาธจากรากเว็บ (กัน path relative เพี้ยน)
function openStory(index) {
  const base = window.location.origin;  // เช่น http://127.0.0.1:8000
  const url  = `${base}/backend/Tales40_web/story${index}/Tales.html`;
  window.location.assign(url);
}
function playSfx(id){const el=document.getElementById(id);if(!el)return;try{el.currentTime=0;el.play();}catch(e){}}

// ฟองสบู่
function spawnBubble() {
  const c = document.getElementById("bubbles");
  if (!c) return;
  const b = document.createElement("div");
  b.className = "bubble";
  const size = Math.random() * 40 + 10;
  b.style.width = b.style.height = `${size}px`;
  b.style.left = `${Math.random() * 100}vw`;
  b.style.animationDuration = `${6 + Math.random() * 6}s`;
  b.style.filter = `blur(${Math.random() * 1.2}px)`;
  c.appendChild(b);
  setTimeout(() => b.remove(), 13000);
}

document.addEventListener("DOMContentLoaded",()=>{for(let i=0;i<15;i++)spawnBubble(); setInterval(spawnBubble,500);});

// เพลง BG (ต้องมี gesture ครั้งแรก)
const bgMusic=document.getElementById("bg-music");
const musicToggle=document.getElementById("music-toggle");
function tryAutoplayOnce() {
  if (!bgMusic || !bgMusic.paused) return;
  bgMusic.play().then(() => {
    if (musicToggle) musicToggle.textContent = "🔇 Mute";
    window.removeEventListener('pointerdown', tryAutoplayOnce);
    window.removeEventListener('keydown', tryAutoplayOnce);
    window.removeEventListener('touchstart', tryAutoplayOnce);
  }).catch(() => {});
}

window.addEventListener('pointerdown',tryAutoplayOnce);
window.addEventListener('keydown',tryAutoplayOnce);
window.addEventListener('touchstart',tryAutoplayOnce);

if (musicToggle && bgMusic) {
  musicToggle.addEventListener("click", () => {
    if (bgMusic.paused) {
      bgMusic.play();
      musicToggle.textContent = "🔇 Mute";
    } else {
      bgMusic.pause();
      musicToggle.textContent = "🔊 Music";
    }
  });
}


// เล่นเสียงตอนกดปุ่มใดๆ
document.addEventListener("click",e=>{
  if(e.target.tagName==="BUTTON" || e.target.closest("button")) playSfx("sfx-click");
});

// เล่นเสียงเมื่อคารูเซลเลื่อน
const __origHandleCycleTo = window.handleCycleTo;
window.handleCycleTo = function(el, dragged){
  playSfx("sfx-slide");
  if(typeof __origHandleCycleTo==="function") __origHandleCycleTo(el, dragged);
};

// ฟังก์ชัน queueMove ใช้คิวการเลื่อนสไลด์
function queueMove(direction, count) {
  let promiseChain = Promise.resolve();

  // สร้าง Promise สำหรับการเลื่อนหลายสไลด์
  for (let i = 0; i < count; i++) {
    promiseChain = promiseChain.then(() => moveSlider(direction));
  }
}

// แก้ไขฟังก์ชัน centerCarouselTo เพื่อซิงก์กับ carousel
function centerCarouselTo(idx) {
  const inst = window.__materializeCarousel__;
  if (!inst) return;

  const carEl = document.getElementById('story-carousel');
  const items = Array.from(carEl.querySelectorAll('.carousel-item'));
  const pos = items.findIndex(a => Number(a.getAttribute('data-index')) === idx);
  if (pos < 0) return;

  try {
    __programmatic = true;    // 🔒 ล็อกกัน onCycleTo ย้อนกลับ
    if (typeof inst.center === 'function') inst.center(pos);
    else if (typeof inst.set === 'function') inst.set(pos);
  } finally {
    // ปลดล็อกหลังทรานสิชันจบเล็กน้อย (อิง duration ของ carousel)
    const duration = (window.__carouselDurationMs || 160) + 40;
    setTimeout(() => { __programmatic = false; }, duration);
  }
}
