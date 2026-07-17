/**
 * operations.js
 * Operations dashboard controller, incident tracker, AI dispatch advisor coordinator,
 * and executive summary assembler.
 */

import { initialIncidents, staffSOPs, gates, worldCup2026Stadiums, getCurrentMatchForStadium } from './mockData.js';
import { analyzeIncident, generateHealthSummary } from './aiService.js';
import { updateHeatmapScenario, startHeatmap } from './map.js';

// State management
export let incidents = [...initialIncidents];
let selectedIncidentId = null;
let currentAiBriefing = null; // Store active triage result
let currentStadium = "MetLife Stadium"; // Track selected stadium

/**
 * Initialize Operations Portal Event Listeners & Layout
 */
export function initOperationsPortal(toastCallback) {
  initOpsStadiumSelector(toastCallback);
  renderIncidentsList();
  updateOpsMetrics();

  // Search filter
  document.getElementById("incidentSearch").addEventListener("input", filterAndRenderIncidents);
  document.getElementById("severityFilter").addEventListener("change", filterAndRenderIncidents);

  // AI Triage Trigger Button
  document.getElementById("btnTriggerTriage").addEventListener("click", triggerAiTriage);

  // Action Buttons
  document.getElementById("btnDispatchTeam").addEventListener("click", () => dispatchTeam(toastCallback));
  document.getElementById("btnIncidentResolved").addEventListener("click", () => resolveIncident(toastCallback));

  // Copy Broadcast Button
  document.getElementById("btnCopyBroadcast").addEventListener("click", copyBroadcastText);

  // Announcement Language Tabs
  const tabBtns = document.querySelectorAll(".announcement-tabs .tab-btn");
  tabBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      tabBtns.forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      updateBroadcastLanguage(e.target.dataset.lang);
    });
  });

  // Simulation Selector Buttons
  const simBtns = document.querySelectorAll(".simulation-selector .btn-sim");
  simBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      simBtns.forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      const scenario = e.target.dataset.sim;
      
      // Update Canvas
      updateHeatmapScenario(scenario);
      
      // Update badge
      document.getElementById("simulationBadge").textContent = `Scenario: ${e.target.textContent}`;
      
      toastCallback({
        title: "Simulation Scenario Activated",
        message: `Heatmap re-calibrated for "${e.target.textContent}" conditions.`,
        severity: "Minor"
      });
    });
  });

  // Executive summary briefing button
  document.getElementById("btnGenerateSummary").addEventListener("click", compileExecutiveSummary);
}

/**
 * Pushes a new incident report to the active queue (called from Fan Portal report form)
 */
export function logNewIncident(report, toastCallback) {
  const newInc = {
    id: `inc-00${incidents.length + 1}`,
    reporter: "Fan (App Report)",
    type: report.type,
    location: report.location,
    description: report.description,
    status: "Active",
    severity: report.type.includes("Medical") ? "Critical" : report.type.includes("Congestion") ? "Major" : "Minor",
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    actionsTaken: []
  };

  incidents.unshift(newInc); // Add to top
  renderIncidentsList();
  updateOpsMetrics();

  // Show Toast to Operations Coordinator
  toastCallback({
    title: `New Incident logged (${newInc.severity})`,
    message: `${newInc.type} reported at ${newInc.location}`,
    severity: newInc.severity
  });
}

/**
 * Initialize the Operations Stadium Selector
 */
function initOpsStadiumSelector(toastCallback) {
  const selector = document.getElementById("opsStadiumSelector");
  if (!selector) return;

  selector.innerHTML = `<option value="">Choose stadium</option>${worldCup2026Stadiums.map((stadium) => `<option value="${stadium.name}">${stadium.name} — ${stadium.city}</option>`).join("")}`;
  selector.value = "MetLife Stadium";

  selector.addEventListener("change", (e) => {
    const chosen = worldCup2026Stadiums.find((stadium) => stadium.name === e.target.value);
    if (!chosen) return;

    currentStadium = chosen.name;
    renderIncidentsList();
    updateOpsMetricsForStadium(chosen);
    refreshHeatmapForStadium(chosen);

    toastCallback({
      title: "Operations View Updated",
      message: `Dashboard refreshed for ${chosen.name} (${chosen.city}).`,
      severity: "Minor"
    });
  });
}

