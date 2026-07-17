/**
 * app.js
 * Main entry point coordinating view switching, settings configurations,
 * chatbot events, SVG map integrations, and telemetry updates.
 */

import { transitRoutes, concessions, restrooms, gates, worldCup2026Stadiums, matchDetails, worldCup2026Matches, getCurrentMatchForStadium } from './mockData.js';
import { getApiKey, setApiKey, queryAssistant } from './aiService.js';
import { initStadiumMap, drawRoute, removeRoute, highlightSection, startHeatmap, stopHeatmap } from './map.js';
import { initOperationsPortal, logNewIncident } from './operations.js';

// Global application state
let activeView = "fan";

// Global state for Fan Portal
let currentFanPortalStadium = "MetLife Stadium";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Stadium SVG Map
  initStadiumMap("stadiumSvg", handleMapSelection);

  // 2. Hydrate Static UI elements
  hydrateTransitBoard();
  hydrateSeatSelector();
  hydrateStadiumDirectory();
  hydrateStadiumSelector();
  initFeatureLaunchButtons();

  // 3. Set up View Switcher
  initViewSwitcher();

  // 4. Set up Settings Modal (API Key configuration)
  initSettingsModal();

  // 5. Initialize Chat Interfaces
  initChatSystems();

  // 6. Handle Issue Reporting
  initReportSystem();

  // 7. Initialize Map Navigation Routings
  initRouteSelector();

  // 8. Initialize Live Scorecard
  initLiveScorecard();

  // 9. Initialize Operations Dashboard
  initOperationsPortal(showToast);

  // Hydrate key input initially
  document.getElementById("apiKeyInput").value = getApiKey();
});

/**
 * Switch views between Fan Portal & Operations Dashboard
 */
function initViewSwitcher() {
  const btnFan = document.getElementById("btnFanPortal");
  const btnOps = document.getElementById("btnOpsPortal");
  const viewFan = document.getElementById("fanPortalView");
  const viewOps = document.getElementById("opsPortalView");

  btnFan.addEventListener("click", () => {
    if (activeView === "fan") return;
    activeView = "fan";
    btnFan.classList.add("active");
    btnOps.classList.remove("active");
    viewFan.classList.add("active");
    viewOps.classList.remove("active");
    
    // Stop operations heatmap loop to conserve memory/CPU
    stopHeatmap();
  });

  btnOps.addEventListener("click", () => {
    if (activeView === "ops") return;
    activeView = "ops";
    btnOps.classList.add("active");
    btnFan.classList.remove("active");
    viewOps.classList.add("active");
    viewFan.classList.remove("active");
    
    // Start operations Canvas heatmap rendering loop
    startHeatmap("heatmapCanvas", "normal");
  });
}

/**
 * Configure Modal and API Key handling
 */
function initSettingsModal() {
  const modal = document.getElementById("settingsModal");
  const btnOpen = document.getElementById("btnSettings");
  const btnClose = document.getElementById("btnCancelSettings");
  const btnSave = document.getElementById("btnSaveSettings");
  const btnToggle = document.getElementById("toggleApiKey");
  const input = document.getElementById("apiKeyInput");

  btnOpen.addEventListener("click", () => {
    input.value = getApiKey();
    modal.classList.add("active");
  });

  btnClose.addEventListener("click", () => {
    modal.classList.remove("active");
  });

  btnSave.addEventListener("click", () => {
    const key = input.value.trim();
    setApiKey(key);
    modal.classList.remove("active");
    showToast({
      title: key ? "Gemini Key Saved" : "Gemini Key Removed",
      message: key ? "Live Gemini API mode active." : "ArenaFlow is now operating in Simulation Mode.",
      severity: "Minor"
    });
  });

  btnToggle.addEventListener("click", () => {
    if (input.type === "password") {
      input.type = "text";
      btnToggle.textContent = "🙈";
    } else {
      input.type = "password";
      btnToggle.textContent = "👁️";
    }
  });

  // Close on outside click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active");
    }
  });
}

