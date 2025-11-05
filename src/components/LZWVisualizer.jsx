import React, { useEffect, useState } from "react";
import { lzwEncodeSteps } from "../utils/lzw";

export default function LZWVisualizer() {
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const onRun = (e) => {
      const text = (e.detail && e.detail.text) || "";
      const s = lzwEncodeSteps(text);
      setSteps(s);
      setStepIndex(0);
    };
    window.addEventListener("run-all", onRun);
    window.addEventListener("run-lzw", onRun);
    return () => {
      window.removeEventListener("run-all", onRun);
      window.removeEventListener("run-lzw", onRun);
    };
  }, []);

  const step = steps[stepIndex] || {};

  const onPrev = () => setStepIndex((i) => Math.max(0, i - 1));
  const onNext = () => setStepIndex((i) => Math.min(steps.length - 1, i + 1));

  return (
    <div>
      <h3 style={{ color: "#cfe8ff", fontWeight: 600 }}>LZW Compression Visualization</h3>

      <div
        style={{
          marginBottom: 8,
          padding: 10,
          background: "rgba(255,255,255,0.05)",
          borderRadius: 6,
        }}
      >
        <div>
          <strong>Step:</strong> {step.step || 0} / {steps.length}
        </div>
        <div>
          <strong>Processing:</strong> {step.w || ""} + {step.current || ""}
        </div>
        {step.added && (
          <div>
            <strong>Added to dictionary:</strong> <code>{step.added}</code> →{" "}
            {step.addedCode}
          </div>
        )}
        <div>
          <strong>Remaining:</strong> <code>{step.remaining || "—"}</code>
        </div>
        <div>
          <strong>Output:</strong>{" "}
          {step.output && step.output.length > 0
            ? step.output.join(", ")
            : "—"}
        </div>
      </div>

      <h4 style={{ color: "#cfe8ff" }}>Dictionary</h4>
      <div
        style={{
          maxHeight: 250,
          overflowY: "auto",
          borderRadius: 6,
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <thead>
            <tr style={{ color: "#cfe8ff" }}>
              <th align="left" style={{ padding: "4px 8px" }}>Code</th>
              <th align="left" style={{ padding: "4px 8px" }}>String</th>
            </tr>
          </thead>
          <tbody>
            {step.dictionary &&
              step.dictionary.map(([k, v]) => (
                <tr
                  key={v}
                  style={{
                    background:
                      v === step.addedCode ? "rgba(0,255,100,0.15)" : "",
                    transition: "background 0.3s ease",
                  }}
                >
                  <td style={{ padding: "4px 8px" }}>{v}</td>
                  <td style={{ padding: "4px 8px" }}>
                    <code>{k}</code>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button onClick={onPrev}>Prev</button>
        <button onClick={onNext}>Next</button>
      </div>
    </div>
  );
}
