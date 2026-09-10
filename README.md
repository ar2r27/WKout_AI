# WKout AI – Trener Personalny & Dziennik Treningowy

Aplikacja webowo-mobilna (PWA) wspierana przez Google Gemini API, z lokalną bazą danych (IndexedDB / JSON) oraz integracją z Dyskiem Google.

Interfejs oparty jest wyłącznie o czytelne ikony SVG (Lucide Icons) i typografię sportową.

---

## Architektura i Funkcjonalności

### 1. Trener Personalny AI (Gemini API)
- Dedykowany asystent treningowy analizujący cele (hipertrofia, siła, redukcja, kondycja), poziom zaawansowania oraz dostępny sprzęt.
- Automatyczne generowanie planów treningowych z kartami akcji pozwalającymi na wdrożenie planu do bazy jednym kliknięciem.
- Wbudowany inteligentny symulator offline – aplikacja działa od razu bez konieczności natychmiastowego podawania klucza API.
- Obsługiwane modele: `gemini-2.5-flash` (rekomendowany), `gemini-1.5-flash`, `gemini-2.0-flash`, `gemini-1.5-pro`.

### 2. Aktywny Trening (Tryb sesji na żywo)
- Licznik czasu sesji i dynamiczne sumowanie tonażu (kg * powtórzenia) oraz wykonanych serii.
- Rest Timer (stoper przerw) z sygnałami dźwiękowymi (Web Audio API) i wibracjami.
- Kalkulator talerzy na gryf olimpijski.
- Podsumowanie sesji i zapis do historii.

### 3. Baza Danych i Kopia Zapasowa
- Lokalna baza danych w przeglądarce (IndexedDB + localStorage) – pełna prywatność i działanie offline.
- Eksport i import pełnej bazy do pliku `.json`.
- Synchronizacja z Dyskiem Google (OAuth 2.0 GIS, zakres `drive.file`).

---

## Publikacja na GitHub

Aby wysłać projekt do swojego repozytorium GitHub:

```bash
# 1. Przejdź do katalogu projektu (jeśli nie jesteś)
cd /workspace/antigravity/WKout_AI

# 2. Skonfiguruj dane autora git (jeśli jeszcze nie były ustawione)
git config --global user.name "Twoja Nazwa"
git config --global user.email "twoj_email@example.com"

# 3. Dodaj swoje zdalne repozytorium z GitHub
git remote add origin https://github.com/<TWOJ_LOGIN>/<NAZWA_REPOZYTORIUM>.git

# 4. Wyślij kod do gałęzi main
git branch -M main
git push -u origin main
```

---

## Uruchomienie na Docelowym Kontenerze / Serwerze

W projekcie przygotowany jest wieloetapowy `Dockerfile` (Node 20 build + ultralekki Nginx) oraz `docker-compose.yml`.

### Opcja A: Uruchomienie przez Docker Compose (Zalecane)

Na docelowym serwerze lub kontenerze:

```bash
# 1. Pobierz repozytorium
git clone https://github.com/<TWOJ_LOGIN>/<NAZWA_REPOZYTORIUM>.git
cd <NAZWA_REPOZYTORIUM>

# 2. Zbuduj i uruchom kontener w tle
docker compose up -d --build

# Aplikacja będzie dostępna pod adresem:
# http://localhost:8080 (lub IP_SERWERA:8080)
```

Aby zmienić port, wystarczy uruchomić:
```bash
PORT=3000 docker compose up -d
```

### Opcja B: Uruchomienie przez czysty Docker

```bash
# Zbudowanie obrazu
docker build -t wkout-ai .

# Uruchomienie kontenera
docker run -d -p 8080:80 --name wkout_ai_app --restart unless-stopped wkout-ai
```

### Opcja C: Bezpośrednie uruchomienie przez Node.js

```bash
npm install
npm run build
npm run preview -- --host 0.0.0.0 --port 8080
```
