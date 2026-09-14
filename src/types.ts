export type ForagingCategory =
  | "wild_salad"
  | "edible_flour"
  | "fruits_berries"
  | "tubers_winterfood";

export interface CulinaryReverseIndexEntry {
  id: string;
  category: ForagingCategory;
  categoryTitle: string;
  plantId: string;
  scientificName: string;
  commonName: string;
  vernacularName?: string;
  family?: string;
  altitudeRange: string;
  himalayanRegion: string;
  primaryEdiblePart: string;
  flavorProfile: string;
  texture: string;
  preparationMethods: string[];
  foragingCalendar: string;
  keyNutrients: string[];
  winterCachingMethod?: string;
  safetyOrDetoxNotes?: string;
  recipePairing: string;
  imageUrl: string;
  organType: PlantNetOrgan;
  saladPairingRole?: "Base Green" | "Acidic/Sour Accent" | "Pungent/Peppery Kick" | "Bitter Aperitif" | "Succulent Crunch" | "Aromatic Herb";
  flourType?: "Grain / Pseudo-grain" | "Acorn / Nut Starch" | "Rhizome / Root Flour" | "Pollen / Seed Starch";
  preservationForm?: "Sun-Dried (Shukto)" | "Fermented (Gundruk)" | "Cold Stored (Clamp)" | "Dried Fruit / Chuli" | "Roasted Flour (Tsampa)";
}

export interface EdibilityRatingInfo {
  category: ForagingCategory;
  isHighAltitudeHimalayan: boolean;
  saladRating?: number; // 0 - 100
  flourRating?: number;
  winterStorageScore?: number;
}


export type EdibilityRating =
  | "Edible"
  | "Edible with Preparation"
  | "Edible Cooked"
  | "Caution"
  | "Caution / Mild Toxicity"
  | "Toxic"
  | "Toxic/Inedible"
  | "Medicinal Only"
  | "Edible Leaf / Wild Salad"
  | "Edible Flour / Grain"
  | "Edible Fruit / Berry"
  | "Edible Tuber / Winterfood";

export interface ToxicLookalike {
  name: string;
  distinction: string;
  hazard?: string;
}

export interface EdibilityInfo {
  rating: EdibilityRating;
  ratingScore: number; // 0 - 100
  isSafeForHumanConsumption: boolean;
  edibleParts: string[];
  culinaryUses: string;
  preparationNotes: string;
  safetyWarnings: string[];
  toxicLookalikes: ToxicLookalike[];
}

export interface AyurvedaProfile {
  rasa: string[]; // Tastes (Madhura, Amla, Lavana, Tikta, Katu, Kashaya)
  guna: string[]; // Qualities (Laghu, Guru, Snigdha, Ruksha, Tikshna)
  virya: string; // Potency (Ushna - hot / Shita - cold)
  vipaka: string; // Post-digestive taste (Madhura, Amla, Katu)
  doshaImpact: string; // e.g. "Pacifies Vata and Kapha, balances Pitta"
  indications: string[];
}

export interface SiddhaProfile {
  gunam: string; // Character / Properties
  veeryam: string; // Potency (Seetha - Cold / Veppam - Hot)
  vibagham: string; // Transformation / Post-digestion
  drugOriginClassification:
    | "Flower Drug Origin"
    | "Seed Drug Origin"
    | "Leaf Drug Origin"
    | "Root Drug Origin"
    | "Root/Tuber Drug Origin"
    | "Bark Drug Origin"
    | "Whole Plant";
  plantPartUsed: string[];
  formulations: string[];
  clinicalUses: string;
}

export interface SowaRigpaProfile {
  ro: string; // Taste (Ro-drug: Kha-ba bitter, mNgar-ba sweet, etc.)
  zhuJes: string; // Post-digestive taste (Zhu-rjes)
  nusPa: string; // 17 Potencies (Nus-pa bcu-bdun)
  coldHotNature?: "Cooling" | "Warming" | "Neutral";
  organAffinity?: string[];
  traditionalTreatments?: string;
  indications?: string[];
}

export interface WesternPhytotherapy {
  activeConstituents: string[];
  pharmacology: string;
  modernStudies?: string;
  clinicalSummary?: string;
}

export interface PlantPreparation {
  type: string; // "Decoction (Kashayam)", "Paste (Poultice)", "Infused Oil", "Tea", "Powder (Churna)"
  recipe: string;
  dosage: string;
  safetyNote?: string;
}

