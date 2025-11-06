export function getLZWCompressedSize(steps){
  if(!steps || steps.length===0) return 0;
  const lastStep = steps[steps.length-1];
  const output = lastStep.output || [];
  // Number of bits per code (use minimal bits to represent largest code)
  const maxCode = Math.max(...output);
  const bitsPerCode = Math.ceil(Math.log2(maxCode + 1));
  return output.length * bitsPerCode;
}


export function lzwEncodeSteps(input) {
  if (!input || input.length === 0) return [];

  let dict = new Map();
  let dictNextCode = 127; // start after visible ASCII range (32–126)

  // Initialize dictionary with printable ASCII only
  for (let i = 32; i < 127; i++) {
    dict.set(String.fromCharCode(i), i);
  }

  let w = "";
  const steps = [];
  const output = [];

  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    const wc = w + c;

    if (dict.has(wc)) {
      // If combination already in dictionary, keep extending
      w = wc;
    } else {
      // Output code for w
      output.push(dict.get(w));

      // Add new sequence to dictionary
      dict.set(wc, dictNextCode++);

      // Record visualization step
      const snapshot = {
        step: steps.length + 1,
        current: c,
        output: [...output],
        added: wc,
        addedCode: dict.get(wc),
        w,
        dictionary: Array.from(dict.entries()), // show full dictionary now
        remaining: input.slice(i + 1),
      };

      steps.push(snapshot);
      w = c;
    }
  }

  // Flush last code
  if (w !== "") {
    output.push(dict.get(w));
    steps.push({
      step: steps.length + 1,
      current: null,
      output: [...output],
      added: null,
      addedCode: null,
      w,
      dictionary: Array.from(dict.entries()),
      remaining: "",
    });
  }

  return steps;
}

// Add this function to calculate compression ratio
function calculateCompressionRatio(originalText, encodedBits) {
    const originalBits = originalText.length * 8; // ASCII characters use 8 bits
    const compressionRatio = ((originalBits - encodedBits) / originalBits) * 100;
    return compressionRatio.toFixed(2);
}

// Modify the existing compress function
function compress() {
    const inputText = document.getElementById('input').value;
    if (!inputText) {
        alert('Please enter some text');
        return;
    }

    // ...existing code for Huffman encoding...

    const originalSize = inputText.length * 8;
    const compressedSize = encoded.length;
    const ratio = calculateCompressionRatio(inputText, compressedSize);

    // Add this to display compression statistics
    document.getElementById('compressionStats').innerHTML = `
        <div class="stats-container">
            <p>Original size: ${originalSize} bits</p>
            <p>Compressed size: ${compressedSize} bits</p>
            <p>Compression ratio: ${ratio}%</p>
        </div>
    `;
}
