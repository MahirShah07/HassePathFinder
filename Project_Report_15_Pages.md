# Hasse Path Finder
## Interactive Poset Traversal Lab

### Detailed Project Report (15-Page Version)

Prepared by:
- MahirShah07
- Rumani07

Guided by:
- Dr. Ashlesha Bhise

Date: April 2026

---

## Table of Contents
1. Introduction and Project Overview
2. Motivation and Problem Statement
3. Objectives, Scope, and Expected Outcomes
4. Background Theory: Relations, Posets, and Hasse Diagrams
5. Background Theory: Graph Traversal (BFS and DFS)
6. Technology Stack and Tools Used
7. System Architecture and Module Design
8. Data Pipeline and Relation Processing
9. Graph Rendering, Interaction, and Layout Mechanics
10. Traversal Engine, Animation, and Step Mode
11. User Interface Design, Accessibility, and Export Features
12. Implementation Highlights with Code Snippets
13. Sample Outputs and Result Interpretation
14. Team Contributions and Work Distribution
15. Challenges, Limitations, Future Work, and Conclusion

---

# Page 1 - Introduction and Project Overview

## 1.1 Introduction
The Hasse Path Finder is a web-based educational simulator designed to make abstract concepts in discrete mathematics and graph algorithms easier to understand. Specifically, it combines two learning domains:
- Posets (partially ordered sets) and Hasse diagrams
- Graph traversal algorithms: Breadth-First Search (BFS) and Depth-First Search (DFS)

In most classrooms, learners struggle with these topics because explanations are often symbolic and static. The Hasse Path Finder addresses this by creating an interactive environment where users can provide a relation, automatically generate a Hasse diagram, and visually execute traversal algorithms with clear step-by-step explanations.

## 1.2 Project Essence
At its core, the project answers one question:
How can we transform abstract order relations and traversal procedures into a visual and intuitive learning experience for beginners?

The simulator allows users to:
- Input elements and relation pairs
- Validate whether the relation is a valid poset
- Generate a Hasse diagram automatically
- Select start/end nodes
- Run BFS/DFS with animation
- Use guided step mode for learning
- Export final diagram snapshots

## 1.3 Why this project matters
The project bridges theory and practice. Instead of memorizing rules like reflexive, antisymmetric, and transitive properties, learners can see the effect of these rules on diagram structure. Instead of memorizing BFS/DFS pseudocode, they can watch queue/stack behavior unfold live.

This dual-purpose design makes the tool useful for:
- Undergraduate students in mathematics/computer science
- Faculty during live demonstrations
- Self-learners preparing for exams and interviews

\newpage

# Page 2 - Motivation and Problem Statement

## 2.1 Motivation
During classroom and self-learning experiences, the team identified repeated pain points:
1. Poset definitions are clear in text but difficult to internalize without visual structure.
2. Students confuse relation graphs with Hasse diagrams.
3. BFS and DFS are often taught separately from mathematical relation contexts.
4. Most online visualizers do not validate poset properties before drawing diagrams.
5. Existing tools rarely support both algorithm tracing and relation proofing in one workflow.

The motivation was to produce a single educational lab where users can move from relation input to algorithmic traversal without context switching.

## 2.2 Problem Statement
Traditional teaching tools for posets and traversal are fragmented, static, and not beginner-friendly. This causes:
- Low conceptual clarity
- Memorization without understanding
- Difficulty in relating theory to implementation
- Reduced confidence while solving exam questions

Hence, the project problem statement is:
Design and build an interactive simulator that validates posets, generates Hasse diagrams, and demonstrates BFS/DFS traversal with understandable and explainable step-level feedback.

## 2.3 Target user needs
The system was designed around concrete user needs:
- "I want to know why a relation fails as a poset."
- "I want to see traversal order clearly, not just final path."
- "I want control over speed and step-by-step progression."
- "I want to drag/zoom nodes and still retain structure."
- "I want output images for assignments/reports."

## 2.4 Value proposition
The project offers a compact but complete learning pipeline:
Relation input -> Property verification -> Hasse generation -> Traversal execution -> Export/reporting.

