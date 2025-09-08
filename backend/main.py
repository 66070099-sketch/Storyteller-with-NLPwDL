# D:/fastapi-test/myenv/Scripts/activate.bat
# uvicorn backend.main:app --reload
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import FileResponse,  HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import shutil
import os

app = FastAPI()

# สร้าง folder สำหรับเก็บไฟล์ที่อัปโหลด
UPLOAD_FOLDER = "./uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ติดตั้ง Static Files เพื่อให้ FastAPI serve ไฟล์ CSS, JS และภาพ
app.mount("/static", StaticFiles(directory="static"), name="static")

# ติดตั้ง Static Files สำหรับเสิร์ฟไฟล์ใน backend/templates/
app.mount("/backend", StaticFiles(directory="backend"), name="backend")

# เสิร์ฟนิทานใต้ /backend/Tales40_web -> โฟลเดอร์จริงชื่อ Tales40_web
app.mount("/backend/Tales40_web", StaticFiles(directory="backend/Tales40_web", html=True), name="tales40")


# โฟลเดอร์รากของโปรเจกต์ = ขึ้นจาก backend/ ไป 1 ชั้น
BASE_DIR = Path(__file__).resolve().parent.parent
TALES_DIR = BASE_DIR / "Tales40_web"

print("Serving Tales40 from:", TALES_DIR)  # debug

# หน้าเริ่มต้น
@app.get("/")
async def read_root():
    return FileResponse("./backend/templates/index.html")  # ส่งไฟล์ index.html ให้

# ให้ FastAPI serve ไฟล์ต่างๆ เช่น HTML, CSS, JS ที่คุณมีใน folder ของโปรเจกต์
@app.get("/files/{filename}")
async def get_file(filename: str):
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return {"error": "File not found"}

# โหลดข้อมูลนิทานจากไฟล์ stories.json
def load_stories():
    with open('data/demo_data.json', 'r', encoding='utf-8') as f:
        return 

# หน้าแรกแสดงรายการนิทานทั้งหมด
@app.get("/", response_class=HTMLResponse)
async def read_home():
    stories = load_stories()
    return f"""
        <html>
            <head>
                <link rel="stylesheet" href="/static/styles.css">
                <title>นิทาน 40 เรื่อง</title>
            </head>
            <body>
                <h1>นิทาน 40 เรื่อง</h1>
                <ul>
                    {''.join([f'<li><a href="/story/{story["id"]}">{story["title"]}</a></li>' for story in stories])}
                </ul>
            </body>
        </html>
    """

# หน้าแสดงเนื้อหาของนิทานแต่ละเรื่อง
@app.get("/Tales40_web/{story_folder}/{filename}", response_class=HTMLResponse)
async def read_story(story_folder: str, filename: str):
    file_path = os.path.join("Tales40_web", story_folder, filename)

    if os.path.exists(file_path) and file_path.endswith(".html"):
        with open(file_path, "r", encoding="utf-8") as f:
            return HTMLResponse(f.read())
    return HTMLResponse("<h1>ไม่พบไฟล์เรื่องนี้</h1>", status_code=404)
