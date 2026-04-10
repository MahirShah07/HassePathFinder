import { createGraph } from "./graph.js";
import {
  sampleGraph,
  buildDivisibilityRelation,
  generateRandomDAG,
  parseRelationInput,
  checkPoset,
  buildHasseFromRelations,
  validateGraph
} from "./data.js";
import { buildAdjacency, traverseGraph } from "./algorithms.js";
import { createUI } from "./ui.js";
import { exportSvg, exportPng, getThemeTokens } from "./export.js";

const state = {
  nodes: [],
  edges: [],
  startId: null,
  endId: null,
  selectionMode: "start",
  algo: "bfs",
  speedMs: 650,
  stepMode: false,
  running: false,
  timerId: null,
  relationEditTimerId: null,
  stepIndex: 0,
  steps: [],
  labelById: new Map()
};

const graphContainer = document.querySelector("#graph");
const graph = createGraph(graphContainer, {
  onNodeClick: handleNodeClick
});

const ui = createUI({
  onRunBfs: () => startTraversal("bfs"),
  onRunDfs: () => startTraversal("dfs"),
  onReset: () => resetTraversal(false),
  onSelectStartMode: () => setSelectionMode("start"),
  onSelectEndMode: () => setSelectionMode("end"),
  onClearStart: () => clearSelection("start"),
  onClearEnd: () => clearSelection("end"),
  onRandomGraph: () => loadRandomGraph(),
  onStepModeToggle: () => toggleStepMode(),
  onNextStep: () => handleNextStep(),
  onStepModalClose: () => handleStepModalClose(),
  onApplyRelations: () => applyRelations(),
  onLoadRelationSample: () => loadRelationSample(),
  onGenerateElementsRange: () => generateElementsRange(),
  onGeneratePoset: () => generatePosetRelation(),
  onRelationOptionsChanged: () => updateRelationOptionsSummary(),
  onRelationsInputChanged: () => handleRelationsInputChanged(),
  onOpenPresentDoc: () => openProjectAssetPage("present"),
  onSpeedChange: (value) => updateSpeed(value),
  onAlgoChange: (algo) => setAlgo(algo),
  onExportSvg: () =>
    exportSvg(graph.getSvgElement(), buildExportName("svg"), getThemeTokens()),
  onExportPng: () =>
    exportPng(graph.getSvgElement(), buildExportName("png"), getThemeTokens())
});

initialize();

function initialize() {
  const storedTheme = localStorage.getItem("hasse-theme");
  if (storedTheme === "dark" || storedTheme === "light") {
    document.documentElement.dataset.theme = storedTheme;
  } else {
    document.documentElement.dataset.theme = "light";
  }

  const sample = sampleGraph();
  loadRelationSample(false);
  ui.setAlgo(state.algo);
  ui.setSpeedLabel(state.speedMs);
  ui.setStepMode(state.stepMode);
  ui.setSelectionMode(state.selectionMode);
  updateRelationOptionsSummary();
  ui.setNextStepEnabled(false);
  setIdleTrace();
  loadGraph(sample);

  window.addEventListener("resize", () => {
    graph.resize();
  });

  window.addEventListener("keydown", (event) => {
    if (state.running) {
      return;
    }

    if (isTypingTarget(event.target)) {
      return;
    }

    const key = event.key.toLowerCase();
    const modifierPressed = event.ctrlKey || event.metaKey;
    if (!modifierPressed) {
      return;
    }

    if (key === "z" && !event.shiftKey) {
      const changed = graph.undoNodeMove();
      if (changed) {
        event.preventDefault();
      }
      return;
    }

    if (key === "y" || (key === "z" && event.shiftKey)) {
      const changed = graph.redoNodeMove();
      if (changed) {
        event.preventDefault();
      }
    }
  });
}

function isTypingTarget(target) {
  if (!target || !(target instanceof HTMLElement)) {
    return false;
  }
  if (target.isContentEditable) {
    return true;
  }
  const tagName = target.tagName;
  return tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";
}

function loadRandomGraph() {
  stopTraversal();
  const randomGraph = generateRandomDAG();
  loadGraph(randomGraph);
}

