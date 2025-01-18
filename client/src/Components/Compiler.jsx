import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Code2, Eye, Download, Copy, Check, Save, Home } from 'lucide-react';
import Editor from '@monaco-editor/react';
import beautify from 'js-beautify';
import { useCodeGenerator } from '../Context/Codecontext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TypewriterText = ({ text }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (text && currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(text.substring(0, currentIndex + 10));
        setCurrentIndex(currentIndex + 10);
      }, 1);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text]);

  return <span>{displayText || text}</span>;
};

const MultiPagePreview = ({ code, previewKey }) => {
  const [history, setHistory] = useState([]);
  const iframeRef = useRef(null);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'navigation') {
        setHistory(prev => [...prev, event.data.href]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="w-full h-full relative">
      <iframe 
        ref={iframeRef}
        key={previewKey}
        srcDoc={`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <base target="_self">
              <style>
                body { margin: 0; padding: 10px; }
              </style>
              <script>
                window.addEventListener('click', function(e) {
                  if (e.target.tagName === 'A') {
                    e.preventDefault();
                    window.parent.postMessage({
                      type: 'navigation',
                      href: e.target.href
                    }, '*');
                  }
                });
              </script>
            </head>
            <body>${code}</body>
          </html>
        `}
        title="Preview" 
        className="w-full h-full bg-white"
        sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
      />
      {history.length > 0 && (
        <div className="absolute top-2 left-2 flex gap-2">
          <button 
            onClick={() => {
              setHistory(prev => prev.slice(0, -1));
              if (iframeRef.current) {
                iframeRef.current.contentWindow.history.back();
              }
            }}
            className="px-2 py-1 bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
};

const Compiler = () => {
  const { code, setCode, messages, setMessages, projectName } = useCodeGenerator();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('vs-dark');
  const [language, setLanguage] = useState('html');
  const [copied, setCopied] = useState(false);
  const [editorValue, setEditorValue] = useState(code || '');
  const [isTyping, setIsTyping] = useState(false);
  const [isTypingCode, setIsTypingCode] = useState(false);
  const [finalCodeValue, setFinalCodeValue] = useState('');
  const [activeTab, setActiveTab] = useState('code');
  const [desktopView, setDesktopView] = useState('code');
  const [editorMounted, setEditorMounted] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  const chatEndRef = useRef(null);
  const editorRef = useRef(null);
  const navigate = useNavigate();

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    setEditorMounted(true);
  };

  useEffect(() => {
    return () => {
      setEditorMounted(false);
      editorRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (editorMounted && editorRef.current) {
      setEditorValue(code || '');
      setFinalCodeValue(code || '');
      setPreviewKey(prev => prev + 1);
    }
  }, [code, editorMounted]);

  useEffect(() => {
    setPreviewKey(prev => prev + 1);
  }, [finalCodeValue]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleUpdate = async () => {
    if (!input.trim() || loading) return;
    
    try {
      setLoading(true);
      setMessages(prev => [...prev, { text: input, sender: 'user' }]);
      
      const response = await axios.post('http://localhost:3001/update', {
        inputMessage: input,
        existingCode: finalCodeValue,
        aiMessage: messages[messages.length - 1]?.text
      });
  
      if (response.data.code) {
        const formattedCode = beautify.html(response.data.code, { 
          indent_size: 2, 
          preserve_newlines: true 
        });
        await typeCode(formattedCode);
        setCode(formattedCode);
      }
  
      if (response.data.frontendMessage) {
        setMessages(prev => [...prev, { 
          text: response.data.frontendMessage, 
          sender: 'bot' 
        }]);
      }
      
      setInput('');
    } catch (error) {
      setMessages(prev => [...prev, { 
        text: 'Failed to update code. Please try again.', 
        sender: 'bot' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const typeCode = async (codeString) => {
    if (!editorMounted) return;
    
    setIsTypingCode(true);
    const chunkSize = 10;
    let currentCode = '';
    
    for (let i = 0; i < codeString.length; i += chunkSize) {
      currentCode += codeString.substring(i, i + chunkSize);
      setEditorValue(currentCode);
      await new Promise(resolve => setTimeout(resolve, 1));
    }
    
    setIsTypingCode(false);
    setFinalCodeValue(codeString);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUpdate();
    }
  };

  const handleActions = {
    editorChange: (value) => {
      if (!isTypingCode && editorMounted) {
        setEditorValue(value || '');
        setFinalCodeValue(value || '');
      }
    },
    copy: async () => {
      await navigator.clipboard.writeText(finalCodeValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    },
    save: async () => {
      setLoading(true);
      try {
        const response = await axios.post('http://localhost:3001/api/postCode', {
          projectName,
          formattedCode: finalCodeValue,
          messages,
          email: sessionStorage.getItem('sessionToken'),
          showcase: false
        });
        setMessages(prev => [...prev, { text: 'Code saved successfully', sender: 'bot' }]);
      } catch (error) {
        setMessages(prev => [...prev, { text: 'Error saving code. Please try again.', sender: 'bot' }]);
      } finally {
        setLoading(false);
      }
    },
    download: () => {
      const blob = new Blob([finalCodeValue], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName || 'code'}.${language}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    goHome: () => {
      navigate('/input');
    }
  };

  const renderEditor = () => (
    <div className="h-full relative">
      <Editor
        height="100%"
        language={language}
        theme={theme}
        value={editorValue}
        onChange={handleActions.editorChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineHeight: 21,
          padding: { top: 10 },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorSmoothCaretAnimation: true,
          formatOnPaste: true,
          formatOnType: true
        }}
      />
      {isTypingCode && (
        <div className="absolute top-2 left-2 px-3 py-1 bg-[#3C3C3C] text-white text-sm rounded-full">
          Typing code...
        </div>
      )}
    </div>
  );

  const renderPreview = () => (
    <MultiPagePreview 
      code={finalCodeValue}
      previewKey={previewKey}
    />
  );

  const renderChat = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#4A4A4A] scrollbar-track-[#2D2D2D]">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`p-3 rounded-lg max-w-[80%] ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#2D2D2D] text-white'
              }`}
            >
              <TypewriterText text={message.text} />
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#2D2D2D] p-3 rounded-lg text-white">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="p-4 bg-[#252526] border-t border-[#3C3C3C]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 bg-[#3C3C3C] text-white rounded border border-[#4A4A4A] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );

  const renderMobileContent = () => {
    switch (activeTab) {
      case 'chat':
        return renderChat();
      case 'preview':
        return renderPreview();
      default:
        return renderEditor();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#1E1E1E]">
      <div className="p-4 bg-[#252526] border-b border-[#3C3C3C] flex items-center justify-between">
        <h2 className="text-white font-medium">{projectName}</h2>
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-2 py-1 text-sm bg-[#3C3C3C] text-white rounded border border-[#4A4A4A] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="html">HTML</option>
            <option value="javascript">JavaScript</option>
            <option value="css">CSS</option>
          </select>
          <button
            onClick={() => setDesktopView(desktopView === 'code' ? 'preview' : 'code')}
            className="hidden md:flex p-1.5 rounded hover:bg-[#3C3C3C] transition-colors"
          >
            {desktopView === 'code' ? 
              <Eye className="w-4 h-4 text-white" /> : 
              <Code2 className="w-4 h-4 text-white" />
            }
          </button>
          <button 
            onClick={handleActions.copy} 
            className="p-1.5 rounded hover:bg-[#3C3C3C] transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-white" />}
          </button>
          <button 
            onClick={handleActions.download} 
            className="p-1.5 rounded hover:bg-[#3C3C3C] transition-colors"
          >
            <Download className="w-4 h-4 text-white" />
          </button>
          <button 
            onClick={handleActions.save} 
            className="p-1.5 rounded hover:bg-[#3C3C3C] transition-colors"
          >
            <Save className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <div className="md:hidden flex border-b border-[#3C3C3C]">
        <button
          onClick={() => setActiveTab('code')}
          className={`flex-1 p-3 text-white ${activeTab === 'code' ? 'border-b-2 border-blue-500' : ''}`}
        >
          <Code2 className="w-5 h-5 mx-auto" />
        </button>
        <button onClick={() => setActiveTab('preview')}
          className={`flex-1 p-3 text-white ${activeTab === 'preview' ? 'border-b-2 border-blue-500' : ''}`}
        >
          <Eye className="w-5 h-5 mx-auto" />
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 p-3 text-white ${activeTab === 'chat' ? 'border-b-2 border-blue-500' : ''}`}
        >
          <Send className="w-5 h-5 mx-auto" />
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="md:hidden h-full">
          {renderMobileContent()}
        </div>

        <div className="hidden md:flex h-full">
          <div className="flex-1 border-r border-[#3C3C3C]">
            {desktopView === 'code' ? renderEditor() : renderPreview()}
          </div>
          <div className="w-2/5 min-w-[400px]">
            {renderChat()}
          </div>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#252526] border-t border-[#3C3C3C] p-4">
        <button
          onClick={handleActions.goHome}
          className="w-full py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>
      </div>

      <div className="fixed bottom-4 right-4 space-y-2">
        {copied && (
          <div className="bg-green-500 text-white px-4 py-2 rounded shadow-lg flex items-center space-x-2">
            <Check className="w-4 h-4" />
            <span>Copied to clipboard</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compiler;