/**
 * Update metrics for a specific stadium
 */
function updateOpsMetricsForStadium(stadium) {
  const capacityNum = parseInt(stadium.capacity.replace(/,/g, "")) || 82500;
  const attendance = Math.floor(capacityNum * 0.95);

  const attendanceCard = document.querySelector(".ops-metrics-row .metric-card:first-child");
  if (attendanceCard) {
    const metricValue = attendanceCard.querySelector(".metric-value");
    const fillPct = attendanceCard.querySelector(".fill-pct");
    if (metricValue) metricValue.innerHTML = `${attendance.toLocaleString()} <span class="sub-val">/ ${capacityNum.toLocaleString()}</span>`;
    if (fillPct) fillPct.style.width = "95%";
  }

  const stadiumIncidents = incidents.filter((inc) => !inc.location || inc.location.toLowerCase().includes(stadium.name.substring(0, 10)));
  const criticalCount = stadiumIncidents.filter((inc) => inc.severity === "Critical").length;

  const incidentCountEl = document.getElementById("opsMetricIncidentCount");
  const criticalEl = document.getElementById("opsMetricCriticalCount");
  if (incidentCountEl) incidentCountEl.textContent = `${stadiumIncidents.length} `;
  if (criticalEl) criticalEl.textContent = `${criticalCount} Critical`;
}

/**
 * Refresh heatmap with stadium-specific crowd density visualization
 */
function refreshHeatmapForStadium(stadium) {
  const canvas = document.getElementById("heatmapCanvas");
  if (!canvas) return;

  startHeatmap("heatmapCanvas", "normal");

  const badge = document.getElementById("simulationBadge");
  if (badge) {
    badge.textContent = `${stadium.name} - Scenario: Normal Grid`;
  }
}

/**
 * Updates operations KPIs and counter labels
 */
export function updateOpsMetrics() {
  const activeCount = incidents.filter(i => i.status !== "Resolved").length;
  const criticalCount = incidents.filter(i => i.status !== "Resolved" && i.severity === "Critical").length;

  const countText = `${activeCount} <span class="sub-val">${criticalCount} Critical</span>`;
  document.getElementById("opsMetricIncidentCount").innerHTML = countText;

  const metricCard = document.getElementById("opsMetricIncidents");
  if (activeCount > 0) {
    metricCard.classList.add("warning-glow");
  } else {
    metricCard.classList.remove("warning-glow");
  }
}

/**
 * Filter incident list based on Search text and Severity dropdown selection
 */
function filterAndRenderIncidents() {
  const query = document.getElementById("incidentSearch").value.toLowerCase();
  const severityFilter = document.getElementById("severityFilter").value;

  const filtered = incidents.filter(i => {
    const matchesQuery = i.location.toLowerCase().includes(query) || 
                         i.type.toLowerCase().includes(query) || 
                         i.description.toLowerCase().includes(query);
    const matchesSeverity = severityFilter === "" || i.severity === severityFilter;
    return matchesQuery && matchesSeverity;
  });

  renderIncidentsList(filtered);
}

/**
 * Renders the incident feed markup
 */
function renderIncidentsList(listToRender = incidents) {
  const container = document.getElementById("opsIncidentsList");
  container.innerHTML = "";

  if (listToRender.length === 0) {
    container.innerHTML = `<p style="text-align: center; color: var(--color-text-muted); font-size: 0.8rem; margin-top: 1rem;">No incidents matching filters.</p>`;
    return;
  }

  listToRender.forEach(i => {
    const item = document.createElement("div");
    
    let borderClass = "minor-border";
    if (i.severity === "Critical") borderClass = "critical-border";
    else if (i.severity === "Major") borderClass = "major-border";

    item.className = `incident-item-row ${borderClass} ${selectedIncidentId === i.id ? 'selected' : ''}`;
    
    // Status Badge
    let statusClass = "badge-green";
    if (i.status === "Active") statusClass = "badge-red";
    else if (i.status === "Dispatched") statusClass = "badge-orange";

    item.innerHTML = `
      <div class="incident-row-details">
        <h4>${i.location}</h4>
        <p>${i.type} • ${i.timestamp}</p>
      </div>
      <div class="incident-row-status">
        <span class="badge ${statusClass}">${i.status}</span>
        <span class="incident-row-time">${i.reporter}</span>
      </div>
    `;

    item.addEventListener("click", () => selectIncident(i.id));
    container.appendChild(item);
  });
}