function loadGraph(graphData) {
  const validation = validateGraph(graphData.nodes, graphData.edges);
  if (!validation.ok) {
    ui.setInputError(validation.error);
    return;
  }

  state.nodes = graphData.nodes;
  state.edges = graphData.edges;
  state.labelById = new Map(
    graphData.nodes.map((node) => [node.id, node.label])
  );
  state.startId = null;
  state.endId = null;
  state.selectionMode = "start";

  graph.setData(state.nodes, state.edges);
  graph.clearTraversalState();
  graph.setSelection({ startId: null, endId: null });

  updateAdjacency();
  ui.setSelection(null, null, state.labelById);
  ui.setSelectionMode(state.selectionMode);
  ui.setInfo("Graph ready. Select a start node and an end node to begin.", "idle");
  ui.setNextStepEnabled(false);
  setIdleTrace();
  ui.clearLog();
}

function loadRelationSample(apply = true) {
  const relationSample = buildDivisibilityRelation([1, 2, 3, 4, 6, 12]);
  ui.setRelationCountInput(relationSample.elements.length);
  ui.setRelationRuleInput("x | y");
  updateRelationOptionsSummary();
  ui.setElementsInput(relationSample.elements.join(", "));
  ui.setRelationsInput(formatRelationText(relationSample.relations));
  ui.toggleRelationOptions(false);
  ui.setRelationError("");
  ui.setRelationProof("");
  if (apply) {
    applyRelations();
  }
}

function applyRelations() {
  stopTraversal();
  const elementsText = ui.getElementsInput();
  const relationsText = ui.getRelationsInput();
  const parsed = parseRelationInput(elementsText, relationsText);
  if (parsed.error) {
    ui.setRelationError(parsed.error);
    ui.setRelationProof("");
    return;
  }

  const proof = checkPoset(parsed.elements, parsed.relations);
  const proofText = buildProofReport(parsed, proof);
  ui.setRelationProof(proofText);

  if (!proof.isPoset) {
    ui.setRelationError("Relation S is not a poset. Fix the violations below.");
    return;
  }

  ui.setRelationError("");
  const graphData = buildHasseFromRelations(parsed.elements, parsed.relations);
  loadGraph(graphData);
}

function generatePosetRelation() {
  stopTraversal();

  const rule = ui.getRelationRuleInput();
  const inputElements = parseElementsFromText(ui.getElementsInput());
  const elements = inputElements.length
    ? sortElements(inputElements)
    : ["1", "2", "3", "4", "6", "12"];

  const result = buildRelationsFromRule(elements, rule);
  if (result.error) {
    ui.setRelationError(result.error);
    ui.toggleRelationOptions(true);
    return;
  }

  ui.setElementsInput(elements.join(", "));
  ui.setRelationsInput(formatRelationText(result.relations));
  updateRelationOptionsSummary();
  ui.setRelationError("");
  applyRelations();
}

function generateElementsRange() {
  const count = ui.getRelationCountInput();
  if (!Number.isInteger(count) || count < 1) {
    ui.setRelationError("Enter a valid integer count greater than 0.");
    ui.toggleRelationOptions(true);
    return;
  }
  const capped = Math.min(count, 200);
  const elements = Array.from({ length: capped }, (_, i) => String(i + 1));
  ui.setElementsInput(elements.join(", "));
  updateRelationOptionsSummary();
  ui.setRelationError("");
}

function updateRelationOptionsSummary() {
  const count = ui.getRelationCountInput();
  const safeCount = Number.isInteger(count) && count > 0 ? count : 6;
  const rule = ui.getRelationRuleInput() || "x | y";
  ui.setRelationOptionsSummary(
    `Default generation: elements {1..${safeCount}} with relation rule R(x, y): ${rule}`
  );
}

function handleRelationsInputChanged() {
  if (state.running) {
    return;
  }
  if (state.relationEditTimerId) {
    window.clearTimeout(state.relationEditTimerId);
  }
  state.relationEditTimerId = window.setTimeout(() => {
    state.relationEditTimerId = null;
    applyRelations();
  }, 350);
}

function openProjectAssetPage(anchor) {
  window.open(`./project-assets.html#${anchor}`, "_blank", "noopener,noreferrer");
}

