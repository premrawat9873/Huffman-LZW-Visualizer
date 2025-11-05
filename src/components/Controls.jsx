
import React, {useState} from 'react'

export default function Controls(){
  const [text, setText] = useState('AAABBACCBAADADDAABCBBCCBAAAD');
  const runAll = () => {
    window.dispatchEvent(new CustomEvent('run-all', {detail:{text}}))
  }
  return (
    <div className="controls card">
      <textarea value={text} onChange={e=>setText(e.target.value)} />
      <div style={{display:'flex',gap:8,marginLeft:6,marginTop:8}}>
        <button onClick={runAll}>Visualize Both</button>
        <button onClick={()=>window.dispatchEvent(new CustomEvent('run-huffman', {detail:{text}}))}>Huffman Only</button>
        <button onClick={()=>window.dispatchEvent(new CustomEvent('run-lzw', {detail:{text}}))}>LZW Only</button>
      </div>
    </div>
  )
}
