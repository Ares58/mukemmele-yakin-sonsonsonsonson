const express = require("express");
const cors = require("cors");
const app = express();
const port = 5000;

// CORS ayarları
app.use(cors());

// Rastgele log üretecek fonksiyon
function generateRandomLog() {
  const types = ["info", "success", "warning", "error", "debug"];
  const messages = [
    "Sistem başlatıldı",
    "Veritabanı bağlantısı sağlandı",
    "Kullanıcı girişi başarılı",
    "Yetkilendirme hatası",
    "Sunucu yükü %75 seviyesinde",
    "Yedekleme tamamlandı",
    "Geçersiz istek algılandı",
    "API çağrısı başarısız",
    "Önbellek temizlendi",
    "Yeni güncelleme mevcut",
  ];

  const type = types[Math.floor(Math.random() * types.length)];
  const message = messages[Math.floor(Math.random() * messages.length)];

  return {
    type,
    message: `[${type.toUpperCase()}] ${message}`,
    timestamp: new Date().toISOString(),
  };
}

// 20 adet rastgele log oluştur
let logs = Array.from({ length: 20 }, generateRandomLog);

// Log endpoint'i
app.get("/api/logs", (req, res) => {
  // Her istekte 0-2 yeni log ekle
  const newLogs = Array.from(
    { length: Math.floor(Math.random() * 3) },
    generateRandomLog
  );
  logs = [...newLogs, ...logs].slice(0, 50); // En fazla 50 log tut

  res.json(logs);
});

// Uçak verileri için mock endpoint'ler
app.get("/api/aircraft-data", (req, res) => {
  res.json({
    konumBilgileri: [
      {
        takim_numarasi: 1,
        iha_enlem: 41.5118 + (Math.random() * 0.01 - 0.005),
        iha_boylam: 36.1199 + (Math.random() * 0.01 - 0.005),
        iha_irtifa: Math.floor(Math.random() * 1000),
        iha_hiz: Math.floor(Math.random() * 50 + 50),
      },
      {
        takim_numarasi: 2,
        iha_enlem: 41.5118 + (Math.random() * 0.01 - 0.005),
        iha_boylam: 36.1199 + (Math.random() * 0.01 - 0.005),
        iha_irtifa: Math.floor(Math.random() * 1000),
        iha_hiz: Math.floor(Math.random() * 50 + 50),
      },
    ],
  });
});

app.get("/api/my-aircraft-data", (req, res) => {
  res.json({
    hss_koordinat_bilgileri: [
      {
        hssEnlem: 41.5118 + (Math.random() * 0.001 - 0.0005),
        hssBoylam: 36.1199 + (Math.random() * 0.001 - 0.0005),
      },
    ],
  });
});

// Sunucuyu başlat
app.listen(port, () => {
  console.log(`Backend sunucusu http://localhost:${port} adresinde çalışıyor`);
});
