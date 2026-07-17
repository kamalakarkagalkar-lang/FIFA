/**
 * mockData.js
 * Static stadium data and lookup catalogs for MetLife Stadium (FIFA 2026 Edition)
 */

// FIFA World Cup 2026 Match Schedule - All Stadiums
export const worldCup2026Matches = [
  // MetLife Stadium (Group Stage & Knockout)
  { id: "match-001", stadium: "MetLife Stadium", stage: "Group Stage", round: "A1", date: "2026-06-12", kickoffTime: "18:00 EDT", homeTeam: "USA", awayTeam: "Mexico", homeFlag: "🇺🇸", awayFlag: "🇲🇽", score: { home: 3, away: 0 }, status: "COMPLETED" },
  { id: "match-002", stadium: "MetLife Stadium", stage: "Group Stage", round: "A2", date: "2026-06-16", kickoffTime: "20:00 EDT", homeTeam: "USA", awayTeam: "Canada", homeFlag: "🇺🇸", awayFlag: "🇨🇦", score: { home: 2, away: 1 }, status: "COMPLETED" },
  { id: "match-039", stadium: "MetLife Stadium", stage: "Quarter-Finals", round: "QF1", date: "2026-07-09", kickoffTime: "20:00 EDT", homeTeam: "USA", awayTeam: "England", homeFlag: "🇺🇸", awayFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", score: { home: 2, away: 1 }, status: "LIVE" },

  // SoFi Stadium
  { id: "match-003", stadium: "SoFi Stadium", stage: "Group Stage", round: "B1", date: "2026-06-13", kickoffTime: "16:00 PDT", homeTeam: "Argentina", awayTeam: "Saudi Arabia", homeFlag: "🇦🇷", awayFlag: "🇸🇦", score: { home: 3, away: 1 }, status: "COMPLETED" },
  { id: "match-004", stadium: "SoFi Stadium", stage: "Group Stage", round: "B2", date: "2026-06-17", kickoffTime: "19:00 PDT", homeTeam: "Argentina", awayTeam: "Poland", homeFlag: "🇦🇷", awayFlag: "🇵🇱", score: { home: 2, away: 0 }, status: "COMPLETED" },
  { id: "match-041", stadium: "SoFi Stadium", stage: "Semi-Finals", round: "SF1", date: "2026-07-14", kickoffTime: "19:00 PDT", homeTeam: "USA", awayTeam: "France", homeFlag: "🇺🇸", awayFlag: "🇫🇷", score: { home: 0, away: 0 }, status: "SCHEDULED" },

  // Levi's Stadium
  { id: "match-005", stadium: "Levi's Stadium", stage: "Group Stage", round: "C1", date: "2026-06-14", kickoffTime: "16:00 PDT", homeTeam: "Brazil", awayTeam: "Serbia", homeFlag: "🇧🇷", awayFlag: "🇷🇸", score: { home: 2, away: 0 }, status: "COMPLETED" },
  { id: "match-006", stadium: "Levi's Stadium", stage: "Group Stage", round: "C2", date: "2026-06-18", kickoffTime: "18:00 PDT", homeTeam: "Brazil", awayTeam: "Switzerland", homeFlag: "🇧🇷", awayFlag: "🇨🇭", score: { home: 1, away: 0 }, status: "COMPLETED" },
  { id: "match-040", stadium: "Levi's Stadium", stage: "Semi-Finals", round: "SF2", date: "2026-07-15", kickoffTime: "19:00 PDT", homeTeam: "Brazil", awayTeam: "Spain", homeFlag: "🇧🇷", awayFlag: "🇪🇸", score: { home: 0, away: 0 }, status: "SCHEDULED" },

  // AT&T Stadium
  { id: "match-007", stadium: "AT&T Stadium", stage: "Group Stage", round: "D1", date: "2026-06-15", kickoffTime: "19:00 CDT", homeTeam: "Germany", awayTeam: "Netherlands", homeFlag: "🇩🇪", awayFlag: "🇳🇱", score: { home: 2, away: 1 }, status: "COMPLETED" },
  { id: "match-008", stadium: "AT&T Stadium", stage: "Group Stage", round: "D2", date: "2026-06-19", kickoffTime: "20:00 CDT", homeTeam: "Germany", awayTeam: "Belgium", homeFlag: "🇩🇪", awayFlag: "🇧🇪", score: { home: 3, away: 0 }, status: "COMPLETED" },

  // NRG Stadium
  { id: "match-009", stadium: "NRG Stadium", stage: "Group Stage", round: "E1", date: "2026-06-20", kickoffTime: "19:00 CDT", homeTeam: "France", awayTeam: "Australia", homeFlag: "🇫🇷", awayFlag: "🇦🇺", score: { home: 2, away: 1 }, status: "COMPLETED" },
  { id: "match-010", stadium: "NRG Stadium", stage: "Group Stage", round: "E2", date: "2026-06-24", kickoffTime: "20:00 CDT", homeTeam: "France", awayTeam: "Peru", homeFlag: "🇫🇷", awayFlag: "🇵🇪", score: { home: 2, away: 0 }, status: "COMPLETED" },

  // Mercedes-Benz Stadium
  { id: "match-011", stadium: "Mercedes-Benz Stadium", stage: "Group Stage", round: "F1", date: "2026-06-21", kickoffTime: "19:00 EDT", homeTeam: "Spain", awayTeam: "Costa Rica", homeFlag: "🇪🇸", awayFlag: "🇨🇷", score: { home: 3, away: 0 }, status: "COMPLETED" },
  { id: "match-012", stadium: "Mercedes-Benz Stadium", stage: "Group Stage", round: "F2", date: "2026-06-25", kickoffTime: "20:00 EDT", homeTeam: "Spain", awayTeam: "Germany", homeFlag: "🇪🇸", awayFlag: "🇩🇪", score: { home: 1, away: 1 }, status: "COMPLETED" },

  // Hard Rock Stadium
  { id: "match-013", stadium: "Hard Rock Stadium", stage: "Group Stage", round: "G1", date: "2026-06-22", kickoffTime: "19:00 EDT", homeTeam: "Italy", awayTeam: "Japan", homeFlag: "🇮🇹", awayFlag: "🇯🇵", score: { home: 2, away: 1 }, status: "COMPLETED" },
  { id: "match-014", stadium: "Hard Rock Stadium", stage: "Round of 16", round: "R16-1", date: "2026-07-01", kickoffTime: "19:00 EDT", homeTeam: "Argentina", awayTeam: "Netherlands", homeFlag: "🇦🇷", awayFlag: "🇳🇱", score: { home: 2, away: 1 }, status: "COMPLETED" },

  // Arrowhead Stadium
  { id: "match-015", stadium: "Arrowhead Stadium", stage: "Group Stage", round: "G2", date: "2026-06-26", kickoffTime: "19:00 CDT", homeTeam: "Italy", awayTeam: "Croatia", homeFlag: "🇮🇹", awayFlag: "🇭🇷", score: { home: 2, away: 1 }, status: "COMPLETED" },
  { id: "match-016", stadium: "Arrowhead Stadium", stage: "Round of 16", round: "R16-2", date: "2026-07-02", kickoffTime: "20:00 CDT", homeTeam: "Brazil", awayTeam: "Japan", homeFlag: "🇧🇷", awayFlag: "🇯🇵", score: { home: 3, away: 0 }, status: "COMPLETED" },

  // Gillette Stadium
  { id: "match-017", stadium: "Gillette Stadium", stage: "Group Stage", round: "H1", date: "2026-06-27", kickoffTime: "19:00 EDT", homeTeam: "Portugal", awayTeam: "Ghana", homeFlag: "🇵🇹", awayFlag: "🇬🇭", score: { home: 3, away: 2 }, status: "COMPLETED" },
  { id: "match-018", stadium: "Gillette Stadium", stage: "Round of 16", round: "R16-3", date: "2026-07-03", kickoffTime: "20:00 EDT", homeTeam: "France", awayTeam: "Poland", homeFlag: "🇫🇷", awayFlag: "🇵🇱", score: { home: 3, away: 1 }, status: "COMPLETED" },

  // Lumen Field
  { id: "match-019", stadium: "Lumen Field", stage: "Group Stage", round: "H2", date: "2026-06-28", kickoffTime: "16:00 PDT", homeTeam: "Portugal", awayTeam: "Uruguay", homeFlag: "🇵🇹", awayFlag: "🇺🇾", score: { home: 2, away: 1 }, status: "COMPLETED" },
  { id: "match-020", stadium: "Lumen Field", stage: "Quarter-Finals", round: "QF2", date: "2026-07-10", kickoffTime: "19:00 PDT", homeTeam: "Argentina", awayTeam: "Germany", homeFlag: "🇦🇷", awayFlag: "🇩🇪", score: { home: 0, away: 0 }, status: "SCHEDULED" },

  // Lincoln Financial Field
  { id: "match-021", stadium: "Lincoln Financial Field", stage: "Round of 16", round: "R16-4", date: "2026-07-04", kickoffTime: "19:00 EDT", homeTeam: "Germany", awayTeam: "Canada", homeFlag: "🇩🇪", awayFlag: "🇨🇦", score: { home: 3, away: 0 }, status: "COMPLETED" },
  { id: "match-023", stadium: "Lincoln Financial Field", stage: "Quarter-Finals", round: "QF3", date: "2026-07-11", kickoffTime: "19:00 EDT", homeTeam: "France", awayTeam: "Italy", homeFlag: "🇫🇷", awayFlag: "🇮🇹", score: { home: 0, away: 0 }, status: "SCHEDULED" },

  // BMO Field (Toronto)
  { id: "match-022", stadium: "BMO Field", stage: "Round of 16", round: "R16-5", date: "2026-07-05", kickoffTime: "19:00 EDT", homeTeam: "Spain", awayTeam: "Belgium", homeFlag: "🇪🇸", awayFlag: "🇧🇪", score: { home: 2, away: 1 }, status: "COMPLETED" },
  { id: "match-024", stadium: "BMO Field", stage: "Quarter-Finals", round: "QF4", date: "2026-07-12", kickoffTime: "19:00 EDT", homeTeam: "Spain", awayTeam: "Portugal", homeFlag: "🇪🇸", awayFlag: "🇵🇹", score: { home: 0, away: 0 }, status: "SCHEDULED" },

  // Estadio Azteca (Mexico City)
  { id: "match-025", stadium: "Estadio Azteca", stage: "Group Stage", round: "A3", date: "2026-06-23", kickoffTime: "19:00 CDT", homeTeam: "Mexico", awayTeam: "Canada", homeFlag: "🇲🇽", awayFlag: "🇨🇦", score: { home: 2, away: 1 }, status: "COMPLETED" },
  { id: "match-042", stadium: "Estadio Azteca", stage: "Final", round: "FINAL", date: "2026-07-19", kickoffTime: "17:00 CDT", homeTeam: "USA", awayTeam: "Brazil", homeFlag: "🇺🇸", awayFlag: "🇧🇷", score: { home: 0, away: 0 }, status: "SCHEDULED" },

  // Estadio BBVA (Monterrey)
  { id: "match-026", stadium: "Estadio BBVA", stage: "Group Stage", round: "A4", date: "2026-06-28", kickoffTime: "20:00 CDT", homeTeam: "USA", awayTeam: "Canada", homeFlag: "🇺🇸", awayFlag: "🇨🇦", score: { home: 1, away: 0 }, status: "COMPLETED" },

  // Estadio Akron (Guadalajara)
  { id: "match-027", stadium: "Estadio Akron", stage: "Group Stage", round: "B3", date: "2026-06-29", kickoffTime: "18:00 CDT", homeTeam: "Mexico", awayTeam: "Saudi Arabia", homeFlag: "🇲🇽", awayFlag: "🇸🇦", score: { home: 2, away: 0 }, status: "COMPLETED" },

  // BC Place (Vancouver)
  { id: "match-028", stadium: "BC Place", stage: "Group Stage", round: "C3", date: "2026-06-30", kickoffTime: "16:00 PDT", homeTeam: "Canada", awayTeam: "Serbia", homeFlag: "🇨🇦", awayFlag: "🇷🇸", score: { home: 1, away: 0 }, status: "COMPLETED" }
];

export const matchDetails = {
  id: "wc2026-qf1",
  homeTeam: "USA",
  awayTeam: "England",
  stage: "Quarter-Finals",
  date: "July 9, 2026",
  kickoffTime: "20:00 EST",
  currentStatus: "LIVE - 72'",
  score: { home: 2, away: 1 },
  attendance: 82500,
  stadiumCapacity: 82500,
  weather: {
    temp: "74°F (23°C)",
    condition: "Clear Sky",
    humidity: "62%",
    wind: "8 mph ENE"
  }
};

export const worldCup2026Stadiums = [
  { name: "MetLife Stadium", city: "New York / New Jersey", country: "United States", capacity: "82,500", flag: "🇺🇸", url: "https://www.metlifestadium.com/" },
  { name: "SoFi Stadium", city: "Inglewood", country: "United States", capacity: "70,240", flag: "🇺🇸", url: "https://www.sofistadium.com/" },
  { name: "Levi's Stadium", city: "Santa Clara", country: "United States", capacity: "68,500", flag: "🇺🇸", url: "https://www.levisstadium.com/" },
  { name: "AT&T Stadium", city: "Arlington", country: "United States", capacity: "80,000", flag: "🇺🇸", url: "https://www.attstadium.com/" },
  { name: "NRG Stadium", city: "Houston", country: "United States", capacity: "72,220", flag: "🇺🇸", url: "https://www.nrgpark.com/venues/nrg-stadium" },
  { name: "Mercedes-Benz Stadium", city: "Atlanta", country: "United States", capacity: "71,000", flag: "🇺🇸", url: "https://www.mercedesbenzstadium.com/" },
  { name: "Hard Rock Stadium", city: "Miami Gardens", country: "United States", capacity: "65,326", flag: "🇺🇸", url: "https://www.hardrockstadium.com/" },
  { name: "Arrowhead Stadium", city: "Kansas City", country: "United States", capacity: "76,416", flag: "🇺🇸", url: "https://www.arrowheadstadium.com/" },
  { name: "Gillette Stadium", city: "Foxborough", country: "United States", capacity: "65,878", flag: "🇺🇸", url: "https://www.gillettestadium.com/" },
  { name: "Lumen Field", city: "Seattle", country: "United States", capacity: "69,000", flag: "🇺🇸", url: "https://www.lumenfield.com/" },
  { name: "Lincoln Financial Field", city: "Philadelphia", country: "United States", capacity: "69,328", flag: "🇺🇸", url: "https://www.lincolnfinancialfield.com/" },
  { name: "BMO Field", city: "Toronto", country: "Canada", capacity: "30,000", flag: "🇨🇦", url: "https://www.bmofield.com/" },
  { name: "Estadio Azteca", city: "Mexico City", country: "Mexico", capacity: "87,523", flag: "🇲🇽", url: "https://www.estadioazteca.com.mx/" },
  { name: "Estadio BBVA", city: "Monterrey", country: "Mexico", capacity: "53,500", flag: "🇲🇽", url: "https://www.estadiobbva.mx/" },
  { name: "Estadio Akron", city: "Guadalajara", country: "Mexico", capacity: "49,850", flag: "🇲🇽", url: "https://www.estadioakron.com/" },
  { name: "BC Place", city: "Vancouver", country: "Canada", capacity: "54,500", flag: "🇨🇦", url: "https://www.bcplace.com/" }
];

/**
 * Get all matches for a specific stadium
 */
export function getMatchesByStadium(stadiumName) {
  return worldCup2026Matches.filter(match => match.stadium === stadiumName).sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });
}

