// MongoDB initialization script for Docker Compose
// Creates databases, indexes, and seed data on first startup

print("=== EcoVision AI MongoDB Initialization ===");

// Switch to the main backend database
db = db.getSiblingDB("ecovision_ai");

// Create collections with validators
db.createCollection("users");
db.createCollection("scanhistories");
db.createCollection("recyclingcenters");
db.createCollection("smartbins");
db.createCollection("reports");
db.createCollection("notifications");
db.createCollection("auditlogs");
db.createCollection("apilogs");

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ ecoPoints: -1 });
db.scanhistories.createIndex({ createdAt: -1 });
db.scanhistories.createIndex({ userId: 1 });
db.recyclingcenters.createIndex({ location: "2dsphere" });
db.apilogs.createIndex({ createdAt: -1 }, { expireAfterSeconds: 2592000 });

// Seed recycling centers
db.recyclingcenters.insertMany([
  {
    id: "rc-1",
    name: "CircularWorks Recovery Hub",
    lat: 37.7749, lng: -122.4194,
    location: { type: "Point", coordinates: [-122.4194, 37.7749] },
    address: "120 Mission Loop, San Francisco, CA",
    distanceKm: 1.2, rating: 4.9, openNow: true,
    accepted: ["plastic", "paper", "metal", "glass"],
    createdAt: new Date(), updatedAt: new Date()
  },
  {
    id: "rc-2",
    name: "GreenGrid E-Waste Studio",
    lat: 37.7854, lng: -122.4011,
    location: { type: "Point", coordinates: [-122.4011, 37.7854] },
    address: "44 Howard Street, San Francisco, CA",
    distanceKm: 2.7, rating: 4.8, openNow: true,
    accepted: ["e-waste", "metal", "plastic"],
    createdAt: new Date(), updatedAt: new Date()
  },
  {
    id: "rc-3",
    name: "Bay Organics Compost Lab",
    lat: 37.7631, lng: -122.4312,
    location: { type: "Point", coordinates: [-122.4312, 37.7631] },
    address: "9 Castro Garden Way, San Francisco, CA",
    distanceKm: 3.1, rating: 4.7, openNow: false,
    accepted: ["organic", "paper"],
    createdAt: new Date(), updatedAt: new Date()
  },
  {
    id: "rc-4",
    name: "ZeroWaste Exchange",
    lat: 37.7926, lng: -122.393,
    location: { type: "Point", coordinates: [-122.393, 37.7926] },
    address: "210 Embarcadero North, San Francisco, CA",
    distanceKm: 4.4, rating: 4.6, openNow: true,
    accepted: ["plastic", "paper", "organic", "metal", "glass", "e-waste"],
    createdAt: new Date(), updatedAt: new Date()
  }
]);

// Seed waste categories
db.wastecategories.insertMany([
  { id: "plastic", label: "Plastic", tone: "from-cyan-300 to-emerald-300", description: "PET, HDPE, flexible packaging, bottle caps, and refill containers.", recommendation: "Rinse, dry, flatten, and place in the blue recycling stream.", impact: "Recycling one bottle saves enough energy to power an LED bulb for 6 hours.", streamColor: "#22d3ee", recyclable: true, compostable: false, hazardous: false },
  { id: "paper", label: "Paper", tone: "from-lime-200 to-amber-200", description: "Office paper, cardboard, cartons, newspapers, and paperboard.", recommendation: "Keep dry, remove food residue, and bundle cardboard separately.", impact: "Every kilogram recycled helps protect forests and reduce landfill methane.", streamColor: "#fde68a", recyclable: true, compostable: false, hazardous: false },
  { id: "organic", label: "Organic", tone: "from-emerald-300 to-green-600", description: "Food scraps, peels, compostables, coffee grounds, and garden waste.", recommendation: "Send to compost or smart bin organics stream within 24 hours.", impact: "Composting transforms waste into soil nutrients and lowers methane output.", streamColor: "#34d399", recyclable: false, compostable: true, hazardous: false },
  { id: "metal", label: "Metal", tone: "from-slate-100 to-cyan-300", description: "Aluminum cans, tins, foil trays, aerosol cans, and metal caps.", recommendation: "Empty contents, compress where possible, and keep sharp lids covered.", impact: "Aluminum can be recycled repeatedly with a fraction of virgin material energy.", streamColor: "#a5b4fc", recyclable: true, compostable: false, hazardous: false },
  { id: "glass", label: "Glass", tone: "from-teal-100 to-sky-300", description: "Bottles, jars, food containers, and color-sorted glass packaging.", recommendation: "Rinse and separate by color when your municipality requires it.", impact: "Glass recycling reduces raw material extraction and furnace emissions.", streamColor: "#67e8f9", recyclable: true, compostable: false, hazardous: false },
  { id: "e-waste", label: "E-Waste", tone: "from-violet-300 to-fuchsia-400", description: "Batteries, cables, phones, circuit boards, chargers, and small devices.", recommendation: "Do not place in curbside bins. Use certified electronics drop-off.", impact: "Responsible recovery prevents heavy metals from entering soil and water.", streamColor: "#c084fc", recyclable: false, compostable: false, hazardous: true }
]);

// Switch to AI engine database
db = db.getSiblingDB("ecovision_ai_engine");
db.createCollection("predictions");
db.createCollection("models");
db.createCollection("datasets");

print("=== MongoDB initialization completed ===");