/**
 * Opens detailed incident view in the Triage Panel & suggest correct SOP
 */
function selectIncident(id) {
  selectedIncidentId = id;
  renderIncidentsList(); // update highlights

  const inc = incidents.find(i => i.id === id);
  if (!inc) return;

  // Swap panels
  document.getElementById("triageEmptyState").classList.add("hidden");
  const activePane = document.getElementById("triageActiveState");
  activePane.classList.remove("hidden");

  // Load details
  document.getElementById("triageLocation").textContent = inc.location;
  document.getElementById("triageReporter").textContent = `Reporter: ${inc.reporter}`;
  document.getElementById("triageDescription").textContent = inc.description;
  
  const sevBadge = document.getElementById("triageSeverityBadge");
  sevBadge.textContent = inc.severity;
  sevBadge.className = "badge";
  if (inc.severity === "Critical") sevBadge.classList.add("badge-red");
  else if (inc.severity === "Major") sevBadge.classList.add("badge-orange");
  else sevBadge.classList.add("badge-green");

  // Determine SOP based on type
  let matchedSop = staffSOPs.medical; // fallback
  const typeLower = inc.type.toLowerCase();
  
  if (typeLower.includes("medical") || typeLower.includes("aid")) matchedSop = staffSOPs.medical;
  else if (typeLower.includes("congestion") || typeLower.includes("gate")) matchedSop = staffSOPs.congested_gate;
  else if (typeLower.includes("clean") || typeLower.includes("spill") || typeLower.includes("trash")) matchedSop = staffSOPs.spill_sustainability;
  else if (typeLower.includes("fire") || typeLower.includes("evacuate")) matchedSop = staffSOPs.fire;
  else if (typeLower.includes("security") || typeLower.includes("lost")) matchedSop = staffSOPs.lost_child;

  document.getElementById("triageSopTitle").textContent = matchedSop.title;
  
  // Render steps
  const stepsContainer = document.getElementById("triageSopSteps");
  stepsContainer.innerHTML = matchedSop.steps.map(step => `<li>${step}</li>`).join("");

  // Clear previous AI results
  document.getElementById("triageAiResults").classList.add("hidden");
  document.getElementById("btnTriggerTriage").classList.remove("hidden");
}

/**
 * Triggers the GenAI API call to generate incident response briefings
 */
async function triggerAiTriage() {
  const btn = document.getElementById("btnTriggerTriage");
  const aiResultsPanel = document.getElementById("triageAiResults");
  const loading = document.getElementById("aiTriageLoading");
  const loaded = document.getElementById("aiTriageLoaded");

  btn.classList.add("hidden");
  aiResultsPanel.classList.remove("hidden");
  loading.classList.remove("hidden");
  loaded.classList.add("hidden");

  const inc = incidents.find(i => i.id === selectedIncidentId);
  if (!inc) return;

  const matchedSopText = document.getElementById("triageSopTitle").textContent + "\n" + 
    Array.from(document.querySelectorAll("#triageSopSteps li")).map((el, i) => `${i+1}. ${el.textContent}`).join("\n");

  try {
    const analysis = await analyzeIncident(inc.description, matchedSopText);
    currentAiBriefing = analysis; // Cache results

    // Populate briefing text
    document.getElementById("aiTriageBriefing").textContent = analysis.staffInstructions;

    // Populate actions checklist
    const checklist = document.getElementById("aiActionChecklist");
    checklist.innerHTML = analysis.immediateActions.map((act, index) => `
      <li>
        <input type="checkbox" id="chk-act-${index}">
        <label for="chk-act-${index}">${act}</label>
      </li>
    `).join("");

    // Set default broadcast translation tab (EN)
    document.querySelector(".announcement-tabs .tab-btn[data-lang='en']").click();

    loading.classList.add("hidden");
    loaded.classList.remove("hidden");

  } catch (error) {
    console.error("AI Analysis error:", error);
    loading.classList.add("hidden");
    aiResultsPanel.classList.add("hidden");
    btn.classList.remove("hidden");
    alert("Generative AI was unable to parse this incident. Check credentials or internet connection.");
  }
}

