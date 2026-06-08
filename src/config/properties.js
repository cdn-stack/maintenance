// ---------------------------------------------------------------
// CDN Homes — Property List with full addresses
// This drives every property dropdown and detail view in the app.
// ---------------------------------------------------------------

const PROPERTY_DATA = [
  { nick: 'Whitechapel',        address: 'Flat 21 Dron House, Adelina Grove, London, E1 3AA' },
  { nick: 'Kings Cross',        address: 'Flat 8 Albion Walk, 1 Albion Buildings, London, N1 9BZ' },
  { nick: 'Archway',            address: 'Flat 8, 11-13 Miranda Road, London, N19 3RA' },
  { nick: 'Golders Green',      address: '8C Park Drive, London, NW11 7SH' },
  { nick: 'TPL',                address: '15B, The Avenue, London, N8 0JR' },
  { nick: 'Ilford',             address: '12 Wycliffe House, 245-247 Cranbrook Road, London, IG1 4TD' },
  { nick: 'Girdlestone Street', address: '222 Girdlestone Walk, London, N19 5DP' },
  { nick: 'Portnall',           address: '8B Portnall Road, London, W9 3BD' },
  { nick: 'Queens Park',        address: '255C Harvist Road, London, NW6 6HH' },
  { nick: 'GG Studio',          address: '8D Park Drive, London, NW11 7SH' },
  { nick: 'GG Three Bed',       address: '8A Park Drive, London, NW11 7SH' },
  { nick: 'The Mall',           address: '61 The Mall, London, N14 6LR' },
  { nick: 'Turnpike',           address: '15A, The Avenue, London, N8 0JR' },
  { nick: 'Fidlers Moat',       address: 'Fidlers Moat, Loves Green, Highwood, Chelmsford, CM1 3QJ' },
  { nick: 'Windermere',         address: '96 Windermere Avenue, Hornchurch, RM12 5ER' },
  { nick: 'Albion Buildings',   address: 'Flat 4 Albion Walk, 1 Albion Buildings, London, N1 9BZ' },
  { nick: 'Wheler Street',      address: '28 Wheler Street, London, E1 6LD' },
  { nick: 'North End Road',     address: '137C North End Road' },
];

// Simple list of nicknames — used for dropdowns and API validation
const PROPERTIES = PROPERTY_DATA.map(p => p.nick);

module.exports = { PROPERTY_DATA, PROPERTIES };
