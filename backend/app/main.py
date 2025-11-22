import os
import art # type: ignore
import numpy as np
from pathlib import Path
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from app.services import audio_service
from app.core.transcribe_model import SpeechToTextModel

app = FastAPI(title="SpeechToText API")

app.add_middleware(
    CORSMiddleware,
    allow_origins= ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

model = SpeechToTextModel()

@app.on_event("startup")
async def app_startup_logic():
    art.tprint("SpeechToText")

@app.get("/")
def home():
    return {"message": "Hello from SpeechToText API!"}

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    file_bytes = await file.read()
    audio = audio_service.load_and_process_audio(file_bytes)
    audio_input = np.expand_dims(audio, axis=0)
    outputs = model.infer(audio_input)
    return {"status": "successfull", "raw_output": outputs}