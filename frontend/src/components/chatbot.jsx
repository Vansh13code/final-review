import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import './chatbot.css';

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

const healthKeywords = [
  "fever", "cold", "cough", "pain", "headache", "vomiting", "dizziness", "rash",
  "infection", "swelling", "stomach", "breathing", "burn", "injury", "diarrhea",
  "fatigue", "nausea", "symptom", "sore", "chills", "congestion", "throat", "skin", "allergy"
];

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Show welcome message initially
  useEffect(() => {
    const welcome = "Welcome to Medicare Chatbot! 🤖 Please enter your health symptoms, and I’ll help suggest possible causes.";
    setChat([{ role: 'bot', content: welcome }]);
    speak(welcome);
  }, []);

  const isHealthRelated = (text) => {
    return healthKeywords.some((word) => text.toLowerCase().includes(word));
  };

  const sendToAI = async () => {
    if (!input.trim()) {
      setError('Please enter your health symptoms.');
      return;
    }

    setError('');
    setLoading(true);

    const userMsg = { role: 'user', content: input };
    setChat((prev) => [...prev, userMsg]);

    try {
      let response = '';

      if (!isHealthRelated(input)) {
        response = "Please enter valid health symptoms so I can assist you properly.";
      } else {
        const res = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: `User symptoms: ${input}. Briefly suggest possible disease(s) only. End with: "Please consult a certified Medicare doctor. I am not a licensed medical professional."`
        });
        response = res.text;
      }

      setChat((prev) => [...prev, { role: 'bot', content: response }]);
      speak(response);
    } catch (err) {
      console.error(err);
      const fallback = "Sorry, I couldn't process your request.";
      setChat((prev) => [...prev, { role: 'bot', content: fallback }]);
      speak(fallback);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const startVoice = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      setError("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
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

      {error && (
        <p className="error text-red-500 text-center mb-4">{error}</p>
      )}
    </div>
  );
};

export default Chatbot;
