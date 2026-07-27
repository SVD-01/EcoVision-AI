import type {
  AnalyticsSummary,
  AssistantMessage,
  GamificationSummary,
  RecyclingCenter,
  ScanResult,
  WasteCategory,
  WasteType,
} from "./types";

const latency = (min = 420, max = 1050) =>
  new Promise((resolve) => window.setTimeout(resolve, Math.floor(Math.random() * (max - min)) + min));

const id = () => Math.random().toString(36).slice(2, 10);

const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

export const wasteCategories: WasteCategory[] = [
  {
    id: "plastic",
    label: "Plastic",
    tone: "from-cyan-300 to-emerald-300",
    description: "PET, HDPE, flexible packaging, bottle caps, and refill containers.",
    recommendation: "Rinse, dry, flatten, and place in the blue recycling stream.",
    impact: "Recycling one bottle saves enough energy to power an LED bulb for 6 hours.",
  },
  {
    id: "paper",
    label: "Paper",
    tone: "from-lime-200 to-amber-200",
    description: "Office paper, cardboard, cartons, newspapers, and paperboard.",
    recommendation: "Keep dry, remove food residue, and bundle cardboard separately.",
    impact: "Every kilogram recycled helps protect forests and reduce landfill methane.",
  },
  {
    id: "organic",
    label: "Organic",
    tone: "from-emerald-300 to-green-600",
    description: "Food scraps, peels, compostables, coffee grounds, and garden waste.",
    recommendation: "Send to compost or smart bin organics stream within 24 hours.",
    impact: "Composting transforms waste into soil nutrients and lowers methane output.",
  },
  {
    id: "metal",
    label: "Metal",
    tone: "from-slate-100 to-cyan-300",
    description: "Aluminum cans, tins, foil trays, aerosol cans, and metal caps.",
    recommendation: "Empty contents, compress where possible, and keep sharp lids covered.",
    impact: "Aluminum can be recycled repeatedly with a fraction of virgin material energy.",
  },
  {
    id: "glass",
    label: "Glass",
    tone: "from-teal-100 to-sky-300",
    description: "Bottles, jars, food containers, and color-sorted glass packaging.",
    recommendation: "Rinse and separate by color when your municipality requires it.",
    impact: "Glass recycling reduces raw material extraction and furnace emissions.",
  },
  {
    id: "e-waste",
    label: "E-Waste",
    tone: "from-violet-300 to-fuchsia-400",
    description: "Batteries, cables, phones, circuit boards, chargers, and small devices.",
    recommendation: "Do not place in curbside bins. Use certified electronics drop-off.",
    impact: "Responsible recovery prevents heavy metals from entering soil and water.",
  },
];

export const recyclingCenters: RecyclingCenter[] = [
  {
    id: "rc-1",
    name: "CircularWorks Recovery Hub",
    lat: 37.7749,
    lng: -122.4194,
    address: "120 Mission Loop, San Francisco, CA",
    distanceKm: 1.2,
    rating: 4.9,
    openNow: true,
    accepted: ["plastic", "paper", "metal", "glass"],
  },
  {
    id: "rc-2",
    name: "GreenGrid E-Waste Studio",
    lat: 37.7854,
    lng: -122.4011,
    address: "44 Howard Street, San Francisco, CA",
    distanceKm: 2.7,
    rating: 4.8,
    openNow: true,
    accepted: ["e-waste", "metal", "plastic"],
  },
  {
    id: "rc-3",
    name: "Bay Organics Compost Lab",
    lat: 37.7631,
    lng: -122.4312,
    address: "9 Castro Garden Way, San Francisco, CA",
    distanceKm: 3.1,
    rating: 4.7,
    openNow: false,
    accepted: ["organic", "paper"],
  },
  {
    id: "rc-4",
    name: "ZeroWaste Exchange",
    lat: 37.7926,
    lng: -122.393,
    address: "210 Embarcadero North, San Francisco, CA",
    distanceKm: 4.4,
    rating: 4.6,
    openNow: true,
    accepted: ["plastic", "paper", "organic", "metal", "glass", "e-waste"],
  },
];