/**
 * Hydrates the public transit status board
 */
function hydrateTransitBoard() {
  const list = document.getElementById("fanTransitList");
  list.innerHTML = "";

  transitRoutes.forEach(r => {
    const li = document.createElement("li");
    li.className = "transit-item";
    
    let colorClass = "green";
    if (r.status.toLowerCase().includes("delay") || r.status.toLowerCase().includes("surge")) {
      colorClass = r.status.toLowerCase().includes("heavy") || r.status.toLowerCase().includes("surge") ? "red" : "yellow";
    }

    li.innerHTML = `
      <div class="transit-item-icon">${r.icon}</div>
      <div class="transit-item-details">
        <h4>${r.name}</h4>
        <p>Frequency: ${r.nextDeparture === "N/A" ? "Continuous" : "Every " + r.nextDeparture}</p>
      </div>
      <div>
        <span class="transit-badge ${colorClass}">${r.status}</span>
      </div>
    `;
    list.appendChild(li);
  });
}

/**
 * Hydrates the FIFA World Cup 2026 stadium directory cards
 */
function hydrateStadiumDirectory() {
  const grid = document.getElementById("stadiumDirectoryGrid");
  if (!grid) return;

  grid.innerHTML = worldCup2026Stadiums.map((stadium) => `
    <a class="stadium-card" href="${stadium.url}" target="_blank" rel="noopener noreferrer">
      <div class="stadium-card-top">
        <span class="stadium-card-flag">${stadium.flag}</span>
        <span class="stadium-card-badge">Open</span>
      </div>
      <div class="stadium-card-body">
        <h4>${stadium.name}</h4>
        <p>${stadium.city}</p>
        <small>${stadium.country}</small>
      </div>
      <div class="stadium-card-footer">
        <span>${stadium.capacity}</span>
        <span>↗</span>
      </div>
    </a>
  `).join("");
}

/**
 * Hydrates quick seat locator dropdown
 */
function hydrateSeatSelector() {
  const select = document.getElementById("seatBlockSelect");
  select.addEventListener("change", (e) => {
    const secId = e.target.value;
    if (secId) {
      const found = highlightSection("stadiumSvg", secId);
      if (found) {
        showToast({
          title: "Section Highlighted",
          message: `Highlighted ${secId.replace("sec-", "Section ")} on the map.`,
          severity: "Minor"
        });
      }
    }
  });
}

function hydrateStadiumSelector() {
  const select = document.getElementById("stadiumSelector");
  if (!select) return;

  select.innerHTML = `<option value="">Choose stadium</option>${worldCup2026Stadiums.map((stadium) => `<option value="${stadium.name}">${stadium.name} — ${stadium.city}</option>`).join("")}`;
  select.value = "MetLife Stadium";

  select.addEventListener("change", (e) => {
    const chosen = worldCup2026Stadiums.find((stadium) => stadium.name === e.target.value);
    if (!chosen) return;

    currentFanPortalStadium = chosen.name;

    const title = document.querySelector("#fanPortalView .fan-map-card .card-header h3");
    if (title) {
      title.textContent = `🗺️ ${chosen.name} Navigation Map`;
    }

    initStadiumMap("stadiumSvg", handleMapSelection, chosen.name);
    updateMatchForStadium(chosen.name);
    
    showToast({
      title: "Stadium Updated",
      message: `Showing ${chosen.name} in ${chosen.city} - Current match loaded.`,
      severity: "Minor"
    });
  });

  initStadiumMap("stadiumSvg", handleMapSelection, "MetLife Stadium");
  updateMatchForStadium("MetLife Stadium");
}

function initFeatureLaunchButtons() {
  document.querySelectorAll(".card-launch-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const feature = button.dataset.launchFeature;
      const title = button.closest(".card")?.querySelector(".card-header h3")?.textContent || "ArenaFlow Feature";
      const content = buildFeatureWindowContent(feature, title);
      openFeatureWindow(title, content);
    });
  });
}

