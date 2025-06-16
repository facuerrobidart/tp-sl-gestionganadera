db = db.getSiblingDB('gestionganadera');

// Create collections
db.createCollection('zones');
db.createCollection('cattle');
db.createCollection('dashboard');
db.createCollection('users');

// Create indexes for better performance
db.zones.createIndex({ "id": 1 }, { unique: true });
db.cattle.createIndex({ "id": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });

// Mocked Zones - Ubicadas en zona rural de Argentina (cerca de La Plata)
const zones = [
  {
    id: "farm",
    name: "Granja Completa",
    description: "Perímetro completo de la granja",
    bounds: [ [-34.9500, -57.9800], [-34.9350, -57.9650] ],
    color: "#3b82f6"
  },
  {
    id: "stables", 
    name: "Establos",
    description: "Área de descanso para el ganado",
    bounds: [ [-34.9480, -57.9780], [-34.9460, -57.9760] ],
    color: "#ef4444"
  },
  {
    id: "feeders",
    name: "Comederos", 
    description: "Área de alimentación",
    bounds: [ [-34.9440, -57.9750], [-34.9420, -57.9730] ],
    color: "#f97316"
  },
  {
    id: "waterers",
    name: "Bebederos",
    description: "Área de hidratación", 
    bounds: [ [-34.9480, -57.9720], [-34.9460, -57.9700] ],
    color: "#22c55e"
  },
  {
    id: "milking",
    name: "Áreas de Ordeño",
    description: "Zona de producción de leche",
    bounds: [ [-34.9440, -57.9690], [-34.9420, -57.9670] ],
    color: "#a855f7"
  },
  {
    id: "maternity",
    name: "Maternidades", 
    description: "Área para vacas preñadas y recién paridas",
    bounds: [ [-34.9400, -57.9780], [-34.9380, -57.9760] ],
    color: "#ec4899"
  },
  {
    id: "pasture",
    name: "Áreas de Pastoreo",
    description: "Zonas de alimentación natural",
    bounds: [ [-34.9420, -57.9740], [-34.9380, -57.9700] ],
    color: "#84cc16"
  }
];

// Insert zones first
db.zones.insertMany(zones);
print('Zones inserted successfully');

// Función para generar posición aleatoria dentro de una zona
function randomPositionInZone(zoneId) {
  const zone = zones.find(z => z.id === zoneId);
  if (!zone) return [-34.9450, -57.9720];
  
  const [sw, ne] = zone.bounds;
  const lat = sw[0] + Math.random() * (ne[0] - sw[0]);
  const lng = sw[1] + Math.random() * (ne[1] - sw[1]);
  return [parseFloat(lat.toFixed(6)), parseFloat(lng.toFixed(6))];
}

