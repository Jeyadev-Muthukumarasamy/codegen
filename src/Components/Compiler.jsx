import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Editor from "@monaco-editor/react";
import DOMPurify from 'dompurify';

const Compiler = () => {
    const location = useLocation();
    const { code: initialCodeProp } = location.state || { code: '' };
    const [htmlCode, setHtmlCode] = useState('');
    const [cssCode, setCssCode] = useState('');
    const [jsCode, setJsCode] = useState('');
    const [editorValue, setEditorValue] = useState('');
    const [error, setError] = useState(null);
    const previewRef = useRef(null);
    const [projectName, setProjectName] = useState("Untitled Project");
    const [userInput, setUserInput] = useState("");
    const [generatedCode, setGeneratedCode] = useState(null);
    const navigate = useNavigate();
    const email = sessionStorage.getItem('sessionToken');

    const generateCombinedCode = (html, css, js) => `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>${css}</style>
        </head>
        <body>
            ${html}
            <script>${js}</script>
        </body>
        </html>`.trim();

    const updateCode = async () => {
        try {
            const response = await axios.post("http://localhost:3001/update-code", {
                email,
                userPrompt: userInput,
                existingCode: { html: htmlCode, css: cssCode, js: jsCode },
                projectName
            });

            const { html, css, js, combinedCode, projectName: newProjectName } = response.data.data || {};
            setHtmlCode(html || "");
            setCssCode(css || "");
            setJsCode(js || "");
            if(newProjectName) setProjectName(newProjectName)
            setGeneratedCode({ html, css, js, combinedCode });
            setEditorValue(combinedCode);
            setError(null);
        } catch (error) {
            console.error("Error updating code:", error);
            setError("Failed to update code. Please check the server connection.");
        }
    };

    useEffect(() => {
        try {
            const parsedCode = typeof initialCodeProp === "string" ? JSON.parse(initialCodeProp) : initialCodeProp;
            if (parsedCode) {
                setProjectName(parsedCode.projectName || "Untitled Project");
                setHtmlCode(parsedCode.html || "");
                setCssCode(parsedCode.css || "");
                setJsCode(parsedCode.js || "");
                const combinedCode = generateCombinedCode(parsedCode.html || "", parsedCode.css || "", parsedCode.js || "");
                setGeneratedCode({ ...parsedCode, combinedCode });
                setEditorValue(combinedCode);
            }
        } catch (err) {
            console.error("Error parsing initial code:", err);
            setError("Failed to load initial code.");
        }
    }, [initialCodeProp]);

    useEffect(() => {
        if (previewRef.current && generatedCode) {
            previewRef.current.innerHTML = '';
            try {
                const cleanHTML = DOMPurify.sanitize(generatedCode.combinedCode, { USE_PROFILES: { html: true } });
                const parser = new DOMParser();
                const doc = parser.parseFromString(cleanHTML, 'text/html');

                const scripts = doc.querySelectorAll('script');
                scripts.forEach(script => {
                    const newScript = document.createElement('script');
                    Array.from(script.attributes).forEach(attr => {
                        newScript.setAttribute(attr.name, attr.value);
                    });
                    newScript.textContent = script.textContent;
                    previewRef.current.appendChild(newScript);
                    script.remove();
                });

                //Handle Links
                const links = doc.querySelectorAll('a');
                links.forEach(link => {
                    link.addEventListener('click', (event) => {
                        const href = event.target.getAttribute('href');
                        if (href && href.startsWith("/")) {
                            event.preventDefault();
                            window.parent.postMessage(JSON.stringify({ action: "navigate", path: href }), '*');
                        }
                    })
                })
                previewRef.current.appendChild(doc.body);
            } catch (error) {
                console.error("Error parsing or rendering HTML:", error);
                previewRef.current.innerHTML = '<div style="color: red;">Error rendering preview. Check your HTML/CSS/JS.</div>';
            }
        }
    }, [generatedCode]);

    const handleEditorChange = (value) => {
        setEditorValue(value);
    };

    const handleProjectNameChange = (e) => {
        setProjectName(e.target.value);
    };

    return (
        <div className="flex h-screen bg-zinc-950">
            <div className="w-[250px] border-r border-zinc-800">
                <Sidebar />
            </div>

            <PanelGroup direction="horizontal" className="flex-1">
                <Panel defaultSize={50} minSize={30}>
                    <div className="h-full flex flex-col">
                        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={projectName}
                                    onChange={handleProjectNameChange}
                                    className="bg-zinc-800 rounded px-2 py-1 text-white"
                                />
                                {error && <span className="text-red-500 text-sm">{error}</span>}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={updateCode}
                                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                                >
                                    Update Code
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden">
                            <Editor
                                height="100%"
                                defaultLanguage="html"
                                theme="vs-dark"
                                value={editorValue}
                                onChange={handleEditorChange}
                                options={{
                                    fontSize: 14,
                                    minimap: { enabled: true },
                                    scrollBeyondLastLine: false,
                                    wordWrap: "on",
                                    padding: { top: 16 },
                                    lineNumbers: "on",
                                    matchBrackets: "always",
                                    automaticLayout: true,
                                    tabSize: 2,
                                    formatOnPaste: true,
                                    formatOnType: true
                                }}
                            />
                        </div>
                    </div>
                </Panel>

                <PanelResizeHandle className="w-2 bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-col-resize" />

                <Panel defaultSize={50} minSize={30}>
                    <div className="h-full flex flex-col">
                        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900">
                            <h2 className="text-lg font-semibold text-white">Preview</h2>
                        </div>
                        <div ref={previewRef} className="flex-1 w-full h-full overflow-auto bg-white" />
                    </div>
                </Panel>
            </PanelGroup>
            <div className="fixed bottom-0 w-full bg-zinc-800 p-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        className="flex-1 p-2 bg-zinc-700 text-white rounded-l-lg"
                        placeholder="Type your message..."
                    />
                    <button
                        onClick={updateCode}
                        className="px-4 py-2 bg-blue-600 text-white rounded-r-lg"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Compiler;