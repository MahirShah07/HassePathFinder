const SVG_NS = "http://www.w3.org/2000/svg";

export function getThemeTokens() {
  const styles = getComputedStyle(document.documentElement);
  return {
    canvasBg: styles.getPropertyValue("--canvas-bg").trim() || "#ffffff",
    edgeStroke: styles.getPropertyValue("--edge-stroke").trim() || "#777777",
    accent: styles.getPropertyValue("--accent").trim() || "#ff6b3d",
    nodeFill: styles.getPropertyValue("--node-fill").trim() || "#ffffff",
    nodeStroke: styles.getPropertyValue("--node-stroke").trim() || "#888888",
    nodeText: styles.getPropertyValue("--node-text").trim() || "#222222",
    visitedFill: styles.getPropertyValue("--visited-fill").trim() || "#ffe3a3",
    visitedStroke: styles.getPropertyValue("--visited-stroke").trim() || "#e3b35d",
    currentFill: styles.getPropertyValue("--current-fill").trim() || "#ff6b3d",
    currentStroke: styles.getPropertyValue("--current-stroke").trim() || "#c13f1f",
    pathFill: styles.getPropertyValue("--path-fill").trim() || "#a8dadc",
    pathStroke: styles.getPropertyValue("--path-stroke").trim() || "#2a9d8f",
    startStroke: styles.getPropertyValue("--start-stroke").trim() || "#2a9d8f",
    endStroke: styles.getPropertyValue("--end-stroke").trim() || "#ff6b3d",
    fontBody: styles.getPropertyValue("--font-body").trim() || "sans-serif"
  };
}

export function exportSvg(svgElement, filename, tokens = getThemeTokens()) {
  const { svgString } = serializeSvg(svgElement, tokens);
  const blob = new Blob([svgString], {
    type: "image/svg+xml;charset=utf-8"
  });
  downloadBlob(blob, filename);
}

export function exportPng(svgElement, filename, tokens = getThemeTokens()) {
  const { svgString, width, height } = serializeSvg(svgElement, tokens);
  const svgData = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    svgString
  )}`;

  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        downloadBlob(blob, filename);
      }
    }, "image/png");
  };

  image.src = svgData;
}

function serializeSvg(svgElement, tokens) {
  // Inline styles and a background so exported files match the UI theme.
  const clone = svgElement.cloneNode(true);
  const width =
    Number(svgElement.getAttribute("width")) ||
    Math.round(svgElement.getBoundingClientRect().width);
  const height =
    Number(svgElement.getAttribute("height")) ||
    Math.round(svgElement.getBoundingClientRect().height);

  clone.setAttribute("width", width);
  clone.setAttribute("height", height);
  if (!clone.getAttribute("viewBox")) {
    clone.setAttribute("viewBox", `0 0 ${width} ${height}`);
  }

  const defs = clone.querySelector("defs") || createDefs(clone);
  const style = document.createElementNS(SVG_NS, "style");
  style.textContent = buildSvgStyle(tokens);
  defs.appendChild(style);

  const background = document.createElementNS(SVG_NS, "rect");
  background.setAttribute("class", "svg-bg");
  background.setAttribute("width", width);
  background.setAttribute("height", height);
  clone.insertBefore(background, clone.firstChild);

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clone);
  return { svgString, width, height };
}

function createDefs(svgElement) {
  const defs = document.createElementNS(SVG_NS, "defs");
  svgElement.insertBefore(defs, svgElement.firstChild);
  return defs;
}

function buildSvgStyle(tokens) {
  return `
    .svg-bg { fill: ${tokens.canvasBg}; }
    .arrow-head { fill: ${tokens.edgeStroke}; }
    .hasse-edge { stroke: ${tokens.edgeStroke}; stroke-width: 2; fill: none; }
    .hasse-edge.path { stroke: ${tokens.pathStroke}; stroke-width: 3; }
    .hasse-edge.active { stroke: ${tokens.accent || tokens.pathStroke}; stroke-width: 3; }
    .hasse-node circle { fill: ${tokens.nodeFill}; stroke: ${tokens.nodeStroke}; stroke-width: 2; }
    .hasse-node.visited circle { fill: ${tokens.visitedFill}; stroke: ${tokens.visitedStroke}; }
    .hasse-node.current circle { fill: ${tokens.currentFill}; stroke: ${tokens.currentStroke}; }
    .hasse-node.path circle { fill: ${tokens.pathFill}; stroke: ${tokens.pathStroke}; }
    .hasse-node.start circle { stroke: ${tokens.startStroke}; }
    .hasse-node.end circle { stroke: ${tokens.endStroke}; }
    .hasse-node text { fill: ${tokens.nodeText}; font-family: ${tokens.fontBody}; font-size: 14px; font-weight: 600; }
    .hasse-node text.visit-order { fill: ${tokens.nodeText}; font-size: 11px; font-weight: 600; }
  `;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