/**
 * Handle tabs for language translations of drafted announcements
 */
function updateBroadcastLanguage(lang) {
  if (!currentAiBriefing || !currentAiBriefing.draftAnnouncements) return;
  const textbox = document.getElementById("aiBroadcastText");
  textbox.value = currentAiBriefing.draftAnnouncements[lang] || "No translation available.";
}

/**
 * Copy public announcement text to clipboard
 */
function copyBroadcastText() {
  const textbox = document.getElementById("aiBroadcastText");
  textbox.select();
  navigator.clipboard.writeText(textbox.value);
  
  const btn = document.getElementById("btnCopyBroadcast");
  btn.textContent = "Copied! ✓";
  setTimeout(() => {
    btn.textContent = "Copy text";
  }, 1500);
}

/**
 * Dispatch Team: change incident state
 */
function dispatchTeam(toastCallback) {
  const inc = incidents.find(i => i.id === selectedIncidentId);
  if (!inc) return;

  inc.status = "Dispatched";
  renderIncidentsList();
  updateOpsMetrics();

  toastCallback({
    title: "Squad Dispatched",
    message: `Staff alerted on Channel. Response unit en route to ${inc.location}.`,
    severity: "Minor"
  });

  selectIncident(inc.id); // Refresh drawer
}

/**
 * Mark Incident as Resolved
 */
function resolveIncident(toastCallback) {
  const inc = incidents.find(i => i.id === selectedIncidentId);
  if (!inc) return;

  inc.status = "Resolved";
  renderIncidentsList();
  updateOpsMetrics();

  toastCallback({
    title: "Incident Resolved",
    message: `Case ${inc.id} at ${inc.location} has been successfully closed.`,
    severity: "Minor"
  });

  // Reset Pane
  document.getElementById("triageActiveState").classList.add("hidden");
  document.getElementById("triageEmptyState").classList.remove("hidden");
  selectedIncidentId = null;
}

/**
 * Compiles real-time telemetry metrics and calls GenAI to generate stadium health narrative
 */
async function compileExecutiveSummary() {
  const box = document.getElementById("opsSummaryText");
  const loading = document.getElementById("aiSummaryLoading");
  const btn = document.getElementById("btnGenerateSummary");

  btn.classList.add("hidden");
  box.classList.add("hidden");
  loading.classList.remove("hidden");

  // Gather live telemetry state
  const activeIncCount = incidents.filter(i => i.status !== "Resolved").length;
  const critIncCount = incidents.filter(i => i.status !== "Resolved" && i.severity === "Critical").length;
  
  // Find highest wait time gate
  let peakWait = 0;
  let peakGate = "None";
  gates.forEach(g => {
    if (g.waitTime > peakWait) {
      peakWait = g.waitTime;
      peakGate = g.name;
    }
  });

  const metrics = {
    attendance: 82500,
    capacity: 82500,
    peakGateWait: peakWait,
    peakGateName: peakGate,
    activeIncidents: activeIncCount,
    criticalIncidents: critIncCount,
    transitDelay: "Meadowlands Rail: 10 mins delay",
    rideshareSurge: "Uber/Lyft Surge Active",
    wasteSorted: 83.4,
    energyGrid: 72
  };

  try {
    const summary = await generateHealthSummary(metrics);
    
    loading.classList.add("hidden");
    box.classList.remove("hidden");
    box.classList.add("ai-written");
    btn.classList.remove("hidden");
    
    // Typewriter animation effect
    box.textContent = "";
    let i = 0;
    function type() {
      if (i < summary.length) {
        box.textContent += summary.charAt(i);
        i++;
        setTimeout(type, 15);
      }
    }
    type();

  } catch (error) {
    console.error("Summary generation error:", error);
    loading.classList.add("hidden");
    box.classList.remove("hidden");
    btn.classList.remove("hidden");
    box.textContent = "Error compiling briefing text. Check your network or API keys.";
  }
}