function buildFeatureWindowContent(feature, title) {
  const selectedStadium = worldCup2026Stadiums.find((stadium) => stadium.name === document.getElementById("stadiumSelector")?.value) || worldCup2026Stadiums[0];

  switch (feature) {
    case "assistant":
      return `
        <h2>🤖 Multilingual Assistant</h2>
        <p>Open assistance for ${selectedStadium.name} with multilingual support, gate guidance, and fan services.</p>
        <ul><li>Translates common questions into multiple languages</li><li>Guides fans to gates, transit, and food options</li><li>Supports accessibility and sustainability requests</li></ul>
      `;
    case "map":
      return `
        <h2>🗺️ Stadium Layout & Navigation Map</h2>
        <p>Interactive route planning for ${selectedStadium.name} (${selectedStadium.city}, ${selectedStadium.country}).</p>
        <ul><li>View gates, concessions, and restrooms</li><li>Plan routes to your section or service point</li><li>Switch between any 2026 host venue</li></ul>
      `;
    case "transit":
      return `
        <h2>🚆 Real-Time Public Transit</h2>
        <p>Live transport guidance for ${selectedStadium.name} and surrounding transit hubs.</p>
        <ul><li>Train and shuttle status</li><li>Ride-share pickup queues</li><li>Walking routes to venue entrances</li></ul>
      `;
    case "match":
      return `
        <h2>🏆 Match Live Feed</h2>
        <p>Follow the live match feed and match-day updates for the current event.</p>
        <ul><li>Live score and match clock</li><li>Key moments and substitutions</li><li>Venue-specific event updates</li></ul>
      `;
    case "report":
      return `
        <h2>♻️ Report Issue / Assistance Request</h2>
        <p>File a request for accessibility, cleanliness, medical, or security support.</p>
        <ul><li>Submit assistance requests quickly</li><li>Route issues to operations staff</li><li>Track the status from the operations dashboard</li></ul>
      `;
    default:
      return `<h2>${title}</h2><p>Opened from ArenaFlow.</p>`;
  }
}

function openFeatureWindow(title, content) {
  const win = window.open("", "_blank", "width=960,height=720,noopener,noreferrer");
  if (!win) {
    showToast({ title: "Popup Blocked", message: "Please allow pop-ups to open the feature window.", severity: "Major" });
    return;
  }

  win.document.write(`<!DOCTYPE html><html><head><title>${title}</title><style>body{font-family:Inter,Segoe UI,sans-serif;background:#060814;color:#f1f5f9;padding:2rem;} h2{color:#00f59b;} .card{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);padding:1.25rem;border-radius:16px;} ul{line-height:1.7;} </style></head><body><div class="card">${content}</div></body></html>`);
  win.document.close();
}

/**
 * Coordinates routing pathways on the map
 */
function initRouteSelector() {
  const btnDraw = document.getElementById("btnDrawRoute");
  const btnClear = document.getElementById("btnClearRoute");
  const selFrom = document.getElementById("mapRouteFrom");
  const selTo = document.getElementById("mapRouteTo");

  btnDraw.addEventListener("click", () => {
    const fromVal = selFrom.value;
    const toVal = selTo.value;
    
    if (fromVal && toVal) {
      drawRoute("stadiumSvg", fromVal, toVal);
      showToast({
        title: "Navigation Route Drawn",
        message: `Showing path from ${fromVal.replace("gate-", "Gate ").toUpperCase()} to target.`,
        severity: "Minor"
      });
    }
  });

  btnClear.addEventListener("click", () => {
    removeRoute("stadiumSvg");
  });
}

/**
 * Toast notifications generator
 */
