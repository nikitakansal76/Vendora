const VENDOR_DATA = {
  Florists: [
    { id:'v-f1', name:'Bloom & Co.', emoji:'🌸', location:'Wynwood, Miami', price:'$2,000–$5,000', priceNum:3500, services:['Wedding Arrangements','Centerpieces','Bouquets','Arch Decor'], review:'"Made our wedding look like a fairytale." — 4.9★ (87)', category:'Florists' },
    { id:'v-f2', name:'Flor de Cuba', emoji:'🌺', location:'Little Havana, Miami', price:'$1,500–$4,000', priceNum:2500, services:['Tropical Arrangements','Custom Bouquets','Event Decor'], review:'"Vibrant, colorful, absolutely beautiful." — 4.8★ (62)', category:'Florists' },
    { id:'v-f3', name:'Petals & Palms', emoji:'🌴', location:'Coral Gables, Miami', price:'$3,000–$8,000', priceNum:5500, services:['Luxury Florals','Installation Art','Ceiling Decor'], review:'"Breathtaking ceiling installations." — 5.0★ (34)', category:'Florists' },
    { id:'v-f4', name:'Garden State Florals', emoji:'🌿', location:'Brickell, Miami', price:'$800–$2,500', priceNum:1500, services:['Budget Friendly','Seasonal Flowers','Simple Arrangements'], review:'"Great value, fresh flowers." — 4.6★ (120)', category:'Florists' }
  ],
  Catering: [
    { id:'v-c1', name:'Ceviche Bar Miami', emoji:'🍤', location:'Brickell, Miami', price:'$45–$85/person', priceNum:6500, services:['Latin Fusion','Live Stations','Cocktail Hour'], review:'"The food was the highlight of our event." — 4.9★ (156)', category:'Catering' },
    { id:'v-c2', name:'The Coconut Table', emoji:'🥥', location:'South Beach, Miami', price:'$55–$120/person', priceNum:8000, services:['Caribbean Cuisine','Buffet','Plated Dinners'], review:'"Guests are still talking about it." — 4.8★ (89)', category:'Catering' },
    { id:'v-c3', name:'Sabor Latino Catering', emoji:'🫔', location:'Hialeah, Miami', price:'$25–$55/person', priceNum:4000, services:['Cuban','Colombian','Venezuelan','Authentic Recipes'], review:'"Authentic flavors, incredible portions." — 4.7★ (203)', category:'Catering' }
  ],
  Photography: [
    { id:'v-p1', name:'Golden Hour Studios', emoji:'📸', location:'Design District, Miami', price:'$2,500–$6,000', priceNum:4000, services:['Wedding Photography','Drone Shots','Same-Day Edits','Videography'], review:'"Every photo told a story." — 5.0★ (44)', category:'Photography' },
    { id:'v-p2', name:'Mango Lens Co.', emoji:'🥭', location:'Coconut Grove, Miami', price:'$1,800–$3,500', priceNum:2500, services:['Event Photography','Candid Style','Online Gallery'], review:'"Natural, beautiful candid shots." — 4.8★ (78)', category:'Photography' },
    { id:'v-p3', name:'Azure Films', emoji:'🎬', location:'Downtown Miami', price:'$3,000–$8,000', priceNum:5500, services:['Cinematic Video','Highlight Reels','Live Streaming'], review:'"Our highlight reel made us cry." — 4.9★ (31)', category:'Photography' }
  ],
  Entertainment: [
    { id:'v-e1', name:'DJ Fuego Miami', emoji:'🎧', location:'South Beach, Miami', price:'$1,200–$3,000', priceNum:2000, services:['DJ Set','MC Services','Lighting','Sound System'], review:'"Dance floor was packed all night." — 4.9★ (192)', category:'Entertainment' },
    { id:'v-e2', name:'Salsa Soul Band', emoji:'🎺', location:'Little Havana, Miami', price:'$2,000–$5,000', priceNum:3500, services:['Live Latin Band','Salsa','Merengue','Jazz'], review:'"The live band was incredible!" — 5.0★ (56)', category:'Entertainment' }
  ],
  Decor: [
    { id:'v-d1', name:'Luxe Event Decor', emoji:'🪩', location:'Midtown Miami', price:'$2,000–$10,000', priceNum:6000, services:['Full Setup','Lighting Design','Table Decor','Backdrops'], review:'"Transformed the venue completely." — 4.9★ (67)', category:'Decor' },
    { id:'v-d2', name:'Balloon Artistry MIA', emoji:'🎈', location:'Doral, Miami', price:'$500–$2,000', priceNum:1200, services:['Balloon Arches','Columns','Organic Walls','Custom Designs'], review:'"Every balloon arch was perfect." — 4.7★ (144)', category:'Decor' }
  ],
  Bakeries: [
    { id:'v-b1', name:'Dulce Dreams Bakery', emoji:'🎂', location:'Coral Way, Miami', price:'$300–$2,500', priceNum:800, services:['Custom Cakes','Cupcake Towers','Dessert Tables','Macarons'], review:'"Our wedding cake was a masterpiece." — 5.0★ (211)', category:'Bakeries' }
  ],
  Bartending: [
    { id:'v-bt1', name:'Cocktail Cartel', emoji:'🍸', location:'Wynwood, Miami', price:'$800–$2,500', priceNum:1500, services:['Full Bar Service','Signature Cocktails','Staff','Equipment'], review:'"Best signature cocktails at any wedding." — 4.8★ (88)', category:'Bartending' }
  ],
  Security: [
    { id:'v-s1', name:'Shield Event Security', emoji:'🛡️', location:'Downtown Miami', price:'$500–$2,000', priceNum:1000, services:['Licensed Guards','Crowd Management','VIP Protection'], review:'"Professional and discreet." — 4.7★ (42)', category:'Security' }
  ]
};