This pipeline improves explainability, engagement, and practical understanding.

\newpage

# Page 3 - Objectives, Scope, and Expected Outcomes

## 3.1 Primary objectives
The primary objectives were:
1. Build a browser-based interface for poset relation input and visualization.
2. Validate relation properties (reflexive, antisymmetric, transitive).
3. Construct Hasse diagrams by identifying cover relations.
4. Implement BFS and DFS traversals over generated diagram edges.
5. Provide visual and textual traversal feedback in real time.
6. Include a beginner-friendly Step Mode with modal guidance.
7. Support export of diagrams to SVG and PNG.

## 3.2 Secondary objectives
- Make UI intuitive for non-expert users.
- Allow random DAG generation for quick testing.
- Provide keyboard-assisted graph editing actions (undo/redo).
- Keep code modular and maintainable.

## 3.3 Scope
In-scope:
- Directed acyclic relation-based diagrams
- Poset proof reporting
- Traversal of selected start/end nodes
- Interactive graph manipulation and export

Out-of-scope (current version):
- Weighted path algorithms (Dijkstra, A*)
- Multi-criteria relation synthesis
- Massive-scale graph optimization for thousands of nodes
- Collaborative real-time editing

## 3.4 Expected outcomes
By the end of the project, expected outcomes included:
- A functional and stable simulator running in modern browsers
- Better learner understanding of posets and traversal behavior
- Clear demonstration material for presentations
- Sufficient documentation for project evaluation

## 3.5 Success criteria
The project was considered successful if:
- Valid relations produce correct Hasse diagrams
- Invalid relations produce clear error/proof feedback
- BFS/DFS traversal sequences are correctly animated
- Step Mode explains transitions accurately
- Export functionality generates usable diagram files

## 3.6 Applicability
The project is directly applicable in multiple settings:
- Classroom teaching of discrete mathematics and graph theory
- Laboratory demonstrations in data structures/algorithms courses
- Self-learning and revision before exams
- Mini-project demonstrations during viva and academic evaluations
- Visual aid generation for reports and presentations via PNG/SVG export

In short, the tool is not limited to one assignment. It can be reused as a teaching utility, revision companion, and demonstration platform.

\newpage

# Page 4 - Background Theory: Relations, Posets, and Hasse Diagrams

## 4.1 Relation basics
A relation on set A is any subset of A x A. In simple terms, it is a set of ordered pairs connecting elements of A.

Example:
A = {1, 2, 3}
R = {(1,1), (2,2), (3,3), (1,2)}

## 4.2 Poset definition
A relation is a partial order if it satisfies:
- Reflexive: for every a in A, (a,a) in R
- Antisymmetric: if (a,b) in R and (b,a) in R, then a = b
- Transitive: if (a,b) in R and (b,c) in R, then (a,c) in R

The project programmatically checks each property and generates a proof report.

## 4.3 Divisibility poset example
A classic example uses divisibility on numbers.
For A = {1,2,3,4,6,12}, relation "x divides y" produces a valid poset.

## 4.4 Hasse diagram concept
A Hasse diagram is a simplified representation of a finite poset.
It removes:
- Reflexive loops (a,a)
- Transitive edges that can be inferred via middle nodes

Only cover relations are shown.

## 4.5 Why this matters for learners
Hasse diagrams reduce clutter and make hierarchy visible. Learners can immediately detect:
- Minimal/maximal elements
- Paths of order progression
- Connectivity structure for traversal

## 4.6 Theory-to-code mapping
In this project:
- Relation parsing converts user text into pair objects.
- Poset checks detect violations.
- Cover relation filtering generates final edges.
- Layout engine places higher-order elements visually above lower ones.

\newpage

# Page 5 - Background Theory: Graph Traversal (BFS and DFS)

## 5.1 Breadth-First Search (BFS)
BFS explores layer by layer from a start node.
- Uses a queue (FIFO)
- Visits nearest nodes first
- Finds shortest path in unweighted graphs

In educational terms, BFS is like checking all rooms on floor 1 before floor 2.