export function showToast({ title, message, severity }) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  const severityClass = severity === "Critical" ? "toast-critical" : severity === "Major" ? "toast-major" : "toast-minor";
  toast.className = `toast ${severityClass}`;

  const icon = severity === "Critical" ? "🚨" : severity === "Major" ? "⚠️" : "✓";

  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-body">
      <h5>${title}</h5>
      <p>${message}</p>
    </div>
    <button class="toast-close">&times;</button>
  `;

  // Attach close event
  toast.querySelector(".toast-close").addEventListener("click", () => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  });

  container.appendChild(toast);

  // Auto remove
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }
  }, 5000);
}

/**
 * Update match display for a given stadium
 */
function updateMatchForStadium(stadiumName) {
  const currentMatch = getCurrentMatchForStadium(stadiumName);
  if (!currentMatch) {
    // No match at this stadium - show default message
    const homeScoreEl = document.getElementById("homeScore");
    const awayScoreEl = document.getElementById("awayScore");
    const gameTimeEl = document.getElementById("matchGameTime");
    const headerEl = document.getElementById("headerMatchInfo");
    
    if (homeScoreEl) homeScoreEl.textContent = "-";
    if (awayScoreEl) awayScoreEl.textContent = "-";
    if (gameTimeEl) gameTimeEl.textContent = "No matches scheduled";
    if (headerEl) headerEl.textContent = `${stadiumName} - No matches`;
    return;
  }

  // Display the match
  const homeScoreEl = document.getElementById("homeScore");
  const awayScoreEl = document.getElementById("awayScore");
  const gameTimeEl = document.getElementById("matchGameTime");
  const headerEl = document.getElementById("headerMatchInfo");
  
  if (homeScoreEl) homeScoreEl.textContent = currentMatch.score.home;
  if (awayScoreEl) awayScoreEl.textContent = currentMatch.score.away;
  
  // Set status text
  let statusText = `${currentMatch.stage}`;
  if (currentMatch.status === "LIVE") {
    statusText = "🔴 LIVE";
  } else if (currentMatch.status === "COMPLETED") {
    statusText = `${currentMatch.stage} - FINAL`;
  } else if (currentMatch.status === "SCHEDULED") {
    statusText = `${currentMatch.stage} - ${currentMatch.kickoffTime}`;
  }
  
  if (gameTimeEl) gameTimeEl.textContent = statusText;
  if (headerEl) {
    const suffix = currentMatch.status === "COMPLETED" ? "(FT)" : currentMatch.status === "LIVE" ? "(LIVE)" : "";
    headerEl.textContent = `${currentMatch.homeTeam} ${currentMatch.homeFlag} ${currentMatch.score.home} - ${currentMatch.score.away} ${currentMatch.awayFlag} ${currentMatch.awayTeam} ${suffix}`;
  }
  
  // Update ticker with match events
  const tickerEl = document.getElementById("matchTicker");
  if (tickerEl) {
    const events = [];
    if (currentMatch.status === "COMPLETED" || currentMatch.status === "LIVE") {
      events.push({
        minute: Math.floor(Math.random() * 90),
        event: `${currentMatch.homeTeam} ${currentMatch.score.home} - ${currentMatch.score.away} ${currentMatch.awayTeam}`
      });
    }
    events.push({
      minute: "-",
      event: `${currentMatch.stage} • ${currentMatch.date} • ${currentMatch.kickoffTime}`
    });
    
    tickerEl.innerHTML = events
      .map(e => `<div class="ticker-item"><span class="ticker-time">${e.minute}</span> ${e.event}</div>`)
      .join("");
  }
}

/**
 * Initialize Live Scorecard with Real-Time Match Simulation
 */
function initLiveScorecard() {
  let matchState = {
    homeScore: matchDetails.score.home,
    awayScore: matchDetails.score.away,
    minute: 72,
    period: "second-half", // "first-half", "halftime", "second-half", "fulltime", "extra-time", "penalties"
    events: [
      { minute: 70, event: "⚽ GOAL! Pulisic slots it home from a beautiful assist. USA leads!" },
      { minute: 64, event: "🟨 Yellow card to Rashford for a sliding challenge." },
      { minute: 52, event: "🧤 Incredible diving save by Turner! Corner for England." }
    ],
    isRunning: true,
    nextEventTime: 0
  };

  // Update UI with initial state
  updateScorecardDisplay(matchState);

  // Simulate real-time match progression
  setInterval(() => {
    if (!matchState.isRunning) return;

    matchState.minute += 1;

    // Determine period
    if (matchState.minute < 45) {
      matchState.period = "first-half";
    } else if (matchState.minute === 45) {
      matchState.period = "halftime";
      matchState.isRunning = false; // Pause at halftime
      updateScorecardDisplay(matchState);
      showToast({
        title: "🏟️ HALFTIME",
        message: `Score: ${matchState.homeTeam || "USA"} ${matchState.homeScore} - ${matchState.awayScore} ${matchState.awayTeam || "ENG"}`,
        severity: "Minor"
      });
      setTimeout(() => {
        matchState.isRunning = true;
        matchState.minute = 46;
        matchState.period = "second-half";
      }, 8000); // 8 second halftime break
      return;
    } else if (matchState.minute <= 90) {
      matchState.period = "second-half";
    } else if (matchState.minute === 90) {
      matchState.period = "fulltime";
      matchState.isRunning = false;
      updateScorecardDisplay(matchState);
      showToast({
        title: "⏱️ FULLTIME",
        message: `Final Score: ${matchState.homeTeam || "USA"} ${matchState.homeScore} - ${matchState.awayScore} ${matchState.awayTeam || "ENG"}`,
        severity: "Minor"
      });
      return;
    }

    // Random goal chance (simplified simulation)
    if (Math.random() < 0.02) {
      const isHome = Math.random() < 0.5;
      if (isHome) {
        matchState.homeScore++;
        const goalers = ["Pulisic", "Reyna", "Pepi", "Weah"];
        const scorer = goalers[Math.floor(Math.random() * goalers.length)];
        matchState.events.unshift({ 
          minute: matchState.minute, 
          event: `⚽ GOAL! ${scorer} scores! USA ${matchState.homeScore} - ${matchState.awayScore} ENG` 
        });
        showToast({
          title: "⚽ GOAL!",
          message: `${scorer} scores for USA!`,
          severity: "Minor"
        });
      } else {
        matchState.awayScore++;
        const goalers = ["Kane", "Sterling", "Mount", "Foden"];
        const scorer = goalers[Math.floor(Math.random() * goalers.length)];
        matchState.events.unshift({ 
          minute: matchState.minute, 
          event: `⚽ GOAL! ${scorer} scores! USA ${matchState.homeScore} - ${matchState.awayScore} ENG` 
        });
        showToast({
          title: "⚽ GOAL!",
          message: `${scorer} scores for England!`,
          severity: "Minor"
        });
      }
    }

    // Random yellow/red card
    if (Math.random() < 0.015) {
      const players = ["Rashford", "Shaw", "Reyna", "Adams", "Pulisic", "Sterling"];
      const player = players[Math.floor(Math.random() * players.length)];
      const cardType = Math.random() < 0.8 ? "🟨 Yellow" : "🔴 Red";
      matchState.events.unshift({ 
        minute: matchState.minute, 
        event: `${cardType} card to ${player}` 
      });
    }

    // Random other events
    if (Math.random() < 0.01) {
      const events = [
        "🧤 Brilliant save by the goalkeeper!",
        "🎯 Shot wide by inches!",
        "🏃 Dangerous counter-attack brewing!",
        "🔄 Substitution made"
      ];
      const evt = events[Math.floor(Math.random() * events.length)];
      matchState.events.unshift({ minute: matchState.minute, event: evt });
    }

    updateScorecardDisplay(matchState);
  }, 3000); // Update every 3 seconds (1 real second ≈ 1 minute in simulation)
}

/**
 * Update scorecard display with current match state
 */
function updateScorecardDisplay(state) {
  // Update scores
  const homeScoreEl = document.getElementById("homeScore");
  const awayScoreEl = document.getElementById("awayScore");
  if (homeScoreEl) homeScoreEl.textContent = state.homeScore;
  if (awayScoreEl) awayScoreEl.textContent = state.awayScore;

  // Update match status/time
  let statusText = "";
  if (state.period === "halftime") {
    statusText = "🏟️ HALFTIME";
  } else if (state.period === "fulltime") {
    statusText = "⏱️ FULLTIME";
  } else if (state.period === "extra-time") {
    statusText = `EXTRA TIME ${state.minute - 90}'`;
  } else if (state.period === "penalties") {
    statusText = "🎯 PENALTIES";
  } else {
    statusText = `${state.period === "first-half" ? "First Half" : "Second Half"} - ${state.minute}'`;
  }

  const gameTimeEl = document.getElementById("matchGameTime");
  if (gameTimeEl) gameTimeEl.textContent = statusText;

  // Update header info
  const headerEl = document.getElementById("headerMatchInfo");
  if (headerEl) {
    if (state.period === "fulltime") {
      headerEl.textContent = `USA ${state.homeScore} - ${state.awayScore} ENG (FT)`;
    } else if (state.period === "halftime") {
      headerEl.textContent = `USA ${state.homeScore} - ${state.awayScore} ENG (HT)`;
    } else {
      headerEl.textContent = `USA ${state.homeScore} - ${state.awayScore} ENG (${state.minute}')`;
    }
  }

  // Update ticker with last 5 events
  const tickerEl = document.getElementById("matchTicker");
  if (tickerEl) {
    const recentEvents = state.events.slice(0, 5);
    tickerEl.innerHTML = recentEvents
      .map(e => `<div class="ticker-item"><span class="ticker-time">${e.minute}'</span> ${e.event}</div>`)
      .join("");
  }
}