function updateAdjacency() {
  const adjacency = buildAdjacency(state.nodes, state.edges);
  const lines = state.nodes.map((node) => {
    const neighbors = adjacency.get(node.id) || [];
    const labels = neighbors.map((id) => state.labelById.get(id) || id);
    return `${node.label}: ${labels.length ? labels.join(", ") : "-"}`;
  });
  ui.setAdjacencyList(lines.join("\n"));
}

function handleNodeClick(nodeId) {
  if (state.running) return;

  if (state.selectionMode === "start") {
    state.startId = nodeId;
    if (state.endId === nodeId) {
      state.endId = null;
    }
  } else {
    state.endId = nodeId;
    if (state.startId === nodeId) {
      state.startId = null;
    }
  }

  updateSelection();
}

function setSelectionMode(mode) {
  if (state.running || (mode !== "start" && mode !== "end")) {
    return;
  }
  state.selectionMode = mode;
  ui.setSelectionMode(state.selectionMode);
}

function clearSelection(mode) {
  if (state.running) {
    return;
  }

  if (mode === "start") {
    state.startId = null;
  } else if (mode === "end") {
    state.endId = null;
  } else {
    return;
  }

  updateSelection();
}

function updateSelection() {
  graph.setSelection({ startId: state.startId, endId: state.endId });
  ui.setSelection(state.startId, state.endId, state.labelById);
}

function startTraversal(mode) {
  if (!state.startId || !state.endId) {
    ui.setInfo("Select both a start and an end node before running.", "warn");
    return;
  }

  stopTraversal();
  setAlgo(mode);
  graph.clearTraversalState();

  const adjacency = buildAdjacency(state.nodes, state.edges);
  const result = traverseGraph({
    startId: state.startId,
    endId: state.endId,
    adjacency,
    mode
  });

  state.steps = result.steps;
  state.stepIndex = 0;

  if (!state.steps.length) {
    ui.setInfo("No traversal steps available.", "warn");
    return;
  }

  ui.clearLog();
  ui.setControlsDisabled(true);
  state.running = true;
  ui.setNextStepEnabled(state.stepMode);
  advanceStep();
}

function advanceStep() {
  if (!state.running) return;
  if (state.stepIndex >= state.steps.length) {
    state.running = false;
    ui.setControlsDisabled(false);
    ui.setNextStepEnabled(false);
    ui.hideStepModal();
    return;
  }

  const step = state.steps[state.stepIndex];
  const stepNumber = state.stepIndex + 1;
  const total = state.steps.length;

  const frontierLabel = state.algo === "bfs" ? "Queue" : "Stack";
  const frontierText = formatList(step.frontier || []);
  const traceText = formatTrace(step.trace || []);
  const visitedText = formatList(step.visited || []);
  const currentLabel = step.current
    ? state.labelById.get(step.current) || step.current
    : "none";
  const activeEdgeText = step.activeEdge
    ? `${state.labelById.get(step.activeEdge.source) || step.activeEdge.source} -> ${state.labelById.get(step.activeEdge.target) || step.activeEdge.target}`
    : "none";

  graph.setTraversalState({
    visited: step.visited,
    current: step.current,
    path: step.path,
    activeEdge: step.activeEdge,
    visitedOrder: step.visited
  });

  const infoLines = [
    step.message,
    `Current: ${currentLabel}`,
    `${frontierLabel}: ${frontierText}`,
    `Visited: ${visitedText}`,
    `Trace: ${traceText}`,
    `Edge: ${activeEdgeText}`
  ];
  ui.setInfo(infoLines.join("\n"), step.status || "info");
  ui.setLiveTrace({ frontierLabel, frontierText, traceText });
  ui.appendLog(`${stepNumber}/${total} ${step.message}`);

  state.stepIndex += 1;

  if (state.stepIndex < state.steps.length) {
    if (state.stepMode) {
      const nextStep = state.steps[state.stepIndex];
      const previewLines = buildStepPreview(nextStep, frontierLabel);
      ui.setNextStepEnabled(true);
      ui.showStepModal({
        title: `Step ${stepNumber} of ${total} (${state.algo.toUpperCase()})`,
        explanation: infoLines.join("\n"),
        nextText: previewLines.join("\n"),
        isLast: false
      });
    } else {
      state.timerId = window.setTimeout(advanceStep, state.speedMs);
    }
  } else {
    state.running = false;
    ui.setControlsDisabled(false);
    ui.setNextStepEnabled(false);
    if (state.stepMode) {
      ui.showStepModal({
        title: `Step ${stepNumber} of ${total} (${state.algo.toUpperCase()})`,
        explanation: infoLines.join("\n"),
        nextText: "Traversal complete.",
        isLast: true
      });
    }
  }
}

