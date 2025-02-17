import "./main.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router";
import Chat from "./pages/chat";
import Onboard from "./pages/onboard";
import Prepare from "./pages/prepare";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Prepare />} />
        <Route path="/onboard" element={<Onboard />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