/**
 * Setup Fan Chat & Staff Advisor Chat Submissions
 */
function initChatSystems() {
  const fanForm = document.getElementById("fanChatForm");
  const fanInput = document.getElementById("fanChatInput");
  const fanMsgBox = document.getElementById("fanChatMessages");

  const opsForm = document.getElementById("opsChatForm");
  const opsInput = document.getElementById("opsChatInput");
  const opsMsgBox = document.getElementById("opsChatMessages");

  // Fan Chat Submission
  fanForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = fanInput.value.trim();
    if (!msg) return;

    appendChatMessage(fanMsgBox, msg, "user");
    fanInput.value = "";

    // Add typing loader
    const loaderId = appendChatLoader(fanMsgBox);
    
    try {
      const response = await queryAssistant(msg, false);
      removeChatLoader(fanMsgBox, loaderId);
      appendChatMessage(fanMsgBox, response, "assistant");
    } catch (err) {
      removeChatLoader(fanMsgBox, loaderId);
      appendChatMessage(fanMsgBox, "Error processing AI response. Please check your network.", "assistant");
    }
  });

  // Ops Chat Submission
  opsForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = opsInput.value.trim();
    if (!msg) return;

    appendChatMessage(opsMsgBox, msg, "user");
    opsInput.value = "";

    // Add typing loader
    const loaderId = appendChatLoader(opsMsgBox);

    try {
      const response = await queryAssistant(msg, true);
      removeChatLoader(opsMsgBox, loaderId);
      appendChatMessage(opsMsgBox, response, "assistant");
    } catch (err) {
      removeChatLoader(opsMsgBox, loaderId);
      appendChatMessage(opsMsgBox, "Error parsing Staff SOP catalog. Please check network connectivity.", "assistant");
    }
  });

  // Chips Event Listeners
  document.querySelectorAll(".quick-chips .chip-btn").forEach(chip => {
    chip.addEventListener("click", async () => {
      const query = chip.dataset.query;
      appendChatMessage(fanMsgBox, query, "user");
      
      const loaderId = appendChatLoader(fanMsgBox);
      try {
        const response = await queryAssistant(query, false);
        removeChatLoader(fanMsgBox, loaderId);
        appendChatMessage(fanMsgBox, response, "assistant");
      } catch (err) {
        removeChatLoader(fanMsgBox, loaderId);
        appendChatMessage(fanMsgBox, "Error processing request.", "assistant");
      }
    });
  });
}

