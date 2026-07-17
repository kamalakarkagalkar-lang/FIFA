/**
 * map.js
 * SVG stadium layout rendering, route pathfinding drawer, 
 * and Canvas-based crowd density heatmap simulation engine.
 */

import { concessions, restrooms, gates } from './mockData.js';

// Coordinates registry for stadium locations to enable pathfinding & overlays
export const coordinates = {
  // Gates
  "gate-a": { x: 400, y: 70, name: "Gate A (North Entrance)" },
  "gate-b": { x: 700, y: 300, name: "Gate B (East Entrance)" },
  "gate-c": { x: 400, y: 530, name: "Gate C (South Entrance)" },
  "gate-d": { x: 100, y: 300, name: "Gate D (West Entrance)" },
  
  // Sections (Stands)
  "sec-101": { x: 400, y: 130, name: "Section 101 (North Stand)" },
  "sec-108": { x: 570, y: 170, name: "Section 108 (North-East Corner)" },
  "sec-114": { x: 620, y: 300, name: "Section 114 (East Sideline)" },
  "sec-124": { x: 570, y: 430, name: "Section 124 (South-East Corner)" },
  "sec-117": { x: 400, y: 470, name: "Section 117 (South Stand)" },
  "sec-135": { x: 230, y: 430, name: "Section 135 (South-West Corner)" },
  "sec-128": { x: 180, y: 300, name: "Section 128 (West Sideline)" },
  "sec-140": { x: 230, y: 170, name: "Section 140 (North-West Corner)" },
  "sec-142": { x: 280, y: 140, name: "Section 142 (North Stand)" },
  
  // Concessions
  "c1": { x: 380, y: 450, name: "Liberty Burgers" },
  "c2": { x: 250, y: 410, name: "Hudson Valley Tacos" },
  "c3": { x: 300, y: 150, name: "Empire Pizza Slice" },
  "c4": { x: 520, y: 190, name: "Stadium Pretzels & Beer" },
  "c5": { x: 550, y: 410, name: "Garden State Salads" },
  "c6": { x: 590, y: 270, name: "Big Apple Hot Dogs" },
  "c7": { x: 420, y: 140, name: "FIFA Official Merch Store" },
  "c8": { x: 200, y: 320, name: "Eco Hydration Station" },
  
  // Restrooms
  "r-102": { x: 350, y: 130, name: "Restroom Sec 102" },
  "r-114-m": { x: 620, y: 280, name: "Men's Restroom Sec 114" },
  "r-114-w": { x: 620, y: 320, name: "Women's Restroom Sec 114" },
  "r-128-m": { x: 180, y: 280, name: "Men's Restroom Sec 128" },
  "r-128-w": { x: 180, y: 320, name: "Women's Restroom Sec 128" },
  "r-140": { x: 250, y: 180, name: "Restroom Sec 140" }
};

/**
 * Initializes and draws the stadium blueprint inside the SVG container
 */