export interface MedicinalInfo {
  primaryActions: string[];
  ayurveda: AyurvedaProfile;
  siddha: SiddhaProfile;
  sowaRigpa: SowaRigpaProfile;
  westernPhytotherapy: WesternPhytotherapy;
  contraindications?: string[];
  preparations?: PlantPreparation[];
}

export interface Morphology3D {
  modelType?:
    | "simple-leaf"
    | "compound-leaf"
    | "flower-stem"
    | "succulent"
    | "creeper"
    | "shrub-tree";
  leafColor?: string;
  stemColor?: string;
  flowerColor?: string;
  serration?: boolean;
  leafCount?: number;
  curvature?: number;
  textureType?: "glossy" | "matte" | "pubescent" | "coriaceous";
  leafApex?: "acute" | "acuminate" | "obtuse" | "rounded";
  leafBase?: "cuneate" | "cordate" | "attenuate" | "rounded";
  venationPattern?: "pinnate" | "palmate" | "parallel" | "reticulate";
  growthHabit?: string;
  canopyRadius?: number;
  foliageDensity?: number | string;
  branchingPattern?: string;
  stemTexture?: string;
  primaryColor?: string;
  accentColor?: string;
}

export interface BotanicalDescription {
  summary: string;
  leafShape: string;
  venation: string;
  flowerColor: string;
  stemType: string;
  fruitType: string;
  heightRange: string;
}

export interface AcademicPaper {
  title: string;
  journal: string;
  year: number;
  doi: string;
  downloadPointer: string;
  abstract: string;
}

export type PlantNetMorphology = "leaf" | "flower" | "fruit" | "bark" | "habit" | "other";
export type PlantNetOrgan = PlantNetMorphology; // Backward-compatibility alias

export type PlantNetDatasetType =
  | "plantnet_300k"
  | "gbif_validated"
  | "gbif_auto"
  | "my_plantnet_world"
  | "my_plantnet_useful"
  | "my_plantnet_weeds"
  | "my_plantnet_himalaya"
  | "my_plantnet_trees";

export interface PlantNetGbifOccurrence {
  occurrenceId: string;
  scientificName: string;
  datasetName: "Pl@ntNet observations (with human validation)" | "Pl@ntNet automatically identified occurrences";
  validationType: "human_validated" | "automated_ai";
  country: string;
  locality?: string;
  elevationMeters?: number;
  latitude?: number;
  longitude?: number;
  organ: PlantNetOrgan;
  observerOrValidator?: string;
  confidenceScore: number;
  gbifTaxonKey: string;
  observationDate: string;
  imageUrl: string;
}

export interface PlantNetDatasetMetadata {
  id: PlantNetDatasetType;
  name: string;
  shortName: string;
  category: "benchmark_image" | "gbif_validated" | "gbif_auto" | "regional_project";
  description: string;
  citation: string;
  doi: string;
  zenodoRecordId?: string;
  gbifDatasetKey?: string;
  totalSpeciesCount: number;
  totalImagesOrOccurrences: string;
  humanValidated: boolean;
  offlineStatus: "prebundled" | "ready" | "downloadable";
  downloadSize: string;
  organsSupported: PlantNetOrgan[];
  featuredSpeciesSample: string[];
  license: string;
  neuripsCitation?: string;
  apiEndpoint?: string;
  gbifApiUrl?: string;
  badgeColor: string;
}

export interface PlantNetCandidate {
  scientificName: string;
  commonName: string;
  family: string;
  confidence: number;
  organClass: PlantNetOrgan;
  distinguishingFeatures: string;
  gbifTaxonKey?: string;
  isMatchingSpecies?: boolean;
}

export interface PlantNet300KBenchmark {
  zenodoRecordId: string; // "5645731"
  zenodoDoi: string; // "10.5281/zenodo.5645731"
  detectedOrgan: PlantNetOrgan;
  organConfidence: number; // 0.0 to 1.0
  ambiguityIndex: "Low" | "Moderate" | "High (Sister Taxa)";
  macroAverageTopKRank: number; // 1 to 5
  candidates: PlantNetCandidate[];
  datasetCitation: string;
  gbifTaxonKey?: string;
}

