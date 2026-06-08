// Run once to import existing issues from the CSV into the database.
// Usage: node src/db/seed.js
require('dotenv').config();
const db = require('./database');
const initSchema = require('./schema');

initSchema();

// Map old property names from CSV → new names used in the app
const PROPERTY_MAP = {
  'Adelina (Whitechapel)': 'Whitechapel',
  'Adelina':               'Whitechapel',
  'Albion':                'Albion Buildings',
  'Albion 1BD':            'Albion Buildings',
  'Miranda':               'Archway',
  'TPL 2BD':               'TPL',
  'TPL 3BD':               'Turnpike',
  'GG 2BD':                'Golders Green',
  'Golders Green Studio':  'GG Studio',
  'Golders Green 3BD':     'GG Three Bed',
  'Girdlestone':           'Girdlestone Street',
  // These stay the same:
  'Ilford':                'Ilford',
  'Portnall':              'Portnall',
  'Queens Park':           'Queens Park',
  'The Mall':              'The Mall',
  'Fidlers Moat':          'Fidlers Moat',
  'Windermere':            'Windermere',
  'Wheler Street':         'Wheler Street',
  'North End Road':        'North End Road',
};

// Map CSV status values → DB values
const STATUS_MAP = {
  'Open':        'open',
  'In Progress': 'in-progress',
  'Resolved':    'resolved',
  'Pending':     'pending',
};