export function initStadiumMap(svgId, onSelectElement, stadiumName = "MetLife Stadium") {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  svg.innerHTML = ""; // Clear
  
  // Create definitions for glowing dropshadows
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  defs.innerHTML = `
    <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  `;
  svg.appendChild(defs);

  const titleText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  titleText.setAttribute("x", "400");
  titleText.setAttribute("y", "40");
  titleText.setAttribute("fill", "#f8fafc");
  titleText.setAttribute("font-size", "18px");
  titleText.setAttribute("font-weight", "700");
  titleText.setAttribute("text-anchor", "middle");
  titleText.textContent = stadiumName;
  svg.appendChild(titleText);

  const subtitleText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  subtitleText.setAttribute("x", "400");
  subtitleText.setAttribute("y", "64");
  subtitleText.setAttribute("fill", "#94a3b8");
  subtitleText.setAttribute("font-size", "12px");
  subtitleText.setAttribute("text-anchor", "middle");
  subtitleText.textContent = "FIFA World Cup 2026 navigation overview";
  svg.appendChild(subtitleText);

  // Outer Oval Border (Stadium Boundary)
  const outerBowl = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
  outerBowl.setAttribute("cx", "400");
  outerBowl.setAttribute("cy", "300");
  outerBowl.setAttribute("rx", "340");
  outerBowl.setAttribute("ry", "250");
  outerBowl.setAttribute("fill", "#050713");
  outerBowl.setAttribute("stroke", "#1e293b");
  outerBowl.setAttribute("stroke-width", "3");
  svg.appendChild(outerBowl);

  // Inner Bowl (Seating Tiers boundary)
  const innerBowl = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
  innerBowl.setAttribute("cx", "400");
  innerBowl.setAttribute("cy", "300");
  innerBowl.setAttribute("rx", "260");
  innerBowl.setAttribute("ry", "180");
  innerBowl.setAttribute("fill", "#080c21");
  innerBowl.setAttribute("stroke", "#334155");
  innerBowl.setAttribute("stroke-width", "2");
  svg.appendChild(innerBowl);

  // Soccer Pitch Area
  const pitchRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  pitchRect.setAttribute("x", "300");
  pitchRect.setAttribute("y", "220");
  pitchRect.setAttribute("width", "200");
  pitchRect.setAttribute("height", "160");
  pitchRect.setAttribute("class", "pitch-green");
  svg.appendChild(pitchRect);

  // Soccer Pitch markings
  const pitchCenterLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
  pitchCenterLine.setAttribute("x1", "400");
  pitchCenterLine.setAttribute("y1", "220");
  pitchCenterLine.setAttribute("x2", "400");
  pitchCenterLine.setAttribute("y2", "380");
  pitchCenterLine.setAttribute("class", "pitch-lines");
  svg.appendChild(pitchCenterLine);

  const pitchCenterCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  pitchCenterCircle.setAttribute("cx", "400");
  pitchCenterCircle.setAttribute("cy", "300");
  pitchCenterCircle.setAttribute("r", "35");
  pitchCenterCircle.setAttribute("class", "pitch-lines");
  svg.appendChild(pitchCenterCircle);

  // Draw Sections (Concentric seating sectors)
  // We'll define paths for key stadium segments to support click selection
  const sectors = [
    { id: "sec-101", d: "M 320 120 L 480 120 L 460 180 L 340 180 Z", label: "Sec 101" },
    { id: "sec-108", d: "M 480 120 L 590 170 L 530 220 L 460 180 Z", label: "Sec 108" },
    { id: "sec-114", d: "M 590 170 L 650 300 L 560 300 L 530 220 Z", label: "Sec 114" },
    { id: "sec-124", d: "M 650 300 L 590 430 L 530 380 L 560 300 Z", label: "Sec 124" },
    { id: "sec-117", d: "M 590 430 L 480 480 L 460 420 L 530 380 Z", label: "Sec 117" },
    { id: "sec-135", d: "M 480 480 L 320 480 L 340 420 L 460 420 Z", label: "Sec 135" },
    { id: "sec-128", d: "M 320 480 L 210 430 L 270 380 L 340 420 Z", label: "Sec 128" },
    { id: "sec-140", d: "M 210 430 L 150 300 L 240 300 L 270 380 Z", label: "Sec 140" },
    { id: "sec-142", d: "M 150 300 L 210 170 L 270 220 L 240 300 Z", label: "Sec 142" }
  ];

  sectors.forEach(s => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", s.d);
    path.setAttribute("id", s.id);
    path.setAttribute("class", "map-ring");
    path.addEventListener("click", () => {
      clearHighlights(svg);
      path.classList.add("highlighted");
      onSelectElement({ type: "Section", id: s.id, name: s.label });
    });
    svg.appendChild(path);
  });

  // Plot Gates
  gates.forEach(g => {
    const coord = coordinates[g.id];
    if (!coord) return;

    const gateGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    gateGroup.setAttribute("class", "gate-sensor-group");
    gateGroup.setAttribute("id", `g-${g.id}`);
    gateGroup.style.cursor = "pointer";

    // Circle sensor
    const circ = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circ.setAttribute("cx", coord.x.toString());
    circ.setAttribute("cy", coord.y.toString());
    circ.setAttribute("r", "16");
    circ.setAttribute("class", "gate-sensor");

    // Text Label
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", coord.x.toString());
    text.setAttribute("y", (coord.y + 4).toString());
    text.setAttribute("fill", "#ffffff");
    text.setAttribute("font-size", "10px");
    text.setAttribute("font-weight", "bold");
    text.setAttribute("text-anchor", "middle");
    text.textContent = g.id.replace("gate-", "").toUpperCase();

    gateGroup.appendChild(circ);
    gateGroup.appendChild(text);

    gateGroup.addEventListener("click", () => {
      clearHighlights(svg);
      circ.style.fill = "rgba(0, 245, 155, 0.4)";
      onSelectElement({ type: "Gate", id: g.id, data: g });
    });

    svg.appendChild(gateGroup);
  });

  // Plot Concessions (Food Icons)
  concessions.forEach(c => {
    const coord = coordinates[c.id];
    if (!coord) return;

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", coord.x.toString());
    text.setAttribute("y", coord.y.toString());
    text.setAttribute("class", "facility-pin concession-pin");
    text.setAttribute("id", `pin-${c.id}`);
    text.setAttribute("font-size", "18px");
    text.setAttribute("text-anchor", "middle");
    text.textContent = c.icon;

    text.addEventListener("click", () => {
      onSelectElement({ type: "Concession", id: c.id, data: c });
    });

    svg.appendChild(text);
  });

  // Plot Restrooms
  restrooms.forEach(r => {
    const coord = coordinates[r.id];
    if (!coord) return;

    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("class", "facility-pin restroom-pin");
    group.setAttribute("id", `pin-${r.id}`);
    group.style.cursor = "pointer";

    // Small background badge
    const badge = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    badge.setAttribute("cx", coord.x.toString());
    badge.setAttribute("cy", coord.y.toString());
    badge.setAttribute("r", "10");
    // Color code based on wait time (Green/Yellow/Red)
    let badgeColor = "rgba(16, 185, 129, 0.8)";
    if (r.waitTime > 10) badgeColor = "rgba(239, 68, 68, 0.8)";
    else if (r.waitTime > 5) badgeColor = "rgba(245, 158, 11, 0.8)";
    badge.setAttribute("fill", badgeColor);
    badge.setAttribute("class", "restroom-badge-indicator");

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", coord.x.toString());
    text.setAttribute("y", (coord.y + 4).toString());
    text.setAttribute("font-size", "11px");
    text.setAttribute("text-anchor", "middle");
    text.textContent = "🚻";

    group.appendChild(badge);
    group.appendChild(text);

    group.addEventListener("click", () => {
      onSelectElement({ type: "Restroom", id: r.id, data: r });
    });

    svg.appendChild(group);
  });
}