/**
 * Get the current or next live match for a stadium
 */
export function getCurrentMatchForStadium(stadiumName) {
  const matches = getMatchesByStadium(stadiumName);
  if (matches.length === 0) return null;
  
  // Return the live match if available, otherwise return the next scheduled match
  const liveMatch = matches.find(m => m.status === "LIVE");
  if (liveMatch) return liveMatch;
  
  // Return the next scheduled match
  const nextMatch = matches.find(m => m.status === "SCHEDULED");
  if (nextMatch) return nextMatch;
  
  // Return the most recent completed match
  return matches[matches.length - 1];
}

export const gates = [
  { id: "gate-a", name: "Gate A (MetLife Gate - North)", status: "Open", waitTime: 8, load: "Medium" },
  { id: "gate-b", name: "Gate B (Verizon Gate - East)", status: "Open", waitTime: 18, load: "High" },
  { id: "gate-c", name: "Gate C (Pepsi Gate - South)", status: "Open", waitTime: 4, load: "Low" },
  { id: "gate-d", name: "Gate D (Bud Light Gate - West)", status: "Open", waitTime: 12, load: "Medium" },
  { id: "vip-gate", name: "VIP Suite Gate", status: "Restricted", waitTime: 2, load: "Low" }
];

export const concessions = [
  { id: "c1", name: "Liberty Burgers", type: "Food", section: 117, waitTime: 15, isVegan: false, rating: 4.5, icon: "🍔" },
  { id: "c2", name: "Hudson Valley Tacos", type: "Food", section: 135, waitTime: 8, isVegan: true, rating: 4.7, icon: "🌮" },
  { id: "c3", name: "Empire Pizza Slice", type: "Food", section: 142, waitTime: 22, isVegan: true, rating: 4.2, icon: "🍕" },
  { id: "c4", name: "Stadium Pretzels & Beer", type: "Drinks", section: 104, waitTime: 5, isVegan: true, rating: 4.0, icon: "🥨" },
  { id: "c5", name: "Garden State Salads", type: "Food", section: 124, waitTime: 4, isVegan: true, rating: 4.4, icon: "🥗" },
  { id: "c6", name: "Big Apple Hot Dogs", type: "Food", section: 110, waitTime: 12, isVegan: false, rating: 4.1, icon: "🌭" },
  { id: "c7", name: "FIFA 2026 Official Merch Store", type: "Merchandise", section: 101, waitTime: 25, isVegan: false, rating: 4.8, icon: "🛍️" },
  { id: "c8", name: "Eco Hydration Station (Water Refill)", type: "Drinks", section: 128, waitTime: 0, isVegan: true, rating: 5.0, icon: "💧" }
];

