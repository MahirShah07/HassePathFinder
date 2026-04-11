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
  if (mode === "dfs") {
    return traverseAllPathsDfs({ startId, endId, adjacency });
  }

  return traverseSinglePath({ startId, endId, adjacency, mode });
}

function traverseSinglePath({ startId, endId, adjacency, mode }) {
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

function traverseAllPathsDfs({ startId, endId, adjacency }) {
  const steps = [];
  if (!startId || !endId) {
    return { steps, path: [], allPaths: [] };
  }

  const visitedOrder = [];
  const visitedSet = new Set();
  const allPaths = [];

  steps.push(
    snapshot({
      current: null,
      visited: visitedOrder,
      frontier: [startId],
      path: [],
      trace: [],
      activeEdge: null,
      message: `Initialize DFS stack with ${startId}.`,
      status: "info"
    })
  );

  const explore = (nodeId, trace) => {
    const nextTrace = [...trace, nodeId];
    if (!visitedSet.has(nodeId)) {
      visitedSet.add(nodeId);
      visitedOrder.push(nodeId);
    }

    const incoming =
      nextTrace.length > 1
        ? {
            source: nextTrace[nextTrace.length - 2],
            target: nodeId
          }
        : null;

    steps.push(
      snapshot({
        current: nodeId,
        visited: visitedOrder,
        frontier: nextTrace,
        path: [],
        trace: nextTrace,
        activeEdge: incoming,
        message: `Visit ${nodeId}.`,
        status: "info"
      })
    );

    if (nodeId === endId) {
      allPaths.push(nextTrace);
      const weight = nextTrace.length - 1;
      steps.push(
        snapshot({
          current: nodeId,
          visited: visitedOrder,
          frontier: nextTrace,
          path: [],
          trace: nextTrace,
          activeEdge: incoming,
          message: `Found path ${allPaths.length}: ${nextTrace.join(" -> ")} (unit weight = ${weight}).`,
          status: "success"
        })
      );
      return;
    }

    const neighbors = adjacency.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (nextTrace.includes(neighbor)) {
        steps.push(
          snapshot({
            current: nodeId,
            visited: visitedOrder,
            frontier: nextTrace,
            path: [],
            trace: nextTrace,
            activeEdge: { source: nodeId, target: neighbor },
            message: `Skip ${neighbor} to avoid a cycle in the current path.`,
            status: "warn"
          })
        );
        continue;
      }

      steps.push(
        snapshot({
          current: nodeId,
          visited: visitedOrder,
          frontier: nextTrace,
          path: [],
          trace: nextTrace,
          activeEdge: { source: nodeId, target: neighbor },
          message: `Explore edge ${nodeId} -> ${neighbor}.`,
          status: "info"
        })
      );

      explore(neighbor, nextTrace);
    }

    steps.push(
      snapshot({
        current: nodeId,
        visited: visitedOrder,
        frontier: trace,
        path: [],
        trace: nextTrace,
        activeEdge: incoming,
        message: `Backtrack from ${nodeId}.`,
        status: "info"
      })
    );
  };

  explore(startId, []);

  if (!allPaths.length) {
    steps.push(
      snapshot({
        current: null,
        visited: visitedOrder,
        frontier: [],
        path: [],
        trace: [],
        activeEdge: null,
        message: "No directed path found between the selected nodes.",
        status: "warn"
      })
    );
    return { steps, path: [], allPaths };
  }

  const shortestPath = selectShortestPath(allPaths);
  const allPathLines = allPaths.map((path, index) => {
    const weight = path.length - 1;
    return `${index + 1}. ${path.join(" -> ")} (unit weight = ${weight})`;
  });
  const shortestWeight = shortestPath.length - 1;

  steps.push(
    snapshot({
      current: endId,
      visited: visitedOrder,
      frontier: [],
      path: shortestPath,
      trace: shortestPath,
      activeEdge: null,
      highlightShortest: true,
      message:
        `All DFS paths found (${allPaths.length}):\n${allPathLines.join("\n")}\n` +
        `Lowest unit-weight path: ${shortestPath.join(" -> ")} (weight = ${shortestWeight}).` +
        " Highlighting only this path in the graph.",
      status: "success"
    })
  );

  return {
    steps,
    path: shortestPath,
    allPaths
  };
}

function selectShortestPath(paths) {
  if (!paths.length) {
    return [];
  }

  return paths.reduce((best, current) => {
    if (!best) {
      return current;
    }

    if (current.length < best.length) {
      return current;
    }

    if (current.length > best.length) {
      return best;
    }

    // Deterministic tie-breaker when weights are equal.
    const bestKey = best.join("\u0000");
    const currentKey = current.join("\u0000");
    return currentKey < bestKey ? current : best;
  }, null);
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
  highlightShortest,
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
    highlightShortest: Boolean(highlightShortest),
    message,
    status
  };
}