export interface DigitisedRepository {
  herbariumSheetUrl?: string;
  specimenBarcodes?: string[];
  sowaRigpaPlateIndex?: string;
  siddhaManuscriptRef?: string;
  scientificPapers?: any[];
  sowaRigpaCatalogue?: {
    code: string;
    sourceRepo: string; // e.g. "SVDCDN Research Server Repository"
    botanicalMappingUrl: string;
    plateNumber: string;
    manuscriptRef: string;
    pdfExtractText: string;
  };
  siddhaPharmacopoeia?: {
    monographCode: string;
    networkOrigin: string; // e.g. "Pharma Research Online Network"
    structuralLayout: string; // e.g. "Flower and Seed Drug Origins"
    partCategory: string;
    monographSummary: string;
    standardSpec: string;
  };
  academicPapers?: AcademicPaper[];
  plantnet300kCitation?: {
    zenodoRecord: string;
    doi: string;
    datasetTitle: string;
    neuripsYear: number;
    organClassificationStandard: string;
  };
}

export interface PlantOrganImage {
  id?: string;
  url: string;
  organ: PlantNetOrgan; // "leaf" | "flower" | "fruit" | "bark" | "habit" | "other"
  author?: string;
  license?: string;
  title?: string;
  source?: "plantnet_api" | "zenodo_300k" | "herbarium" | "wikipedia" | "pl@ntnet-300k" | "botanical_repository";
  confidence?: number;
}

export interface PlantData {
  id: string;
  scientificName: string;
  commonNames: string[];
  teluguName?: string; // Siddha (Telugu vernacular & traditional medicinal name)
  tamilName?: string; // Optional legacy compatibility
  tibetanName?: string;
  sanskritName?: string;
  family: string;
  order?: string;
  confidenceScore?: number;
  identificationEngine?: "plantnet_api" | "gemini_vision" | "offline_database";
  habitat: string;
  imageUrl?: string;
  organImages?: PlantOrganImage[];
  botanicalDescription: BotanicalDescription;
  edibility: EdibilityInfo;
  medicinal: MedicinalInfo;
  morphology3D: Morphology3D;
  digitisedRepository: DigitisedRepository;
  plantnet300k?: PlantNet300KBenchmark;
  plantnetDatasets?: PlantNetDatasetType[];
  gbifTaxonKey?: string;
  gbifOccurrences?: PlantNetGbifOccurrence[];
  tags: string[];
  isCustomEntry?: boolean;
  discoveredDate?: string;
  fieldNotes?: string;
}

export interface SavedHerbariumItem {
  id: string;
  plant: PlantData;
  capturedImage?: string;
  timestamp: number;
  userNotes: string;
  location?: string;
}

export type ActiveTab =
  | "scanner"
  | "dossier"
  | "3dview"
  | "repository"
  | "herbarium"
  | "key-explorer";

export type FeedbackDecision = "confirmed_correct" | "corrected" | "uncertain";

export interface MorphologicalVerification {
  leafShapeMatch?: boolean;
  venationMatch?: boolean;
  flowerColorMatch?: boolean;
  marginMatch?: boolean;
  stemMatch?: boolean;
}

export interface IdentificationFeedback {
  id: string;
  plantId: string;
  timestamp: number;
  isoDate: string;
  originalIdentification: {
    scientificName: string;
    commonName: string;
    family: string;
    confidenceScore?: number;
    detectedOrgan?: PlantNetOrgan;
    source?: string;
  };
  userDecision: FeedbackDecision;
  correctedData?: {
    scientificName: string;
    commonName?: string;
    family?: string;
    organ?: PlantNetOrgan;
    correctionReason?: string;
    botanicalNotes?: string;
    matchedCandidateIndex?: number;
  };
  morphologyVerification?: MorphologicalVerification;
  imageSnippet?: string;
  userNotes?: string;
  modelFineTuningExport?: {
    prompt: string;
    expectedOutputLabel: string;
    organ: string;
    confidence: number;
  };
}

export interface FeedbackStats {
  total: number;
  confirmed: number;
  corrected: number;
  uncertain: number;
  accuracyRate: number;
  organBreakdown: Record<string, { total: number; confirmed: number }>;
  topMisidentified: { original: string; corrected: string; count: number }[];
}

// -------------------------------------------------------------
// Plant Grouping, Population Statistics & Biodiversity Types
// -------------------------------------------------------------

