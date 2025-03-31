import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/global.css";
import "../styles/components/yonetim.css";

// OptimizedMap bileşenini şu şekilde güncelleyin:
function OptimizedMap({ initialCenter, initialZoom }) {
  const map = useMap();

  // Sadece ilk yüklemede ve boyut değişikliklerinde çalışacak
  useEffect(() => {
    map.invalidateSize();
    map.setView(initialCenter, initialZoom, { animate: false });
  }, [map]); // Sadece map değiştiğinde çalışsın

  return null;
}
// Marker ikonlarını önceden yükle
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const myAircraftIcon = L.icon({
  iconUrl: "/images/my-aircraft-icon.png",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export default function Yonetim() {
  const [aircraftData, setAircraftData] = useState([]);
  const [myAircraftData, setMyAircraftData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [systemStatus, setSystemStatus] = useState("Çalışıyor");
  const logContainerRef = useRef(null);
  const userScrolledRef = useRef(false);

  // En alta kaydırma fonksiyonu
  const scrollToBottom = () => {
    if (logContainerRef.current && !userScrolledRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  };

  // Kullanıcı kaydırma davranışını izle
  useEffect(() => {
    const container = logContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop <= clientHeight + 50;
      userScrolledRef.current = !isNearBottom;
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Loglar değiştiğinde otomatik kaydır
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [logs]);

  // API'den uçak verilerini al
  const fetchAircraftData = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/aircraft-data");
      const data = await response.json();
      setAircraftData(data.konumBilgileri || []);

      const myAircraftResponse = await fetch(
        "http://localhost:5000/api/my-aircraft-data"
      );
      const myAircraft = await myAircraftResponse.json();
      setMyAircraftData(myAircraft.hss_koordinat_bilgileri || null);

      addLocalLog("success", "Uçak verileri başarıyla güncellendi");
    } catch (error) {
      console.error("Veri çekme hatası:", error);
      addLocalLog("error", "Uçak verileri alınırken hata oluştu");
      setSystemStatus("Sorunlu");
    }
  };

  // API'den log verilerini al
  const fetchLogs = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/logs");
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error("Loglar alınırken hata:", error);
      addLocalLog("error", "Log verileri alınırken hata oluştu");
    }
  };

  // Yerel log ekleme fonksiyonu
  const addLocalLog = (type, message) => {
    const newLog = {
      type,
      message: `[${type.toUpperCase()}] ${message}`,
      timestamp: new Date().toISOString(),
    };
    setLogs((prevLogs) => [newLog, ...prevLogs].slice(0, 50));
  };

  // Örnek log ekleme fonksiyonu
  const addLog = (type, message) => {
    const newLog = {
      type,
      message: `[${type.toUpperCase()}] ${message}`,
      timestamp: new Date().toISOString(),
    };
    setLogs((prev) => [newLog, ...prev].slice(0, 100));
  };

  useEffect(() => {
    // İlk verileri yükle
    fetchAircraftData();
    fetchLogs();

    // Periyodik güncellemeleri ayarla
    const aircraftInterval = setInterval(fetchAircraftData, 5000);
    const logInterval = setInterval(fetchLogs, 3000);

    return () => {
      clearInterval(aircraftInterval);
      clearInterval(logInterval);
    };
  }, []);

  return (
    <div className="dashboard-container">
      {/* Üst Kısım */}
      <div className="status-screen">
        <h2>Durum Ekranı</h2>
        <div className="status-content">
          <p>Sistem durumu: {systemStatus}</p>
          <p>Son güncelleme: {new Date().toLocaleString()}</p>
          <p>Aktif uçak sayısı: {aircraftData.length}</p>
          {myAircraftData && <p>Kendi uçağım: Aktif</p>}
        </div>
      </div>

      <div className="buttons-panel">
        <h2>İşlemler</h2>
        <div className="button-group">
          <button
            className="action-button start-button"
            onClick={() => {
              addLog("success", "Sistem başlatıldı");
              setSystemStatus("Çalışıyor");
            }}
          >
            Başlat
          </button>
          <button
            className="action-button stop-button"
            onClick={() => {
              addLog("warning", "Sistem durduruldu");
              setSystemStatus("Durduruldu");
            }}
          >
            Durdur
          </button>
          <button
            className="action-button settings-button"
            onClick={() => addLog("info", "Ayarlar açıldı")}
          >
            Ayarlar
          </button>
          <button
            className="action-button report-button"
            onClick={() => addLog("debug", "Rapor oluşturuluyor")}
          >
            Rapor Al
          </button>
        </div>
      </div>

      {/* Simülasyon Ekranı */}
      <div className="simulation-screen">
        <h2>Harita Görünümü</h2>
        <div className="simulation-content">
          <div className="simulation-visual">
            <MapContainer
              center={[41.5118256, 36.11993]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              zoomControl={false}
              preferCanvas={true}
              whenReady={() => addLocalLog("info", "Harita başarıyla yüklendi")}
            >
              <OptimizedMap
                initialCenter={[41.5118256, 36.11993]}
                initialZoom={13}
              />

              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                maxZoom={19}
                minZoom={2}
                updateWhenIdle={true}
                keepBuffer={5}
              />

              {/* Kendi uçağımın marker'ı */}
              {myAircraftData?.map((coord, index) => (
                <Marker
                  key={`my-${index}`}
                  position={[coord.hssEnlem, coord.hssBoylam]}
                  icon={myAircraftIcon}
                  eventHandlers={{
                    click: () => {
                      addLocalLog(
                        "info",
                        `Kendi uçağımın konumu görüntülendi: ${coord.hssEnlem}, ${coord.hssBoylam}`
                      );
                    },
                  }}
                >
                  <Popup>
                    Uçağım - Konum: {coord.hssEnlem}, {coord.hssBoylam}
                  </Popup>
                </Marker>
              ))}

              {/* Diğer uçaklar */}
              {aircraftData.map((aircraft, index) => (
                <Marker
                  key={`aircraft-${index}`}
                  position={[aircraft.iha_enlem, aircraft.iha_boylam]}
                  icon={markerIcon}
                  eventHandlers={{
                    click: () => {
                      addLocalLog(
                        "info",
                        `Takım ${aircraft.takim_numarasi} uçağının konumu görüntülendi`
                      );
                    },
                  }}
                >
                  <Popup>
                    Takım {aircraft.takim_numarasi}
                    <br />
                    Yükseklik: {aircraft.iha_irtifa}m
                    <br />
                    Hız: {aircraft.iha_hiz} m/s
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Log Paneli */}
      <div className="log-panel">
        <h2>Sistem Logları</h2>
        <div className="log-content-container" ref={logContainerRef}>
          <div className="log-content">
            {logs.map((log, i) => (
              <p key={`log-${i}`} className={log.type}>
                {new Date(log.timestamp).toLocaleTimeString()} - {log.message}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
