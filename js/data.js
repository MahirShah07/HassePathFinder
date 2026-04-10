export function sampleGraph() {
  const values = [1, 2, 3, 4, 6, 12];
  return buildDivisibilityGraph(values);
}

export function buildDivisibilityGraph(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const nodes = sorted.map((value) => ({
    id: String(value),
    label: String(value)
  }));
  const edges = [];

  for (let i = 0; i < sorted.length; i += 1) {
    for (let j = i + 1; j < sorted.length; j += 1) {
      const a = sorted[i];
      const b = sorted[j];
      if (b % a !== 0) {
        continue;
      }
      let isCover = true;
      for (let k = i + 1; k < j; k += 1) {
        const c = sorted[k];
        if (b % c === 0 && c % a === 0) {
          isCover = false;
          break;
        }
      }
      if (isCover) {
        edges.push({ source: String(a), target: String(b) });
      }
    }
  }

  return {
    nodes,
    edges,
    meta: {
      name: "Divisibility Poset",
      type: "divisibility"
    }
  };
}

export function buildDivisibilityRelation(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const elements = sorted.map((value) => String(value));
  const relations = [];
  sorted.forEach((a) => {
    sorted.forEach((b) => {
      if (b % a === 0) {
        relations.push({ source: String(a), target: String(b) });
      }
    });
  });
  return {
    elements,
    relations,
    meta: {
      name: "Divisibility Relation",
      type: "divisibility-relation"
    }
  };
}

export function parseRelationInput(elementsText, relationsText) {
  const elements = dedupeElements(parseElementsInput(elementsText));
  const parsedRelations = parseRelationsText(relationsText || "");
  if (parsedRelations.error) {
    return { error: parsedRelations.error };
  }

  const relations = parsedRelations.relations;

  let finalElements = elements;
  if (!finalElements.length) {
    finalElements = dedupeElements(
      relations.flatMap((pair) => [pair.source, pair.target])
    );
  }

  if (!finalElements.length) {
    return { error: "Provide elements or at least one relation pair." };
  }

  const elementSet = new Set(finalElements);
  for (const pair of relations) {
    if (!elementSet.has(pair.source) || !elementSet.has(pair.target)) {
      return {
        error: `Relation (${pair.source}, ${pair.target}) includes an unknown element.`
      };
    }
  }

  return { elements: finalElements, relations };
}

export function checkPoset(elements, relations) {
  const relationSet = new Set(
    relations.map((pair) => relationKey(pair.source, pair.target))
  );
  const missingReflexive = elements
    .filter((element) => !relationSet.has(relationKey(element, element)))
    .map((element) => [element, element]);

  const antisymmetricViolations = [];
  const antiSeen = new Set();
  relations.forEach((pair) => {
    if (pair.source === pair.target) {
      return;
    }
    if (relationSet.has(relationKey(pair.target, pair.source))) {
      const key = [pair.source, pair.target].sort().join("|");
      if (!antiSeen.has(key)) {
        antiSeen.add(key);
        antisymmetricViolations.push([pair.source, pair.target]);
      }
    }
  });

  const missingTransitives = [];
  const transSeen = new Set();
  elements.forEach((a) => {
    elements.forEach((b) => {
      if (!relationSet.has(relationKey(a, b))) {
        return;
      }
      elements.forEach((c) => {
        if (!relationSet.has(relationKey(b, c))) {
          return;
        }
        if (!relationSet.has(relationKey(a, c))) {
          const key = `${a}|${b}|${c}`;
          if (!transSeen.has(key)) {
            transSeen.add(key);
            missingTransitives.push([a, b, c]);
          }
        }
      });
    });
  });

  const isPoset =
    missingReflexive.length === 0 &&
    antisymmetricViolations.length === 0 &&
    missingTransitives.length === 0;

  return {
    isPoset,
    missingReflexive,
    antisymmetricViolations,
    missingTransitives
  };
}

export function buildHasseFromRelations(elements, relations) {
  const nodes = elements.map((element) => ({
    id: String(element),
    label: String(element)
  }));
  const relationSet = new Set(
    relations.map((pair) => relationKey(pair.source, pair.target))
  );
  const edges = [];

  elements.forEach((a) => {
    elements.forEach((b) => {
      if (a === b) {
        return;
      }
      if (!relationSet.has(relationKey(a, b))) {
        return;
      }
      let isCover = true;
      elements.forEach((c) => {
        if (c === a || c === b) {
          return;
        }
        if (
          relationSet.has(relationKey(a, c)) &&
          relationSet.has(relationKey(c, b))
        ) {
          isCover = false;
        }
      });
      if (isCover) {
        edges.push({ source: String(a), target: String(b) });
      }
    });
  });

  return {
    nodes,
    edges,
    meta: {
      name: "Relation Poset",
      type: "relation"
    }
  };
}

