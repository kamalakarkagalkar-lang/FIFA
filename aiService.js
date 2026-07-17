/**
 * aiService.js
 * Interface to the Gemini API with a robust, context-aware local simulation fallback.
 * Allows user to plug in their own key in the dashboard settings, stored in localStorage.
 */

// Retrieve API key from localStorage if it exists
export function getApiKey() {
  return localStorage.getItem("arena_flow_gemini_key") || "";
}

export function setApiKey(key) {
  if (key) {
    localStorage.setItem("arena_flow_gemini_key", key);
  } else {
    localStorage.removeItem("arena_flow_gemini_key");
  }
}

// System instructions for the model
const STADIUM_BOT_SYSTEM_PROMPT = `
You are the ArenaFlow AI Assistant for the FIFA World Cup 2026 at MetLife Stadium. 
Your role is to assist fans, volunteers, and operations staff with navigation, transit, scheduling, sustainability, accessibility, and emergency procedures.
Keep answers concise, helpful, and polite. If a user asks in a language other than English, translate your response to their language.
Use formatting (bullet points, bold text) for readability.
`;

/**
 * Call the actual Gemini API
 */
async function callGeminiAPI(prompt, systemInstruction = "") {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("No API Key configured");

  const model = "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: systemInstruction ? `${systemInstruction}\n\nUser Prompt: ${prompt}` : prompt }]
      }],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        maxOutputTokens: 1024
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Failed to contact Gemini API");
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
}

/**
 * Main query function for Fan / Staff chat assistance
 */
export async function queryAssistant(userMessage, isStaff = false) {
  const apiKey = getApiKey();
  
  if (apiKey) {
    try {
      const systemPrompt = STADIUM_BOT_SYSTEM_PROMPT + 
        (isStaff ? "\nUser is a stadium staff member. Provide operating protocols, coordinator contacts, and technical guidance." : "\nUser is a fan. Provide directions, concessions, toilet queues, and match schedules.");
      return await callGeminiAPI(userMessage, systemPrompt);
    } catch (e) {
      console.warn("Gemini API call failed, falling back to local simulation:", e.message);
      // Fall through to mock
    }
  }

  // Local Simulation Engine (context-aware, rule-based)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(simulateAssistantResponse(userMessage, isStaff));
    }, 800);
  });
}

/**
 * Live Operations Incident Analysis
 */
export async function analyzeIncident(incidentText, sopText) {
  const apiKey = getApiKey();
  const prompt = `
  Analyze the following stadium incident and standard operating procedure (SOP).
  
  INCIDENT DETAILS:
  "${incidentText}"
  
  STADIUM SOP REFERENCE:
  "${sopText}"
  
  Format your response strictly as a JSON object with the following fields:
  {
    "severity": "Minor" | "Major" | "Critical",
    "sopMatches": true | false,
    "immediateActions": ["Action 1", "Action 2", ...],
    "staffInstructions": "Short briefing text for dispatched units...",
    "draftAnnouncements": {
      "en": "English announcement for display screens...",
      "es": "Spanish translation...",
      "fr": "French translation..."
    }
  }
  Do not include markdown wrappers like \`\`\`json, just output the raw JSON.
  `;

  if (apiKey) {
    try {
      const responseText = await callGeminiAPI(prompt, "You are a JSON generator. Respond only with valid JSON.");
      // Parse JSON from response
      const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      console.warn("Gemini API incident analysis failed, falling back to local simulation:", e.message);
    }
  }

  // Local Simulation Fallback
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(simulateIncidentAnalysis(incidentText));
    }, 1000);
  });
}

/**
 * Generate Stadium Health Narrative Summary
 */
