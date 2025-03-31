import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/global.css";
import "../styles/components/telemetry.css";
const Telemetry = () => {
  const [telemetryData, setTelemetryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fps, setFps] = useState(0);
  const [streamStatus, setStreamStatus] = useState("stopped");
  const [telemetryError, setTelemetryError] = useState(false);
  const [signalLost, setSignalLost] = useState(false); // New state to track signal loss

  const fetchTelemetry = async () => {
    // FPS ve Yayın durumu
    try {
      const statsRes = await axios.get("http://127.0.0.1:5004/stats");
      setFps(statsRes.data.fps);
      setStreamStatus(statsRes.data.status);
      if (statsRes.data.status !== "running") {
        setSignalLost(true); // If status is not running, signal is lost
      } else {
        setSignalLost(false); // Signal is back if the stream is running
      }
    } catch (err) {
      console.warn("Video istatistik alınamadı:", err.message);
    }

    // Telemetri verisi
    try {
      const telemetryRes = await axios.get("http://127.0.0.1:5000/telemetry");
      setTelemetryData(telemetryRes.data);
      setTelemetryError(false);
      setLoading(false);
    } catch (err) {
      console.error("Telemetri alınamadı:", err.message);
      setTelemetryError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 1000);
    return () => clearInterval(interval);
  }, []);

  const startServer = async () => {
    try {
      await axios.post("http://127.0.0.1:5004/start");
      setStreamStatus("running");
    } catch (err) {
      console.error("Sunucu başlatma hatası:", err.message);
    }
  };

  const stopServer = async () => {
    try {
      await axios.post("http://127.0.0.1:5004/stop");
      setStreamStatus("stopped");
    } catch (err) {
      console.error("Sunucu durdurma hatası:", err.message);
    }
  };
  return (
    <div className="telemetry-wrapper">
      {/* Video Yayını */}
      <div className="telemetry-container green-container">
        <div className="stream-header"></div>

        <div className="video-responsive-container">
          {signalLost ? (
            <div className="video-wrapper signal-lost">
              <div className="status-overlay">Sinyal Kesildi</div>
              <img
                src="http://127.0.0.1:5004/video_feed"
                alt="Canlı Görüntü"
                className="video-element"
              />
            </div>
          ) : streamStatus === "running" ? (
            <div className="video-wrapper">
              <img
                src="http://127.0.0.1:5004/video_feed"
                alt="Canlı Görüntü"
                className="video-element"
              />
              <div className="status-overlay active">FPS: {fps.toFixed(1)}</div>
            </div>
          ) : (
            <div className="video-wrapper">
              <div className="status-overlay">Yayın Kapalı</div>
            </div>
          )}
        </div>
      </div>

      {/* Kırmızı Konteynır (Telemetri Verileri) */}
      <div className="telemetry-container red-container">
        {loading ? (
          <div className="error-message">Telemetri verisi yükleniyor...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="telemetry-content">
            {telemetryData && (
              <>
                <p>
                  <strong>Takım Numarası:</strong>{" "}
                  {telemetryData.takim_numarasi}
                </p>
                <p>
                  <strong>Hedef Merkez X:</strong>{" "}
                  {telemetryData.hedef_merkez_X}
                </p>
                <p>
                  <strong>Hedef Merkez Y:</strong>{" "}
                  {telemetryData.hedef_merkez_Y}
                </p>
                <p>
                  <strong>Hedef Genişlik:</strong>{" "}
                  {telemetryData.hedef_genislik}
                </p>
                <p>
                  <strong>Hedef Yükseklik:</strong>{" "}
                  {telemetryData.hedef_yukseklik}
                </p>
                <p>
                  <strong>İHA Enlem:</strong> {telemetryData.iha_enlem}
                </p>
                <p>
                  <strong>İHA Boylam:</strong> {telemetryData.iha_boylam}
                </p>
                <p>
                  <strong>İHA Yükseklik:</strong> {telemetryData.iha_irtifa}
                </p>
                <p>
                  <strong>İHA Dikilme:</strong>{" "}
                  {Number(telemetryData.iha_dikilme).toFixed(3)}°
                </p>
                <p>
                  <strong>İHA Yatış:</strong>{" "}
                  {Number(telemetryData.iha_yatis).toFixed(3)}°
                </p>
                <p>
                  <strong>İHA Yönelme:</strong>{" "}
                  {Number(telemetryData.iha_yonelme).toFixed(3)}°
                </p>
                <p>
                  <strong>İHA Hız:</strong>{" "}
                  {Number(telemetryData.iha_hiz).toFixed(3)} m/s
                </p>
                <p>
                  <strong>İHA Batarya:</strong> {telemetryData.iha_batarya}%
                </p>
                <p>
                  <strong>GPS Saati:</strong>{" "}
                  {telemetryData?.gps_saati?.saat ?? "00"}:
                  {telemetryData?.gps_saati?.dakika ?? "00"}:
                  {telemetryData?.gps_saati?.saniye ?? "00"}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Telemetry;
