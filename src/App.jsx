import React, { useState, useEffect } from 'react';
import HuffmanVisualizer from './components/HuffmanVisualizer';
import LZWVisualizer from './components/LZWVisualizer';
import Controls from './components/Controls';
import { buildFrequencyMap, genCodes, buildHuffmanSteps } from './utils/huffman';
import { getLZWCompressedSize, lzwEncodeSteps } from './utils/lzw';

export default function App() {
  const [text, setText] = useState('AAABBACCBAADADDAABCBBCCBAAAD');

  // Huffman state
  const [huffmanRoot, setHuffmanRoot] = useState(null);
  const [huffmanFreqMap, setHuffmanFreqMap] = useState(new Map());
  const [huffmanSteps, setHuffmanSteps] = useState([]);

  // LZW state
  const [lzwSteps, setLZWSteps] = useState([]);

  // Compression stats
  const [originalSize, setOriginalSize] = useState(0);
  const [huffmanSize, setHuffmanSize] = useState(0);
  const [lzwSize, setLZWSize] = useState(0);
  const [huffmanReduction, setHuffmanReduction] = useState(0);
  const [lzwReduction, setLZWReduction] = useState(0);

  useEffect(() => {
    const onRunAll = (e) => {
      const inputText = e.detail?.text || '';
      setText(inputText);

      // Huffman
      const freqMap = buildFrequencyMap(inputText);
      const { steps, root } = buildHuffmanSteps(inputText);
      setHuffmanSteps(steps);
      setHuffmanRoot(root);
      setHuffmanFreqMap(freqMap);

      // LZW
      const lzwStepArr = lzwEncodeSteps(inputText);
      setLZWSteps(lzwStepArr);

      // Comparison
      const origSize = inputText.length * 8;
      const huffSize = getHuffmanCompressedSize(root, freqMap);
      const lzwCompSize = getLZWCompressedSize(lzwStepArr);

      setOriginalSize(origSize);
      setHuffmanSize(huffSize);
      setLZWSize(lzwCompSize);

      setHuffmanReduction(((origSize - huffSize) / origSize * 100).toFixed(2));
      setLZWReduction(((origSize - lzwCompSize) / origSize * 100).toFixed(2));
    };

    const onRunHuffman = (e) => {
      const inputText = e.detail?.text || '';
      setText(inputText);

      const freqMap = buildFrequencyMap(inputText);
      const { steps, root } = buildHuffmanSteps(inputText);
      setHuffmanSteps(steps);
      setHuffmanRoot(root);
      setHuffmanFreqMap(freqMap);

      const origSize = inputText.length * 8;
      const huffSize = getHuffmanCompressedSize(root, freqMap);

      setOriginalSize(origSize);
      setHuffmanSize(huffSize);
      setHuffmanReduction(((origSize - huffSize) / origSize * 100).toFixed(2));

      setLZWSize(0);
      setLZWReduction(0);
    };

    const onRunLZW = (e) => {
      const inputText = e.detail?.text || '';
      setText(inputText);

      const lzwStepArr = lzwEncodeSteps(inputText);
      setLZWSteps(lzwStepArr);

      const origSize = inputText.length * 8;
      const lzwCompSize = getLZWCompressedSize(lzwStepArr);

      setOriginalSize(origSize);
      setLZWSize(lzwCompSize);
      setLZWReduction(((origSize - lzwCompSize) / origSize * 100).toFixed(2));

      setHuffmanSize(0);
      setHuffmanReduction(0);
    };

    window.addEventListener('run-all', onRunAll);
    window.addEventListener('run-huffman', onRunHuffman);
    window.addEventListener('run-lzw', onRunLZW);

    return () => {
      window.removeEventListener('run-all', onRunAll);
      window.removeEventListener('run-huffman', onRunHuffman);
      window.removeEventListener('run-lzw', onRunLZW);
    };
  }, []);

  return (
    <div className="app">
      <div className="header">
        <div>
          <div className="subtitle">DAA project</div>
          <div className="title">Data Elegance in Bits — Huffman &amp; LZW Visualizer</div>
          <div className="small">
            Beautiful animated visualizations showing tree nodes and dictionary growth
          </div>
        </div>
      </div>

      <Controls />

      <div className="grid">
        <div className="card">
          <div className="panel-title">Huffman Tree Visualization</div>
          <HuffmanVisualizer steps={huffmanSteps} />
        </div>
        <div className="card">
          <div className="panel-title">LZW Dictionary & Steps</div>
          <LZWVisualizer steps={lzwSteps} />
        </div>
      </div>

      <div className="card compression-stats">
        <h4>Compression Comparison</h4>
        <p>Original size: {originalSize} bits</p>
        {huffmanSize > 0 && (
          <p>
            Huffman compressed: {huffmanSize} bits ({huffmanReduction}% reduced)
          </p>
        )}
        {lzwSize > 0 && (
          <p>
            LZW compressed: {lzwSize} bits ({lzwReduction}% reduced)
          </p>
        )}
      </div>

      <div className="footer">
        Created by:
        <br />
        Prem Rawat (23BCS10659)
        <br />
        Devika (23BCS11644)
      </div>
    </div>
  );
}

// Helper function to calculate Huffman compressed size
export function getHuffmanCompressedSize(root, freqMap) {
  if (!root || !freqMap) return 0;
  const codes = genCodes(root);
  let size = 0;
  for (const [ch, freq] of freqMap.entries()) {
    size += freq * codes[ch].length;
  }
  return size;
}