export async function generateHealthSummary(metrics) {
  const apiKey = getApiKey();
  const prompt = `
  Create a concise, executive operational summary (2-3 sentences) for the Stadium Director based on these live metrics:
  - Attendance: ${metrics.attendance} / ${metrics.capacity} (${Math.round(metrics.attendance/metrics.capacity*100)}%)
  - Peak Gate Wait Time: ${metrics.peakGateWait} mins (${metrics.peakGateName})
  - Active Incidents: ${metrics.activeIncidents} (${metrics.criticalIncidents} critical)
  - Transport Flow: Transit Rail delay is ${metrics.transitDelay}, Rideshare surge is ${metrics.rideshareSurge}
  - Sustainability Index: Waste sorted: ${metrics.wasteSorted}%, Energy Grid Load: ${metrics.energyGrid}%
  
  Write in a professional, alert, and data-driven tone. Highlight the single highest priority bottleneck.
  `;

  if (apiKey) {
    try {
      return await callGeminiAPI(prompt, "You are an executive operational intelligence assistant. Keep it to 3 sentences max.");
    } catch (e) {
      console.warn("Gemini API summary failed, falling back to local simulation:", e.message);
    }
  }

  // Local Simulation Fallback
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(simulateHealthSummary(metrics));
    }, 700);
  });
}


/* ==========================================
   LOCAL SIMULATION LOGIC (HIGH FIDELITY)
   ========================================== */

