import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import Modal from 'react-modal';
import './chatbot.css'


// Fix: Changed process.env to import.meta.env for Vite compatibility
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

let speechInstance;

const speak = (text) => {
  if (speechInstance) window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  speechInstance = utterance;
  window.speechSynthesis.speak(utterance);
};

const stopSpeaking = () => {
  window.speechSynthesis.cancel();
};

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');

  const sendToAI = async () => {
    if (!input && !image) {
      setError('Please enter symptoms or upload an image.');
      return;
    }

    setError('');
    setLoading(true);

    const userMsg = { role: 'user', content: input || 'Uploaded Image' };
    setChat((prev) => [...prev, userMsg]);
    setInput('');

    try {
      let response = '';

      if (input) {
        const res = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: `User symptoms: ${input}. Briefly suggest possible disease(s) only. End with: "Please consult a certified Medicare doctor. I am not a licensed medical professional."`,
        });
        response = res.text;
      }

      if (image) {
        setModalOpen(true);
        setTimeout(() => {
          const simulatedResponse =
            "The uploaded image may show signs of a potential skin condition (possibly skin cancer). Please consult a certified Medicare doctor for a professional diagnosis.";
          setChat((prev) => [
            ...prev,
            { role: 'bot', content: simulatedResponse },
          ]);
          speak(simulatedResponse);
          setModalOpen(false);
          setImage(null);
          setLoading(false);
        }, 2500);
        return;
      }

      setChat((prev) => [...prev, { role: 'bot', content: response }]);
      speak(response);
    } catch (err) {
      console.error(err);
      setChat((prev) => [
        ...prev,
        { role: 'bot', content: "Sorry, I couldn't process your request." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const startVoice = () => {
    // Check if SpeechRecognition is available
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      setError("Speech recognition not supported in this browser");
      return;
    }
  
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.start();

    recognition.onresult = (event) => {
      setInput(event.results[0][0].transcript);
    };

    recognition.onerror = (err) => {
      console.error(err);
      setError("Error with speech recognition");
    };
  };

  return (
    <div className="chatbot-container bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">🤖 Medicare-AI Health Assistant</h2>

      <div className="chat-box h-80 overflow-y-auto mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
        {chat.map((msg, idx) => (
          <div
            key={idx}
            className={`message p-3 mb-3 rounded-lg ${
              msg.role === 'user' 
                ? 'bg-blue-100 text-right ml-12' 
                : 'bg-green-100 mr-12'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="avatar w-6 h-6 flex items-center justify-center rounded-full bg-gray-200">
                {msg.role === 'user' ? '🧑' : '🤖'}
              </span>
              <span className="font-medium">
                {msg.role === 'user' ? 'You' : 'AI Assistant'}
              </span>
            </div>
            <p>{msg.content}</p>
          </div>
        ))}
        {loading && (
          <p className="text-gray-500 italic text-center py-2">Thinking...</p>
        )}
      </div>

      <div className="input-box flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Describe your symptoms..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-lg"
          onKeyPress={(e) => e.key === 'Enter' && sendToAI()}
        />
        <button 
          onClick={sendToAI}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Send
        </button>
        <button 
          onClick={startVoice}
          className="bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300"
        >
          🎤
        </button>
        <button 
          onClick={stopSpeaking}
          className="bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300"
        >
          🔇
        </button>
      </div>

      <div className="upload-box mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Upload an image for analysis:
        </label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImageUpload}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        {image && (
          <div className="mt-3">
            <img 
              src={image} 
              alt="Uploaded" 
              className="preview max-h-40 rounded-lg border border-gray-200" 
            />
          </div>
        )}
      </div>

      {error && (
        <p className="error text-red-500 text-center mb-4">{error}</p>
      )}

      <Modal 
        isOpen={modalOpen} 
        className="fixed inset-0 flex items-center justify-center"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm">
          <h3 className="text-xl font-bold mb-4">🧪 Image Processing...</h3>
          <p>Please wait while we analyze your image.</p>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full animate-pulse" style={{width: '70%'}}></div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Chatbot;