## 5.2 Depth-First Search (DFS)
DFS explores one branch deeply before backtracking.
- Uses a stack (LIFO) or recursion
- Can reach deep nodes quickly
- Does not guarantee shortest path

In educational terms, DFS is like taking one corridor to the end before returning.

## 5.3 Traversal in this project
The project treats the Hasse diagram as a directed acyclic graph and runs traversal from selected start node to selected end node.

For each step, the app stores:
- Current node
- Visited set
- Frontier (queue/stack)
- Trace path
- Active edge
- Status message

## 5.4 Pedagogical advantage
Most tools only show final route. This simulator shows process-level behavior. That is crucial because algorithm understanding comes from seeing *how* frontier and visited sets evolve.

## 5.5 Learning outcomes
After using the simulator, a learner should be able to:
- Explain BFS/DFS operational difference
- Predict next step given current frontier
- Distinguish shortest-path tendency of BFS from DFS exploration behavior
- Read traversal logs confidently

\newpage

# Page 6 - Technology Stack and Tools Used

## 6.1 Core stack
The project uses a lightweight web stack:
- HTML5 for structure
- CSS3 for styling and responsive layout
- JavaScript (ES modules) for application logic

## 6.2 Visualization and interaction library
- D3.js (imported as ES module) is used for SVG rendering, drag behavior, and zoom/pan transforms.

## 6.3 Rendering and export pipeline
- SVG is the primary graph rendering medium.
- Export module serializes SVG and converts it to PNG using canvas.

## 6.4 PPT and report asset page
A separate project assets page provides in-browser presentation rendering and PDF report preview/opening.

## 6.5 Design principles in tool selection
The stack was chosen to maximize:
- Browser compatibility
- Simplicity of deployment
- Easy debugging
- Separation of concerns
- Low dependency overhead

## 6.6 Modular JS files used
- data.js: relation parsing, validation, Hasse generation, random DAG generation, layout.
- algorithms.js: adjacency building and BFS/DFS traversal snapshots.
- graph.js: SVG rendering, interaction mechanics, node movement, zoom/pan.
- ui.js: DOM event wiring, modal controls, state reflection.
- main.js: orchestration and application state control.
- export.js: SVG/PNG export.

## 6.7 Why this architecture is educationally useful
It allows each concept to map to a clear module. Students reading code can identify where theory is implemented and where visual behavior is handled.

\newpage

# Page 7 - System Architecture and Module Design

## 7.1 High-level architecture
The architecture follows a clear flow:
1. User actions trigger UI callbacks.
2. Main controller updates state and requests processing.
3. Data/algorithm modules compute relation/traversal outputs.
4. Graph module renders visuals and state highlights.
5. UI module updates text panels, logs, badges, and modals.

## 7.2 State-centered design
A central state object in main.js stores:
- Nodes, edges
- Selected start/end
- Selection mode
- Traversal mode and speed
- Step mode and running status
- Step snapshots and label map

This state-centric design prevents inconsistency between controls and graph display.

## 7.3 Event-driven interactions
Key event flows:
- Node click updates start/end selection based on active mode.
- Run BFS/DFS triggers traversal computation and animation.
- Relation edits debounce and auto-apply validation.
- Resize events re-fit graph and presentation view scaling.

## 7.4 Separation of responsibilities
- main.js never performs low-level SVG drawing.
- graph.js never parses relation text.
- algorithms.js never touches DOM.
- ui.js avoids business logic calculations.

This improves maintainability and simplifies testing.

## 7.5 Fault handling strategy
Validation is applied before loading graphs. If graph structure is invalid (duplicate nodes, self-loops, unknown references, cycle detection), the system reports an error instead of rendering a broken model.

## 7.6 Modularity benefits for future work
Because modules are isolated, future upgrades like Dijkstra traversal, quiz mode, or advanced layout heuristics can be added without rewriting the full application.

\newpage

# Page 8 - Data Pipeline and Relation Processing

## 8.1 Input parsing pipeline
The relation processing flow:
- Parse elements input (comma/space separated)
- Parse relation text (tuple or line formats)
- Deduplicate elements and relation pairs
- Check unknown elements in relations
- Build canonical relation set