function clearHighlights(svg) {
  svg.querySelectorAll(".map-ring").forEach(el => el.classList.remove("highlighted"));
  svg.querySelectorAll(".gate-sensor").forEach(el => el.style.fill = "");
}

/**
 * Highlights a specific section on the SVG map by section identifier
 */
export function highlightSection(svgId, sectionId) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  clearHighlights(svg);
  
  const el = svg.querySelector(`#${sectionId}`);
  if (el) {
    el.classList.add("highlighted");
    // Scroll or focus could be simulated here
    return true;
  }
  return false;
}

/**
 * Draws a navigation route from point A to point B on the SVG map
 */
export function drawRoute(svgId, fromId, toId) {
  const svg = document.getElementById(svgId);
  if (!svg) return;

  // Clear existing routes
  removeRoute(svgId);

  const start = coordinates[fromId];
  const end = coordinates[toId];
  if (!start || !end) return;

  // Draw path
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  
  // Calculate curved path (quadratic Bezier control point in center)
  const mx = (start.x + end.x) / 2;
  const my = (start.y + end.y) / 2;
  // Offset control point to make it curved
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const cx = mx - dy * 0.15;
  const cy = my + dx * 0.15;

  const pathStr = `M ${start.x} ${start.y} Q ${cx} ${cy} ${end.x} ${end.y}`;
  path.setAttribute("d", pathStr);
  path.setAttribute("class", "nav-route");
  path.setAttribute("id", "activeRouteLine");

  // Create glowing start and end points
  const startDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  startDot.setAttribute("cx", start.x.toString());
  startDot.setAttribute("cy", start.y.toString());
  startDot.setAttribute("r", "6");
  startDot.setAttribute("fill", "#00e5ff");
  startDot.setAttribute("id", "routeStartDot");
  startDot.setAttribute("filter", "url(#glow-gold)");

  const endDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  endDot.setAttribute("cx", end.x.toString());
  endDot.setAttribute("cy", end.y.toString());
  endDot.setAttribute("r", "6");
  endDot.setAttribute("fill", "#00f59b");
  endDot.setAttribute("id", "routeEndDot");
  endDot.setAttribute("filter", "url(#glow-gold)");

  svg.appendChild(path);
  svg.appendChild(startDot);
  svg.appendChild(endDot);
}