export function generateRandomDAG(options = {}) {
  const {
    minNodes = 7,
    maxNodes = 12,
    minLevels = 3,
    maxLevels = 5
  } = options;

  const nodeCount = randomInt(minNodes, maxNodes);
  const levelCount = Math.min(nodeCount, randomInt(minLevels, maxLevels));
  const levels = Array.from({ length: levelCount }, () => []);
  const nodes = [];

  for (let i = 0; i < levelCount; i += 1) {
    const node = { id: `n${i + 1}`, label: `N${i + 1}` };
    levels[i].push(node);
    nodes.push(node);
  }

  for (let i = levelCount; i < nodeCount; i += 1) {
    const levelIndex = randomInt(0, levelCount - 1);
    const node = { id: `n${i + 1}`, label: `N${i + 1}` };
    levels[levelIndex].push(node);
    nodes.push(node);
  }

  const edges = [];
  const edgeSet = new Set();

  const addEdge = (source, target) => {
    const key = `${source}->${target}`;
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push({ source, target });
    }
  };

  for (let levelIndex = 0; levelIndex < levelCount - 1; levelIndex += 1) {
    const fromLevel = levels[levelIndex];
    const toLevel = levels[levelIndex + 1];

    fromLevel.forEach((node) => {
      const targetCount = randomInt(1, Math.min(2, toLevel.length));
      const targets = pickRandomSubset(toLevel, targetCount);
      targets.forEach((target) => addEdge(node.id, target.id));
    });
  }

  for (let levelIndex = 1; levelIndex < levelCount; levelIndex += 1) {
    const currentLevel = levels[levelIndex];
    const previousLevel = levels[levelIndex - 1];
    currentLevel.forEach((node) => {
      const hasIncoming = edges.some((edge) => edge.target === node.id);
      if (!hasIncoming) {
        const source = pickRandomSubset(previousLevel, 1)[0];
        addEdge(source.id, node.id);
      }
    });
  }

  return {
    nodes,
    edges,
    meta: {
      name: "Random DAG",
      type: "random"
    }
  };
}

export function parseCustomGraph(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    return { error: `Invalid JSON: ${error.message}` };
  }

  if (!parsed || typeof parsed !== "object") {
    return { error: "JSON must be an object with nodes and edges." };
  }

  if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
    return { error: "JSON must include arrays 'nodes' and 'edges'." };
  }

  const nodes = [];
  for (let i = 0; i < parsed.nodes.length; i += 1) {
    const normalized = normalizeNode(parsed.nodes[i]);
    if (!normalized) {
      return { error: `Node ${i + 1} is invalid. Provide an id or label.` };
    }
    nodes.push(normalized);
  }

  const edges = [];
  for (let i = 0; i < parsed.edges.length; i += 1) {
    const normalized = normalizeEdge(parsed.edges[i]);
    if (!normalized) {
      return {
        error: `Edge ${i + 1} is invalid. Use [source, target] or {source, target}.`
      };
    }
    edges.push(normalized);
  }

  return {
    nodes,
    edges,
    meta: {
      name: parsed.name || "Custom Graph",
      type: "custom"
    }
  };
}

export function validateGraph(nodes, edges) {
  if (!nodes.length) {
    return { ok: false, error: "Graph must include at least one node." };
  }

  const nodeIds = new Set();
  for (const node of nodes) {
    if (!node.id) {
      return { ok: false, error: "All nodes must have an id." };
    }
    if (nodeIds.has(node.id)) {
      return { ok: false, error: `Duplicate node id: ${node.id}.` };
    }
    nodeIds.add(node.id);
  }

  const edgeSet = new Set();
  for (const edge of edges) {
    if (!edge.source || !edge.target) {
      return { ok: false, error: "Edges must include source and target." };
    }
    if (edge.source === edge.target) {
      return { ok: false, error: "Edges cannot create self loops." };
    }
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      return { ok: false, error: "Edges must reference existing nodes." };
    }
    const key = `${edge.source}->${edge.target}`;
    if (edgeSet.has(key)) {
      return { ok: false, error: "Duplicate edges are not allowed." };
    }
    edgeSet.add(key);
  }

  const levelResult = computeLevels(nodes, edges);
  if (levelResult.hasCycle) {
    return {
      ok: false,
      error: "Graph has a cycle. Hasse diagrams must be acyclic."
    };
  }

  return { ok: true };
}

export function computeLevels(nodes, edges) {
  // Topological level assignment keeps edges flowing upward in the layout.
  const incoming = new Map();
  const adjacency = new Map();

  nodes.forEach((node) => {
    incoming.set(node.id, 0);
    adjacency.set(node.id, []);
  });

  edges.forEach((edge) => {
    adjacency.get(edge.source)?.push(edge.target);
    incoming.set(edge.target, (incoming.get(edge.target) || 0) + 1);
  });

  const queue = [];
  const levelById = new Map();

  nodes.forEach((node) => {
    if ((incoming.get(node.id) || 0) === 0) {
      queue.push(node.id);
      levelById.set(node.id, 0);
    }
  });

  let visited = 0;
  while (queue.length) {
    const current = queue.shift();
    visited += 1;
    const currentLevel = levelById.get(current) || 0;
    const neighbors = adjacency.get(current) || [];
    neighbors.forEach((neighbor) => {
      const nextLevel = currentLevel + 1;
      if (!levelById.has(neighbor) || nextLevel > levelById.get(neighbor)) {
        levelById.set(neighbor, nextLevel);
      }
      incoming.set(neighbor, (incoming.get(neighbor) || 0) - 1);
      if ((incoming.get(neighbor) || 0) === 0) {
        queue.push(neighbor);
      }
    });
  }

  const hasCycle = visited !== nodes.length;
  const maxLevel = Math.max(0, ...levelById.values());

  return { levelById, maxLevel, hasCycle };
}

