import React, { useEffect, useState, useRef } from "react";

import { lzwEncodeSteps, expandLZWOutput } from "../utils/lzw";

export default function LZWVisualizer() {
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [finalDict, setFinalDict] = useState([]);
  const [finalOutputTable, setFinalOutputTable] = useState([]);
  const dictionaryRef = useRef(null);


  useEffect(() => {
    const onRun = (e) => {
      const text = (e.detail && e.detail.text) || "";
      const { steps: s, finalDictionary } = lzwEncodeSteps(text);

      setSteps(s);
      setStepIndex(0);
      setFinalDict(finalDictionary);

      const output = s.length > 0 ? s[s.length - 1].output : [];
      setFinalOutputTable(expandLZWOutput(output, finalDictionary));
    };

    window.addEventListener("run-all", onRun);
    window.addEventListener("run-lzw", onRun);
    return () => {
      window.removeEventListener("run-all", onRun);
      window.removeEventListener("run-lzw", onRun);
    };
  }, []);
  useEffect(() => {
  if (!steps.length) return;

  const step = steps[stepIndex];
  if (step && step.addedCode && dictionaryRef.current) {
    // Wait a frame for DOM update then scroll
    setTimeout(() => {
      dictionaryRef.current.scrollTop = dictionaryRef.current.scrollHeight;
    }, 50);
  }
}, [stepIndex, steps]);

  const step = steps.length > 0 ? steps[stepIndex] : {};

  const onPrev = () => setStepIndex(i => Math.max(0, i - 1));
  const onNext = () => setStepIndex(i => Math.min(steps.length - 1, i + 1));
  const onFinal = () => setStepIndex(steps.length - 1);

  return (
    <div>
      <h3 style={{ color: "#cfe8ff", fontWeight: 600 }}>LZW Compression Visualization</h3>

      <div style={{ marginBottom: 8, padding: 10, background: "rgba(255,255,255,0.05)", borderRadius: 6 }}>
        <div><strong>Step:</strong> {steps.length === 0 ? 0 : stepIndex + 1} / {steps.length}</div>
        <div><strong>Processing:</strong> {step.w || ""} + {step.current || ""}</div>
        {step.added && (
          <div><strong>Added to dictionary:</strong> <code>{step.added}</code> → {step.addedCode}</div>
        )}
        <div><strong>Output so far:</strong> {step.output?.join(", ") || "—"}</div>
      </div>

      <h4 style={{ color: "#cfe8ff" }}>Dictionary at this Step</h4>
      <div
  ref={dictionaryRef}
  style={{
    maxHeight: 250,
    overflowY: "auto",
    scrollBehavior: "smooth",  // ✅ smooth scrolling
    borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.1)",
  }}
>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "#cfe8ff" }}>
              <th style={{ padding: "4px 8px" }}>Code</th>
              <th style={{ padding: "4px 8px" }}>String</th>
            </tr>
          </thead>
<tbody>
  {(step.dictionary || [])
    .sort((a, b) => a[1] - b[1])
    .map(([str, code]) => {
      const isNew = code === step.addedCode;
      return (
        <tr
          key={code}
          className={isNew ? "lzw-glow" : ""}
          style={{
            transition: "background 0.4s ease",
          }}
        >
          <td style={{ padding: "4px 8px" }}>{code}</td>
          <td style={{ padding: "4px 8px" }}><code>{str}</code></td>
        </tr>
      );
    })}
</tbody>

        </table>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button onClick={onPrev}>Prev</button>
        <button onClick={onNext}>Next</button>
        <button onClick={onFinal}>Final Step</button>
      </div>

      {stepIndex === steps.length - 1 && (
        <div style={{ marginTop: 30 }}>
          <h3 style={{ color: "#cfe8ff", fontWeight: 600 }}>Final LZW Output Table</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ color: "#cfe8ff" }}>
                <th style={{ padding: "6px 8px" }}>Output Code</th>
                <th style={{ padding: "6px 8px" }}>Decoded Value</th>
              </tr>
            </thead>
            <tbody>
              {finalOutputTable.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ padding: "6px 8px" }}>{row.code}</td>
                  <td style={{ padding: "6px 8px" }}><code>{row.value}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