function resetTraversal(resetLayout) {
  stopTraversal();
  graph.clearTraversalState();
  if (resetLayout) {
    graph.resetLayout();
  }

  ui.setInfo("Traversal reset. Select nodes to run again.", "idle");
  ui.hideStepModal();
  setIdleTrace();
  ui.clearLog();
  state.startId = null;
  state.endId = null;
  state.selectionMode = "start";
  ui.setSelectionMode(state.selectionMode);
  updateSelection();
}

function stopTraversal() {
  if (state.timerId) {
    window.clearTimeout(state.timerId);
  }
  if (state.relationEditTimerId) {
    window.clearTimeout(state.relationEditTimerId);
  }
  state.timerId = null;
  state.relationEditTimerId = null;
  state.running = false;
  ui.setControlsDisabled(false);
  ui.setNextStepEnabled(false);
  ui.hideStepModal();
}

function updateSpeed(value) {
  state.speedMs = value;
  ui.setSpeedLabel(value);
}

function setAlgo(algo) {
  state.algo = algo;
  ui.setAlgo(algo);
  if (!state.running) {
    setIdleTrace();
  }
}

function toggleStepMode() {
  if (state.running) {
    return;
  }
  state.stepMode = !state.stepMode;
  ui.setStepMode(state.stepMode);
  ui.setNextStepEnabled(false);
  if (!state.stepMode) {
    ui.hideStepModal();
  }
}

function handleNextStep() {
  if (!state.stepMode) {
    return;
  }

  if (!state.running) {
    ui.hideStepModal();
    return;
  }

  ui.hideStepModal();
  advanceStep();
}

function handleStepModalClose() {
  if (!state.running) {
    return;
  }
  ui.setNextStepEnabled(true);
}

function setIdleTrace() {
  const frontierLabel = state.algo === "bfs" ? "Queue" : "Stack";
  ui.setLiveTrace({ frontierLabel, frontierText: "[]", traceText: "[]" });
}

function buildExportName(ext) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `hasse-diagram-${timestamp}.${ext}`;
}

function buildRelationsFromRule(elements, ruleText) {
  const predicateResult = createRelationPredicate(ruleText);
  if (predicateResult.error) {
    return { error: predicateResult.error };
  }

  const relations = [];
  for (const x of elements) {
    for (const y of elements) {
      if (predicateResult.predicate(x, y)) {
        relations.push({ source: x, target: y });
      }
    }
  }
  return { relations };
}

function createRelationPredicate(ruleText) {
  const normalized = String(ruleText || "")
    .toLowerCase()
    .replace(/\s+/g, "");

  if (!normalized) {
    return { error: "Enter a relation rule, for example x <= y or x | y." };
  }

  if (normalized === "x<=y") return { predicate: (x, y) => compareAsNumbers(x, y, (a, b) => a <= b) };
  if (normalized === "x<y") return { predicate: (x, y) => compareAsNumbers(x, y, (a, b) => a < b) };
  if (normalized === "x>=y") return { predicate: (x, y) => compareAsNumbers(x, y, (a, b) => a >= b) };
  if (normalized === "x>y") return { predicate: (x, y) => compareAsNumbers(x, y, (a, b) => a > b) };
  if (normalized === "x==y" || normalized === "x=y") return { predicate: (x, y) => x === y };
  if (normalized === "x!=y") return { predicate: (x, y) => x !== y };
  if (normalized === "x|y") return { predicate: (x, y) => divides(x, y) };
  if (normalized === "y|x") return { predicate: (x, y) => divides(y, x) };

  return {
    error: "Unsupported rule. Use one of: x <= y, x < y, x >= y, x > y, x = y, x != y, x | y, y | x."
  };
}

