import librosa  # type: ignore
import numpy as np

from app.core.transcribe_model import SpeechToTextModel
def load_and_process_audio(file_bytes, target_sr: int = 1600):
    audio, sr = librosa.load(file_bytes, sr=None)
    if sr != target_sr:
        audio = librosa.resample(audio, orig_sr=sr, target_sr=target_sr)
    audio = audio.astype(np.float32)
    return audio

def run_speech2text_model(audio_input) -> dict[str, any]:
    model = SpeechToTextModel("example/path")
    results = model.infer(audio_input)
    return results