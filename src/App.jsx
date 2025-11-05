
import React from 'react'
import HuffmanVisualizer from './components/HuffmanVisualizer'
import LZWVisualizer from './components/LZWVisualizer'
import Controls from './components/Controls'

export default function App(){
  return (
    <div className="app">
      <div className="header">
        <div>
          <div className="subtitle">DAA project</div>
          <div className="title">Data Elegance in Bits — Huffman &amp; LZW Visualizer</div>
          <div className="small">Beautiful animated visualizations showing tree nodes and dictionary growth</div>
        </div>
      </div>
      <Controls />
      <div className="grid">
        <div className="card">
          <div className="panel-title">Huffman Tree Visualization</div>
          <HuffmanVisualizer />
        </div>
        <div className="card">
          <div className="panel-title">LZW Dictionary & Steps</div>
          <LZWVisualizer />
        </div>
      </div>
      <div className="footer">
        Created by:
        <br />
        Prem Rawat(23BCS10659)
        <br />
        Devika(23BCS11644)
      </div>
    </div>
  )
}
