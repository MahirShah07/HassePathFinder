export function buildAdjacency(nodes, edges) {
  const adjacency = new Map();
  nodes.forEach((node) => {
    adjacency.set(node.id, []);
  });
  edges.forEach((edge) => {
    if (!adjacency.has(edge.source)) {
      adjacency.set(edge.source, []);
    }
    adjacency.get(edge.source).push(edge.target);
  });
  return adjacency;
}

export function traverseGraph({ startId, endId, adjacency, mode }) {
  const steps = [];
  // Build step snapshots to animate traversal state changes.
  if (!startId || !endId) {
    return { steps, path: [] };
  }

  const frontierLabel = mode === "bfs" ? "queue" : "stack";

  if (startId === endId) {
    const visited = new Set([startId]);
    const path = [startId];
    steps.push(
      snapshot({
        current: startId,
        visited,
        frontier: [],
        path,
        trace: [startId],
        activeEdge: null,
        message: "Start equals end. Path found.",
        status: "success"
      })
    );
    return { steps, path };
  }

  const visited = new Set();
  const frontier = [startId];
  const parent = new Map();

  steps.push(
    snapshot({
      current: null,
      visited,
      frontier,
      path: [],
      trace: [],
      activeEdge: null,
      message: `Initialize ${frontierLabel} with ${startId}.`,
      status: "info"
    })
  );

  while (frontier.length) {
    const current = mode === "bfs" ? frontier.shift() : frontier.pop();
    if (visited.has(current)) {
      continue;
    }

    visited.add(current);
    const trace = buildTrace(parent, startId, current);
    const incoming = parent.has(current)
      ? { source: parent.get(current), target: current }
      : null;
    steps.push(
      snapshot({
        current,
        visited,
        frontier,
        path: [],
        trace,
        activeEdge: incoming,
        message: `Visit ${current}.`,
        status: "info"
      })
    );

    if (current === endId) {
      const path = buildPath(parent, startId, endId);
      steps.push(
        snapshot({
          current,
          visited,
          frontier,
          path,
          trace,
          activeEdge: incoming,
          message: `Path found: ${path.join(" -> ")}.`,
          status: "success"
        })
      );
      return { steps, path };
    }

    const neighbors = adjacency.get(current) || [];
    neighbors.forEach((neighbor) => {
      if (!visited.has(neighbor) && !frontier.includes(neighbor)) {
        parent.set(neighbor, current);
        frontier.push(neighbor);
        steps.push(
          snapshot({
            current,
            visited,
            frontier,
            path: [],
            trace,
            activeEdge: { source: current, target: neighbor },
            message: `Add ${neighbor} to the ${frontierLabel}.`,
            status: "info"
          })
        );
      }
    });
  }

  steps.push(
    snapshot({
      current: null,
      visited,
      frontier,
      path: [],
      trace: [],
      activeEdge: null,
      message: "No directed path found between the selected nodes.",
      status: "warn"
    })
  );

  return { steps, path: [] };
}

function buildPath(parent, startId, endId) {
  const path = [];
  let current = endId;
  while (current) {
    path.push(current);
    if (current === startId) {
      break;
    }
    current = parent.get(current);
  }
  path.reverse();
  if (path[0] !== startId) {
    return [];
  }
  return path;
}

function buildTrace(parent, startId, current) {
  if (!current) {
    return [];
  }
  const trace = [];
  let cursor = current;
  while (cursor) {
    trace.push(cursor);
    if (cursor === startId) {
      break;
    }
    cursor = parent.get(cursor);
  }
  trace.reverse();
  return trace[0] === startId ? trace : [current];
}

function snapshot({
  current,
  visited,
  frontier,
  path,
  trace,
  activeEdge,
  message,
  status
}) {
  return {
    current: current ?? null,
    visited: Array.from(visited),
    frontier: Array.from(frontier),
    path: Array.from(path),
    trace: Array.from(trace || []),
    activeEdge: activeEdge || null,
    message,
    status
  };
}
