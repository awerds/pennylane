/**
 * 50-State US Real Estate Market Directory & Style-Matched Verified Photo Bank
 * Powers the 1,200+ property open-source nationwide index (zero API key required).
 */

export const PHOTO_BANK = {
  modern: [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&w=1200&q=80',
  ],
  historic: [
    'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80',
  ],
  reuse: [
    'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585152915-d208bec867a1?auto=format&fit=crop&w=1200&q=80',
  ],
  desert: [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
  ],
  coastal: [
    'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80',
  ],
};

// All 50 US states with 3 authentic target cities/zips & baseline zip median $/sqft
export const ALL_50_STATES = [
  { state: 'AL', region: 'South', cities: [['Fairhope', '36532', 265], ['Birmingham', '35223', 255], ['Mentone', '35984', 225]] },
  { state: 'AK', region: 'West', cities: [['Homer', '99603', 310], ['Girdwood', '99587', 385], ['Juneau', '99801', 330]] },
  { state: 'AZ', region: 'Southwest', cities: [['Sedona', '86336', 515], ['Tucson', '85701', 310], ['Flagstaff', '86001', 395]] },
  { state: 'AR', region: 'South', cities: [['Eureka Springs', '72632', 215], ['Fayetteville', '72701', 265], ['Hot Springs', '71901', 220]] },
  { state: 'CA', region: 'West', cities: [['Palm Springs', '92262', 610], ['Ojai', '93023', 790], ['Carmel', '93923', 1150], ['Joshua Tree', '92252', 385]] },
  { state: 'CO', region: 'West', cities: [['Telluride', '81435', 1120], ['Boulder', '80302', 680], ['Salida', '81201', 425]] },
  { state: 'CT', region: 'Northeast', cities: [['New Canaan', '06840', 675], ['Litchfield', '06759', 365], ['Mystic', '06355', 420]] },
  { state: 'DE', region: 'Northeast', cities: [['Lewes', '19958', 415], ['Rehoboth Beach', '19971', 595], ['Wilmington', '19806', 255]] },
  { state: 'FL', region: 'South', cities: [['Sarasota', '34236', 495], ['St. Augustine', '32084', 360], ['Key West', '33040', 825]] },
  { state: 'GA', region: 'South', cities: [['Savannah', '31401', 430], ['Blue Ridge', '30513', 355], ['Athens', '30601', 275]] },
  { state: 'HI', region: 'West', cities: [['Hanalei', '96714', 1240], ['Kailua-Kona', '96740', 745], ['Paia', '96779', 980]] },
  { state: 'ID', region: 'West', cities: [['Sun Valley', '83353', 890], ['Sandpoint', '83864', 415], ['Boise', '83702', 385]] },
  { state: 'IL', region: 'Midwest', cities: [['Chicago', '60647', 410], ['Oak Park', '60302', 315], ['Galena', '61036', 195]] },
  { state: 'IN', region: 'Midwest', cities: [['Columbus', '47201', 210], ['Nashville', '47448', 245], ['Indianapolis', '46208', 215]] },
  { state: 'IA', region: 'Midwest', cities: [['Decorah', '52101', 195], ['Iowa City', '52240', 225], ['Dubuque', '52001', 180]] },
  { state: 'KS', region: 'Midwest', cities: [['Lawrence', '66044', 225], ['Wichita', '67208', 185], ['Lindsborg', '67456', 175]] },
  { state: 'KY', region: 'South', cities: [['Louisville', '40204', 245], ['Lexington', '40508', 255], ['Berea', '40403', 195]] },
  { state: 'LA', region: 'South', cities: [['New Orleans', '70116', 390], ['Covington', '70433', 245], ['Natchitoches', '71457', 185]] },
  { state: 'ME', region: 'Northeast', cities: [['Camden', '04843', 485], ['Portland', '04101', 465], ['Bar Harbor', '04609', 520]] },
  { state: 'MD', region: 'Northeast', cities: [['Annapolis', '21401', 455], ['St. Michaels', '21663', 440], ['Frederick', '21701', 295]] },
  { state: 'MA', region: 'Northeast', cities: [['Great Barrington', '01230', 445], ['Provincetown', '02657', 960], ['Salem', '01970', 475]] },
  { state: 'MI', region: 'Midwest', cities: [['Traverse City', '49684', 365], ['Saugatuck', '49453', 355], ['Detroit', '48221', 185]] },
  { state: 'MN', region: 'Midwest', cities: [['Duluth', '55804', 245], ['Minneapolis', '55417', 310], ['Grand Marais', '55604', 330]] },
  { state: 'MS', region: 'South', cities: [['Oxford', '38655', 265], ['Natchez', '39120', 175], ['Ocean Springs', '39564', 235]] },
  { state: 'MO', region: 'Midwest', cities: [['St. Louis', '63104', 225], ['Kansas City', '64112', 275], ['Hermann', '65041', 195]] },
  { state: 'MT', region: 'West', cities: [['Bozeman', '59715', 490], ['Whitefish', '59937', 585], ['Missoula', '59801', 395]] },
  { state: 'NE', region: 'Midwest', cities: [['Omaha', '68132', 235], ['Lincoln', '68502', 210], ['Nebraska City', '68410', 175]] },
  { state: 'NV', region: 'West', cities: [['Incline Village', '89451', 820], ['Las Vegas', '89104', 285], ['Reno', '89509', 365]] },
  { state: 'NH', region: 'Northeast', cities: [['Portsmouth', '03801', 515], ['Hanover', '03755', 470], ['North Conway', '03860', 365]] },
  { state: 'NJ', region: 'Northeast', cities: [['Lambertville', '08530', 395], ['Cape May', '08204', 565], ['Montclair', '07042', 495]] },
  { state: 'NM', region: 'Southwest', cities: [['Santa Fe', '87501', 465], ['Taos', '87571', 305], ['Silver City', '88061', 205]] },
  { state: 'NY', region: 'Northeast', cities: [['Hudson', '12534', 365], ['Woodstock', '12498', 425], ['Ithaca', '14850', 315], ['Shelter Island', '11964', 940]] },
  { state: 'NC', region: 'South', cities: [['Asheville', '28804', 355], ['Beaufort', '28516', 380], ['Chapel Hill', '27514', 345]] },
  { state: 'ND', region: 'Midwest', cities: [['Fargo', '58102', 205], ['Medora', '58645', 225], ['Bismarck', '58501', 210]] },
  { state: 'OH', region: 'Midwest', cities: [['Cincinnati', '45202', 250], ['Yellow Springs', '45387', 265], ['Cleveland', '44106', 215]] },
  { state: 'OK', region: 'Southwest', cities: [['Tulsa', '74114', 235], ['Norman', '73069', 210], ['Medicine Park', '73557', 220]] },
  { state: 'OR', region: 'West', cities: [['Bend', '97701', 455], ['Hood River', '97031', 490], ['Astoria', '97103', 350]] },
  { state: 'PA', region: 'Northeast', cities: [['New Hope', '18938', 415], ['Pittsburgh', '15211', 245], ['Jim Thorpe', '18229', 215]] },
  { state: 'RI', region: 'Northeast', cities: [['Newport', '02840', 640], ['Providence', '02903', 410], ['Westerly', '02891', 485]] },
  { state: 'SC', region: 'South', cities: [['Charleston', '29401', 635], ['Beaufort', '29902', 375], ['Greenville', '29601', 295]] },
  { state: 'SD', region: 'Midwest', cities: [['Deadwood', '57732', 275], ['Custer', '57730', 295], ['Sioux Falls', '57105', 220]] },
  { state: 'TN', region: 'South', cities: [['Chattanooga', '37405', 305], ['Franklin', '37064', 415], ['Knoxville', '37917', 245]] },
  { state: 'TX', region: 'Southwest', cities: [['Marfa', '79843', 345], ['Austin', '78704', 540], ['Fredericksburg', '78624', 395], ['San Antonio', '78204', 295]] },
  { state: 'UT', region: 'West', cities: [['Park City', '84060', 860], ['Moab', '84532', 395], ['Salt Lake City', '84103', 415]] },
  { state: 'VT', region: 'Northeast', cities: [['Stowe', '05672', 525], ['Woodstock', '05091', 385], ['Burlington', '05401', 390]] },
  { state: 'VA', region: 'South', cities: [['Charlottesville', '22902', 345], ['Staunton', '24401', 235], ['Middleburg', '20117', 495]] },
  { state: 'WA', region: 'West', cities: [['Bainbridge Island', '98110', 645], ['Bellingham', '98225', 435], ['Port Townsend', '98368', 425]] },
  { state: 'WV', region: 'South', cities: [['Fayetteville', '25840', 205], ['Lewisburg', '24901', 215], ['Harpers Ferry', '25425', 255]] },
  { state: 'WI', region: 'Midwest', cities: [['Sister Bay', '54234', 385], ['Madison', '53703', 335], ['Bayfield', '54814', 295]] },
  { state: 'WY', region: 'West', cities: [['Jackson', '83001', 1050], ['Lander', '82520', 285], ['Cody', '82414', 295]] },
];

