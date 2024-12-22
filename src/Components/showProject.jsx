import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Editor from "@monaco-editor/react";

const Showproject = () => {
    const location = useLocation();
    const { id } = location.state;
    const [projectData, setProjectData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [code, setCode] = useState('');
    const [editedCode, setEditedCode] = useState('');
    const [language, setLanguage] = useState('html');

    const getCode = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`http://localhost:3001/api/sendCodeById?id=${id}`);
            if (response.data && response.data.response && response.data.response.length > 0) { // Check if data exists
                setProjectData(response.data.response[0]);
                console.log(projectData)
                const initialCode = response.data.response[0].formattedCode;
                setCode(initialCode);
                setEditedCode(initialCode);
                detectLanguage(initialCode);
            } else {
                console.error("No project data found for ID:", id);
                setCode('');
                setEditedCode('');
            }
        } catch (error) {
            console.error('Error fetching code:', error);
            setCode('');
            setEditedCode('');
        } finally {
            setIsLoading(false);
        }
    };

    const detectLanguage = (code) => {
        if (code.includes('<!DOCTYPE html>') || code.includes('<html>')) {
            setLanguage('html');
        } else if (code.includes('function') || code.includes('const') || code.includes('import') || code.includes('export')) {
            setLanguage('javascript');
        } else if (code.includes('<?php') || code.includes('<?')) {
            setLanguage('php');
        }
        else if (code.includes('class ') || code.includes('def ')) {
            setLanguage('python');
        }
        else if (code.includes('package ') || code.includes('public class')) {
            setLanguage('java');
        }
        else if (code.includes('using ') || code.includes('namespace ')) {
            setLanguage('csharp');
        }
        else if (code.includes('#include ') || code.includes('int main()')) {
            setLanguage('cpp');
        }
        else if (code.includes('package main') || code.includes('func main()')) {
            setLanguage('go');
        }
        else if (code.includes('fn main()') || code.includes('let ')) {
            setLanguage('rust');
        }
        else if (code.includes('print(') || code.includes('input(')) {
          setLanguage('python');
        }
         else if (code.includes('SELECT ') || code.includes('FROM ')) {
          setLanguage('sql');
        }
        else if (code.includes('import ') || code.includes('from ')) {
          setLanguage('python');
        }
        else {
            setLanguage('plaintext');
        }
    };

    useEffect(() => {
        getCode();
    }, [id]);

    const handleEditorChange = (value) => {
        setEditedCode(value);
        setCode(value); // Update code state directly on editor change
    };

    const handleResetCode = () => {
        setEditedCode(projectData?.formattedCode || '');
        setCode(projectData?.formattedCode || '');
    };

    return (
        <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">
            <div className="w-64 border-r border-zinc-800 hidden lg:block">
                <Sidebar />
            </div>

            <PanelGroup direction="horizontal" className="flex-1">
                <Panel defaultSize={50} minSize={30}>
                    <div className="h-full flex flex-col">
                        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-semibold">Code Editor</h2>
                                <span className="text-xs px-2 py-1 bg-zinc-800 rounded">{language}</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleResetCode}
                                    className="px-3 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600 text-sm transition-colors"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                </div>
                            ) : (
                                <Editor
                                    height="100%"
                                    defaultLanguage={language}
                                    theme="vs-dark"
                                    value={editedCode}
                                    onChange={handleEditorChange}
                                    options={{
                                        fontSize: 14,
                                        minimap: { enabled: true },
                                        scrollBeyondLastLine: false,
                                        padding: { top: 16 },
                                        lineNumbers: "on",
                                        matchBrackets: "always",
                                        automaticLayout: true,
                                        tabSize: 2,
                                        wordWrap: "on"
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </Panel>

                <PanelResizeHandle className="w-2 bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-col-resize" />

                <Panel defaultSize={50} minSize={30}>
                    <div className="h-full flex flex-col">
                        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900">
                            <h2 className="text-lg font-semibold text-white">Preview</h2>
                        </div>
                        <div className="flex-1 bg-white">
                            <iframe
                                srcDoc={code}
                                title="preview"
                                className="w-full h-full border-0"
                                sandbox="allow-scripts allow-modals"
                            />
                        </div>
                    </div>
                </Panel>
            </PanelGroup>
        </div>
    );
};

export default Showproject;