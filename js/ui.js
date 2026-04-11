export function createUI(callbacks = {}) {
  const elements = {
    runBfs: document.querySelector("#runBfs"),
    runDfs: document.querySelector("#runDfs"),
    resetGraph: document.querySelector("#resetGraph"),
    randomGraph: document.querySelector("#randomGraph"),
    speedRange: document.querySelector("#speedRange"),
    speedLabel: document.querySelector("#speedLabel"),
    stepModeToggle: document.querySelector("#stepModeToggle"),
    nextStep: document.querySelector("#nextStep"),
    openLearnModal: document.querySelector("#openLearnModal"),
    openRelationModal: document.querySelector("#openRelationModal"),
    openLogModal: document.querySelector("#openLogModal"),
    openPresentDoc: document.querySelector("#openPresentDoc"),
    exportSvg: document.querySelector("#exportSvg"),
    exportPng: document.querySelector("#exportPng"),
    startBadge: document.querySelector("#startBadge"),
    endBadge: document.querySelector("#endBadge"),
    clearStart: document.querySelector("#clearStart"),
    clearEnd: document.querySelector("#clearEnd"),
    infoBox: document.querySelector("#infoBox"),
    frontierLabel: document.querySelector("#frontierLabel"),
    frontierBox: document.querySelector("#frontierBox"),
    traceBox: document.querySelector("#traceBox"),
    stepModal: document.querySelector("#stepModal"),
    stepBackdrop: document.querySelector("#stepBackdrop"),
    stepTitle: document.querySelector("#stepTitle"),
    stepExplanation: document.querySelector("#stepExplanation"),
    stepPreview: document.querySelector("#stepPreview"),
    stepNext: document.querySelector("#stepNext"),
    stepClose: document.querySelector("#stepClose"),
    learnModal: document.querySelector("#learnModal"),
    learnBackdrop: document.querySelector("#learnBackdrop"),
    learnClose: document.querySelector("#learnClose"),
    relationModal: document.querySelector("#relationModal"),
    relationBackdrop: document.querySelector("#relationBackdrop"),
    relationClose: document.querySelector("#relationClose"),
    logModal: document.querySelector("#logModal"),
    logBackdrop: document.querySelector("#logBackdrop"),
    logClose: document.querySelector("#logClose"),
    toggleRelationOptions: document.querySelector("#toggleRelationOptions"),
    relationOptionsSummary: document.querySelector("#relationOptionsSummary"),
    relationAdvanced: document.querySelector("#relationAdvanced"),
    elementsInput: document.querySelector("#elementsInput"),
    relationCountInput: document.querySelector("#relationCountInput"),
    relationRuleInput: document.querySelector("#relationRuleInput"),
    generateElementsRange: document.querySelector("#generateElementsRange"),
    relationsInput: document.querySelector("#relationsInput"),
    applyRelations: document.querySelector("#applyRelations"),
    loadRelationSample: document.querySelector("#loadRelationSample"),
    generatePoset: document.querySelector("#generatePoset"),
    relationError: document.querySelector("#relationError"),
    relationProof: document.querySelector("#relationProof"),
    adjacencyList: document.querySelector("#adjacencyList"),
    traversalLog: document.querySelector("#traversalLog"),
    dfsPathsList: document.querySelector("#dfsPathsList")
  };

  const algoButtons = Array.from(document.querySelectorAll("[data-algo]"));

  function bindClick(element, handler) {
    if (!element) return;
    element.addEventListener("click", handler);
  }

  bindClick(elements.runBfs, () => {
    callbacks.onRunBfs?.();
  });

  bindClick(elements.runDfs, () => {
    callbacks.onRunDfs?.();
  });

  bindClick(elements.resetGraph, () => {
    callbacks.onReset?.();
  });

  bindClick(elements.startBadge, () => {
    callbacks.onSelectStartMode?.();
  });

  bindClick(elements.endBadge, () => {
    callbacks.onSelectEndMode?.();
  });

  bindClick(elements.clearStart, () => {
    callbacks.onClearStart?.();
  });

  bindClick(elements.clearEnd, () => {
    callbacks.onClearEnd?.();
  });

  bindClick(elements.randomGraph, () => {
    callbacks.onRandomGraph?.();
  });

  bindClick(elements.stepModeToggle, () => {
    callbacks.onStepModeToggle?.();
  });

  bindClick(elements.nextStep, () => {
    callbacks.onNextStep?.();
  });

  bindClick(elements.stepNext, () => {
    callbacks.onNextStep?.();
  });

  bindClick(elements.stepClose, () => {
    if (isStepModalLocked()) {
      return;
    }
    hideStepModal();
    callbacks.onStepModalClose?.();
  });

  bindClick(elements.stepBackdrop, () => {
    if (isStepModalLocked()) {
      return;
    }
    hideStepModal();
    callbacks.onStepModalClose?.();
  });

  bindClick(elements.openLearnModal, (event) => {
    event.preventDefault();
    showLearnModal();
    callbacks.onOpenLearnModal?.();
  });

  bindClick(elements.openRelationModal, () => {
    showRelationModal();
    callbacks.onOpenRelationModal?.();
  });

  bindClick(elements.openLogModal, () => {
    showLogModal();
  });

  bindClick(elements.openPresentDoc, () => {
    callbacks.onOpenPresentDoc?.();
  });

  bindClick(elements.learnClose, () => {
    hideLearnModal();
  });

  bindClick(elements.learnBackdrop, () => {
    hideLearnModal();
  });

  bindClick(elements.relationClose, () => {
    hideRelationModal();
  });

  bindClick(elements.relationBackdrop, () => {
    hideRelationModal();
  });

  bindClick(elements.logClose, () => {
    hideLogModal();
  });

  bindClick(elements.logBackdrop, () => {
    hideLogModal();
  });

  if (elements.dfsPathsList) {
    elements.dfsPathsList.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const pathButton = target.closest(".path-link");
      if (!(pathButton instanceof HTMLButtonElement)) {
        return;
      }

      const index = Number(pathButton.dataset.pathIndex);
      if (!Number.isInteger(index) || index < 0) {
        return;
      }

      callbacks.onSelectDfsPath?.(index);
    });
  }

  bindClick(elements.toggleRelationOptions, () => {
    toggleRelationOptions();
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    if (target.closest("#learnClose") || target.closest("#learnBackdrop")) {
      hideLearnModal();
      return;
    }

    if (target.closest("#relationClose") || target.closest("#relationBackdrop")) {
      hideRelationModal();
      return;
    }

    if (target.closest("#logClose") || target.closest("#logBackdrop")) {
      hideLogModal();
      return;
    }

    if (target.closest("#stepClose") || target.closest("#stepBackdrop")) {
      if (isStepModalLocked()) {
        return;
      }
      hideStepModal();
      callbacks.onStepModalClose?.();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    if (isStepModalLocked()) {
      event.preventDefault();
      return;
    }

    const hadVisibleModal =
      isModalVisible(elements.stepModal) ||
      isModalVisible(elements.learnModal) ||
      isModalVisible(elements.relationModal) ||
      isModalVisible(elements.logModal);

    if (!hadVisibleModal) {
      return;
    }

    hideLearnModal();
    hideRelationModal();
    hideLogModal();
    if (isModalVisible(elements.stepModal)) {
      hideStepModal();
      callbacks.onStepModalClose?.();
    }
    event.preventDefault();
  });

  bindClick(elements.applyRelations, () => {
    callbacks.onApplyRelations?.();
  });

  bindClick(elements.loadRelationSample, () => {
    callbacks.onLoadRelationSample?.();
  });

  bindClick(elements.generatePoset, () => {
    callbacks.onGeneratePoset?.();
  });

  bindClick(elements.generateElementsRange, () => {
    callbacks.onGenerateElementsRange?.();
  });

  if (elements.relationsInput) {
    elements.relationsInput.addEventListener("input", () => {
      callbacks.onRelationsInputChanged?.();
    });
  }

  if (elements.relationCountInput) {
    elements.relationCountInput.addEventListener("input", () => {
      callbacks.onRelationOptionsChanged?.();
    });
  }

  if (elements.relationRuleInput) {
    elements.relationRuleInput.addEventListener("input", () => {
      callbacks.onRelationOptionsChanged?.();
    });
  }

  bindClick(elements.exportSvg, () => {
    callbacks.onExportSvg?.();
  });

  bindClick(elements.exportPng, () => {
    callbacks.onExportPng?.();
  });

  if (elements.speedRange) {
    elements.speedRange.addEventListener("input", () => {
      const value = Number(elements.speedRange.value);
      setSpeedLabel(value);
      callbacks.onSpeedChange?.(value);
    });
  }

  algoButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const algo = button.dataset.algo || "bfs";
      setAlgo(algo);
      callbacks.onAlgoChange?.(algo);
    });
  });

  function setSelection(startId, endId, labelMap) {
    if (!elements.startBadge || !elements.endBadge) return;
    const startLabel = startId
      ? labelMap?.get(startId) || startId
      : "none";
    const endLabel = endId ? labelMap?.get(endId) || endId : "none";
    elements.startBadge.textContent = `Start: ${startLabel}`;
    elements.endBadge.textContent = `End: ${endLabel}`;
  }

  function setSelectionMode(mode) {
    if (!elements.startBadge || !elements.endBadge) return;
    const startActive = mode === "start";
    const endActive = mode === "end";

    elements.startBadge.classList.toggle("is-active", startActive);
    elements.endBadge.classList.toggle("is-active", endActive);
    elements.startBadge.setAttribute("aria-pressed", startActive ? "true" : "false");
    elements.endBadge.setAttribute("aria-pressed", endActive ? "true" : "false");
  }

  function setInfo(message, status = "info") {
    if (!elements.infoBox) return;
    elements.infoBox.textContent = message;
    elements.infoBox.dataset.status = status;
  }

  function setLiveTrace({ frontierLabel, frontierText, traceText }) {
    if (!elements.frontierLabel || !elements.frontierBox || !elements.traceBox) {
      return;
    }
    elements.frontierLabel.textContent = frontierLabel || "Frontier";
    elements.frontierBox.textContent = frontierText || "[]";
    elements.traceBox.textContent = traceText || "[]";
  }

  function showStepModal({ title, explanation, nextText, isLast }) {
    if (!elements.stepModal || !elements.stepNext) return;
    elements.stepTitle.textContent = title || "Step details";
    elements.stepExplanation.textContent = explanation || "";
    elements.stepPreview.textContent = nextText || "";
    elements.stepModal.classList.add("is-visible");
    elements.stepModal.setAttribute("aria-hidden", "false");
    elements.stepModal.dataset.locked = isLast ? "false" : "true";
    if (elements.stepClose) {
      elements.stepClose.disabled = !isLast;
    }
    elements.stepNext.disabled = false;
    elements.stepNext.textContent = isLast ? "Close" : "Next Step";
    elements.stepNext.focus();
  }

  function hideStepModal() {
    if (!elements.stepModal) return;
    elements.stepModal.classList.remove("is-visible");
    elements.stepModal.setAttribute("aria-hidden", "true");
    elements.stepModal.dataset.locked = "false";
    if (elements.stepClose) {
      elements.stepClose.disabled = false;
    }
  }

  function isStepModalLocked() {
    return (
      isModalVisible(elements.stepModal) &&
      elements.stepModal?.dataset.locked === "true"
    );
  }

  function showLearnModal() {
    if (!elements.learnModal) return;
    elements.learnModal.classList.add("is-visible");
    elements.learnModal.setAttribute("aria-hidden", "false");
  }

  function hideLearnModal() {
    if (!elements.learnModal) return;
    elements.learnModal.classList.remove("is-visible");
    elements.learnModal.setAttribute("aria-hidden", "true");
  }

  function showRelationModal() {
    if (!elements.relationModal) return;
    elements.relationModal.classList.add("is-visible");
    elements.relationModal.setAttribute("aria-hidden", "false");
  }

  function hideRelationModal() {
    if (!elements.relationModal) return;
    elements.relationModal.classList.remove("is-visible");
    elements.relationModal.setAttribute("aria-hidden", "true");
  }

  function showLogModal() {
    if (!elements.logModal) return;
    elements.logModal.classList.add("is-visible");
    elements.logModal.setAttribute("aria-hidden", "false");
  }

  function hideLogModal() {
    if (!elements.logModal) return;
    elements.logModal.classList.remove("is-visible");
    elements.logModal.setAttribute("aria-hidden", "true");
  }

  function toggleRelationOptions(forceOpen) {
    if (!elements.relationAdvanced || !elements.toggleRelationOptions) {
      return;
    }

    const shouldOpen =
      typeof forceOpen === "boolean"
        ? forceOpen
        : !elements.relationAdvanced.classList.contains("is-open");

    elements.relationAdvanced.classList.toggle("is-open", shouldOpen);
    elements.relationAdvanced.setAttribute("aria-hidden", shouldOpen ? "false" : "true");
    elements.toggleRelationOptions.textContent = shouldOpen ? "Less options" : "More options";
  }

  function isModalVisible(modalElement) {
    return Boolean(modalElement?.classList.contains("is-visible"));
  }

  function appendLog(message) {
    if (!elements.traversalLog) return;
    const entry = document.createElement("div");
    entry.className = "log-entry";
    entry.textContent = message;
    elements.traversalLog.appendChild(entry);
    elements.traversalLog.scrollTop = elements.traversalLog.scrollHeight;
  }

  function clearLog() {
    if (!elements.traversalLog) return;
    elements.traversalLog.innerHTML = "";
  }

  function setDfsPaths(paths, labelMap, shortestIndex) {
    if (!elements.dfsPathsList) {
      return;
    }

    elements.dfsPathsList.innerHTML = "";

    if (!Array.isArray(paths) || !paths.length) {
      clearDfsPaths();
      return;
    }

    paths.forEach((path, index) => {
      const item = document.createElement("div");
      const isShortest = index === shortestIndex;
      item.className = `path-item${isShortest ? " is-shortest" : ""}`;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "path-link";
      button.dataset.pathIndex = String(index);
      button.textContent = buildPathLabel(path, index, labelMap, isShortest);

      item.appendChild(button);
      elements.dfsPathsList.appendChild(item);
    });
  }

  function setActiveDfsPath(index) {
    if (!elements.dfsPathsList) {
      return;
    }

    const links = elements.dfsPathsList.querySelectorAll(".path-link");
    links.forEach((link) => {
      const linkIndex = Number(link.dataset.pathIndex);
      link.classList.toggle("is-active", Number.isInteger(linkIndex) && linkIndex === index);
    });
  }

  function clearDfsPaths() {
    if (!elements.dfsPathsList) {
      return;
    }
    elements.dfsPathsList.innerHTML =
      '<div class="paths-empty">Run DFS to list all possible paths.</div>';
  }

  function setAdjacencyList(text) {
    if (!elements.adjacencyList) return;
    elements.adjacencyList.textContent = text;
  }

  function setInputError(text) {
    if (!elements.relationError) return;
    elements.relationError.textContent = text || "";
  }

  function setSpeedLabel(value) {
    if (!elements.speedLabel) return;
    elements.speedLabel.textContent = `${value} ms`;
  }

  function setAlgo(algo) {
    algoButtons.forEach((button) => {
      const isActive = button.dataset.algo === algo;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function setStepMode(enabled) {
    if (!elements.stepModeToggle) return;
    elements.stepModeToggle.classList.toggle("is-active", enabled);
    elements.stepModeToggle.setAttribute("aria-pressed", enabled ? "true" : "false");
    elements.stepModeToggle.textContent = enabled ? "Step Mode: On" : "Step Mode: Off";
  }

  function setNextStepEnabled(enabled) {
    if (!elements.nextStep) return;
    elements.nextStep.disabled = !enabled;
  }

  function setRelationError(text) {
    if (!elements.relationError) return;
    elements.relationError.textContent = text || "";
  }

  function setRelationProof(text) {
    if (!elements.relationProof) return;
    elements.relationProof.textContent = text || "";
  }

  function getElementsInput() {
    return elements.elementsInput?.value || "";
  }

  function setElementsInput(text) {
    if (!elements.elementsInput) return;
    elements.elementsInput.value = text;
  }

  function getRelationsInput() {
    return elements.relationsInput?.value || "";
  }

  function setRelationsInput(text) {
    if (!elements.relationsInput) return;
    elements.relationsInput.value = text;
  }

  function setRelationOptionsSummary(text) {
    if (!elements.relationOptionsSummary) return;
    elements.relationOptionsSummary.textContent = text || "";
  }

  function getRelationCountInput() {
    return Number(elements.relationCountInput?.value || 0);
  }

  function setRelationCountInput(value) {
    if (!elements.relationCountInput) return;
    elements.relationCountInput.value = String(value);
  }

  function getRelationRuleInput() {
    return (elements.relationRuleInput?.value || "").trim();
  }

  function setRelationRuleInput(text) {
    if (!elements.relationRuleInput) return;
    elements.relationRuleInput.value = text;
  }

  function setControlsDisabled(disabled) {
    const controls = [
      elements.runBfs,
      elements.runDfs,
      elements.randomGraph,
      elements.stepModeToggle,
      elements.openLearnModal,
      elements.openRelationModal,
      elements.openLogModal,
      elements.openPresentDoc,
      elements.applyRelations,
      elements.startBadge,
      elements.endBadge,
      elements.clearStart,
      elements.clearEnd,
      elements.loadRelationSample,
      elements.generatePoset,
      elements.generateElementsRange,
      elements.exportSvg,
      elements.exportPng,
      ...algoButtons
    ];

    controls.forEach((control) => {
      if (!control) return;
      control.disabled = disabled;
    });
  }

  function buildPathLabel(path, index, labelMap, isShortest) {
    const labels = (Array.isArray(path) ? path : []).map(
      (id) => labelMap?.get(id) || id
    );
    const weight = Math.max(0, labels.length - 1);
    const shortestSuffix = isShortest ? " | Shortest path" : "";
    return `Show path ${index + 1}: ${labels.join(" -> ")} (weight ${weight})${shortestSuffix}`;
  }

  return {
    setSelection,
    setSelectionMode,
    setInfo,
    setLiveTrace,
    showStepModal,
    hideStepModal,
    appendLog,
    clearLog,
    setAdjacencyList,
    setInputError,
    setSpeedLabel,
    setAlgo,
    setStepMode,
    setNextStepEnabled,
    setRelationError,
    setRelationProof,
    getElementsInput,
    setElementsInput,
    getRelationsInput,
    setRelationsInput,
    getRelationCountInput,
    setRelationCountInput,
    getRelationRuleInput,
    setRelationRuleInput,
    setRelationOptionsSummary,
    setControlsDisabled,
    showLearnModal,
    hideLearnModal,
    showRelationModal,
    hideRelationModal,
    showLogModal,
    hideLogModal,
    toggleRelationOptions,
    setDfsPaths,
    setActiveDfsPath,
    clearDfsPaths
  };
}
