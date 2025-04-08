import "./main.css";

import History from "@pages/history";
import Model from "@pages/model";
import Prompt from "@pages/prompt";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import Chat from "./pages/chat";
import Onboard from "./pages/onboard";
import Prepare from "./pages/prepare";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <div data-theme="dark">
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Prepare />} index />
          <Route path="/onboard" element={<Onboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/history" element={<History />} />
          <Route path="/prompt" element={<Prompt />} />
          <Route path="/model" element={<Model />} />
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  </div>
);