export function removeRoute(svgId) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  const route = svg.querySelector("#activeRouteLine");
  if (route) route.remove();
  const start = svg.querySelector("#routeStartDot");
  if (start) start.remove();
  const end = svg.querySelector("#routeEndDot");
  if (end) end.remove();
}

/**
 * Filter visibility of pins on SVG map
 */
export function togglePinsVisibility(svgId, pinClass, visible) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  svg.querySelectorAll(`.${pinClass}`).forEach(el => {
    if (visible) {
      el.classList.remove("hidden");
    } else {
      el.classList.add("hidden");
    }
  });
}


/* ==========================================================================
   CANVAS HEATMAP ENGINE
   ========================================================================== */

let heatmapAnimationId = null;
let canvasContext = null;
let currentHeatmapScenario = 'normal';

// Crowd heat nodes dictionary for different simulation scenarios
const heatmapScenarios = {
  normal: [
    { x: 400, y: 130, r: 80, val: 0.4 }, // Section 101
    { x: 570, y: 170, r: 80, val: 0.35 }, // Corner
    { x: 620, y: 300, r: 90, val: 0.45 }, // East
    { x: 400, y: 470, r: 80, val: 0.4 }, // South
    { x: 180, y: 300, r: 90, val: 0.38 }, // West
    { x: 400, y: 70, r: 40, val: 0.5 },  // Gate A
    { x: 700, y: 300, r: 45, val: 0.7 }, // Gate B (East is busy)
    { x: 400, y: 530, r: 40, val: 0.3 }  // Gate C
  ],
  halftime: [
    { x: 380, y: 450, r: 60, val: 0.8 }, // Burger line
    { x: 250, y: 410, r: 50, val: 0.75 }, // Tacos line
    { x: 300, y: 150, r: 50, val: 0.85 }, // Pizza line
    { x: 420, y: 140, r: 70, val: 0.9 }, // Merch store
    { x: 620, y: 300, r: 70, val: 0.9 }, // East restroom queue
    { x: 350, y: 130, r: 60, val: 0.8 }, // North restroom
    { x: 180, y: 300, r: 75, val: 0.75 }, // West restroom
    { x: 400, y: 300, r: 120, val: 0.1 } // Pitch is empty
  ],
  egress: [
    { x: 400, y: 70, r: 90, val: 0.9 },  // Gate A Exit
    { x: 700, y: 300, r: 100, val: 0.95 }, // Gate B Exit
    { x: 400, y: 530, r: 90, val: 0.85 }, // Gate C Exit
    { x: 100, y: 300, r: 85, val: 0.8 },  // Gate D Exit
    { x: 730, y: 340, r: 110, val: 0.9 }, // Lot E Rideshare backup
    { x: 400, y: 130, r: 70, val: 0.2 },  // Emptying stands
    { x: 400, y: 470, r: 70, val: 0.2 }
  ],
  congested: [
    { x: 700, y: 300, r: 130, val: 0.98 }, // MASSIVE backup at Gate B
    { x: 620, y: 300, r: 90, val: 0.85 },  // Flow backed up inside Section 114
    { x: 780, y: 300, r: 100, val: 0.9 },  // Outside security gates Lot B
    { x: 400, y: 530, r: 50, val: 0.2 },   // Other gates are underutilized
    { x: 400, y: 70, r: 50, val: 0.25 }
  ]
};

