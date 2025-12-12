#include <WiFi.h>
#include <WiFiClientSecure.h> // Wajib untuk HTTPS
#include <SPI.h>
#include <MFRC522.h>
#include <LiquidCrystal_I2C.h>

// --- KONFIGURASI FIREBASE FUNCTION ---
// Ganti dengan URL dasar Firebase Function Anda!
const char* host = "us-central1-Rawuh.id-120808.cloudfunctions.net"; 
const int port = 443;
const char* apiEndpoint = "/submitAbsensi"; 

// --- SERTIFIKAT CA GOOGLE ---
// Sertifikat CA Root harus disertakan agar ESP32 memercayai Google Cloud (Firebase).
// Dapatkan sertifikat ini dan paste di sini:
const char* google_root_ca = \
"-----BEGIN CERTIFICATE-----\n" \
// ... ISI SERTIFIKAT DI SINI ...
"-----END CERTIFICATE-----\n";


// --- KONFIGURASI HARDWARE (Sama) ---
#define RST_PIN   33   
#define SS_PIN    32   
#define BUZZER_PIN 27 
LiquidCrystal_I2C lcd(0x27, 16, 2); 
MFRC522 mfrc522(SS_PIN, RST_PIN);  

// ... (Setup Wi-Fi, LCD init) ...

// Fungsi HTTP POST ke Firebase Function
void postAbsensi(String uid) {
  WiFiClientSecure client;
  client.setCACert(google_root_ca); // Tetapkan Sertifikat CA

  if (!client.connect(host, port)) {
    Serial.println("Koneksi Server Gagal!");
    lcdDisplay("Server Error!", "Cek Koneksi!");
    return;
  }

  String data = "uid=" + uid;
  
  // Header HTTP
  client.println("POST " + String(apiEndpoint) + " HTTP/1.1");
  client.println("Host: " + String(host));
  client.println("Content-Type: application/x-www-form-urlencoded");
  client.print("Content-Length: ");
  client.println(data.length());
  client.println();
  client.print(data);
  
  // ... (Parsing respon JSON untuk menampilkan status di LCD dan buzzer) ...
  // Parsing status akan jauh lebih mudah di sini karena respon dari Firebase Function berupa JSON yang terstruktur.
}

// ... (loop() dan fungsi getRfidUid(), lcdDisplay()) ...