## 8.2 Poset verification
The system checks three properties:
- Missing reflexive pairs
- Antisymmetric violations
- Missing transitive implications

When failures occur, proof text includes concise violation examples.

## 8.3 Cover relation extraction
Hasse edges are computed by removing non-cover links:
- For each a,b where aRb and a != b
- If there exists c such that aRc and cRb
- Then edge a->b is not a cover edge

Only cover edges are preserved for diagram rendering.

## 8.4 Example code snippet - relation checking
```js
const proof = checkPoset(parsed.elements, parsed.relations);
if (!proof.isPoset) {
  ui.setRelationError("Relation S is not a poset. Fix the violations below.");
  return;
}
```

## 8.5 Example code snippet - cover relation logic
```js
if (
  relationSet.has(relationKey(a, c)) &&
  relationSet.has(relationKey(c, b))
) {
  isCover = false;
}
```

## 8.6 Generation from relation rules
The project supports textual rules such as:
- x <= y
- x < y
- x >= y
- x | y
- y | x

This dramatically reduces manual typing and helps create learning examples quickly.

## 8.7 Educational output benefit
The proof report makes hidden logic visible. Instead of just saying "invalid," it tells the learner *why* it is invalid.

\newpage

# Page 9 - Graph Rendering, Interaction, and Layout Mechanics

## 9.1 SVG rendering model
The graph is rendered in SVG with D3-managed groups:
- edge group
- node group
- marker definitions for arrowheads

This allows scalable and crisp visual output.

## 9.2 Layout strategy
Node levels are computed by topological processing. Levels are placed vertically, and nodes in each level are spaced horizontally.

Result:
- Directed edges generally flow upward
- Layer structure remains readable
- Diagram maintains mathematical clarity

## 9.3 Interactive features
- Node drag-and-drop
- Zoom and pan
- Fit-to-view transform
- Undo/redo for node movements

## 9.4 Movement history
Each drag stores from/to coordinates. Undo and redo replay these positions, enabling user experimentation without permanent mistakes.

## 9.5 Example code snippet - zoom transform
```js
const zoom = d3.zoom().scaleExtent([0.35, 2.6]).on("zoom", (event) => {
  currentTransform = event.transform;
  zoomGroup.attr("transform", currentTransform);
});
```

## 9.6 Example code snippet - state-based styling
```js
nodeSelection
  .classed("visited", (d) => visitedSet.has(d.id))
  .classed("current", (d) => d.id === current)
  .classed("path", (d) => pathSet.has(d.id));
```

## 9.7 Why this helps users
Interactivity turns diagrams into manipulable learning objects. Students can adjust visual clarity, focus on a branch, and inspect edge direction without reloading data.

\newpage

# Page 10 - Traversal Engine, Animation, and Step Mode

## 10.1 Traversal engine design
The algorithm module computes traversal as a sequence of immutable snapshots. This makes animation deterministic and replayable.

Each snapshot stores:
- current node
- visited nodes
- frontier content
- path and trace
- active edge
- message and status

## 10.2 BFS/DFS switch behavior
The traversal core uses one engine with mode-based frontier extraction:
- BFS: `frontier.shift()`
- DFS: `frontier.pop()`

This compact approach avoids code duplication.

## 10.3 Example code snippet - frontier behavior
```js
const current = mode === "bfs" ? frontier.shift() : frontier.pop();
```

## 10.4 Animation loop
main.js consumes snapshots one by one and updates:
- graph highlights
- info text
- live trace fields
- traversal log

In auto mode, timers control step delay.
In step mode, user advances manually with "Next Step."

## 10.5 Step modal guidance
The step modal includes:
- what just happened
- what comes next
- lock/unlock controls based on completion stage

This transforms execution into guided pedagogy rather than raw animation.

## 10.6 Educational insight
By exposing frontier and trace explicitly, users stop seeing BFS/DFS as black boxes and start understanding internal state transitions.

## 10.7 Failure scenario handling
If no path exists, the engine emits a warning snapshot:
"No directed path found between the selected nodes."

This behavior is important for realistic learning because not every start/end pair is reachable.

\newpage

# Page 11 - User Interface Design, Accessibility, and Export Features

