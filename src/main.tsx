import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
  <HashRouter>
    <Routes>
      <Route path="/" element={<Prepare />} />
      <Route path="/onboard" element={<Onboard />} />
      <Route path="/app" element={<App />} />
    </Routes>
  </HashRouter>
</React.StrictMode>
);
