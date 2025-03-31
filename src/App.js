// src/App.js
import Navbar from "./Navbar";
import Yonetim from "./pages/Yonetim";
import Iletisim from "./pages/Iletisim";
import Telemetry from "./pages/Telemetry"; // Telemetry sayfasını import ediyoruz
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Yonetim />} />
          <Route path="/Iletisim" element={<Iletisim />} />
          <Route path="/telemetry" element={<Telemetry />} /> {/* Yeni rota */}
        </Routes>
      </div>
    </>
  );
}

export default App;
