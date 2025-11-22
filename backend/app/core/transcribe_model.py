import numpy as np
from pathlib import Path
import onnxruntime as ort 


class SpeechToTextModel:
    def __init__(self, model_path: str | Path):
        self.model_session = ort.InferenceSession(model_path, providers=["CPUExecutionProvider"])
    
    def infer(self, audio_features: np.ndarray):
        input_name = self.model_session.get_inputs()[0].name
        result = self.model_session.run(None, {input_name: audio_features})
        return result