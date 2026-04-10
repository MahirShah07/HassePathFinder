import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { computeLayout } from "./data.js";

const DEFAULT_RADIUS = 23;
const ZOOM_EXTENT = [0.35, 2.6];
const EDGE_SOURCE_OFFSET = DEFAULT_RADIUS + 4;
const EDGE_TARGET_OFFSET = DEFAULT_RADIUS + 6;
const MAX_MOVE_HISTORY = 200;

export function createGraph(container, options = {}) {
  const { onNodeClick } = options;
  const root = d3.select(container);

  const svg = root
    .append("svg")
    .attr("class", "hasse-svg")
    .attr("role", "img")
    .attr("aria-label", "Hasse diagram")
    .attr("tabindex", 0);

  const defs = svg.append("defs");
  defs
    .append("marker")
    .attr("id", "arrow-head")
    .attr("viewBox", "0 0 6 6")
    .attr("refX", 6)
    .attr("refY", 3)
    .attr("markerWidth", 8)
    .attr("markerHeight", 8)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,0 L0,6 L6,3 z")
    .attr("class", "arrow-head");

  const background = svg.append("rect").attr("class", "svg-bg");

  const zoomGroup = svg.append("g").attr("class", "zoom-group");
  const edgeGroup = zoomGroup.append("g").attr("class", "edges");
  const nodeGroup = zoomGroup.append("g").attr("class", "nodes");

  let currentTransform = d3.zoomIdentity;
  const zoom = d3
    .zoom()
    .scaleExtent(ZOOM_EXTENT)
    .on("zoom", (event) => {
      currentTransform = event.transform;
      zoomGroup.attr("transform", currentTransform);
    });

  svg.call(zoom);
  let nodes = [];
  let edges = [];
  let nodeById = new Map();
  let bounds = { width: 800, height: 600 };
  let edgeSelection = edgeGroup.selectAll("line");
  let nodeSelection = nodeGroup.selectAll("g");
  let moveHistory = [];
  let historyIndex = -1;

  function setData(newNodes, newEdges) {
    nodes = newNodes.map((node) => ({ ...node }));
    edges = newEdges.map((edge) => ({ ...edge }));
    clearMoveHistory();
    layout();
    render();
    fitToView();
  }

  function layout() {
    const size = getSize();
    const result = computeLayout(nodes, edges, size);
    nodes = result.nodes;
    bounds = result.bounds;
    nodeById = new Map(nodes.map((node) => [node.id, node]));
    resizeCanvas(bounds);
  }

  function getSize() {
    const rect = container.getBoundingClientRect();
    return {
      width: rect.width || 900,
      height: rect.height || 600
    };
  }

  function resizeCanvas(size) {
    svg.attr("width", size.width).attr("height", size.height);
    svg.attr("viewBox", `0 0 ${size.width} ${size.height}`);
    background.attr("width", size.width).attr("height", size.height);
  }

  function render() {
    edgeSelection = edgeGroup
      .selectAll("line")
      .data(edges, (d) => `${d.source}-${d.target}`);

    edgeSelection.exit().remove();

    const edgeEnter = edgeSelection
      .enter()
      .append("line")
      .attr("class", "hasse-edge")
      .attr("marker-end", "url(#arrow-head)")
      .attr("vector-effect", "non-scaling-stroke");

    edgeSelection = edgeEnter.merge(edgeSelection);

    nodeSelection = nodeGroup.selectAll("g").data(nodes, (d) => d.id);

    nodeSelection.exit().remove();

    const nodeEnter = nodeSelection
      .enter()
      .append("g")
      .attr("class", "hasse-node")
      .attr("tabindex", 0)
      .attr("role", "button")
      .attr("aria-label", (d) => `Node ${d.label}`);

    nodeEnter.append("circle").attr("r", DEFAULT_RADIUS);

    nodeEnter
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .text((d) => d.label);

    nodeEnter
      .append("text")
      .attr("class", "visit-order")
      .attr("text-anchor", "start")
      .attr("dx", "0.72em")
      .attr("dy", "-0.85em");

    nodeEnter.on("click", (event, d) => {
      if (event.defaultPrevented) return;
      if (onNodeClick) onNodeClick(d.id);
    });

    nodeEnter.call(
      d3
        .drag()
        .on("start", (event, d) => dragStarted(event, d))
        .on("drag", (event, d) => dragged(event, d))
        .on("end", (event, d) => dragEnded(event, d))
    );

    nodeSelection = nodeEnter.merge(nodeSelection);
    updatePositions();
  }

  function dragStarted(event, node) {
    node.dragStartX = node.x;
    node.dragStartY = node.y;
    node.fx = node.x;
    node.fy = node.y;
  }

  function dragged(event, node) {
    const adjusted = toGraphCoordinates(event.x, event.y);
    node.x = clamp(adjusted.x, DEFAULT_RADIUS, bounds.width - DEFAULT_RADIUS);
    node.y = clamp(adjusted.y, DEFAULT_RADIUS, bounds.height - DEFAULT_RADIUS);
    updatePositions();
  }

  function dragEnded(event, node) {
    const startX = node.dragStartX;
    const startY = node.dragStartY;
    const endX = node.x;
    const endY = node.y;

    if (
      Number.isFinite(startX) &&
      Number.isFinite(startY) &&
      (Math.abs(startX - endX) > 0.001 || Math.abs(startY - endY) > 0.001)
    ) {
      pushMoveHistory({
        nodeId: node.id,
        fromX: startX,
        fromY: startY,
        toX: endX,
        toY: endY
      });
    }

    delete node.dragStartX;
    delete node.dragStartY;
    node.fx = null;
    node.fy = null;
  }

  function pushMoveHistory(move) {
    if (historyIndex < moveHistory.length - 1) {
      moveHistory = moveHistory.slice(0, historyIndex + 1);
    }

    moveHistory.push(move);
    if (moveHistory.length > MAX_MOVE_HISTORY) {
      moveHistory.shift();
    }
    historyIndex = moveHistory.length - 1;
  }

  function clearMoveHistory() {
    moveHistory = [];
    historyIndex = -1;
  }

  function setNodePosition(nodeId, x, y) {
    const node = nodeById.get(nodeId);
    if (!node) {
      return false;
    }

    node.x = clamp(x, DEFAULT_RADIUS, bounds.width - DEFAULT_RADIUS);
    node.y = clamp(y, DEFAULT_RADIUS, bounds.height - DEFAULT_RADIUS);
    updatePositions();
    return true;
  }

  function undoNodeMove() {
    if (historyIndex < 0) {
      return false;
    }

    const move = moveHistory[historyIndex];
    const changed = setNodePosition(move.nodeId, move.fromX, move.fromY);
    if (changed) {
      historyIndex -= 1;
    }
    return changed;
  }

  function redoNodeMove() {
    if (historyIndex >= moveHistory.length - 1) {
      return false;
    }

    const move = moveHistory[historyIndex + 1];
    const changed = setNodePosition(move.nodeId, move.toX, move.toY);
    if (changed) {
      historyIndex += 1;
    }
    return changed;
  }

  function updatePositions() {
    nodeSelection.attr("transform", (d) => `translate(${d.x},${d.y})`);
    updateEdges();
  }

  function updateEdges() {
    edgeSelection.each(function (d) {
      const point = edgePoint(d);
      d3.select(this)
        .attr("x1", point.x1)
        .attr("y1", point.y1)
        .attr("x2", point.x2)
        .attr("y2", point.y2);
    });
  }

  function edgePoint(edge) {
    const source = nodeById.get(edge.source);
    const target = nodeById.get(edge.target);
    if (!source || !target) {
      return { x1: 0, y1: 0, x2: 0, y2: 0 };
    }
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const length = Math.max(1, Math.hypot(dx, dy));
    const ux = dx / length;
    const uy = dy / length;
    return {
      x1: source.x + ux * EDGE_SOURCE_OFFSET,
      y1: source.y + uy * EDGE_SOURCE_OFFSET,
      x2: target.x - ux * EDGE_TARGET_OFFSET,
      y2: target.y - uy * EDGE_TARGET_OFFSET
    };
  }

  function setSelection({ startId, endId }) {
    nodeSelection
      .classed("start", (d) => d.id === startId)
      .classed("end", (d) => d.id === endId);
  }

  function setTraversalState({ visited, current, path, activeEdge, visitedOrder }) {
    const visitedSet = new Set(visited || []);
    const pathSet = new Set(path || []);
    const orderSource = visitedOrder || visited || [];
    const orderMap = new Map(
      orderSource.map((id, index) => [id, String(index + 1)])
    );

    nodeSelection
      .classed("visited", (d) => visitedSet.has(d.id))
      .classed("current", (d) => d.id === current)
      .classed("path", (d) => pathSet.has(d.id));

    nodeSelection
      .select("text.visit-order")
      .text((d) => orderMap.get(d.id) || "");

    const pathEdges = new Set();
    if (path && path.length > 1) {
      for (let i = 0; i < path.length - 1; i += 1) {
        pathEdges.add(`${path[i]}->${path[i + 1]}`);
      }
    }

    const activeKey = activeEdge
      ? `${activeEdge.source}->${activeEdge.target}`
      : null;

    edgeSelection
      .classed("path", (d) => pathEdges.has(`${d.source}->${d.target}`))
      .classed("active", (d) =>
        activeKey ? activeKey === `${d.source}->${d.target}` : false
      );
  }

  function clearTraversalState() {
    nodeSelection
      .classed("visited", false)
      .classed("current", false)
      .classed("path", false);
    nodeSelection.select("text.visit-order").text("");
    edgeSelection.classed("path", false).classed("active", false);
  }

  function resetLayout() {
    layout();
    clearMoveHistory();
    updatePositions();
    fitToView();
  }

  function resize() {
    const size = getSize();
    bounds = size;
    resizeCanvas(bounds);
    nodes.forEach((node) => {
      node.x = clamp(node.x, DEFAULT_RADIUS, bounds.width - DEFAULT_RADIUS);
      node.y = clamp(node.y, DEFAULT_RADIUS, bounds.height - DEFAULT_RADIUS);
    });
    updatePositions();
  }

  function getSvgElement() {
    return svg.node();
  }

  function getData() {
    return { nodes, edges };
  }

  function fitToView() {
    if (!nodes.length) {
      return;
    }

    const padding = 48;
    const minX = d3.min(nodes, (d) => d.x) - DEFAULT_RADIUS - padding;
    const maxX = d3.max(nodes, (d) => d.x) + DEFAULT_RADIUS + padding;
    const minY = d3.min(nodes, (d) => d.y) - DEFAULT_RADIUS - padding;
    const maxY = d3.max(nodes, (d) => d.y) + DEFAULT_RADIUS + padding;
    const width = Math.max(1, maxX - minX);
    const height = Math.max(1, maxY - minY);

    const fitScale = Math.min(bounds.width / width, bounds.height / height);
    const scale = clamp(fitScale, ZOOM_EXTENT[0], Math.min(1.15, ZOOM_EXTENT[1]));
    const tx = bounds.width / 2 - scale * (minX + maxX) / 2;
    const ty = bounds.height / 2 - scale * (minY + maxY) / 2;

    currentTransform = d3.zoomIdentity.translate(tx, ty).scale(scale);
    svg.call(zoom.transform, currentTransform);
  }

  // Convert pointer coordinates into graph space to respect zoom and pan.
  function toGraphCoordinates(x, y) {
    const [graphX, graphY] = currentTransform.invert([x, y]);
    return { x: graphX, y: graphY };
  }

  return {
    setData,
    resetLayout,
    resize,
    setSelection,
    setTraversalState,
    clearTraversalState,
    undoNodeMove,
    redoNodeMove,
    getSvgElement,
    getData
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
