export const AREA_GROUPS = [
  { district: 'Belconnen', suburbs: ['Aranda', 'Belconnen', 'Bruce', 'Cook', 'Hawker', 'Macquarie', 'McKellar', 'Scullin', 'Weetangera'] },
  { district: 'East Canberra', suburbs: ['Campbell', 'Duntroon', 'Harman', 'Kowen', 'Majura', 'Pialligo', 'Queanbeyan fringe'] },
  { district: 'Gungahlin', suburbs: ['Amaroo', 'Bonner', 'Casey', 'Crace', 'Forde', 'Franklin', 'Gungahlin', 'Harrison', 'Nicholls', 'Ngunnawal'] },
  { district: 'Inner North & City', suburbs: ['Acton', 'Ainslie', 'Braddon', 'City', 'Dickson', 'Downer', 'Lyneham', 'O’Connor', 'Turner', 'Watson'] },
  { district: 'Inner South', suburbs: ['Barton', 'Deakin', 'Forrest', 'Griffith', 'Kingston', 'Manuka', 'Narrabundah', 'Red Hill', 'Yarralumla'] },
  { district: 'Molonglo Valley', suburbs: ['Coombs', 'Denman Prospect', 'Molonglo', 'Wright'] },
  { district: 'Tuggeranong', suburbs: ['Calwell', 'Conder', 'Erindale', 'Fadden', 'Gordon', 'Kambah', 'Lanyon', 'Tuggeranong', 'Wanniassa'] },
  { district: 'Weston Creek', suburbs: ['Chapman', 'Duffy', 'Fisher', 'Holder', 'Rivett', 'Stirling', 'Warambanga', 'Weston'] },
  { district: 'Woden', suburbs: ['Chifley', 'Curtin', 'Farrer', 'Garran', 'Hughes', 'Isaacs', 'Mawson', 'O’Malley', 'Pearce', 'Phillip', 'Torrens'] },
];

export const AREA_OPTIONS = AREA_GROUPS.flatMap(({ district, suburbs }) => suburbs.map((suburb) => `${suburb} — ${district}`));

export const SERVICE_TITLES = [
  'Roof Leak Repairs',
  'Tile Roof Repairs',
  'Chimney Flashing Repairs',
  'Rebedding & Repointing',
  'Roof Inspections',
];

export const FIELD_LIMITS = {
  name: 100,
  email: 254,
  phone: 40,
  address: 200,
  message: 5000,
  textFieldBytes: 10240,
  fieldNameBytes: 100,
  fields: 9,
  files: 1,
  parts: 10,
};

export const PHOTO_LIMIT_BYTES = 4 * 1024 * 1024;
export const PHOTO_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const PHOTO_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
export const PHOTO_ACCEPT = `${PHOTO_ALLOWED_TYPES.join(',')},${PHOTO_EXTENSIONS.join(',')}`;