export type SamplingCriteriaMethod =
  | "quadrat_standard" // 1.0m x 1.0m (Standard Herbaceous / Ground Flora)
  | "quadrat_micro"    // 0.5m x 0.5m (Alpine Turf, Cushion Mosses, Lichens)
  | "belt_transect"    // 10m-20m Line / Belt Transect
  | "point_quarter"    // Point-Centered Quarter Distance Method
  | "patch_colony";    // Clonal Patch / Rhizome Colony

export interface SamplingCriteriaInfo {
  id: SamplingCriteriaMethod;
  name: string;
  shortName: string;
  recommendedSampleCount: string;
  minFrames: number;
  plotAreaM2: number;
  idealStratum: string;
  cameraProtocol: string;
  boundaryRule: string;
  description: string;
  iconName: string;
}

export interface DetectedPlantGroup {
  id: string;
  plantId?: string;
  scientificName: string;
  commonName: string;
  family: string;
  estimatedCount: number;
  canopyCoverPercentage: number;
  confidence: number;
  growthHabit: "Rosette" | "Erect Herb" | "Clumping Stolon" | "Sub-shrub" | "Creeping Vine" | "Cushion" | "Tuber/Basal";
  isMedicinal?: boolean;
  isEdible?: boolean;
  isInvasive?: boolean;
  conservationStatus?: "Least Concern" | "Vulnerable" | "Near Threatened" | "Endangered" | "Invasive Weed";
  boundingZone?: { x: number; y: number; width: number; height: number }; // Relative coordinates 0-100%
}

export interface SampledFrame {
  id: string;
  imageSrc: string;
  label: string; // e.g., "Sample Frame #1 (Quadrat A)"
  timestamp: number;
  detectedGroups: DetectedPlantGroup[];
  totalIndividuals: number;
  totalCanopyCoverage: number;
  notes?: string;
}

export interface SpeciesPopulationEstimate {
  scientificName: string;
  commonName: string;
  family: string;
  totalObservedCount: number;
  meanCountPerFrame: number;
  countVariance: number;
  standardDeviation: number;
  standardError: number;
  confidenceInterval95: [number, number];
  densityPerM2: number;
  relativeAbundance: number; // percentage (0 - 100%)
  frequencyPercentage: number; // percentage of sampled frames containing species
  meanCanopyCoverage: number; // percentage (0 - 100%)
  spatialDispersion: {
    varianceToMeanRatio: number;
    pattern: "Clustered / Contagious" | "Random" | "Uniform / Regular";
    morisitaIndex: number;
    interpretation: string;
  };
  estimatedTotalPopulation: number;
  populationRange: [number, number];
  isMedicinal: boolean;
  isEdible: boolean;
  isInvasive: boolean;
  conservationStatus: string;
}

export interface BiodiversityIndices {
  speciesRichness: number; // S
  totalIndividualsSampled: number; // N
  shannonWienerIndex: number; // H' = -sum(pi * ln(pi))
  shannonMax: number; // ln(S)
  pielouEvenness: number; // J' = H' / ln(S)
  simpsonDominance: number; // D = sum(pi^2)
  simpsonDiversity: number; // 1 - D
  simpsonReciprocal: number; // 1 / D
  margalefRichness: number; // (S - 1) / ln(N)
  bergerParkerDominance: number; // max(ni) / N
  dominantSpecies: string;
  ecologicalHealthGrade: "A+ (Pristine High-Diversity)" | "A (Rich Poly-culture)" | "B (Stable Semi-Natural)" | "C (Moderately Disturbed)" | "D (Degraded / Monoculture)";
  ecologicalHealthSummary: string;
  warnings: string[];
  nativeVsInvasiveCount: { native: number; invasive: number };
  medicinalKeystoneTaxa: string[];
  wildEdibleTaxa: string[];
}

export interface PopulationSurveyReport {
  surveyId: string;
  surveyDate: string;
  samplingMethod: SamplingCriteriaMethod;
  criteriaDetails: SamplingCriteriaInfo;
  framesCount: number;
  quadratAreaM2: number;
  surveyZoneAreaM2: number;
  samples: SampledFrame[];
  speciesEstimates: SpeciesPopulationEstimate[];
  biodiversity: BiodiversityIndices;
  overallDensityPerM2: number;
  overallVegetationCover: number;
  isAiEnhanced: boolean;
  notes?: string;
}