function appendChatMessage(container, text, sender) {
  const div = document.createElement("div");
  div.className = `chat-message ${sender}`;

  // Simple Markdown Parsing helper (bold and bullet points)
  let formattedText = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/### (.*?)\n/g, '<h4>$1</h4>')
    .replace(/## (.*?)\n/g, '<h3>$1</h3>')
    .replace(/^- (.*?)$/gm, '<li>$1</li>')
    .replace(/^\* (.*?)$/gm, '<li>$1</li>')
    .replace(/\n/g, '<br>');

  // Wrap lists
  if (formattedText.includes('<li>')) {
    // Basic formatting replacement to group list items
    formattedText = formattedText.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
  }

  div.innerHTML = `
    <div class="message-bubble">
      ${formattedText}
    </div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function appendChatLoader(container) {
  const id = `loader-${Date.now()}`;
  const div = document.createElement("div");
  div.className = "chat-message assistant loader-bubble";
  div.id = id;
  div.innerHTML = `
    <div class="message-bubble" style="display:flex; align-items:center; gap:0.5rem; color:var(--color-text-muted)">
      <div class="spinner" style="width:14px; height:14px; border-width:2px;"></div>
      <span>Gemini is thinking...</span>
    </div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeChatLoader(container, id) {
  const el = container.querySelector(`#${id}`);
  if (el) el.remove();
}

/**
 * Handle Fan Issue Reporting Form Submission
 */
function initReportSystem() {
  const form = document.getElementById("fanReportForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const type = document.getElementById("reportType").value;
    const location = document.getElementById("reportLocation").value.trim();
    const description = document.getElementById("reportDescription").value.trim();

    const report = { type, location, description };

    // Send report to Operations Incident list
    logNewIncident(report, showToast);

    // Reset UI
    form.reset();

    showToast({
      title: "Report Transmitted",
      message: "Your assistance request has been received by Stadium Central Operations.",
      severity: "Minor"
    });
  });
}

/**
 * Handles clicks on the Interactive Stadium SVG Map
 */
function handleMapSelection(elem) {
  const popup = document.getElementById("mapInfoPopup");
  const content = document.getElementById("popupContent");
  
  popup.style.display = "block";

  if (elem.type === "Section") {
    content.innerHTML = `
      <h4>📍 ${elem.name}</h4>
      <p>Capacity: ~8,200 seats. Flow State: Nominal. Accessibility elevator access available near East Portal.</p>
    `;
  } else if (elem.type === "Gate") {
    content.innerHTML = `
      <h4>🚪 ${elem.data.name}</h4>
      <p>Status: <strong>${elem.data.status}</strong> | Security Queue: <strong>${elem.data.waitTime} minutes</strong> wait (${elem.data.load} traffic load)</p>
    `;
  } else if (elem.type === "Concession") {
    content.innerHTML = `
      <h4>${elem.data.icon} Concession: ${elem.data.name}</h4>
      <p>Section: ${elem.data.section} | Wait Line: <strong>${elem.data.waitTime} mins</strong> | Vegan Option: <strong>${elem.data.isVegan ? 'Yes' : 'No'}</strong> | Rating: ★ ${elem.data.rating}</p>
    `;
  } else if (elem.type === "Restroom") {
    content.innerHTML = `
      <h4>🚻 Facility: ${elem.data.name}</h4>
      <p>Type: ${elem.data.gender} | Queue Level: <strong>${elem.data.load} (${elem.data.waitTime} mins wait)</strong> | Baby-Changing table: <strong>${elem.data.hasChangingTable ? 'Available' : 'None'}</strong> | ADA Accessible: <strong>Yes</strong></p>
    `;
  }
}

// Attach popup close click handler
document.getElementById("btnClosePopup").addEventListener("click", () => {
  document.getElementById("mapInfoPopup").style.display = "none";
});
