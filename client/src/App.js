import React from "react";
import { Routes, Route } from "react-router-dom";
import { CodeGeneratorProvider } from "./Context/Codecontext";
import Input from "./Components/Input";
import Compiler from "./Components/Compiler";
import Signup from "./Components/Signup";
import Projects from "./Components/Projects";
import ShowCase from "./Components/ShowCase";
import FinalShowCase from "./Components/FinalShowCase";
import ShowProject from "./Components/showProject";

function App() {
  return (
    <CodeGeneratorProvider>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/input" element={<Input />} />
        <Route path="/compiler" element={<Compiler />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/show" element={<ShowCase />} />
        <Route path="/showproject/:id" element={<ShowProject />} />
        <Route path="/showcase" element={<FinalShowCase />} />
      </Routes>
    </CodeGeneratorProvider>
  );
}

export default App;