export const restrooms = [
  { id: "r-102", name: "Restroom Sec 102", gender: "All-Gender / Family", section: 102, waitTime: 12, load: "High", hasChangingTable: true, accessible: true },
  { id: "r-114-m", name: "Men's Restroom Sec 114", gender: "Men", section: 114, waitTime: 4, load: "Low", hasChangingTable: false, accessible: true },
  { id: "r-114-w", name: "Women's Restroom Sec 114", gender: "Women", section: 114, waitTime: 15, load: "High", hasChangingTable: true, accessible: true },
  { id: "r-128-m", name: "Men's Restroom Sec 128", gender: "Men", section: 128, waitTime: 7, load: "Medium", hasChangingTable: false, accessible: true },
  { id: "r-128-w", name: "Women's Restroom Sec 128", gender: "Women", section: 128, waitTime: 6, load: "Medium", hasChangingTable: true, accessible: true },
  { id: "r-140", name: "Restroom Sec 140", gender: "All-Gender / Family", section: 140, waitTime: 2, load: "Low", hasChangingTable: true, accessible: true }
];

export const transitRoutes = [
  { id: "transit-rail", name: "Meadowlands Rail Station Shuttle", type: "Train", status: "Delayed (10 mins)", waitTime: 18, crowd: "High", nextDeparture: "8 mins", icon: "🚆" },
  { id: "shuttle-nyc", name: "Express Bus Shuttle to Port Authority (NYC)", type: "Bus", status: "On Time", waitTime: 8, crowd: "Medium", nextDeparture: "4 mins", icon: "🚌" },
  { id: "shuttle-nj", name: "Secaucus Junction Link Bus", type: "Bus", status: "On Time", waitTime: 5, crowd: "Low", nextDeparture: "3 mins", icon: "🚌" },
  { id: "rideshare", name: "Uber / Lyft Designated Pickup Zone (Lot E)", type: "Rideshare", status: "High Demand Surge", waitTime: 25, crowd: "Extremely High", nextDeparture: "N/A", icon: "🚗" },
  { id: "parking-lot-a", name: "General Parking Lots A-D Walkway", type: "Pedestrian", status: "Clear", waitTime: 0, crowd: "Low", nextDeparture: "N/A", icon: "🚶" }
];