export const fetchScanHistory = async (): Promise<ScanResult[]> => {
  await latency(240, 520);
  return ["bottle-demo.jpg", "cardboard-demo.png", "battery-demo.heic"].map((name) => makeScanResult(name));
};

export const scanWaste = async (fileName: string): Promise<ScanResult> => {
  await latency(1200, 1900);
  return makeScanResult(fileName);
};

export const fetchRecyclingCenters = async (): Promise<RecyclingCenter[]> => {
  await latency();
  return recyclingCenters;
};

export const fetchAnalytics = async (): Promise<AnalyticsSummary> => {
  await latency();
  return analyticsSummary;
};

export const fetchGamification = async (): Promise<GamificationSummary> => {
  await latency();
  return gamificationSummary;
};

export const askAssistant = async (messages: AssistantMessage[], language: string): Promise<AssistantMessage> => {
  await latency(700, 1400);
  const latest = messages[messages.length - 1]?.content.toLowerCase() ?? "";
  const topic = latest.includes("battery")
    ? "Batteries should go to certified e-waste or hazardous waste collection. Tape exposed terminals before drop-off."
    : latest.includes("compost")
      ? "Compost organics by separating food scraps, coffee grounds, and yard waste from plastics or glass."
      : "Use the scanner first, then follow the local stream recommendation and nearest center routing shown in EcoVision AI.";

  return {
    id: id(),
    role: "assistant",
    language,
    content: `**EcoVision AI guidance**\n\n${topic}\n\nBackend-ready placeholder: connect this response to OpenAI or Gemini with your server-side JWT session and audit logging.`,
  };
};

export const generateReportText = (scan: ScanResult) => `EcoVision AI Waste Report\n\nScan ID: ${scan.id}\nFile: ${scan.fileName}\nCategory: ${scan.category.label}\nConfidence: ${scan.confidence}%\nCarbon Saved: ${scan.impact.carbonKg} kg\nWater Conserved: ${scan.impact.waterLiters} L\nTrees Protected: ${scan.impact.trees}\nPoints Awarded: ${scan.impact.points}\n\nRecommendations:\n${scan.recommendations.map((item) => `- ${item}`).join("\n")}\n`;

const makeScanResult = (fileName: string): ScanResult => {
  const category = inferCategory(fileName);
  const confidence = Math.floor(Math.random() * 13) + 86;
  return {
    id: `scan-${id()}`,
    fileName,
    category,
    confidence,
    createdAt: new Date().toISOString(),
    boundingBoxes: [
      {
        x: 16 + Math.random() * 10,
        y: 18 + Math.random() * 8,
        width: 48 + Math.random() * 12,
        height: 44 + Math.random() * 13,
        label: category.label,
        confidence,
      },
    ],
    recommendations: [
      category.recommendation,
      "Check local contamination rules before final disposal.",
      "Log this item to improve your Eco Score and team reporting.",
    ],
    impact: {
      carbonKg: Number((Math.random() * 1.6 + 0.3).toFixed(2)),
      waterLiters: Math.floor(Math.random() * 44) + 12,
      trees: Number((Math.random() * 0.08 + 0.01).toFixed(2)),
      points: Math.floor(Math.random() * 36) + 18,
    },
  };
};

const inferCategory = (fileName: string): WasteCategory => {
  const lower = fileName.toLowerCase();
  const match: Partial<Record<WasteType, string[]>> = {
    plastic: ["plastic", "bottle", "pet"],
    paper: ["paper", "cardboard", "carton"],
    organic: ["food", "organic", "compost", "banana"],
    metal: ["metal", "can", "tin"],
    glass: ["glass", "jar"],
    "e-waste": ["battery", "phone", "cable", "device"],
  };
  const detected = wasteCategories.find((category) => match[category.id]?.some((word) => lower.includes(word)));
  return detected ?? pick(wasteCategories);
};