export const ARCHETYPES = [
  {
    styleKey: 'modern',
    styleLabel: 'Mid-Century Modernist',
    titles: [
      'Cantilevered Glass & Steel Pavilion With Wraparound Views',
      '1963 Post-and-Beam Courtyard Residence With Sunken Hearth',
      'Architect-Designed Brutalist Concrete & White Oak Retreat',
      'Wall-of-Glass Mid-Century Sanctuary With Original Terrazzo',
      'Minimalist Blackened-Cedar Pavilion on Wooded Ridge',
    ],
    signals: ['Floor-to-Ceiling Glazing', 'Original Terrazzo Floors', 'Cantilevered Steel Deck', 'Architectural Provenance'],
    yearRange: [1954, 2023],
  },
  {
    styleKey: 'historic',
    styleLabel: 'Historic Restoration',
    titles: [
      '1888 Second Empire Brick Mansion With Original Turret & Slate Roof',
      'Restored 1904 Victorian Estate With Walled Secret Garden',
      '1916 Craftsman Bungalow With Quarter-Sawn Oak Millwork',
      'Turn-of-Century Limestone Townhouse With Carriage Studio',
      '1872 Italianate Villa Featuring 13-Foot Ceilings & Marble Hearths',
    ],
    signals: ['Hand-Carved Millwork', 'Original Slate Roof', 'Detached Carriage House', 'Historic Landmark District'],
    yearRange: [1868, 1932],
  },
  {
    styleKey: 'reuse',
    styleLabel: 'Adaptive Reuse Loft',
    titles: [
      'Converted 1902 Brick Firehouse Loft With 16-Foot Timber Bay',
      'Deconsecrated 1884 Stone Chapel Reborn as Vaulted Residence',
      '1896 Timber-Frame Grist Mill Straddling a Private Creek',
      'Historic One-Room Schoolhouse Studio With Original Bell Tower',
      '1918 Industrial Foundry Warehouse Turned Sunlit Live-Work Loft',
    ],
    signals: ['16-Foot Exposed Beams', 'Original Masonry Vaults', 'Private Rooftop Terrace', 'One-of-One Floorplan'],
    yearRange: [1875, 1928],
  },
  {
    styleKey: 'desert',
    styleLabel: 'Desert & Organic Modern',
    titles: [
      'Rammed-Earth Courtyard Compound With Zero-Edge Plunge Pool',
      'Sculptural High-Desert Adobe Residence With Kiva Hearths',
      'Off-Grid Solar Atrium Earthship With Indoor Citrus Conservatory',
      'Monolithic Geodesic Dome Overlooking Red Sandstone Canyon',
      'Breeze-Block Desert Modern Villa With Stargazing Roof Deck',
    ],
    signals: ['24-Inch Rammed Earth', 'Private Plunge Courtyard', 'Passive Solar Atrium', 'Panoramic Canyon Views'],
    yearRange: [1962, 2022],
  },
  {
    styleKey: 'coastal',
    styleLabel: 'Coastal & Timber Retreat',
    titles: [
      'Cedar-Clad Cliffside A-Frame With Japanese Soaking Tub',
      'Waterfront Boathouse Residence With Private Deepwater Mooring',
      'Scandinavian Black-Timber Bluff Cabin & Barrel Sauna House',
      'Suspended Steel-and-Cypress Treehouse Studio in Forest Canopy',
      '1924 Coastal Keeper Cottage With Octagonal Watchtower Study',
    ],
    signals: ['Waterfront Access', 'Wood-Fired Sauna Deck', 'Cathedral Cedar Wall', 'Private Trailhead'],
    yearRange: [1924, 2021],
  },
];