// Crear ganado con posiciones específicas y estados de conexión variados
const cattleData = [
  // Vacas en establos
  { id: "cow-1", name: "Bella", description: "Holstein de 5 años, alta productora de leche", imageUrl: "/placeholder.svg?height=200&width=200", zoneId: "stables", connected: true },
  { id: "cow-2", name: "Luna", description: "Jersey de 3 años, excelente calidad de leche", imageUrl: "/placeholder.svg?height=200&width=200", zoneId: "stables", connected: true },
  { id: "cow-3", name: "Estrella", description: "Angus de 4 años, buena para carne", imageUrl: "/placeholder.svg?height=200&width=200", zoneId: "stables", connected: false },
  { id: "cow-4", name: "Princesa", description: "Gyr de 5 años, adaptable a climas cálidos", imageUrl: "/placeholder.svg?height=200&width=200", zoneId: "stables", connected: true },

  // Vacas en comederos
  { id: "cow-5", name: "Margarita", description: "Normando de 6 años, buena para leche y carne", imageUrl: "/placeholder.svg?height=200&width=200", zoneId: "feeders", connected: true },
  { id: "cow-6", name: "Rubí", description: "Limousin de 3 años, buena musculatura", imageUrl: "/placeholder.svg?height=200&width=200", zoneId: "feeders", connected: false },
  { id: "cow-7", name: "Manchas", description: "Hereford de 6 años, madre de 4 terneros", imageUrl: "/placeholder.svg?height=200&width=200", zoneId: "feeders", connected: true },

  // Vacas en bebederos
  { id: "cow-8", name: "Violeta", description: "Holstein de 5 años, alta productora de leche", imageUrl: "/placeholder.svg?height=200&width=200", zoneId: "waterers", connected: true },
  { id: "cow-9", name: "Zafiro", description: "Simmental de 4 años, doble propósito", imageUrl: "/placeholder.svg?height=200&width=200", zoneId: "waterers", connected: true },

  // Vacas en ordeño
  { id: "cow-10", name: "Flor", description: "Brahman de 2 años, resistente al calor", imageUrl: "/placeholder.svg?height=200&width=200", zoneId: "milking", connected: true },
  { id: "cow-11", name: "Rosa", description: "Jersey de 3 años, excelente calidad de leche", imageUrl: "/placeholder.svg?height=200&width=200", zoneId: "milking", connected: true },
  { id: "cow-12", name: "Ámbar", description: "Gyr de 5 años, adaptable a climas cálidos", imageUrl: "/placeholder.svg?height=200&width=200", zoneId: "milking", connected: false },

  // Vacas en maternidad
  { id: "cow-13", name: "Dulce", description: "Charolais de 7 años, gran tamaño", imageUrl: "/placeholder.svg?height=200&width=200", zoneId: "maternity", connected: true },
  { id: "cow-14", name: "Azucena", description: "Angus de 4 años, buena para carne", imageUrl: "/placeholder.svg?height=200&width=200", zoneId: "maternity", connected: true },
  { id: "cow-15", name: "Topacio", description: "Normando de 6 años, buena para leche y carne", imageUrl: "/placeholder.svg?height=200&width=200", zoneId: "maternity", connected: true },

  // Vacas en pastoreo
  { id: "cow-16", name: "Canela", description: "Limousin de 3 años, buena musculatura", imageUrl: "/placeholder.svg?height=200&width=200", zoneId: "pasture", connected: true },
  { id: "cow-17", name: "Perla", description: "Hereford de 6 años, madre de 4 terneros", imageUrl: "/placeholder.svg?height=200&width=200", zoneId: "pasture", connected: false },
  { id: "cow-18", name: "Diamante", description: "Brahman de 2 años, resistente al calor", imageUrl: "/placeholder.svg?height=200&width=200", zoneId: "pasture", connected: true },

  // Vacas en granja general
  { id: "cow-19", name: "Lucero", description: "Simmental de 4 años, doble propósito", imageUrl: "/placeholder.svg?height=200&width=200", zoneId: "farm", connected: true },
  { id: "cow-20", name: "Esmeralda", description: "Charolais de 7 años, gran tamaño", imageUrl: "/placeholder.svg?height=200&width=200", zoneId: "farm", connected: true }
];

// Generar posiciones y crear documentos finales
const cattle = cattleData.map(cow => ({
  ...cow,
  position: randomPositionInZone(cow.zoneId),
  createdAt: new Date().toISOString(),
  lastSeen: cow.connected ? new Date().toISOString() : new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
}));

db.cattle.insertMany(cattle);
print('Cattle inserted successfully with varied zones and connection status');

// Mocked Users
const users = [
  { 
    name: "Administrador", 
    email: "admin@ejemplo.com", 
    password: "$2b$10$u8bxbvd8Y.iWIL.O8.h8COzBq2mNgn5sUKUn90ndRNbhiUxLGbt6q",
    role: "Administrador", 
    createdAt: "2023-01-15" 
  },
  { 
    name: "Juan Pérez", 
    email: "juan@ejemplo.com", 
    password: "$2b$10$u8bxbvd8Y.iWIL.O8.h8COzBq2mNgn5sUKUn90ndRNbhiUxLGbt6q",
    role: "Supervisor", 
    createdAt: "2023-02-20" 
  },
  { 
    name: "María López", 
    email: "maria@ejemplo.com", 
    password: "$2b$10$u8bxbvd8Y.iWIL.O8.h8COzBq2mNgn5sUKUn90ndRNbhiUxLGbt6q",
    role: "Operador", 
    createdAt: "2023-03-10" 
  }
];
db.users.insertMany(users);

print('Database initialization completed successfully!');