function simulateAssistantResponse(message, isStaff) {
  const clean = message.toLowerCase();
  
  // Multilingual detection
  let isSpanish = clean.includes("dónde") || clean.includes("hola") || clean.includes("baño") || clean.includes("estadio") || clean.includes("juego");
  let isFrench = clean.includes("où") || clean.includes("bonjour") || clean.includes("toilette") || clean.includes("match");
  
  if (isStaff) {
    if (clean.includes("medical") || clean.includes("heart") || clean.includes("sop-101")) {
      return `### 🚨 SOP-101: Medical Emergency Protocol Activated
1. **EMS Dispatch**: Notify EMS Command (Ch 4) immediately.
2. **Access Corridor**: Assign nearest section staff to clear the stairwells and direct the stretcher team.
3. **AED Locations**: Nearest AED is located behind **Section 112 (West Concourse)**.
4. **Log**: Record patient status, time of incident, and EMS arrival time in the operations log.`;
    }
    if (clean.includes("evacuate") || clean.includes("fire") || clean.includes("sop-102")) {
      return `### ⚠️ SOP-102: Fire and Evacuation Protocol
- **Action**: Alert Operations Director immediately.
- **Egress**: Open all gates A, B, C, and D. Lock turnstiles in the open position.
- **PA System**: Prepare Phase 1 evacuation broadcast ("Please proceed to the nearest exit in an orderly fashion").
- **Assembly**: Direct crowds to Plaza North and Plaza West.`;
    }
    if (clean.includes("trash") || clean.includes("spill") || clean.includes("recycle") || clean.includes("sop-309")) {
      return `### ♻️ SOP-309: Spill & Waste Management
- **Action**: Contact Facilities Dispatch (Ch 6).
- **Equipment**: Dispatch a sanitation team with a mobile sorting cart.
- **Sorting**: Ensure cardboard, plastic, and organic waste are separated to meet FIFA sustainability goals (80%+ diversion target).`;
    }
    return `### 📋 Stadium Operations Info System
I recognized your query regarding staff instructions. Here are some guidelines:
* **Active Channels**: Security (Ch 2), Medical/EMS (Ch 4), Sanitation/Facilities (Ch 6), Crowd Management (Ch 8).
* **Duty Coordinator**: Main office is behind Section 100 (Level 1).
* **Shift Rules**: Ensure all volunteers are rotated every 2 hours due to the summer heat. Hydration points are set up in staff break rooms.
* You can ask me about emergency protocols like "SOP-101 (Medical)", "SOP-102 (Fire/Evacuation)", or "SOP-309 (Spill/Recycling)".`;
  } else {
    // Fan response
    if (isSpanish) {
      if (clean.includes("baño") || clean.includes("toilet")) {
        return `### 🚻 Información de Baños
Los baños con menor tiempo de espera se encuentran en la **Sección 140** (tiempo estimado de espera: **2 minutos**).
* Evite los baños de la **Sección 114**, ya que tienen alta congestión (**15 minutos** de espera).
* Todos los baños cuentan con cambiadores de pañales y son accesibles para sillas de ruedas.`;
      }
      if (clean.includes("comer") || clean.includes("comida") || clean.includes("burger") || clean.includes("taco")) {
        return `### 🍔 Concesiones de Comida
¡Bienvenido! Aquí están las mejores opciones cerca:
* **Hudson Valley Tacos** (Sección 135) - *Vegano y sin gluten disponible* (Espera: 8 mins)
* **Liberty Burgers** (Sección 117) - Hamburguesas clásicas (Espera: 15 mins)
* **Empire Pizza Slice** (Sección 142) - Pizza neoyorquina (Espera: 22 mins)
* **Eco Hydration** (Sección 128) - Recarga de agua gratis y sostenible 💧`;
      }
      return `### ⚽ Asistente de Fanáticos de la Copa Mundial 2026
¡Hola! Estoy aquí para ayudarte a navegar por el MetLife Stadium.
* Puedes preguntarme sobre: **comida**, **baños**, **transporte**, o **puertas de acceso**.
* **Estado del Partido**: USA 2 - 1 England (Minuto 72). ¡Un ambiente eléctrico!`;
    }

    if (isFrench) {
      if (clean.includes("toilette") || clean.includes("bain")) {
        return `### 🚻 Toilettes du Stade
Les toilettes les plus fluides se situent à la **Section 140** (Attente : **2 minutes**).
* Veuillez éviter la **Section 114** où l'attente est actuellement de **15 minutes**.
* Toutes les toilettes disposent de tables à langer et d'un accès PMR.`;
      }
      if (clean.includes("manger") || clean.includes("nourriture") || clean.includes("taco") || clean.includes("pizza")) {
        return `### 🍔 Restauration et Boissons
Voici les stands ouverts :
* **Hudson Valley Tacos** (Section 135) - Options végétaliennes (Attente : 8 min)
* **Liberty Burgers** (Section 117) - Burgers classiques (Attente : 15 min)
* **Empire Pizza Slice** (Section 142) - Parts de pizza (Attente : 22 min)
* **Eco Hydration Station** (Section 128) - Recharge d'eau gratuite 💧`;
      }
      return `### ⚽ Assistant Supporter Coupe du Monde 2026
Bonjour ! Comment puis-je vous aider aujourd'hui au MetLife Stadium ?
* Vous pouvez me poser des questions sur : **les toilettes**, **les stands de nourriture**, **les transports**, ou **les sorties**.
* **Score actuel** : USA 2 - 1 Angleterre (72ème minute).`;
    }

    // English responses
    if (clean.includes("toilet") || clean.includes("restroom") || clean.includes("bathroom") || clean.includes("washroom")) {
      return `### 🚻 Restroom Wait Times
* **Shortest Line**: **Section 140** (All-Gender, wait time: **2 mins**) & **Section 128-W/M** (wait time: **6-7 mins**).
* **Busy / Avoid**: **Section 114** (wait time: **15 mins**).
* *Note: All family restrooms include baby-changing tables and are fully ADA-compliant.*`;
    }
    if (clean.includes("food") || clean.includes("eat") || clean.includes("drink") || clean.includes("beer") || clean.includes("vegan") || clean.includes("burger") || clean.includes("taco") || clean.includes("water")) {
      return `### 🍔 Stadium Concessions & Dining
Here are the top concessions nearby:
1. **Hudson Valley Tacos** (Sec 135) - 🌮 Vegan & gluten-free options. (Wait: 8 mins)
2. **Liberty Burgers** (Sec 117) - 🍔 Classic beef & chicken burgers. (Wait: 15 mins)
3. **Empire Pizza Slice** (Sec 142) - 🍕 Hot New York slices. (Wait: 22 mins)
4. **Eco Hydration Station** (Sec 128) - 💧 Bring your reusable bottle for **free water refills**! (Wait: 0 mins)
5. **FIFA Merch Store** (Sec 101) - 🛍️ World Cup apparel and souvenirs. (Wait: 25 mins)`;
    }
    if (clean.includes("train") || clean.includes("bus") || clean.includes("uber") || clean.includes("lyft") || clean.includes("transit") || clean.includes("parking")) {
      return `### 🚆 Transportation & Parking Updates
* **Meadowlands Rail Station**: 18-minute wait. Trains departing every 10 minutes.
* **NYC Express Bus**: On Time, leaving every 5 minutes from Gate A. Wait time: 8 mins.
* **Uber/Lyft (Lot E)**: High demand surge. Rideshare wait times are around **25 minutes**. We recommend taking the rail shuttle to Secaucus Junction for faster connections.
* **Pedestrian Paths**: All walkways to Parking Lots A-D are currently clear.`;
    }
    if (clean.includes("gate") || clean.includes("entrance") || clean.includes("enter") || clean.includes("security")) {
      return `### 🚪 Gate Entrances & Security Wait Times
* **Gate A (North)**: 8 mins wait. (Medium traffic)
* **Gate B (East)**: 18 mins wait. (High congestion, avoid if possible)
* **Gate C (South)**: 4 mins wait. (Low traffic, recommended)
* **Gate D (West)**: 12 mins wait. (Medium traffic)`;
    }
    if (clean.includes("schedule") || clean.includes("match") || clean.includes("game") || clean.includes("who is playing") || clean.includes("score")) {
      return `### 🏆 FIFA World Cup 2026 Quarter-Final
* **Match**: **USA vs England**
* **Score**: 🇺🇸 **USA 2 - 1 England** 🏴󠁧󠁢󠁥󠁮󠁧󠁿
* **Status**: Second Half - 72'
* **Stadium**: MetLife Stadium, NY/NJ
* **Attendance**: 82,500 (Sold out)`;
    }
    if (clean.includes("sustainability") || clean.includes("green") || clean.includes("recycle") || clean.includes("eco")) {
      return `### ♻️ FIFA Green Stadium Initiative
MetLife Stadium is operating a **Zero-Waste-to-Landfill** policy for the 2026 World Cup:
* **Hydration**: Reusable water containers can be refilled for free at any **Eco Hydration Station** (e.g., Section 128).
* **Sorting**: Please use the color-coded bins: **Green** for Compostable food waste, **Blue** for Recyclable plastics/cans, and **Gray** for landfill-only items.
* **Energy**: The stadium is operating on 100% certified renewable energy offset.`;
    }
    if (clean.includes("wheelchair") || clean.includes("accessibility") || clean.includes("ada") || clean.includes("disabled")) {
      return `### ♿ Accessibility Services
* **Elevators**: Located at Gates A, B, C, and D.
* **Seating**: Accessible seating platforms are located in Sections 109, 124, 140, and 200 level.
* **Assistance**: You can request a sensory pack (noise-canceling headphones, fidget tools) or wheelchair escort from guest services at Section 128.
* *To request immediate wheelchair assistance at your seat, use the report form on the side panel or alert a volunteer.*`;
    }
    
    // Default reply
    return `### ⚽ ArenaFlow Fan Assistant
Hi! I am your AI concierge for the FIFA World Cup 2026 at MetLife Stadium.
How can I assist you today? You can ask me about:
* **🚻 Restrooms** (queue wait times)
* **🍔 Food & Drink** (menus & line wait times)
* **🚆 Transit & Rideshares**
* **🚪 Gates & Security queues**
* **♻️ Sustainability & Green policies**
* **♿ Wheelchair and Accessibility services**`;
  }
}

