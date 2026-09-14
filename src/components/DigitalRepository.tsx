import React, { useState } from "react";
import {
  BookOpen,
  Download,
  FileText,
  Search,
  ExternalLink,
  Layers,
  Sparkles,
  CheckCircle,
  Eye,
  Bookmark,
  Share2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronRight,
  Database,
  Award,
  Heart,
  Scale,
} from "lucide-react";
import { PlantData } from "../types";
import { FULL_BOTANICAL_DATABASE } from "../services/plantService";

interface DigitalRepositoryProps {
  initialSystemFilter?: "sowaRigpa" | "siddha" | "papers";
  onSelectPlant?: (plant: PlantData) => void;
}

export const DigitalRepository: React.FC<DigitalRepositoryProps> = ({
  initialSystemFilter = "sowaRigpa",
  onSelectPlant,
}) => {
  const [activeTab, setActiveTab] = useState<"sowaRigpa" | "siddha" | "papers">(
    initialSystemFilter
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeReaderItem, setActiveReaderItem] = useState<{
    title: string;
    subtitle: string;
    repoName: string;
    pdfExtract: string;
    plateNumber?: string;
    standardSpec?: string;
    downloadUrl: string;
  } | null>(null);

  const [downloadedItems, setDownloadedItems] = useState<Record<string, boolean>>({});

  const handleDownload = (key: string) => {
    setDownloadedItems((prev) => ({ ...prev, [key]: true }));
  };

  // Filter Plants that have Sowa Rigpa catalogues
  const sowaRigpaPlants = FULL_BOTANICAL_DATABASE.filter(
    (p) =>
      p.digitisedRepository.sowaRigpaCatalogue &&
      (p.commonNames.some((n) =>
        n.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
        p.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.tibetanName &&
          p.tibetanName.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  // Filter Plants that have Siddha Pharmacopoeial Booklets
  const siddhaPlants = FULL_BOTANICAL_DATABASE.filter(
    (p) =>
      p.digitisedRepository.siddhaPharmacopoeia &&
      (p.commonNames.some((n) =>
        n.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
        p.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.teluguName &&
          p.teluguName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.tamilName &&
          p.tamilName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.digitisedRepository.siddhaPharmacopoeia.structuralLayout
          .toLowerCase()
          .includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-5 text-[#E2E8F0]">
      {/* Repository Portal Header Banner - Geometric Balance */}
      <div className="rounded-sm bg-[#161C1A] border border-[#2D3748] p-5 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="flex flex-col gap-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Database className="w-3 h-3" />
              Open-Access Academic Repository
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Accessing Full Digitised Materials
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Download full-length academic publications, digital botanical mappings via the{" "}
            <strong className="text-emerald-400 font-mono">SVDCDN Research Server Repository</strong>, and
            open-access structural layouts on flower and seed drug origins through the{" "}
            <strong className="text-amber-300 font-mono">Pharma Research Online Network</strong>.
          </p>
        </div>

        {/* System Tabs */}
        <div className="flex flex-wrap gap-2 mt-5 border-t border-[#2D3748] pt-4">
          <button
            onClick={() => setActiveTab("sowaRigpa")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-sm text-xs font-bold uppercase tracking-tight transition-all cursor-pointer ${
              activeTab === "sowaRigpa"
                ? "bg-emerald-500 text-black shadow-sm font-bold"
                : "bg-[#1A2220] hover:bg-[#242f2c] text-slate-400 border border-[#2D3748]"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Sowa Rigpa (SVDCDN Repository)
          </button>

          <button
            onClick={() => setActiveTab("siddha")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-sm text-xs font-bold uppercase tracking-tight transition-all cursor-pointer ${
              activeTab === "siddha"
                ? "bg-emerald-500 text-black shadow-sm font-bold"
                : "bg-[#1A2220] hover:bg-[#242f2c] text-slate-400 border border-[#2D3748]"
            }`}
          >
            <Layers className="w-4 h-4" />
            Siddha Booklets (Flower & Seed Origins)
          </button>

          <button
            onClick={() => setActiveTab("papers")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-sm text-xs font-bold uppercase tracking-tight transition-all cursor-pointer ${
              activeTab === "papers"
                ? "bg-emerald-500 text-black shadow-sm font-bold"
                : "bg-[#1A2220] hover:bg-[#242f2c] text-slate-400 border border-[#2D3748]"
            }`}
          >
            <FileText className="w-4 h-4" />
            Academic Research Papers
          </button>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search digital monographs, manuscript plates, or species in ${
            activeTab === "sowaRigpa"
              ? "Sowa Rigpa SVDCDN Catalogues"
              : activeTab === "siddha"
              ? "Siddha Pharmacopoeial Booklets"
              : "Academic Research Library"
          }...`}
          className="w-full bg-[#161C1A] border border-[#2D3748] rounded-sm pl-11 pr-4 py-3 text-xs sm:text-sm text-slate-200 focus:border-emerald-500 outline-none shadow-sm placeholder:text-slate-500 font-sans"
        />
      </div>

      {/* Tab 1: Sowa Rigpa Catalogues (SVDCDN Research Server Repository) */}
      {activeTab === "sowaRigpa" && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="p-4 rounded-sm bg-[#1A2220] border border-[#2D3748] text-xs text-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <strong className="text-emerald-400 block font-bold text-sm uppercase tracking-tight font-mono">
                SVDCDN Research Server Repository Botanical Mapping Gateway
              </strong>
              <p className="text-slate-400 text-xs mt-0.5">
                Open-access digital facsimile cataloguing of Tibetan Materia Medica (rGyud-bZhi & Shel-phreng).
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-sm bg-[#0F1412] border border-[#2D3748] text-emerald-400 font-mono text-[11px] whitespace-nowrap">
              {sowaRigpaPlants.length} Botanical Mappings Available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sowaRigpaPlants.map((plant) => {
              const cat = plant.digitisedRepository.sowaRigpaCatalogue!;
              const isDownloaded = downloadedItems[cat.code];

              return (
                <div
                  key={plant.id}
                  className="rounded-sm bg-[#161C1A] border border-[#2D3748] p-5 shadow-sm flex flex-col justify-between gap-4 hover:border-emerald-500/40 transition-all group"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-[#0F1412] px-2.5 py-1 rounded-sm border border-[#2D3748]">
                        {cat.code}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {cat.plateNumber}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {plant.commonNames[0]} ({plant.tibetanName})
                    </h3>

                    <p className="text-xs text-emerald-400/90 font-serif italic">
                      {plant.scientificName} • {cat.manuscriptRef}
                    </p>

                    <div className="p-3 rounded-sm bg-[#0F1412] border border-[#2D3748] text-xs text-slate-300 leading-relaxed italic">
                      "{cat.pdfExtractText}"
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-1">
                      <Database className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Repo: {cat.sourceRepo}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#2D3748] text-xs">
                    <button
                      onClick={() =>
                        setActiveReaderItem({
                          title: `${plant.commonNames[0]} (${plant.tibetanName})`,
                          subtitle: `${plant.scientificName} • ${cat.plateNumber}`,
                          repoName: cat.sourceRepo,
                          pdfExtract: cat.pdfExtractText,
                          plateNumber: cat.plateNumber,
                          downloadUrl: cat.botanicalMappingUrl,
                        })
                      }
                      className="text-emerald-400 hover:text-emerald-300 font-bold uppercase tracking-tight flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      Read PDF Facsimile
                    </button>

                    <div className="flex items-center gap-2">
                      {onSelectPlant && (
                        <button
                          onClick={() => onSelectPlant(plant)}
                          className="p-2 rounded-sm bg-[#1A2220] hover:bg-[#242f2c] border border-[#2D3748] text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="View Full Pharmacopoeia Dossier"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDownload(cat.code)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-bold uppercase tracking-tight text-xs transition-all cursor-pointer ${
                          isDownloaded
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            : "bg-emerald-500 hover:bg-emerald-400 text-black"
                        }`}
                      >
                        {isDownloaded ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Offline Saved
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" /> Download Mapping
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Siddha Pharmacopoeial Booklets (Flower and Seed Drug Origins) */}
      {activeTab === "siddha" && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="p-4 rounded-sm bg-[#1A2220] border border-[#2D3748] text-xs text-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <strong className="text-amber-300 block font-bold text-sm uppercase tracking-tight font-mono">
                Pharma Research Online Network: Flower & Seed Drug Origins Structural Layouts
              </strong>
              <p className="text-slate-400 text-xs mt-0.5">
                Standardized macroscopic, microscopic, and chromatographic assay booklets on flower and seed drug origins.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-sm bg-[#0F1412] border border-[#2D3748] text-amber-300 font-mono text-[11px] whitespace-nowrap">
              {siddhaPlants.length} Structural Booklets Available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {siddhaPlants.map((plant) => {
              const sid = plant.digitisedRepository.siddhaPharmacopoeia!;
              const isDownloaded = downloadedItems[sid.monographCode];

              return (
                <div
                  key={plant.id}
                  className="rounded-sm bg-[#161C1A] border border-[#2D3748] p-5 shadow-sm flex flex-col justify-between gap-4 hover:border-amber-500/40 transition-all group"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-400 bg-[#0F1412] px-2.5 py-1 rounded-sm border border-[#2D3748]">
                        {sid.monographCode}
                      </span>
                      <span className="text-[11px] text-amber-300/80 px-2 py-0.5 rounded-sm bg-[#1A2220] border border-[#2D3748] font-mono uppercase">
                        {sid.partCategory} Drug Origin
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                      {plant.commonNames[0]} ({plant.teluguName || plant.tamilName})
                    </h3>

                    <p className="text-xs text-amber-300/90 font-serif italic">
                      {plant.scientificName} • {sid.structuralLayout}
                    </p>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {sid.monographSummary}
                    </p>

                    <div className="p-3 rounded-sm bg-[#0F1412] border border-[#2D3748] text-xs font-mono text-slate-300">
                      <strong className="text-emerald-400 block mb-0.5 text-[10px] uppercase">
                        Standard Pharmacopoeial Spec:
                      </strong>
                      {sid.standardSpec}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-1">
                      <Database className="w-3.5 h-3.5 text-amber-400" />
                      <span>Network: {sid.networkOrigin}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#2D3748] text-xs">
                    <button
                      onClick={() =>
                        setActiveReaderItem({
                          title: `${plant.commonNames[0]} (${plant.teluguName || plant.tamilName})`,
                          subtitle: `${plant.scientificName} • ${sid.structuralLayout}`,
                          repoName: sid.networkOrigin,
                          pdfExtract: sid.monographSummary,
                          standardSpec: sid.standardSpec,
                          downloadUrl: `https://pharma-research-online.net/monographs/${sid.monographCode.toLowerCase()}.pdf`,
                        })
                      }
                      className="text-amber-400 hover:text-amber-300 font-bold uppercase tracking-tight flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      Review Structural Layout
                    </button>

                    <div className="flex items-center gap-2">
                      {onSelectPlant && (
                        <button
                          onClick={() => onSelectPlant(plant)}
                          className="p-2 rounded-sm bg-[#1A2220] hover:bg-[#242f2c] border border-[#2D3748] text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="View Full Pharmacopoeia Dossier"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDownload(sid.monographCode)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-bold uppercase tracking-tight text-xs transition-all cursor-pointer ${
                          isDownloaded
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            : "bg-emerald-500 hover:bg-emerald-400 text-black"
                        }`}
                      >
                        {isDownloaded ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Booklet Saved
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" /> Download Booklet
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Academic Publications & Datasets */}
      {activeTab === "papers" && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="p-4 rounded-sm bg-[#1A2220] border border-[#2D3748] text-xs text-slate-200">
            <strong className="text-emerald-400 block font-bold text-sm uppercase tracking-tight font-mono">
              Botanical Benchmark Datasets &amp; Ethnopharmacology Publications
            </strong>
            <p className="text-slate-400 text-xs mt-0.5">
              Direct open-access pointers to peer-reviewed preprints, phytochemical reviews, clinical trials, and taxonomic dataset benchmarks.
            </p>
          </div>

          {/* Pl@ntNet-300K Dataset Spotlight Card */}
          <div className="rounded-sm bg-[#161C1A] border-2 border-emerald-500/50 p-5 shadow-lg flex flex-col gap-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-black bg-emerald-400 px-2.5 py-1 rounded-sm font-bold uppercase tracking-wider">
                  NeurIPS Datasets & Benchmarks
                </span>
                <span className="text-emerald-400 font-mono text-[11px] font-bold">
                  Zenodo ID: 5645731
                </span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">
                DOI: 10.5281/zenodo.5645731
              </span>
            </div>

            <h3 className="text-base font-bold text-white leading-snug">
              PL@NTNET-300K: A High-Confidence Benchmark for Botanical Morphology Plant Identification & Set-Valued Classification
            </h3>

            <p className="text-emerald-400/90 font-serif italic">
              Authors: Camille Garcin, Maximilien Servajean, Alexis Joly, Pierre Bonnet (NeurIPS / Inria / CIRAD)
            </p>

            <p className="text-slate-300 leading-relaxed bg-[#0F1412] p-3.5 rounded-sm border border-[#2D3748]">
              Pl@ntNet-300K is a large-scale botanical dataset and benchmark containing 306,146 validated images covering 1,081 species and 168 plant families across 6 plant morphology categories (leaf, flower, fruit, bark, habit, and other). This dataset models high label ambiguity and class imbalance, enabling top-k set-valued classification for reliable herbal and botanical identification in field conditions.
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#2D3748]">
              <a
                href="https://zenodo.org/records/5645731"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:text-emerald-300 font-bold uppercase tracking-tight flex items-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" />
                Access Dataset on Zenodo (Record 5645731)
              </a>

              <button
                onClick={() => handleDownload("plantnet-300k-zenodo")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm font-bold uppercase tracking-tight transition-all cursor-pointer ${
                  downloadedItems["plantnet-300k-zenodo"]
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-emerald-500 hover:bg-emerald-400 text-black"
                }`}
              >
                {downloadedItems["plantnet-300k-zenodo"] ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Benchmark Schema Cached
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" /> Cache Dataset Spec Offline
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {FULL_BOTANICAL_DATABASE.flatMap((p) =>
              (p.digitisedRepository?.academicPapers || []).map((paper, idx) => ({
                ...paper,
                plantName: p.commonNames?.[0] || p.scientificName,
                plantScientific: p.scientificName,
                key: `${p.id}-paper-${idx}`,
              }))
            )
              .filter(
                (p) =>
                  !searchQuery ||
                  (p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (p.journal && p.journal.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (p.plantName && p.plantName.toLowerCase().includes(searchQuery.toLowerCase()))
              )
              .map((paper) => {
                const isDownloaded = downloadedItems[paper.key];

                return (
                  <div
                    key={paper.key}
                    className="rounded-sm bg-[#161C1A] border border-[#2D3748] p-5 shadow-sm flex flex-col gap-3 hover:border-emerald-500/40 transition-all text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-[11px] font-mono text-emerald-400 bg-[#0F1412] px-2.5 py-1 rounded-sm border border-[#2D3748] self-start font-bold">
                        {paper.journal} • {paper.year}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        DOI: {paper.doi}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white leading-snug">
                      {paper.title}
                    </h3>

                    <p className="text-emerald-400/90 font-serif italic">
                      Botanical Subject: {paper.plantName} ({paper.plantScientific})
                    </p>

                    <p className="text-slate-300 leading-relaxed bg-[#0F1412] p-3.5 rounded-sm border border-[#2D3748]">
                      {paper.abstract}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-[#2D3748]">
                      <a
                        href={paper.downloadPointer}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 font-bold uppercase tracking-tight flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open Journal DOI Link
                      </a>

                      <button
                        onClick={() => handleDownload(paper.key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-bold uppercase tracking-tight transition-all cursor-pointer ${
                          isDownloaded
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            : "bg-emerald-500 hover:bg-emerald-400 text-black"
                        }`}
                      >
                        {isDownloaded ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> PDF Cached
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" /> Download Full PDF
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Institutional Authorship & Benevity Causes Contribution Card */}
      <div className="p-4 sm:p-5 rounded-sm bg-[#141B19] border border-[#2D3748] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-white font-sans text-sm">
              Dr. Bheemaiah Anil K
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-sm bg-[#1A2521] text-emerald-400 border border-emerald-500/30">
              Mother Divine Inc., Seattle
            </span>
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] px-2 py-0.5 rounded-sm bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 hover:underline flex items-center gap-1"
            >
              <Scale className="w-3 h-3" /> CC BY-SA 4.0
            </a>
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            Digitised palm leaf manuscripts, Siddha treatises, Sowa-Rigpa pharmacopoeia and open scientific papers curated for global research access.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <a
            href="https://causes.benevity.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-tight text-[11px] rounded-sm flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Heart className="w-3.5 h-3.5 fill-black" />
            <span>Contribute via Benevity</span>
          </a>
        </div>
      </div>

      {/* Digital Reader Modal Simulation */}
      {activeReaderItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="relative w-full max-w-3xl bg-[#161C1A] border border-[#2D3748] rounded-sm overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#111614] border-b border-[#2D3748]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-tight text-white">
                    {activeReaderItem.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {activeReaderItem.subtitle}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveReaderItem(null)}
                className="p-2 rounded-sm bg-[#1A2220] hover:bg-[#242f2c] border border-[#2D3748] text-slate-300 hover:text-white transition-colors text-xs font-bold uppercase tracking-tight cursor-pointer"
              >
                Close Reader
              </button>
            </div>

            {/* Simulated Manuscript Page */}
            <div className="p-6 overflow-y-auto flex flex-col gap-5 text-slate-200 bg-[#0F1412]">
              <div className="p-6 rounded-sm bg-[#161C1A] border border-[#2D3748] text-slate-100 flex flex-col gap-4 font-serif">
                <div className="text-center pb-4 border-b border-[#2D3748]">
                  <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-bold">
                    DIGITISED HERBARIUM ARCHIVE FACSIMILE
                  </span>
                  <h2 className="text-xl font-bold mt-1 text-white">
                    {activeReaderItem.title}
                  </h2>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Repository Origin: {activeReaderItem.repoName}
                  </p>
                </div>

                <div className="leading-relaxed text-sm text-slate-200 space-y-4">
                  <p className="first-letter:text-3xl first-letter:font-bold first-letter:text-emerald-400 first-letter:mr-2">
                    {activeReaderItem.pdfExtract}
                  </p>

                  {activeReaderItem.standardSpec && (
                    <div className="p-4 rounded-sm bg-[#0F1412] border border-[#2D3748] text-xs font-mono text-slate-300">
                      <strong className="text-emerald-400 block mb-1 text-xs">
                        SPECIFICATION ASSAYS & PURITY CRITERIA:
                      </strong>
                      {activeReaderItem.standardSpec}
                    </div>
                  )}

                  <p className="text-xs text-slate-400 italic">
                    Certified open-access digital facsimile recorded under taxonomic digitisation protocols for pharmacological and botanical preservation.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#111614] border-t border-[#2D3748] text-xs">
              <span className="text-slate-400 font-mono">
                Source Pointer: {activeReaderItem.repoName}
              </span>

              <button
                onClick={() => {
                  handleDownload(activeReaderItem.title);
                  setActiveReaderItem(null);
                }}
                className="px-4 py-2 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-tight flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" /> Save Monograph PDF to Device
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
