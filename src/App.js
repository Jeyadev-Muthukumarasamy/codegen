import Compiler from "./Components/Compiler";
import Input from "./Components/Input";
// import Sidebar from "./Components/Sidebar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./Components/Signup";
import Projects from "./Components/Projects";
// import Input from "./Components/Input";

import ShowCase from "./Components/ShowCase";
import FinalShowCase from "./Components/FinalShowCase";
import ShowProject from "./Components/showProject";
  

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/input" element={<Input />} />
        <Route path="/compiler" element={<Compiler />} />
        <Route path="/projects" element={<Projects />} />
        {/* <Route path="/show" element={<ShowProject />} /> */}
        <Route path="/show" element={<ShowCase />} />
        <Route path="/showproject" element={<ShowProject />} />
        <Route path="/showcase" element={<FinalShowCase />} />
      </Routes>
    </Router>
  )
}