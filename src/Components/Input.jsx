import axios from "axios";
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

const Input = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const generateCode = async() => {
    try {
      setIsLoading(true);
      const response = await axios.post("http://localhost:3001/", { prompt });
      setResponse(response.response);
      navigate("/compiler", { state: { code: response.data.response } });
    } catch (error) {
      console.error("Error generating code:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-screen bg-[#0A0F1C]">
      <Sidebar />
      
      <div className="flex-1 relative overflow-hidden">
        {/* Background Gradient Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
        <div className="absolute inset-0 backdrop-blur-3xl" />
        
        {/* Main Content */}
        <div className="relative h-full flex flex-col items-center justify-center p-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-white">
              Build Anything with AI
            </h1>
            <p className="mt-4 text-gray-400 text-lg">
              Describe your idea and let AI transform it into reality
            </p>
          </div>

          {/* Input Card */}
          <div className="w-full backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 shadow-2xl">
            <div className="p-6">
              <textarea
                className="w-full min-h-[200px] bg-transparent border-2 border-white/10 rounded-xl p-6 
                         text-white text-lg placeholder:text-gray-500 focus:border-blue-500/50 
                         focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 resize-none"
                placeholder="Describe your project idea in detail..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />

              <div className="flex items-center gap-4 mt-6">
                <button
                  onClick={generateCode}
                  disabled={isLoading || !prompt.trim()}
                  className={`flex-1 py-4 px-6 rounded-xl font-medium text-white
                           transition-all duration-300 transform hover:scale-[1.02]
                           ${isLoading || !prompt.trim() 
                             ? 'bg-gray-600 cursor-not-allowed' 
                             : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500'
                           }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Generating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>Generate Code</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  )}
                </button>

                <button className="px-6 py-4 rounded-xl font-medium text-white bg-white/5 
                                 border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Input;