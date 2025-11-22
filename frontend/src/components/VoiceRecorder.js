import React, { useState, useRef } from 'react';
import { Mic, Square, Send, FileText } from 'lucide-react';

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcribedText, setTranscribedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  // Load Inter font
  React.useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    document.body.style.fontFamily = "'Inter', sans-serif";
    return () => {
      document.body.style.fontFamily = '';
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Please allow microphone access to record audio.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const sendToBackend = async () => {
    if (!audioBlob) return;
    
    setIsProcessing(true);
    
    // Simulate backend call - Replace this with your actual API endpoint
    // setTimeout(() => {
    //   setTranscribedText("This is a sample transcription. Replace the sendToBackend function with your actual API call to convert speech to text. The audio data is available in the audioBlob variable as a Blob object.");
    //   setIsProcessing(false);
    // }, 2000);
    
   
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');
    
    try {
      const response = await fetch('http://localhost:8000/transcribe', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      setTranscribedText(data.text);
    } catch (err) {
      console.error('Error sending audio:', err);
      alert('Failed to transcribe audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Voice to Text</h1>
          <p className="text-gray-500 text-sm font-medium">Record your voice and convert it to text instantly</p>
        </div>

        {/* Recording Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 mb-6 border border-gray-200/50">
          <div className="flex items-center gap-2 mb-6">
            <Mic className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-semibold text-gray-700">Record Audio</h2>
          </div>
          
          <div className="flex flex-col items-center py-8">
            {/* Recording Indicator */}
            {isRecording && (
              <div className="mb-6 flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-gray-600 font-mono text-lg font-semibold">{formatTime(recordingTime)}</span>
              </div>
            )}

            {/* Record Button */}
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
              >
                <Mic className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
              >
                <Square className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
              </button>
            )}

            <p className="mt-6 text-gray-500 text-sm font-medium">
              {isRecording ? 'Click to stop recording' : 'Click to start recording'}
            </p>
          </div>

          {/* Send Button */}
          {audioBlob && !isRecording && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={sendToBackend}
                disabled={isProcessing}
                className="px-8 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Convert to Text
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Transcription Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-gray-200/50">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-teal-500" />
            <h2 className="text-xl font-semibold text-gray-700">Transcribed Text</h2>
          </div>
          
          <div className="min-h-[200px] bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-6 border border-gray-200">
            {transcribedText ? (
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">{transcribedText}</p>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-center italic font-medium">
                  Your transcribed text will appear here...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8 text-gray-400 text-xs font-medium">
          <p>Made by <a href='https://linkedin.com/in/enes-sejfovski-866607272'>Enes Sejfovski</a>. All rights reserved. @Skopje, 2025</p>
        </div>
      </div>
    </div>
  );
}