## 11.1 UI structure
The interface uses a two-panel layout:
- Sidebar: controls, relation tools, and algorithm options
- Workspace: graph canvas, legend, and utility controls

This separation reduces cognitive load.

## 11.2 Selection workflow
Users can set explicit selection mode:
- Start mode
- End mode

Clear buttons allow resetting either node independently, which improves experimentation speed.

## 11.3 Modal ecosystem
The project includes dedicated modals:
- Learn modal (BFS/DFS explanation)
- Relation modal (input/proof)
- Log modal (step history)
- Step modal (guided progression)

## 11.4 Accessibility aspects
- Buttons include labels/aria states
- Modals support escape handling
- Active states are visually and semantically reflected
- Keyboard shortcuts for undo/redo are supported outside text input contexts

## 11.5 Export support
Users can export diagrams as SVG and PNG. Export captures current theme tokens and embeds styling so output matches on-screen appearance.

## 11.6 Example code snippet - PNG export
```js
canvas.toBlob((blob) => {
  if (blob) {
    downloadBlob(blob, filename);
  }
}, "image/png");
```

## 11.7 Practical value
Export capability directly supports:
- Assignments
- Reports
- PPT slides
- Poster/demo artifacts

Combined with logs and step explanation, this makes the tool presentation-friendly as well as learning-friendly.

\newpage

# Page 12 - Implementation Highlights with Code Snippets

## 12.1 Application orchestration
main.js wires callbacks from UI to functional modules.

```js
const ui = createUI({
  onRunBfs: () => startTraversal("bfs"),
  onRunDfs: () => startTraversal("dfs"),
  onApplyRelations: () => applyRelations(),
  onExportPng: () => exportPng(graph.getSvgElement(), buildExportName("png"), getThemeTokens())
});
```

## 12.2 Selection handling
```js
function handleNodeClick(nodeId) {
  if (state.selectionMode === "start") {
    state.startId = nodeId;
    if (state.endId === nodeId) state.endId = null;
  } else {
    state.endId = nodeId;
    if (state.startId === nodeId) state.startId = null;
  }
  updateSelection();
}
```

## 12.3 Poset validation result reporting
```js
const proofText = buildProofReport(parsed, proof);
ui.setRelationProof(proofText);
```

## 12.4 Traversal call
```js
const result = traverseGraph({
  startId: state.startId,
  endId: state.endId,
  adjacency,
  mode
});
state.steps = result.steps;
```

## 12.5 Graph state updates per step
```js
graph.setTraversalState({
  visited: step.visited,
  current: step.current,
  path: step.path,
  activeEdge: step.activeEdge,
  visitedOrder: step.visited
});
```

## 12.6 Rule-based relation generation
```js
if (normalized === "x|y") return { predicate: (x, y) => divides(x, y) };
if (normalized === "y|x") return { predicate: (x, y) => divides(y, x) };
```

## 12.7 Why these snippets matter
Together, these snippets show that the application is not a static visual toy. It is a structured, modular educational system combining formal relation logic with interactive graph algorithms.

\newpage

# Page 13 - Sample Outputs and Result Interpretation

## 13.1 Sample input
Elements:
`1, 2, 3, 4, 6, 12`

Rule:
`x | y`

## 13.2 Expected proof output summary
- Reflexive: OK
- Antisymmetric: OK
- Transitive: OK
- Result: relation is a poset, diagram updated

## 13.3 Sample adjacency output
```text
1: 2, 3
2: 4, 6
3: 6
4: 12
6: 12
12: -
```

## 13.4 Sample BFS log snippet (1 to 12)
```text
1/.. Initialize queue with 1.
2/.. Visit 1.
3/.. Add 2 to the queue.
4/.. Add 3 to the queue.
5/.. Visit 2.
6/.. Add 4 to the queue.
7/.. Add 6 to the queue.
...
Path found: 1 -> 2 -> 4 -> 12.
```

## 13.5 Sample DFS behavior note
DFS may produce a different but valid route, for example:
`1 -> 3 -> 6 -> 12`

This helps learners observe order sensitivity of traversal mechanics.

