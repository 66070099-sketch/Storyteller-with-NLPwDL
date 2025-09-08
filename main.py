from fastapi import FastAPI
from fastapi.responses import FileResponse
import os

app = FastAPI()

# เสิร์ฟไฟล์ index.html จาก backend/templates
@app.get("/")
async def read_root():
    return FileResponse("./backend/templates/index.html")