const VENDOR_CATEGORIES = [
  { key:'Florists',       emoji:'🌸', label:'Florists' },
  { key:'Catering',       emoji:'🍽️', label:'Catering' },
  { key:'Photography',    emoji:'📸', label:'Photography' },
  { key:'Entertainment',  emoji:'🎵', label:'Entertainment' },
  { key:'Decor',          emoji:'🪩', label:'Decor' },
  { key:'Bakeries',       emoji:'🎂', label:'Bakeries' },
  { key:'Bartending',     emoji:'🍸', label:'Bartending' },
  { key:'Security',       emoji:'🛡️', label:'Security' }
];

const EVENT_TYPES = [
  { type:'Wedding',      icon:'💍' },
  { type:'Anniversary',  icon:'🥂' },
  { type:'Birthday',     icon:'🎂' },
  { type:'Conference',   icon:'🎤' },
  { type:'Date Night',   icon:'✨' },
  { type:'Quinceañera',  icon:'👑' },
  { type:'Corporate',    icon:'🏢' },
  { type:'Baby Shower',  icon:'🍼' }
];

const CARD_BG = {
  '🌸':'#2a1a2e','🌺':'#2a1510','🌴':'#0a2215','🌿':'#0d1f0d',
  '📸':'#0d1520','🥭':'#201a08','🎬':'#0a0f20','🎧':'#150820',
  '🎺':'#1a0a08','🪩':'#0a1520','🎈':'#201008','🎂':'#1a0f1a',
  '🍸':'#0a1508','🛡️':'#0f1520','🍤':'#1a1008','🥥':'#0f1a0f','🫔':'#1a0f08'
};

function getVendorById(id) {
  for (const cat of Object.values(VENDOR_DATA)) {
    const v = cat.find(v => v.id === id);
    if (v) return v;
  }
  return null;
}

// Demo initial events
const DEMO_EVENTS = [
  {
    id: 'evt-demo1',
    name: "Sofia & Marco's Wedding",
    type: 'Wedding',
    icon: '💍',
    date: '2025-10-18',
    time: '18:00',
    location: 'Miami Beach, FL',
    guests: 150,
    budget: 25000,
    confirmedVendors: [
      { vendorId:'v-f1', category:'Florists', cost:3500 }
    ],
    potentialChats: ['v-f1','v-e1','v-p1'],
    chats: {
      'v-f1': [
        { from:'them', text:"Hi! Thanks for reaching out. We'd love to help with your wedding florals. What's your vision?", time:'10:32 AM' },
        { from:'me',   text:"We're thinking lush tropical arrangements with white orchids and greenery. Does that sound like something you can do?", time:'10:45 AM' },
        { from:'them', text:"Absolutely! Tropical-luxe is one of our specialties. We can do a full arch, ceremony decor, and centerpieces. Shall we schedule a consultation?", time:'11:02 AM' }
      ],
      'v-e1': [],
      'v-p1': []
    },
    openedChats: ['v-f1'],
    lockedCategories: ['Florists'],
    swipedIds: ['v-f1','v-f2','v-e1','v-e2','v-p1'],
    budgetUsed: 3500,
    inviteCode: 'MIA-7X4K',
    planners: ['Sofia M.', 'Marco R.']
  },
  {
    id: 'evt-demo2',
    name: "Isabella's 30th Birthday",
    type: 'Birthday',
    icon: '🎂',
    date: '2025-08-20',
    time: '20:00',
    location: 'Wynwood, Miami',
    guests: 80,
    budget: 8000,
    confirmedVendors: [],
    potentialChats: ['v-bt1'],
    chats: { 'v-bt1': [] },
    openedChats: [],
    lockedCategories: [],
    swipedIds: ['v-bt1'],
    budgetUsed: 0,
    inviteCode: 'MIA-9R2W',
    planners: ['Isabella K.']
  },
  {
    id: 'evt-demo3',
    name: 'Tech Summit Miami 2025',
    type: 'Conference',
    icon: '🎤',
    date: '2025-11-12',
    time: '09:00',
    location: 'Brickell, Miami',
    guests: 300,
    budget: 50000,
    confirmedVendors: [
      { vendorId:'v-c1', category:'Catering', cost:6500 },
      { vendorId:'v-s1', category:'Security', cost:1000 }
    ],
    potentialChats: ['v-c1','v-s1','v-p2'],
    chats: {
      'v-c1': [
        { from:'me',   text:"Hi! We're planning a 300-person conference and need full catering. Do you handle large corporate events?", time:'9:15 AM' },
        { from:'them', text:"Yes! Corporate events are our specialty. We can do full-day catering with breakfast, lunch, and afternoon breaks.", time:'9:28 AM' }
      ],
      'v-s1': [
        { from:'me',   text:"We need security for a tech conference — access control, badge checking, and crowd management.", time:'2:10 PM' },
        { from:'them', text:"Perfect, we handle all of that. We'll send over a formal proposal.", time:'2:45 PM' }
      ],
      'v-p2': []
    },
    openedChats: ['v-c1','v-s1'],
    lockedCategories: ['Catering','Security'],
    swipedIds: ['v-c1','v-c2','v-s1','v-p2'],
    budgetUsed: 7500,
    inviteCode: 'MIA-4T8P',
    planners: ['Jordan L.', 'Priya N.', 'Carlos V.']
  }
];