## 13.6 Visual indicators
During animation:
- Visited nodes change style
- Current node is highlighted distinctly
- Active edge pulses
- Final path nodes/edges use dedicated color state

## 13.7 Interpretation
Outputs demonstrate:
- Correct relation-to-diagram conversion
- Correct traversal progression
- Traceability through logs and live panels
- Usability for both demonstration and self-study

\newpage

# Page 14 - Team Contributions and Work Distribution

## 14.1 Team members
- MahirShah07
- Rumani07

Guide:
- Dr. Ashlesha Bhise

## 14.2 Contribution model
The project involved concept development, implementation, testing, documentation, and presentation preparation.

### MahirShah07 - Primary focus areas
- Core concept framing and project direction
- Poset and relation logic alignment
- Main feature integration and validation flow
- Report and demonstration planning

### Rumani07 - Primary focus areas
- UI behavior implementation and interaction refinement
- Visual experience improvements (selection controls, modal interactions)
- Assets page integration (presentation/report handling)
- Testing of traversal states and user actions

### Shared responsibilities
- Algorithm verification (BFS/DFS correctness checks)
- Bug fixing and usability polishing
- Final integration and end-to-end testing
- Documentation review and presentation content finalization

## 14.3 Role mapping to expected evaluation criteria
As requested in evaluation expectations:
- Concept: jointly designed and validated
- Code: jointly implemented, modularized, and tested
- Documentation: jointly drafted and refined
- Idea implementation: converted from abstract educational goal to functional simulator

## 14.4 Guide role
Dr. Ashlesha Bhise provided guidance on:
- academic framing
- conceptual rigor
- presentation quality
- overall direction and review feedback

## 14.5 Team process summary
The team followed iterative development:
- implement small feature
- test in browser
- gather feedback
- refine UX and explanation clarity

This process helped produce a stable and demonstrable learning tool.

\newpage

# Page 15 - Challenges, Limitations, Future Work, and Conclusion

## 15.1 Challenges faced
1. Balancing mathematical correctness with beginner-friendly language.
2. Designing Hasse edge filtering without over-complicating code.
3. Managing traversal state visualization and logs in sync.
4. Handling varied user input formats safely.
5. Keeping UI flexible while preserving clarity.

## 15.2 Limitations
- Very large diagrams can become visually dense.
- Current traversal suite is limited to BFS/DFS.
- No built-in grading/quiz mode yet.
- No persistence layer for saving session states.

## 15.3 Future enhancement roadmap
- Add Dijkstra and topological traversal modules.
- Add node grouping/clustered layouts for large graphs.
- Add quiz mode with auto-feedback.
- Add downloadable PDF proof reports.
- Add configurable color themes for accessibility needs.
- Add session save/load support.

## 15.4 Conclusion
The Hasse Path Finder successfully transforms abstract discrete mathematics content into an interactive learning experience. The project validates relation correctness, generates clean Hasse diagrams, and demonstrates BFS/DFS traversal in a transparent and explainable way.

By integrating proof generation, visual animation, guided step mode, and export capabilities, the tool supports both classroom teaching and independent study. The modular architecture ensures maintainability and future extensibility.

In summary, the project achieves its educational and technical goals by making complex concepts visible, interactive, and understandable.

## 15.5 References (conceptual)
- Introductory Discrete Mathematics texts (relations and posets)
- Standard algorithms references for BFS and DFS
- D3.js official documentation for SVG interactions
- Web platform docs for Canvas and SVG export behavior

---

## Appendix A - Quick Demo Script (for evaluators)
1. Open relation modal.
2. Use elements `1,2,3,4,6,12` and rule `x | y`.
3. Generate relation and apply.
4. Select start node `1`, end node `12`.
5. Run BFS, observe queue progression.
6. Run DFS, compare traversal order.
7. Enable Step Mode and present modal explanations.
8. Export PNG and include in submission.

## Appendix B - Suggested viva questions
- Why remove transitive edges in Hasse diagrams?
- How does BFS differ from DFS in frontier behavior?
- How does the tool detect antisymmetric violations?
- Why use modular architecture in JavaScript projects?
