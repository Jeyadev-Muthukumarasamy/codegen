import React, { createContext, useContext, useState, useEffect } from "react";

// Create context for code generation
const CodeGeneratorContext = createContext();

export const CodeGeneratorProvider = ({ children }) => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState(() => {
    return sessionStorage.getItem("codegen_code") || "";
  });
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem("codegen_messages");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [data, setData] = useState(null);
  const [projectName, setProjectName] = useState(() => {
    return sessionStorage.getItem("codegen_projectName") || "";
  });

  // Function to handle code generation
  const generateCode = async () => {
    try {
      setIsLoading(true);

      // Add user input to messages
      if (prompt.trim() !== "") {
        setMessages((prevMessages) => [
          ...(Array.isArray(prevMessages) ? prevMessages : []),
          { text: prompt, sender: "user" },
        ]);
      }

      // Send the request to the server
      const response = await fetch("http://localhost:3001/cohere", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const contentType = response.headers.get("content-type");

      // Handle cached (non-streamed) JSON response
      if (contentType && contentType.includes("application/json")) {
        const responseData = await response.json();
        if (responseData.projectName) setProjectName(responseData.projectName);
        if (responseData.code) setCode(responseData.code);
        if (responseData.frontendMessage) {
          setMessages((prev) => [
            ...(Array.isArray(prev) ? prev : []),
            { text: responseData.frontendMessage, sender: "bot" },
          ]);
        }
        return;
      }

      // Handle SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // Add a placeholder bot message while generating
      setMessages((prev) => [
        ...(Array.isArray(prev) ? prev : []),
        { text: "Generating your code...", sender: "bot" },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const parsed = JSON.parse(line.slice(6));

          if (parsed.type === "done") {
            // Set final structured data - only show message, not code
            if (parsed.projectName) setProjectName(parsed.projectName);
            if (parsed.code) setCode(parsed.code);
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                text: parsed.frontendMessage || "Code generated successfully!",
                sender: "bot",
              };
              return updated;
            });
          } else if (parsed.type === "error") {
            throw new Error(parsed.error);
          }
        }
      }
    } catch (error) {
      console.error("Error generating code:", error);

      // Handle errors and display in the chat
      setMessages((prevMessages) => [
        ...(Array.isArray(prevMessages) ? prevMessages : []),
        {
          text: error.message || "An error occurred during code generation.",
          sender: "bot",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Persist state to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("codegen_code", code);
  }, [code]);

  useEffect(() => {
    sessionStorage.setItem("codegen_messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    sessionStorage.setItem("codegen_projectName", projectName);
  }, [projectName]);

  return (
    <CodeGeneratorContext.Provider
      value={{
        prompt,
        setPrompt,
        isLoading,
        generateCode,
        code,
        setCode,
        messages,
        setMessages,
        data,
        setData,
        projectName,
      }}
    >
      {children}
    </CodeGeneratorContext.Provider>
  );
};

// Custom hook to use the CodeGeneratorContext
export const useCodeGenerator = () => useContext(CodeGeneratorContext);
