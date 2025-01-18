import React, { createContext, useContext, useState, useEffect } from "react";

// Create context for code generation
const CodeGeneratorContext = createContext();

export const CodeGeneratorProvider = ({ children }) => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState(""); // Initialize code as empty string
  const [messages, setMessages] = useState([]); // Initialize messages as an empty array
  const [data, setData] = useState(null);
  const [projectName, setProjectName] = useState("");

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

      const responseData = await response.json();
      console.log("Response data:", responseData);

      // Update projectName state
      if (responseData.projectName) {
        setProjectName(responseData.projectName);
        console.log("Updated project name:", responseData.projectName);
      }

      // Ensure the response contains the necessary fields
      if (responseData && responseData.message) {
        const { frontendMessage, code } = responseData.message;

        // Update the code state with the response
        setCode(code);

        // Append the bot's response (frontendMessage) to messages
        setMessages((prevMessages) => [
          ...(Array.isArray(prevMessages) ? prevMessages : []),
          { text: frontendMessage, sender: "bot" },
        ]);

        console.log("Generated code:", code);
        console.log("Frontend message:", frontendMessage);
      } else {
        console.error("Invalid response format:", responseData);

        // Handle invalid response
        setMessages((prevMessages) => [
          ...(Array.isArray(prevMessages) ? prevMessages : []),
          {
            text: "Invalid response from the server.",
            sender: "bot",
          },
        ]);
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

  // Debugging: Log updated projectName when it changes
  useEffect(() => {
    if (projectName) {
      console.log("Project name has been updated:", projectName);
    }
  }, [projectName]);

  // Debugging: Log updated messages
  useEffect(() => {
    console.log("Messages updated:", messages);
  }, [messages]);

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
