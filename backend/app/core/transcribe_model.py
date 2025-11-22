import numpy as np
from pathlib import Path
import onnxruntime as ort 
from transformers import Speech2Text2Processor

class SpeechToTextModel:
    def __init__(self, model_dir_path: str | Path = None):
        if model_dir_path is None:
            model_dir_path = Path(__file__).parent / "onnx_s2t"
            
        self.processor = Speech2Text2Processor.from_pretrained(model_dir_path)
        self.encoder_session = ort.InferenceSession(str(f"{model_dir_path}/encoder_model.onnx"))
        self.decoder_session = ort.InferenceSession(str(f"{model_dir_path}/decoder_model.onnx"))
        self.max_decoder_length = 256
    
    def infer(self, audio_features: np.ndarray) -> dict:
        encoder_outputs = self.encoder_session.run(
            None,
            {"input_features": audio_features}
        )[0]
        decoder_input_ids = np.array([[self.processor.tokenizer.bos_token_id]], dtype=np.int64)
        generated_ids = []
        for _ in range(self.max_decoder_length):
            decoder_outputs = self.decoder_session.run(
                None,
                {
                    "input_ids": decoder_input_ids,
                    "encoder_hidden_states": encoder_outputs
                }
            )[0] 
            next_token_id = np.argmax(decoder_outputs[:, -1, :], axis=-1)
            generated_ids.append(next_token_id.item())
            if next_token_id == self.processor.tokenizer.eos_token_id:
                break
            decoder_input_ids = np.hstack([decoder_input_ids, next_token_id[:, None]])
        
        text = self.processor.batch_decode([generated_ids], skip_special_tokens=True)[0]
        return {"text": text, "token_ids": generated_ids}