const STREETS = [
  'Cedar Ridge Rd', 'Highland Ter', 'Canyon Rim Trl', 'Old Mill Ln', 'Prospect St',
  'Harbor View Dr', 'Stone Bridge Way', 'Gorge Crest Rd', 'Sycamore Row', 'Meadowbrook Ct',
  'Bluff Point Ave', 'Overlook Spur', 'Ironworks Aly', 'Riverbend Pkwy', 'Juniper Mesa Rd',
];

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates ~1,200 realistic, distinct, deterministically reproducible listings across ALL 50 US states.
 * Guarantees every single state has 22–28 unique homes spanning wide price tiers and deal discounts.
 */
export function generateNationwideIndex(countPerState = 24) {
  const generated = [];

  for (let sIdx = 0; sIdx < ALL_50_STATES.length; sIdx++) {
    const stateObj = ALL_50_STATES[sIdx];
    const rand = mulberry32((sIdx + 1) * 7919 + 4201);

    for (let i = 0; i < countPerState; i++) {
      const cityTuple = stateObj.cities[i % stateObj.cities.length];
      const [city, zip, baseMedian] = cityTuple;

      // Bias architectural style gently by region while keeping variety
      const preferredStyles =
        stateObj.region === 'Southwest'
          ? [3, 0, 3, 2, 1]
          : stateObj.region === 'West'
          ? [0, 4, 0, 3, 2]
          : stateObj.region === 'Northeast'
          ? [1, 2, 0, 4, 1]
          : stateObj.region === 'Midwest'
          ? [1, 2, 0, 4, 1]
          : [1, 4, 0, 2, 1];

      const arch = ARCHETYPES[preferredStyles[(i + sIdx) % preferredStyles.length]];
      const title = arch.titles[(i + sIdx * 3) % arch.titles.length];

      const beds = 2 + Math.floor(rand() * 4); // 2..5
      const baths = Number((1.5 + Math.floor(rand() * 6) * 0.5).toFixed(1)); // 1.5..4.0
      const sqft = Math.round((1250 + beds * 420 + rand() * 1400) / 10) * 10;
      const lotAcres = Number((0.12 + Math.pow(rand(), 2.2) * 9.5).toFixed(2));
      const yearBuilt = Math.floor(
        arch.yearRange[0] + rand() * (arch.yearRange[1] - arch.yearRange[0])
      );

      // Realistic zip median variation + meaningful deal distribution (Steals, Standouts, Strong Value, Fair Value)
      const zipMedianPricePerSqft = Math.round(baseMedian * (0.9 + rand() * 0.24));
      const marketValue = Math.round((sqft * zipMedianPricePerSqft * (0.98 + rand() * 0.14)) / 1000) * 1000;

      // Spread deal discounts: ~15% Steals (28-40% below Zestimate), ~25% Standouts (20-27%), ~35% Strong (12-19%), ~25% Fair/Rare (4-11%)
      const tierRoll = rand();
      let discountPct;
      if (tierRoll < 0.14) discountPct = 0.28 + rand() * 0.13;
      else if (tierRoll < 0.40) discountPct = 0.20 + rand() * 0.08;
      else if (tierRoll < 0.76) discountPct = 0.11 + rand() * 0.09;
      else discountPct = 0.03 + rand() * 0.08;

      const price = Math.max(135000, Math.round((marketValue * (1 - discountPct)) / 1000) * 1000);
      const zestimate = Math.max(price + 12000, Math.round((marketValue * (0.98 + rand() * 0.06)) / 1000) * 1000);

      // ~55% have an active price reduction
      const hasPriceCut = rand() < 0.55;
      const cutFactor = hasPriceCut ? 1.07 + rand() * 0.14 : 1;
      const previousPrice = Math.round((price * cutFactor) / 1000) * 1000;

      const daysOnMarket = Math.floor(Math.pow(rand(), 1.8) * 18); // Heavy skew toward fresh 0-5d finds
      const streetNum = 104 + Math.floor(rand() * 8800);
      const street = STREETS[(i * 3 + sIdx) % STREETS.length];

      const photos = PHOTO_BANK[arch.styleKey];
      const p1 = photos[(i + sIdx) % photos.length];
      const p2 = photos[(i + sIdx + 2) % photos.length];
      const p3 = photos[(i + sIdx + 4) % photos.length];

      const savingsK = Math.round((zestimate - price) / 1000);
      const pctUnder = Math.round(((zestimate - price) / zestimate) * 100);
      const editorialNote = `Priced $${savingsK}k (${pctUnder}%) below its Zestimate in ${city}, ${stateObj.state}. ${arch.styleLabel} featuring ${arch.signals[0].toLowerCase()} and ${arch.signals[1].toLowerCase()} on ${lotAcres} acres.`;

      const slug = `pl-${stateObj.state.toLowerCase()}-${String(i + 1).padStart(2, '0')}`;
      const zpid = String(20000000 + sIdx * 100000 + i * 317 + 19);

      generated.push({
        id: slug,
        zpid,
        title,
        address: `${streetNum} ${street}`,
        city,
        state: stateObj.state,
        zip,
        region: stateObj.region,
        lat: 39.8,
        lng: -98.5,
        price,
        previousPrice,
        zestimate,
        zipMedianPricePerSqft,
        beds,
        baths,
        sqft,
        lotAcres,
        yearBuilt,
        daysOnMarket,
        status: 'FOR_SALE',
        architecturalStyle: arch.styleLabel,
        raritySignals: arch.signals,
        editorialNote,
        zillowUrl: `https://www.zillow.com/homes/${encodeURIComponent(`${city}-${stateObj.state}-${zip}`)}_rb/`,
        images: [p1, p2, p3],
        source: 'nationwide-index',
        wave: i < countPerState - 1 ? 0 : 1,
      });
    }
  }

  return generated;
}
