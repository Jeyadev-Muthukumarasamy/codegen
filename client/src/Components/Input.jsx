import React, { useEffect, useState } from "react";
import { useCodeGenerator } from "../Context/Codecontext";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";

const Input = () => {
  const { prompt, setPrompt, isLoading, generateCode, code } = useCodeGenerator();
  const navigate = useNavigate();

  useEffect(() => {
    const sessionToken = sessionStorage.getItem("sessionToken");
    if (!sessionToken) {
      // Redirect to signup page if sessionToken is missing
      navigate("/signup");
    }
  }, [navigate]);

  useEffect(() => {
    if (code) {
      navigate(`/compiler`, { state: { code } });
    }
  }, [code, navigate]);

  return (
    <div className="flex h-screen bg-[#0A0F1C]">
      <Sidebar />
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
        <div className="absolute inset-0 backdrop-blur-3xl" />
        <div className="relative h-full flex flex-col items-center justify-center p-8 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-white">
              Build Anything with AI
            </h1>
            <p className="mt-4 text-gray-400 text-lg">
              Describe your idea and let AI transform it into reality
            </p>
          </div>
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
                    ${
                      isLoading || !prompt.trim()
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                    }`}
                >
                  {isLoading ? "Generating..." : "Generate Code"}
                </button>
                <button
                  onClick={() => setPrompt("")}
                  className="px-6 py-4 rounded-xl font-medium text-white bg-white/5 
                  border border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  Reset
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