const issues = [
  // ── FIDLERS MOAT — RESOLVED ──
  { title: 'Hot Tub Replacement', property: 'Fidlers Moat', source: 'Inspection', priority: 'High', status: 'Resolved', assignee: '', cost: '', notes: '' },
  { title: 'Heating & Hot Water', property: 'Fidlers Moat', source: 'Inspection', priority: 'High', status: 'Resolved', assignee: '', cost: '', notes: '' },
  { title: 'Deep Clean', property: 'Fidlers Moat', source: 'Inspection', priority: 'High', status: 'Resolved', assignee: 'Cleaning team', cost: '300', notes: 'Deep clean fee.' },
  { title: 'Concealed Shower Valve 1', property: 'Fidlers Moat', source: 'Inspection', priority: 'High', status: 'Resolved', assignee: '', cost: '', notes: 'N/A' },
  { title: 'Immersion Wiring', property: 'Fidlers Moat', source: 'Inspection', priority: 'Medium', status: 'Resolved', assignee: '', cost: '', notes: '' },
  { title: 'CCTV', property: 'Fidlers Moat', source: 'Inspection', priority: 'Medium', status: 'Resolved', assignee: '', cost: '', notes: '' },
  { title: 'Tower Pop Up', property: 'Fidlers Moat', source: 'Inspection', priority: 'Low', status: 'Resolved', assignee: '', cost: '', notes: '' },
  { title: 'Gym Door - Latch', property: 'Fidlers Moat', source: 'Inspection', priority: 'Medium', status: 'Resolved', assignee: '', cost: '', notes: '' },
  { title: 'Decorating - Shower Valve 1 Damage', property: 'Fidlers Moat', source: 'Inspection', priority: 'High', status: 'Resolved', assignee: '', cost: '', notes: '' },
  { title: 'Kitchen Sink Tap', property: 'Fidlers Moat', source: 'Inspection', priority: 'Low', status: 'Resolved', assignee: '', cost: '', notes: '' },
  { title: 'Boiler Problem', property: 'Fidlers Moat', source: 'Inspection', priority: 'High', status: 'Resolved', assignee: '', cost: '', notes: 'Pump not working.' },
  { title: 'Master Bedroom Shower Valve 2', property: 'Fidlers Moat', source: 'Inspection', priority: 'High', status: 'Resolved', assignee: '', cost: '', notes: '' },
  { title: 'Decorating - Master Bedroom Shower Valve 2 Damage', property: 'Fidlers Moat', source: 'Inspection', priority: 'High', status: 'Resolved', assignee: '', cost: '', notes: '' },
  { title: 'Gate Codes & Access', property: 'Fidlers Moat', source: 'Inspection', priority: 'High', status: 'Resolved', assignee: '', cost: '', notes: '' },
  { title: 'Front Door Lock 2 - Key', property: 'Fidlers Moat', source: 'Inspection', priority: 'Medium', status: 'Resolved', assignee: '', cost: '', notes: '' },
  { title: 'Dining Room Door', property: 'Fidlers Moat', source: 'Inspection', priority: 'Medium', status: 'Resolved', assignee: '', cost: '', notes: '' },
  { title: 'Annex Door', property: 'Fidlers Moat', source: 'Inspection', priority: 'Low', status: 'Resolved', assignee: '', cost: '', notes: 'Requires new lock.' },
  { title: 'Electric Radiators Wired Up', property: 'Fidlers Moat', source: 'Inspection', priority: 'Medium', status: 'Resolved', assignee: '', cost: '', notes: '' },
  { title: 'Overheating Cylinder', property: 'Fidlers Moat', source: 'Inspection', priority: 'High', status: 'Resolved', assignee: '', cost: '', notes: '' },
  { title: 'Actuators / Underfloor Heating', property: 'Fidlers Moat', source: 'Inspection', priority: 'High', status: 'Resolved', assignee: '', cost: '', notes: '' },
  { title: 'Thermostat Change - Annex', property: 'Fidlers Moat', source: 'Inspection', priority: 'Medium', status: 'Resolved', assignee: '', cost: '', notes: '' },
  // ── FIDLERS MOAT — IN PROGRESS ──
  { title: 'Rotten Timber - Bedroom 3 - Weather Guard', property: 'Fidlers Moat', source: 'Inspection', priority: 'Medium', status: 'In Progress', assignee: '', cost: '', notes: '' },
  // ── FIDLERS MOAT — OPEN ──
  { title: 'Stairs Banister', property: 'Fidlers Moat', source: 'Inspection', priority: 'Medium', status: 'Open', assignee: '', cost: '', notes: '' },
  { title: 'Outside Metal Fence Panel', property: 'Fidlers Moat', source: 'Inspection', priority: 'Medium', status: 'Open', assignee: '', cost: '', notes: '' },
  { title: 'Drainage Issues - Under Manhole', property: 'Fidlers Moat', source: 'Inspection', priority: 'High', status: 'Open', assignee: '', cost: '', notes: '' },
  { title: 'Leak - Bedroom, Pink Room Downstairs', property: 'Fidlers Moat', source: 'Inspection', priority: 'High', status: 'Open', assignee: '', cost: '', notes: '' },
  { title: 'Blinds', property: 'Fidlers Moat', source: 'Inspection', priority: 'Low', status: 'Open', assignee: '', cost: '', notes: '' },
  { title: 'Carpet Cleaning', property: 'Fidlers Moat', source: 'Inspection', priority: 'Medium', status: 'Open', assignee: 'Cleaning team', cost: '', notes: '' },
  { title: 'Toilet Seat', property: 'Fidlers Moat', source: 'Inspection', priority: 'Low', status: 'Open', assignee: '', cost: '', notes: '' },
  { title: 'Painting - Navy Bedroom', property: 'Fidlers Moat', source: 'Inspection', priority: 'Medium', status: 'Open', assignee: '', cost: '', notes: '' },
  { title: 'Annex Painting', property: 'Fidlers Moat', source: 'Inspection', priority: 'Medium', status: 'Open', assignee: '', cost: '', notes: '' },
  // ── GOLDERS GREEN 3BD ──
  { title: 'Zip Tap Replacement', property: 'Golders Green 3BD', source: 'Inspection', priority: 'High', status: 'Open', assignee: '', cost: '', notes: '' },
  { title: 'Tumble Dryer Door Broken', property: 'Golders Green 3BD', source: 'Inspection', priority: 'Medium', status: 'Open', assignee: '', cost: '', notes: '' },
  { title: 'Grouting in En Suite Bathroom', property: 'Golders Green 3BD', source: 'Inspection', priority: 'Low', status: 'Open', assignee: '', cost: '', notes: '' },
  { title: 'Bedroom Walk In Wardrobe Unstable', property: 'Golders Green 3BD', source: 'Inspection', priority: 'Medium', status: 'Open', assignee: '', cost: '', notes: '' },
  { title: 'Decking & The Fence', property: 'Golders Green 3BD', source: 'Inspection', priority: 'Medium', status: 'In Progress', assignee: '', cost: '', notes: '' },
  // ── TPL 2BD ──
  { title: 'Tiles need to be replaced in the Kitchen', property: 'TPL 2BD', source: 'Inspection', priority: 'Medium', status: 'Open', assignee: '', cost: '', notes: '' },
  { title: 'Stairs Carpet', property: 'TPL 2BD', source: 'Inspection', priority: 'Medium', status: 'Open', assignee: '', cost: '', notes: '' },
  // ── THE MALL ──
  { title: 'Painting the Walls', property: 'The Mall', source: 'Inspection', priority: 'Low', status: 'Open', assignee: '', cost: '', notes: '' },
  { title: 'Staircase Heads Have Fallen Off', property: 'The Mall', source: 'Inspection', priority: 'Medium', status: 'Open', assignee: '', cost: '', notes: '' },
  // ── WHELER STREET ──
  { title: 'Oven Trips the Electrics', property: 'Wheler Street', source: 'Inspection', priority: 'High', status: 'Open', assignee: '', cost: '', notes: 'Electrical safety concern' },
  // ── TPL 3BD ──
  { title: 'Blue Bedroom Blinds', property: 'TPL 3BD', source: 'Inspection', priority: 'Low', status: 'Open', assignee: '', cost: '', notes: '' },
  { title: 'WiFi Issue', property: 'TPL 3BD', source: 'Inspection', priority: 'Medium', status: 'Open', assignee: '', cost: '', notes: '' },
  // ── ILFORD ──
  { title: 'Toilet Seat', property: 'Ilford', source: 'Inspection', priority: 'Low', status: 'Open', assignee: '', cost: '', notes: '' },
  // ── GOLDERS GREEN STUDIO ──
  { title: 'Blinds Slate Missing', property: 'Golders Green Studio', source: 'Inspection', priority: 'Low', status: 'Open', assignee: '', cost: '', notes: '' },
  // ── QUEENS PARK ──
  { title: 'Toilet Seat Gap', property: 'Queens Park', source: 'Inspection', priority: 'Low', status: 'Open', assignee: '', cost: '', notes: '' },
  { title: 'Cartridge Shower Ensuite', property: 'Queens Park', source: 'Inspection', priority: 'Medium', status: 'Resolved', assignee: '', cost: '', notes: '' },
  { title: 'Painting Walls', property: 'Queens Park', source: 'Inspection', priority: 'Low', status: 'Open', assignee: '', cost: '', notes: '' },
  { title: 'Living Room Light Bulbs', property: 'Queens Park', source: 'Inspection', priority: 'Low', status: 'Open', assignee: '', cost: '', notes: '' },
  { title: 'Bathroom Damp - Family Bathroom Downstairs', property: 'Queens Park', source: 'Inspection', priority: 'High', status: 'Open', assignee: '', cost: '', notes: 'Damp is a priority' },
  { title: 'Door Handle', property: 'Queens Park', source: 'Inspection', priority: 'Low', status: 'Open', assignee: '', cost: '', notes: '' },
  // ── ADELINA ──
  { title: 'Sofa', property: 'Adelina (Whitechapel)', source: 'Inspection', priority: 'Medium', status: 'Open', assignee: '', cost: '', notes: '' },
];

const insert = db.prepare(`
  INSERT INTO issues (title, property, source, priority, status, assignee, date, cost, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertMany = db.transaction((rows) => {
  let count = 0;
  for (const row of rows) {
    const property = PROPERTY_MAP[row.property] || row.property;
    const status   = STATUS_MAP[row.status]    || 'open';
    insert.run(
      row.title,
      property,
      row.source,
      row.priority,
      status,
      row.assignee || null,
      '2024-01-01',
      row.cost ? parseFloat(row.cost) : null,
      row.notes || null
    );
    count++;
  }
  return count;
});

// Clear existing issues first so we don't double-seed
db.prepare('DELETE FROM issues').run();
db.exec("DELETE FROM sqlite_sequence WHERE name = 'issues'");

const count = insertMany(issues);
console.log(`✅ Seeded ${count} issues into the database.`);