function compareAsNumbers(left, right, fn) {
  const a = Number(left);
  const b = Number(right);
  if (Number.isNaN(a) || Number.isNaN(b)) {
    return false;
  }
  return fn(a, b);
}

function divides(left, right) {
  const a = Number(left);
  const b = Number(right);
  if (!Number.isInteger(a) || !Number.isInteger(b) || a === 0) {
    return false;
  }
  return b % a === 0;
}

function parseElementsFromText(elementsText) {
  return Array.from(
    new Set(
      (elementsText || "")
        .split(/[\s,]+/)
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
}

function sortElements(elements) {
  const allNumeric = elements.every((value) => /^-?\d+(\.\d+)?$/.test(value));
  if (allNumeric) {
    return [...elements].sort((a, b) => Number(a) - Number(b));
  }
  return [...elements].sort((a, b) => a.localeCompare(b));
}

function buildStepPreview(step, frontierLabel) {
  if (!step) {
    return ["Traversal complete."];
  }
  const currentLabel = step.current
    ? state.labelById.get(step.current) || step.current
    : "none";
  const frontierText = formatList(step.frontier || []);
  const visitedText = formatList(step.visited || []);
  const traceText = formatTrace(step.trace || []);
  const activeEdgeText = step.activeEdge
    ? `${state.labelById.get(step.activeEdge.source) || step.activeEdge.source} -> ${state.labelById.get(step.activeEdge.target) || step.activeEdge.target}`
    : "none";
  return [
    step.message,
    `Current: ${currentLabel}`,
    `${frontierLabel}: ${frontierText}`,
    `Visited: ${visitedText}`,
    `Trace: ${traceText}`,
    `Edge: ${activeEdgeText}`
  ];
}

function formatList(list) {
  const labels = list.map((id) => state.labelById.get(id) || id);
  return `[${labels.join(", ")}]`;
}

function formatTrace(list) {
  const labels = list.map((id) => state.labelById.get(id) || id);
  return labels.length ? labels.join(" -> ") : "[]";
}

function formatRelationText(relations) {
  return `{${relations.map((pair) => `(${pair.source},${pair.target})`).join(",")}}`;
}

function buildProofReport(parsed, proof) {
  const lines = [];
  lines.push(`Set A = {${parsed.elements.join(", ")}}`);
  lines.push(`Relation S has ${parsed.relations.length} pairs.`);
  lines.push("");

  if (proof.missingReflexive.length) {
    lines.push("Reflexive: FAIL");
    lines.push(
      `Missing (a, a): ${formatPairList(proof.missingReflexive, 8)}`
    );
  } else {
    lines.push("Reflexive: OK (all (a, a) in S)");
  }

  if (proof.antisymmetricViolations.length) {
    lines.push("Antisymmetric: FAIL");
    lines.push(
      `Found (a, b) and (b, a): ${formatPairList(
        proof.antisymmetricViolations,
        6
      )}`
    );
  } else {
    lines.push("Antisymmetric: OK (no two-way pairs)");
  }

  if (proof.missingTransitives.length) {
    lines.push("Transitive: FAIL");
    lines.push(
      `Missing (a, c) for chains (a, b) and (b, c): ${formatTripleList(
        proof.missingTransitives,
        6
      )}`
    );
  } else {
    lines.push("Transitive: OK (all implied pairs present)");
  }

  lines.push("");
  if (proof.isPoset) {
    lines.push("Result: This relation IS a poset. Hasse diagram updated.");
  } else {
    lines.push("Result: This relation is NOT a poset. Diagram not updated.");
  }

  return lines.join("\n");
}

function formatPairList(pairs, limit) {
  const slice = pairs.slice(0, limit).map((pair) => `(${pair[0]}, ${pair[1]})`);
  if (pairs.length > limit) {
    slice.push(`... +${pairs.length - limit} more`);
  }
  return slice.join(", ");
}

function formatTripleList(triples, limit) {
  const slice = triples.slice(0, limit).map(
    (triple) =>
      `(${triple[0]}, ${triple[1]}) & (${triple[1]}, ${triple[2]}) missing (${triple[0]}, ${triple[2]})`
  );
  if (triples.length > limit) {
    slice.push(`... +${triples.length - limit} more`);
  }
  return slice.join("; ");
}
