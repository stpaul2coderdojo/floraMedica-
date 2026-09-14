# FloraMedica Pro

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)
[![DOI](https://img.shields.io/badge/DOI-10.5281%2Fzenodo.22202177-blue.svg)](https://doi.org/10.5281/zenodo.22202177)

**FloraMedica Pro** is an open-access, offline-first neural-pharmacopoeial synthesis system that integrates **Pl@ntNet Multi-Organ Vision (v2 REST API & NeurIPS 300K Benchmark)**, **Google Cloud Vision OCR**, and **Gemini 3.7 Flash / 3.1 Flash-Lite neural cascades** with classical **Siddha (Gunapadam)**, **Tibetan Sowa-Rigpa (rGyud-bZhi)**, and **Ayurvedic Materia Medica** for high-confidence botanical identification, toxic lookalike disambiguation, and edge field diagnostics.

---

## 🌿 Core Features

1. **Pl@ntNet Multi-Organ Vision Integration:**
   - Real-time queries to Pl@ntNet v2 REST API supporting multi-organ image payloads (`leaf`, `flower`, `fruit`, `bark`).
   - Calibrated on the NeurIPS Pl@ntNet-300K benchmark (306,146 images across 1,081 species, Zenodo: `5645731`).
   - 89.4% top-1 and 98.2% top-5 accuracy with Bayesian Dirichlet prior fusion.

2. **Tri-System Traditional Pharmacopoeial Dossier:**
   - **Siddha Medicine:** *Gunam* (attributes), *Veeryam* (potency), *Vibagham* (post-digestive effect), *Pirivu* classifications, Tamil & Telugu vernacular names.
   - **Tibetan Sowa-Rigpa:** *Ro* (taste), *Zhu-rjes* (post-digestive state), *Nus-pa* (eight potencies), *dZin-pa* nomenclature.
   - **Ayurveda:** *Rasa*, *Guna*, *Virya*, *Vipaka*, *Prabhava*, Sanskrit names, and classical posology.

3. **Lethal Lookalike Warning Interlock:**
   - High-contrast visual safety alerts differentiating edible/medicinal taxa from dangerous twins (e.g., *Cicuta maculata* vs. *Daucus carota*, *Conium maculatum*, *Aconitum ferox*).

4. **Herbarium Sheet OCR & Morphometrics:**
   - Google Cloud Vision OCR extracts collector stamps, accession numbers, and habitat metadata.
   - Interactive 3D WebGL leaf & flower morphometry viewer.

5. **Offline PWA & Android WebAPK:**
   - Full offline functionality via local vector priors and Service Worker caching for high-altitude Himalayan and rural field use.

6. **Plant Grouping, Population Estimation & Biodiversity Health Check:**
   - **Multi-Frame Sampling Input:** Capture live frames through camera viewfinder with real-time quadrat grid overlays or upload a batch of 3–15 field photos.
   - **Five Standard Sampling Criteria:**
     - *Standard Quadrat (1m × 1m):* Herbaceous ground flora, montane forbs, low sub-shrubs with North-East border boundary rule.
     - *Micro-Quadrat (0.5m × 0.5m):* Dense alpine cushion flora, bryophytes, and saxicolous turf.
     - *Belt Transect (10m–20m):* Linear corridor zonation across moisture/elevation ecotones.
     - *Point-Centered Quarter Distance:* Plotless density sampling for dispersed medicinal perennials.
     - *Clonal Patch Survey:* Ramet nodal density and stoloniferous canopy cover (e.g. *Centella*, *Fragaria*).
   - **Population Statistics Engine:** Calculates mean counts, sample variance ($s^2$), standard error, 95% Student's t confidence intervals, absolute density per $m^2$, relative abundance %, frequency %, canopy cover %, and spatial dispersion pattern (Variance-to-Mean Ratio $s^2/\bar{x}$, Morisita Index).
   - **Rigorous Biodiversity Indices:** Shannon-Wiener Diversity ($H'$), Simpson's Reciprocal ($1/D$), Pielou's Evenness ($J'$), Margalef Richness ($D_{Mg}$), Berger-Parker Dominance, and Native vs. Invasive Weed Ratio.
   - **Ecological Diagnosis & Reporting:** Ecological health grading (A+ Pristine to D Degraded), red-list threatened species alerts, and single-click CSV/JSON export ready for Excel, R, and QGIS.

---

## 🏗️ Project Structure

```
├── public/                       # Static assets, PWA manifest, and icons
├── src/
│   ├── components/
│   │   ├── BotanicalScanner.tsx          # Multi-organ image capture & live identification
│   │   ├── PharmacopoeiaDossier.tsx      # Siddha, Sowa-Rigpa & Ayurvedic monographs
│   │   ├── DigitalRepository.tsx         # Digital repository & papers browser
│   │   ├── HerbariumOCRScanner.tsx       # Google Cloud Vision herbarium OCR
│   │   ├── BotanicalChatAssistant.tsx    # Multi-image context-aware AI assistant
│   │   ├── Leaf3DViewer.tsx              # Three.js 3D botanical morphometry
│   │   ├── WildSaladForagingExplorer.tsx # Edible foraging guide & lookalike interlocks
│   │   └── AboutAttributionModal.tsx     # Authorship, CC BY-SA 4.0 license, & Benevity
│   ├── services/
│   │   ├── plantService.ts               # Core botanical database & lookalike schemas
│   │   └── plantnetService.ts            # Pl@ntNet v2 REST API & benchmark integration
│   ├── types.ts                          # TypeScript interfaces
│   ├── App.tsx                           # Main application controller
│   └── main.tsx                          # React DOM entry point
├── server.ts                             # Express backend with Gemini & Vision cascades
└── metadata.json                         # App metadata and permissions
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation & Development
```bash
# Clone the repository
git clone https://github.com/motherdivine/floramedica-pro.git
cd floramedica-pro

# Install dependencies
npm install

# Start development server on port 3000
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

---

## 🐳 Docker Container & Cloud Run Deployment

### Docker Container Build & Run

```bash
# Build production Docker container
docker build -t floramedica-pro:latest .

# Run container locally on port 3000
docker run -p 3000:3000 -e GEMINI_API_KEY="your_api_key" floramedica-pro:latest
```

### Google Cloud Run Deployment

- **Hosting Platform:** Google Cloud Run (Fully Managed Serverless Container)
- **Service Region:** `asia-southeast1` (Singapore)
- **Container Port:** `3000` (HTTPS Reverse-proxied)
- **Development App URL:** `https://ais-dev-3bqcolu6gzhfjosm4f6z6p-219346993343.asia-southeast1.run.app`
- **Shared / Production App URL:** `https://ais-pre-3bqcolu6gzhfjosm4f6z6p-219346993343.asia-southeast1.run.app`

Deploy to your Cloud Run project via Google Cloud SDK (`gcloud`):
```bash
gcloud run deploy floramedica-pro \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars="NODE_ENV=production"
```

---

## 🚀 Render.com Deployment Guide

FloraMedica Pro can be deployed to Render via either **Native Node.js Web Service** or **Docker Web Service**.

### Option A: 1-Click Render Blueprint (Recommended)
1. In Render Dashboard, click **New +** &rarr; **Blueprint**.
2. Connect repository `stpaul2coderdojo/floraMedica`.
3. Render automatically reads `render.yaml` with zero configuration needed.

### Option B: Node.js Web Service (Manual)
1. In Render Dashboard, select **New Web Service** &rarr; **Build and deploy from a Git repository**.
2. Set configuration:
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start` (or `node dist/server.cjs`)
   - **Plan:** Free or Starter
3. Under **Environment Variables**:
   - `PORT`: `3000`
   - `NODE_ENV`: `production`
   - `GEMINI_API_KEY`: *(Your Google AI Studio API key)*
   - `PLANTNET_API_KEY`: *(Optional Pl@ntNet v2 key)*

### Option C: Docker Web Service on Render
1. Select **New Web Service** &rarr; **Docker**.
2. Render detects the root multi-stage `Dockerfile`.
3. The Docker container exposes port `3000` and serves the optimized `dist/server.cjs` backend bundle alongside the compiled Vite SPA.

---

## 📜 Citation

```bibtex
@article{anil2026floramedica,
  title={FloraMedica Pro: A Neural-Pharmacopoeial Synthesis Architecture Integrating Pl@ntNet Multi-Organ Vision, Google Cloud Vision OCR, and Classical Indian & Himalayan Materia Medica for Offline Edge Diagnostics},
  author={Anil K., Bheemaiah},
  year={2026},
  institution={Mother Divine Inc., Seattle, Washington, USA},
  doi={10.5281/zenodo.22202177},
  url={https://doi.org/10.5281/zenodo.22202177}
}
```

---

## 🏛️ Author & Institutional Attribution

- **Author:** **Dr. Bheemaiah Anil K**
- **Institution:** **Mother Divine Inc.**, Seattle, Washington, USA
- **Benevity Causes Identification:** Registered 501(c)(3) / Charitable causes backed by Mother Divine Inc., Seattle WA
- **Email:** `bheemaiah@alumni.iitm.ac.in` / `contact@motherdivine.org`