export function computeLayout(nodes, edges, size) {
  const safeWidth = size.width || 900;
  const safeHeight = size.height || 600;

  const { levelById, maxLevel } = computeLevels(nodes, edges);

  const margins = {
    top: 50,
    right: 80,
    bottom: 50,
    left: 80
  };

  const availableHeight = safeHeight - margins.top - margins.bottom;
  const verticalSpan = Math.max(180, availableHeight * 0.72);
  const verticalOffset = margins.top + (availableHeight - verticalSpan) / 2;
  const levelGap = maxLevel === 0 ? 0 : verticalSpan / maxLevel;

  const buckets = new Map();
  const positioned = nodes.map((node) => {
    const level = levelById.get(node.id) ?? 0;
    if (!buckets.has(level)) {
      buckets.set(level, []);
    }
    const copy = { ...node, level };
    buckets.get(level).push(copy);
    return copy;
  });

  buckets.forEach((bucket, level) => {
    const gap = (safeWidth - margins.left - margins.right) / (bucket.length + 1);
    bucket.forEach((node, index) => {
      node.x = margins.left + gap * (index + 1);
      node.y =
        maxLevel === 0
          ? safeHeight / 2
          : verticalOffset + (maxLevel - level) * levelGap;
    });
  });

  return {
    nodes: positioned,
    bounds: {
      width: safeWidth,
      height: safeHeight
    }
  };
}

function normalizeNode(input) {
  if (input === null || input === undefined) {
    return null;
  }

  if (typeof input === "object") {
    const idValue = input.id ?? input.label;
    if (idValue === undefined) {
      return null;
    }
    return {
      id: String(idValue),
      label: String(input.label ?? idValue)
    };
  }

  return { id: String(input), label: String(input) };
}

function parseElementsInput(text) {
  return (text || "")
    .split(/[\s,]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function parseRelationLine(line) {
  const cleaned = line.replace(/[()\[\]]/g, " ").replace(/<=|->/g, " ");
  const tokens = cleaned.split(/[\s,]+/).map((token) => token.trim()).filter(Boolean);
  if (tokens.length < 2) {
    return null;
  }
  return { source: tokens[0], target: tokens[1] };
}

function parseRelationsText(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) {
    return { relations: [] };
  }

  const tupleRegex = /\(\s*([^,(){}\s]+)\s*,\s*([^,(){}\s]+)\s*\)/g;
  const tupleMatches = Array.from(trimmed.matchAll(tupleRegex));

  if (tupleMatches.length) {
    const leftover = trimmed
      .replace(tupleRegex, "")
      .replace(/[{}\s,;]/g, "");

    if (leftover.length) {
      return {
        error: "Invalid relation format. Use {(a,b),(c,d)} or one pair per line."
      };
    }

    const relationSet = new Set();
    const relations = [];
    tupleMatches.forEach((match) => {
      const source = match[1];
      const target = match[2];
      const key = relationKey(source, target);
      if (!relationSet.has(key)) {
        relationSet.add(key);
        relations.push({ source, target });
      }
    });

    return { relations };
  }

  const relationSet = new Set();
  const relations = [];
  const lines = trimmed
    .split(/\r?\n|;/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (let i = 0; i < lines.length; i += 1) {
    const pair = parseRelationLine(lines[i]);
    if (!pair) {
      return {
        error: `Line ${i + 1} is invalid. Use {(a,b),(c,d)} or one pair per line.`
      };
    }
    const key = relationKey(pair.source, pair.target);
    if (!relationSet.has(key)) {
      relationSet.add(key);
      relations.push(pair);
    }
  }

  return { relations };
}

function dedupeElements(list) {
  const result = [];
  const seen = new Set();
  list.forEach((item) => {
    if (!seen.has(item)) {
      seen.add(item);
      result.push(item);
    }
  });
  return result;
}

function relationKey(source, target) {
  return `${source}->${target}`;
}

function normalizeEdge(input) {
  if (Array.isArray(input) && input.length >= 2) {
    return { source: String(input[0]), target: String(input[1]) };
  }

  if (input && typeof input === "object") {
    if (input.source === undefined || input.target === undefined) {
      return null;
    }
    return { source: String(input.source), target: String(input.target) };
  }

  return null;
}

function randomInt(min, max) {
  const minValue = Math.ceil(min);
  const maxValue = Math.floor(max);
  return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
}

function pickRandomSubset(list, count) {
  const copy = [...list];
  const result = [];
  const selectionCount = Math.min(count, copy.length);
  for (let i = 0; i < selectionCount; i += 1) {
    const index = randomInt(0, copy.length - 1);
    result.push(copy.splice(index, 1)[0]);
  }
  return result;
}
