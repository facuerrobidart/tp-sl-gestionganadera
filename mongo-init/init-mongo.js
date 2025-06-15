db = db.getSiblingDB('gestionganadera');

// Create collections
db.createCollection('zones');
db.createCollection('cattle');
db.createCollection('dashboard');
db.createCollection('users');

// Create indexes for better performance
db.zones.createIndex({ "name": 1 }, { unique: true });
db.cattle.createIndex({ "id": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });

// Mocked Zones
const zones = [
  {
    id: "farm",
    name: "Granja Completa",
    description: "Perímetro completo de la granja",
    bounds: [ [40.7028, -74.016], [40.7228, -73.996] ],
    color: "#3b82f6"
  },
  {
    id: "stables",
    name: "Establos",
    description: "Área de descanso para el ganado",
    bounds: [ [40.7048, -74.014], [40.7088, -74.01] ],
    color: "#ef4444"
  },
  {
    id: "feeders",
    name: "Comederos",
    description: "Área de alimentación",
    bounds: [ [40.7048, -74.002], [40.7088, -73.998] ],
    color: "#f97316"
  },
  {
    id: "waterers",
    name: "Bebederos",
    description: "Área de hidratación",
    bounds: [ [40.7168, -74.014], [40.7208, -74.01] ],
    color: "#22c55e"
  },
  {
    id: "milking",
    name: "Áreas de Ordeño",
    description: "Zona de producción de leche",
    bounds: [ [40.7168, -74.002], [40.7208, -73.998] ],
    color: "#a855f7"
  },
  {
    id: "maternity",
    name: "Maternidades",
    description: "Área para vacas preñadas y recién paridas",
    bounds: [ [40.7108, -74.008], [40.7148, -74.004] ],
    color: "#ec4899"
  },
  {
    id: "pasture",
    name: "Áreas de Pastoreo",
    description: "Zonas de alimentación natural",
    bounds: [ [40.7068, -74.007], [40.7118, -74.0] ],
    color: "#84cc16"
  }
];
db.zones.insertMany(zones);

// Mocked Cattle (20 cows, simplified)
const cattle = [
  { id: "cow-1", name: "Bella", description: "Holstein de 5 años, alta productora de leche", imageUrl: "/placeholder.svg?height=200&width=200", position: [40.705, -74.01], connected: true, zoneId: "farm" },
  { id: "cow-2", name: "Luna", description: "Jersey de 3 años, excelente calidad de leche", imageUrl: "/placeholder.svg?height=200&width=200", position: [40.706, -74.012], connected: true, zoneId: "stables" },
  { id: "cow-3", name: "Estrella", description: "Angus de 4 años, buena para carne", imageUrl: "/placeholder.svg?height=200&width=200", position: [40.707, -74.013], connected: true, zoneId: "feeders" },
  { id: "cow-4", name: "Manchas", description: "Hereford de 6 años, madre de 4 terneros", imageUrl: "/placeholder.svg?height=200&width=200", position: [40.708, -74.014], connected: true, zoneId: "waterers" },
  { id: "cow-5", name: "Flor", description: "Brahman de 2 años, resistente al calor", imageUrl: "/placeholder.svg?height=200&width=200", position: [40.709, -74.015], connected: true, zoneId: "milking" },
  { id: "cow-6", name: "Dulce", description: "Charolais de 7 años, gran tamaño", imageUrl: "/placeholder.svg?height=200&width=200", position: [40.710, -74.016], connected: true, zoneId: "maternity" },
  { id: "cow-7", name: "Canela", description: "Limousin de 3 años, buena musculatura", imageUrl: "/placeholder.svg?height=200&width=200", position: [40.711, -74.017], connected: true, zoneId: "pasture" },
  { id: "cow-8", name: "Lucero", description: "Simmental de 4 años, doble propósito", imageUrl: "/placeholder.svg?height=200&width=200", position: [40.712, -74.018], connected: true, zoneId: "farm" },
  { id: "cow-9", name: "Princesa", description: "Gyr de 5 años, adaptable a climas cálidos", imageUrl: "/placeholder.svg?height=200&width=200", position: [40.713, -74.019], connected: true, zoneId: "stables" },
  { id: "cow-10", name: "Margarita", description: "Normando de 6 años, buena para leche y carne", imageUrl: "/placeholder.svg?height=200&width=200", position: [40.714, -74.02], connected: true, zoneId: "feeders" },
  { id: "cow-11", name: "Violeta", description: "Holstein de 5 años, alta productora de leche", imageUrl: "/placeholder.svg?height=200&width=200", position: [40.715, -74.021], connected: true, zoneId: "waterers" },
  { id: "cow-12", name: "Rosa", description: "Jersey de 3 años, excelente calidad de leche", imageUrl: "/placeholder.svg?height=200&width=200", position: [40.716, -74.022], connected: true, zoneId: "milking" },
  { id: "cow-13", name: "Azucena", description: "Angus de 4 años, buena para carne", imageUrl: "/placeholder.svg?height=200&width=200", position: [40.717, -74.023], connected: true, zoneId: "maternity" },
  { id: "cow-14", name: "Perla", description: "Hereford de 6 años, madre de 4 terneros", imageUrl: "/placeholder.svg?height=200&width=200", position: [40.718, -74.024], connected: true, zoneId: "pasture" },
  { id: "cow-15", name: "Diamante", description: "Brahman de 2 años, resistente al calor", imageUrl: "/placeholder.svg?height=200&width=200", position: [40.719, -74.025], connected: true, zoneId: "farm" },
  { id: "cow-16", name: "Esmeralda", description: "Charolais de 7 años, gran tamaño", imageUrl: "/placeholder.svg?height=200&width=200", position: [40.720, -74.026], connected: true, zoneId: "stables" },
  { id: "cow-17", name: "Rubí", description: "Limousin de 3 años, buena musculatura", imageUrl: "/placeholder.svg?height=200&width=200", position: [40.721, -74.027], connected: true, zoneId: "feeders" },
  { id: "cow-18", name: "Zafiro", description: "Simmental de 4 años, doble propósito", imageUrl: "/placeholder.svg?height=200&width=200", position: [40.722, -74.028], connected: true, zoneId: "waterers" },
  { id: "cow-19", name: "Ámbar", description: "Gyr de 5 años, adaptable a climas cálidos", imageUrl: "/placeholder.svg?height=200&width=200", position: [40.723, -74.029], connected: true, zoneId: "milking" },
  { id: "cow-20", name: "Topacio", description: "Normando de 6 años, buena para leche y carne", imageUrl: "/placeholder.svg?height=200&width=200", position: [40.724, -74.03], connected: true, zoneId: "maternity" }
];
db.cattle.insertMany(cattle);

// Mocked Users
const users = [
  { id: "1", name: "Administrador", email: "admin@ejemplo.com", role: "Administrador", createdAt: "2023-01-15" },
  { id: "2", name: "Juan Pérez", email: "juan@ejemplo.com", role: "Supervisor", createdAt: "2023-02-20" },
  { id: "3", name: "María López", email: "maria@ejemplo.com", role: "Operador", createdAt: "2023-03-10" }
];
db.users.insertMany(users);

// Mocked Dashboard (single document)
db.dashboard.insertOne({
  totalCattle: 20,
  connectedCattle: 18,
  totalZones: 7,
  alerts: 0,
  lastUpdated: new Date().toISOString()
});

print('Database initialization completed with mocked data'); 