/**
 * Initializes and starts the canvas heatmap rendering loop
 */
export function startHeatmap(canvasId, scenario = 'normal') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  
  canvasContext = canvas.getContext('2d');
  currentHeatmapScenario = scenario;

  if (heatmapAnimationId) {
    cancelAnimationFrame(heatmapAnimationId);
  }

  function drawFrame() {
    renderHeatmapFrame(canvas, canvasContext, currentHeatmapScenario);
    heatmapAnimationId = requestAnimationFrame(drawFrame);
  }

  drawFrame();
}

export function stopHeatmap() {
  if (heatmapAnimationId) {
    cancelAnimationFrame(heatmapAnimationId);
    heatmapAnimationId = null;
  }
}

export function updateHeatmapScenario(scenario) {
  if (heatmapScenarios[scenario]) {
    currentHeatmapScenario = scenario;
  }
}

/**
 * Renders a single frame of the heatmap, including a schematic background
 */
function renderHeatmapFrame(canvas, ctx, scenario) {
  const w = canvas.width;
  const h = canvas.height;
  
  ctx.clearRect(0, 0, w, h);
  
  // 1. Draw Blueprint base in dark hues
  ctx.fillStyle = '#060814';
  ctx.fillRect(0, 0, w, h);
  
  // Outer stadium outline
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(w/2, h/2, 340, 230, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  // Inner pitch outline
  ctx.strokeStyle = '#00f59b22';
  ctx.lineWidth = 2;
  ctx.strokeRect(w/2 - 100, h/2 - 80, 200, 160);
  ctx.beginPath();
  ctx.arc(w/2, h/2, 35, 0, Math.PI*2);
  ctx.stroke();

  // Draw sector lines as guides
  ctx.strokeStyle = '#ffffff0a';
  ctx.lineWidth = 1;
  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
    ctx.beginPath();
    ctx.moveTo(w/2 + Math.cos(angle) * 120, h/2 + Math.sin(angle) * 120);
    ctx.lineTo(w/2 + Math.cos(angle) * 340, h/2 + Math.sin(angle) * 340);
    ctx.stroke();
  }

  // Draw concentric helper rings
  ctx.strokeStyle = '#ffffff05';
  ctx.beginPath(); ctx.ellipse(w/2, h/2, 260, 180, 0, 0, Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(w/2, h/2, 190, 130, 0, 0, Math.PI*2); ctx.stroke();

  // 2. Render Heat Overlay
  const nodes = heatmapScenarios[scenario] || [];
  
  // Enable compositing for color blending
  ctx.globalCompositeOperation = 'screen';
  
  nodes.forEach(node => {
    // Add micro-fluctuation to mock live thermal camera sensors
    const flux = 1 + (Math.sin(Date.now() * 0.005 + node.x) * 0.04);
    const radius = node.r * flux;
    const val = node.val * (0.95 + Math.random() * 0.08);

    const grad = ctx.createRadialGradient(node.x, node.y, 2, node.x, node.y, radius);
    
    // Smooth heatmap color gradient: Red (center) -> Orange -> Yellow -> Transparent (edge)
    grad.addColorStop(0, `rgba(239, 68, 68, ${val * 0.8})`);
    grad.addColorStop(0.25, `rgba(245, 158, 11, ${val * 0.55})`);
    grad.addColorStop(0.55, `rgba(253, 224, 71, ${val * 0.25})`);
    grad.addColorStop(1, 'rgba(253, 224, 71, 0)');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // Reset compositing mode
  ctx.globalCompositeOperation = 'source-over';

  // 3. Draw Gate Labels for contextual overlay
  ctx.fillStyle = '#ffffff88';
  ctx.font = '10px Space Grotesk';
  ctx.textAlign = 'center';
  ctx.fillText('GATE A (NORTH)', w/2, 50);
  ctx.fillText('GATE C (SOUTH)', w/2, h - 30);
  ctx.fillText('GATE B (EAST)', w - 60, h/2 - 10);
  ctx.fillText('GATE D (WEST)', 60, h/2 - 10);
}