export const staffSOPs = {
  medical: {
    title: "SOP-101: Medical Emergency Protocol",
    steps: [
      "Confirm precise section location and nearest gate access point.",
      "Dispatch the nearest Mobile First Aid Unit (Bike/Stretcher team).",
      "Assign security personnel to clear access corridors and section stairwell.",
      "Notify Stadium EMS Command Center with patient details (age, conscious/unconscious, breathing state).",
      "For cardiac incidents: Command automated external defibrillator (AED) retrieval from nearest wall-mount station."
    ],
    contactChannel: "EMS Ch 4"
  },
  fire: {
    title: "SOP-102: Fire and Evacuation Protocol",
    steps: [
      "Alert Venue Operations Director and Local Fire Liaison.",
      "Deploy localized chemical extinguishers immediately if incident is minor and safe to contain.",
      "For active fires: Command PA announcer to activate Phase 1 evacuation broadcast for affected zones.",
      "Unlock and hold open all primary egress gates (A through D).",
      "Instruct volunteers to form human guide lanes pointing towards safe external assembly plazas."
    ],
    contactChannel: "Fire/Rescue Ch 1"
  },
  congested_gate: {
    title: "SOP-205: Gate Congestion Mitigation",
    steps: [
      "Halt incoming turnstile ticket-scanning temporarily if crowd density exceeds 4 persons/sq meter.",
      "Update digital exterior signs to redirect incoming fans to adjacent low-load gates.",
      "Deploy crowd management units to separate queues using metal barricades.",
      "Request GenAI text-blast update to app users in vicinity recommending alternative gate entrances."
    ],
    contactChannel: "Crowd Control Ch 8"
  },
  spill_sustainability: {
    title: "SOP-309: Spill & Sustainability Maintenance",
    steps: [
      "Classify spill substance (liquid hazard vs dry trash overflow).",
      "Dispatch Sanitation Team Zone Lead with designated clean-up cart (biodegradable absorbent, sorting bins).",
      "If recycle/compost bin is overflowing, replace canvas bags and redirect sorting signage.",
      "Confirm resolution with a photo upload to Ops Dashboard."
    ],
    contactChannel: "Facilities Ch 6"
  },
  lost_child: {
    title: "SOP-401: Lost/Found Persons Protocol",
    steps: [
      "Secure description of child (clothing, age, name, hair color).",
      "Broadcast description over internal security radio channels immediately.",
      "Guide parent/guardian to the nearest Family Care & Lost Persons Center (located behind Section 128).",
      "Instruct gate agents to monitor exits for anyone matching the child's description."
    ],
    contactChannel: "Security Ch 2"
  }
};

export const initialIncidents = [
  {
    id: "inc-001",
    reporter: "System Sensor Grid",
    type: "Crowd Congestion",
    location: "Gate B Security Queue",
    description: "Camera feed indicates queue backups extending past the security plaza arches. Wait time has spiked to 18 minutes. Density approaching 3.8 persons per square meter.",
    status: "Active",
    severity: "Major",
    timestamp: "21:40",
    actionsTaken: []
  },
  {
    id: "inc-002",
    reporter: "Fan (App Report #12)",
    type: "Sustainability / Cleanliness",
    location: "Section 124 Concourse",
    description: "Massive pile of plastic cups and food wrappers spilled next to the organic recycling bin. Bins are completely full. Slipping hazard.",
    status: "Active",
    severity: "Minor",
    timestamp: "21:48",
    actionsTaken: []
  },
  {
    id: "inc-003",
    reporter: "Volunteer Staff 218",
    type: "Medical / Accessibility",
    location: "Section 108 Row K",
    description: "An elderly fan in a wheelchair is reporting chest pains and shortness of breath. Responsive, but highly distressed. Requesting medical assistance.",
    status: "Active",
    severity: "Critical",
    timestamp: "21:52",
    actionsTaken: []
  }
];
