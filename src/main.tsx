import "./main.css";

import About from "@pages/about";
import History from "@pages/history";
import Prompt from "@pages/prompt";
import Provider from "@pages/provider";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import Chat from "./pages/chat";
import Onboard from "./pages/onboard";
import Prepare from "./pages/prepare";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Prepare />} index />
        <Route path="/onboard" element={<Onboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/history" element={<History />} />
        <Route path="/prompt" element={<Prompt />} />
        <Route path="/provider" element={<Provider />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