export const analyticsSummary: AnalyticsSummary = {
  ecoScore: 92,
  sustainabilityScore: 88,
  carbonSaved: 438.7,
  waterConserved: 12840,
  treesProtected: 41,
  weekly: [
    { label: "Mon", scans: 18, carbon: 12, water: 320, points: 220 },
    { label: "Tue", scans: 24, carbon: 18, water: 480, points: 360 },
    { label: "Wed", scans: 16, carbon: 14, water: 380, points: 260 },
    { label: "Thu", scans: 30, carbon: 23, water: 620, points: 450 },
    { label: "Fri", scans: 28, carbon: 20, water: 560, points: 430 },
    { label: "Sat", scans: 38, carbon: 30, water: 820, points: 610 },
    { label: "Sun", scans: 34, carbon: 27, water: 760, points: 570 },
  ],
  monthly: [
    { label: "Jan", scans: 210, carbon: 142, water: 3800, points: 3100 },
    { label: "Feb", scans: 260, carbon: 176, water: 4200, points: 3850 },
    { label: "Mar", scans: 318, carbon: 220, water: 5300, points: 4810 },
    { label: "Apr", scans: 402, carbon: 284, water: 7200, points: 5900 },
    { label: "May", scans: 486, carbon: 338, water: 8900, points: 7200 },
    { label: "Jun", scans: 564, carbon: 438, water: 12840, points: 8500 },
  ],
  distribution: [
    { name: "Plastic", value: 32, color: "#22d3ee" },
    { name: "Organic", value: 24, color: "#34d399" },
    { name: "Paper", value: 18, color: "#fde68a" },
    { name: "Metal", value: 11, color: "#a5b4fc" },
    { name: "Glass", value: 9, color: "#67e8f9" },
    { name: "E-Waste", value: 6, color: "#c084fc" },
  ],
  timeline: [
    { id: "t-1", title: "Detected 28 recyclable items", meta: "Today, 09:42", impact: "+430 XP" },
    { id: "t-2", title: "Completed plastic-free lunch challenge", meta: "Yesterday", impact: "+120 points" },
    { id: "t-3", title: "Downloaded monthly ESG report", meta: "2 days ago", impact: "Audit ready" },
    { id: "t-4", title: "Visited ZeroWaste Exchange", meta: "4 days ago", impact: "3.1 kg CO2" },
  ],
};

export const gamificationSummary: GamificationSummary = {
  points: 12840,
  xp: 7420,
  level: 18,
  streak: 21,
  nextLevelXp: 9000,
  achievements: [
    { id: "a-1", name: "Zero Waste Pilot", description: "Complete 100 verified scans.", unlocked: true, progress: 100 },
    { id: "a-2", name: "Carbon Guardian", description: "Save 250 kg CO2 equivalent.", unlocked: true, progress: 100 },
    { id: "a-3", name: "E-Waste Defender", description: "Route 15 electronics safely.", unlocked: false, progress: 72 },
    { id: "a-4", name: "Compost Catalyst", description: "Log organics for 14 days.", unlocked: false, progress: 64 },
  ],
  daily: [
    { id: "d-1", title: "Scan 5 items before lunch", reward: 90, progress: 3, goal: 5 },
    { id: "d-2", title: "Route one item to a nearby center", reward: 120, progress: 0, goal: 1 },
    { id: "d-3", title: "Answer the circularity quiz", reward: 80, progress: 1, goal: 1 },
  ],
  weekly: [
    { id: "w-1", title: "Reduce landfill contamination by 18%", reward: 700, progress: 61, goal: 100 },
    { id: "w-2", title: "Team scan sprint", reward: 950, progress: 420, goal: 600 },
  ],
  leaderboard: [
    { rank: 1, name: "Maya Chen", points: 18320, city: "Singapore" },
    { rank: 2, name: "EcoVision Labs", points: 16980, city: "San Francisco" },
    { rank: 3, name: "Ravi Kumar", points: 15870, city: "Bengaluru" },
    { rank: 4, name: "Ava Martin", points: 14240, city: "Paris" },
  ],
};