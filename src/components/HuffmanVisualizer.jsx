import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { buildHuffmanSteps, genCodes } from "../utils/huffman";

export default function HuffmanVisualizer() {
  const svgRef = useRef(null);
  const codeSvgRef = useRef(null);
  const [snapshots, setSnapshots] = useState([]);
  const [root, setRoot] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [codes, setCodes] = useState({});

  useEffect(() => {
    const onRun = (e) => {
      const text = (e.detail && e.detail.text) || "";
      const { steps, root } = buildHuffmanSteps(text);
      setSnapshots(steps);
      setRoot(root);
      setStepIndex(0);
      setCodes(genCodes(root));
    };
    window.addEventListener("run-all", onRun);
    window.addEventListener("run-huffman", onRun);
    return () => {
      window.removeEventListener("run-all", onRun);
      window.removeEventListener("run-huffman", onRun);
    };
  }, []);

  useEffect(() => {
    renderCurrentStep();
    setCodes(genCodes(root));
    if (stepIndex === snapshots.length - 1) renderCodeGraph();
    else d3.select(codeSvgRef.current).selectAll("*").remove();
  }, [snapshots, stepIndex, root]);

  function renderCurrentStep() {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    if (!snapshots || snapshots.length === 0) return;

    const snapshot = snapshots[Math.min(stepIndex, snapshots.length - 1)];
    const nodes = snapshot.nodes || [];
    const groups = nodes.map((n) => buildHierarchy(n)).filter(Boolean);
    const artificial = { name: "", children: groups };

    const rootHierarchy = d3.hierarchy(artificial);

    // make the tree vertical (top to bottom)
    const treeLayout = d3.tree().size([640, 400]); // x=horizontal width, y=vertical height
    treeLayout(rootHierarchy);

    svg.attr("viewBox", "0 0 740 460");
    const g = svg.append("g").attr("transform", "translate(60,40)");

    // draw links (vertical layout)
    g.selectAll("path.link")
      .data(rootHierarchy.links())
      .join("path")
      .attr(
        "d",
        d3
          .linkVertical()
          .x((d) => d.x)
          .y((d) => d.y)
      )
      .attr("stroke", "rgba(255,255,255,0.25)")
      .attr("fill", "none");

    // nodes
    const node = g
      .selectAll("g.node")
      .data(rootHierarchy.descendants())
      .join("g")
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    node
      .append("circle")
      .attr("r", (d) => (d.children ? 14 : 10))
      .attr("fill", (d) => (d.children ? "#06b6d4" : "#60a5fa"))
      .attr("stroke", "rgba(255,255,255,0.3)")
      .attr("stroke-width", 1);

    node
      .append("text")
      .attr("y", -18)
      .attr("text-anchor", "middle")
      .text((d) => d.data.name)
      .attr("fill", "#e6f7ff")
      .style("font-size", "12px");
  }

  function buildHierarchy(node) {
    if (!node) return null;
    const obj = {
      name:
        node.label === null
          ? `* (${node.freq})`
          : `${node.label} (${node.freq})`,
    };
    const kids = [];
    if (node.left) kids.push(buildHierarchy(node.left));
    if (node.right) kids.push(buildHierarchy(node.right));
    if (kids.length) obj.children = kids;
    return obj;
  }

  // Final Huffman Code Tree (only shown at last step)
  function renderCodeGraph() {
    const svg = d3.select(codeSvgRef.current);
    svg.selectAll("*").remove();
    if (!root) return;

    const hierarchy = buildCodeHierarchy(root);
    const treeLayout = d3.tree().size([640, 400]);
    const hRoot = d3.hierarchy(hierarchy);
    treeLayout(hRoot);

    svg.attr("viewBox", "0 0 740 460");
    const g = svg.append("g").attr("transform", "translate(60,40)");

    // links
    g.selectAll("path.link")
      .data(hRoot.links())
      .join("path")
      .attr(
        "d",
        d3
          .linkVertical()
          .x((d) => d.x)
          .y((d) => d.y)
      )
      .attr("stroke", "#94a3b8")
      .attr("fill", "none");

    // edge labels (0 / 1)
    g.selectAll("text.edge")
      .data(hRoot.links())
      .join("text")
      .attr("x", (d) => (d.source.x + d.target.x) / 2)
      .attr("y", (d) => (d.source.y + d.target.y) / 2 - 8)
      .attr("text-anchor", "middle")
      .attr("fill", "#fbbf24")
      .style("font-size", "12px")
      .text((d) => (d.target.data.edge === 0 ? "0" : "1"));

    // nodes
    const node = g
      .selectAll("g.node")
      .data(hRoot.descendants())
      .join("g")
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    node
      .append("circle")
      .attr("r", (d) => (d.children ? 14 : 10))
      .attr("fill", (d) => (d.children ? "#0ea5e9" : "#22c55e"))
      .attr("stroke", "rgba(255,255,255,0.3)");

    node
      .append("text")
      .attr("y", -18)
      .attr("text-anchor", "middle")
      .attr("fill", "#f8fafc")
      .style("font-size", "12px")
      .text((d) =>
        d.data.label ? `${d.data.label}: ${d.data.code}` : "*"
      );
  }

  function buildCodeHierarchy(node, prefix = "", edge = null) {
    if (!node) return null;
    const current = { label: node.label, code: prefix, edge };
    if (node.left || node.right) {
      current.children = [];
      if (node.left)
        current.children.push(buildCodeHierarchy(node.left, prefix + "0", 0));
      if (node.right)
        current.children.push(buildCodeHierarchy(node.right, prefix + "1", 1));
    }
    return current;
  }

  function onPrev() {
    setStepIndex((i) => Math.max(0, i - 1));
  }
  function onNext() {
    setStepIndex((i) => Math.min(i + 1, Math.max(0, snapshots.length - 1)));
  }

  return (
    <div>
      <svg ref={svgRef} style={{ width: "100%", height: 460 }}></svg>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 8,
          alignItems: "center",
        }}
      >
        <button onClick={onPrev}>Prev</button>
        <button onClick={onNext}>Next</button>
        <div style={{ flex: 1, color: "#94a3b8" }}>
          Step {Math.min(stepIndex + 1, snapshots.length)} / {snapshots.length}
        </div>
      </div>

      {stepIndex === snapshots.length - 1 && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ color: "#cfe8ff", fontWeight: 600 }}>
            Final Huffman Code Tree
          </h3>
          <svg ref={codeSvgRef} style={{ width: "100%", height: 460 }}></svg>
        </div>
      )}

      <div style={{ marginTop: 10 }}>
        <div style={{ fontWeight: 600, color: "#cfe8ff" }}>Codes</div>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginTop: 6,
          }}
        >
          {Object.keys(codes).map((k) => (
            <div
              key={k}
              style={{
                padding: 6,
                background: "rgba(255,255,255,0.02)",
                borderRadius: 6,
              }}
            >
              <strong>{k}</strong>:{" "}
              <code style={{ fontFamily: "monospace" }}>{codes[k]}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