function simulateIncidentAnalysis(incidentText) {
  const clean = incidentText.toLowerCase();
  
  // Decide severity and details based on content keywords
  let severity = "Minor";
  let sopMatches = true;
  let actions = [];
  let instructions = "";
  let enAnnounce = "";
  let esAnnounce = "";
  let frAnnounce = "";

  if (clean.includes("chest pain") || clean.includes("heart") || clean.includes("unconscious") || clean.includes("seizure") || clean.includes("medical")) {
    severity = "Critical";
    actions = [
      "Dispatch EMS Unit 4 and Section Supervisor immediately.",
      "Clear medical response channel EMS Ch 4.",
      "Direct staff to wait at Gate A corridor to escort the EMT team to the section.",
      "Deploy localized AED from Section 112 cabinet if patient loses consciousness."
    ];
    instructions = "EMERGENCY. Proceed to target section immediately. Keep spectator aisles clear. Prepare stretchers and coordinate with local police on gate entry clearance.";
    enAnnounce = "Medical personnel are responding to Section 108. Please keep concourse corridors clear for emergency access.";
    esAnnounce = "El personal médico está respondiendo a la Sección 108. Por favor, mantenga los pasillos despejados.";
    frAnnounce = "Le personnel médical intervient dans la section 108. Veuillez laisser les couloirs libres.";
  } 
  else if (clean.includes("congestion") || clean.includes("gate") || clean.includes("crowd") || clean.includes("overcrowding")) {
    severity = "Major";
    actions = [
      "Activate electronic message signs outside Gate B to redirect fans to Gate C.",
      "Halt incoming turnstile scans for 3-minute intervals to relieve congestion.",
      "Deploy queue management barricade teams.",
      "Push mobile app notification to fans in Lot B area."
    ];
    instructions = "Crowd Control team: Coordinate gates. Redirect incoming fans to Gate C (South). Implement zig-zag queue lanes using temporary fencing.";
    enAnnounce = "Gate B is experiencing high congestion. Please use Gate C (South Entrance) for faster entry. Check app map for details.";
    esAnnounce = "La Puerta B está muy congestionada. Utilice la Puerta C (entrada sur) para un acceso más rápido.";
    frAnnounce = "La porte B est très encombrée. Veuillez utiliser la porte C (entrée sud) pour un accès plus rapide.";
  } 
  else if (clean.includes("trash") || clean.includes("spill") || clean.includes("overflow") || clean.includes("recycling")) {
    severity = "Minor";
    actions = [
      "Dispatch Sanitation Team Zone 3 with a mobile cleaning kit.",
      "Replace full organic and recycling bins at the concourse.",
      "Place caution slip-hazard cone if liquid spill exists."
    ];
    instructions = "Sanitation crew: Section 124 concourse needs waste collection bag replacement and sorting sweep. Ensure cardboard is separated.";
    enAnnounce = "Facilities maintenance is currently clearing Section 124 concourse. Please exercise caution in the area.";
    esAnnounce = "Mantenimiento está limpiando el pasillo de la Sección 124. Por favor, transite con precaución.";
    frAnnounce = "Le service de nettoyage intervient dans la section 124. Veuillez circuler avec prudence.";
  } 
  else {
    // Default fallback incident category
    severity = "Major";
    actions = [
      "Dispatch nearest supervisor to assess the incident scene.",
      "Log detailed updates in the central communications channel.",
      "Alert the security dispatch operator if visual contact is lost."
    ];
    instructions = "Investigate the reported situation. Log details on scene and report back to Central Ops.";
    enAnnounce = "Stadium operations are active. Please follow the instructions of venue stewards.";
    esAnnounce = "Operaciones del estadio activas. Siga las instrucciones del personal del estadio.";
    frAnnounce = "Les opérations du stade sont actives. Veuillez suivre les consignes des agents.";
  }

  return {
    severity,
    sopMatches,
    immediateActions: actions,
    staffInstructions: instructions,
    draftAnnouncements: {
      en: enAnnounce,
      es: esAnnounce,
      fr: frAnnounce
    }
  };
}

function simulateHealthSummary(metrics) {
  const percent = Math.round(metrics.attendance / metrics.capacity * 100);
  const statusStr = percent > 90 ? "Operating at peak capacity." : "Operating at moderate capacity.";
  const gateWarning = metrics.peakGateWait > 15 ? 
    `High delay detected at ${metrics.peakGateName} (${metrics.peakGateWait} mins). Recommendation: Redirect inbound flow.` : 
    "Gate entries are processing smoothly.";
  const incidentStr = metrics.criticalIncidents > 0 ? 
    `CRITICAL WARNING: ${metrics.criticalIncidents} active critical emergency response underway.` : 
    `${metrics.activeIncidents} active minor incidents are being managed by facilities staff.`;
  const transitWarning = metrics.transitDelay.toLowerCase().includes("delayed") ? 
    "Transit rail delays are impacting outbound flow." : "Outbound transit operates on-schedule.";

  return `Stadium is ${statusStr} ${gateWarning} ${incidentStr} ${transitWarning} All operations coordinates are within nominal bounds.`;
}
