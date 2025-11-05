// Utilities to produce Huffman merge steps and snapshots for visualization
// - Stable merges by (freq, id) to ensure deterministic tree structure
// - Left child is the node with smaller frequency (left == bit 0)

let globalIdCounter = 0;

export function resetIdCounter(){
  globalIdCounter = 0;
}

export function buildFrequencyMap(s){
  const m = new Map();
  for(const ch of s){
    m.set(ch, (m.get(ch)||0)+1);
  }
  return m;
}

// returns {steps, root}
// steps: array of snapshots; each snapshot: {nodes:Array(nodeSummary), description, merged:[aId,bId], mergedNodeId}
export function buildHuffmanSteps(s){
  resetIdCounter();
  const freq = buildFrequencyMap(s);
  // create initial nodes
  let nodes = [];
  for(const [ch,f] of freq.entries()){
    nodes.push({id: makeId(), label: ch, freq: f, left:null, right:null});
  }
  // if there is no character, return empty
  if(nodes.length === 0){
    return {steps: [], root: null};
  }
  // If only one distinct symbol, we still want a root (single node)
  const steps = [];
  steps.push({nodes: nodes.map(n=>({...n})), description: 'Initial nodes'});

  // operate until one node remains
  while(nodes.length > 1){
    // sort by freq, then by id to be stable
    nodes.sort((a,b) => {
      if(a.freq !== b.freq) return a.freq - b.freq;
      return a.id.localeCompare(b.id);
    });
    const a = nodes.shift(); // smallest
    const b = nodes.shift(); // second smallest

    // ensure left is the smaller (a), right is b
    const merged = {id: makeId(), label: null, freq: a.freq + b.freq, left: a, right: b};

    // push a snapshot before adding merged to nodes (so snapshot shows state after merge)
    nodes.push(merged);
    steps.push({
      nodes: nodes.map(n => ({...n})),
      description: `Merged (${repr(a)}) + (${repr(b)}) => ${merged.freq}`,
      merged: [a.id, b.id],
      mergedNodeId: merged.id
    });
  }

  const root = nodes[0];
  return {steps, root};
}

function makeId(){
  return 'n' + (globalIdCounter++);
}
function repr(n){
  return (n.label !== null ? `'${n.label}':${n.freq}` : `*:${n.freq}`);
}

// convert hierarchical node to d3.hierarchy-friendly structure
export function nodeToHierarchy(node){
  if(!node) return null;
  const res = {name: node.label === null ? '' : `${node.label} (${node.freq})`, freq: node.freq, id: node.id};
  res.children = [];
  if(node.left) res.children.push(nodeToHierarchy(node.left));
  if(node.right) res.children.push(nodeToHierarchy(node.right));
  if(res.children.length === 0) delete res.children;
  return res;
}

// generate codes from final root. Uses left='0', right='1' convention.
// If tree has only one node (single symbol), assign code '0' to it.
export function genCodes(root){
  const codes = {};
  if(!root) return codes;
  if(!root.left && !root.right && root.label !== null){
    // single-node tree
    codes[root.label] = '0';
    return codes;
  }
  function dfs(n, p){
    if(!n) return;
    if(n.label !== null){
      codes[n.label] = p.length ? p : '0';
    }
    if(n.left) dfs(n.left, p + '0');
    if(n.right) dfs(n.right, p + '1');
  }
  dfs(root, '');
  return codes;
}
