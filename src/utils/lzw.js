// LZW Encoding Step Generator for Visualization
// Tracks dictionary growth, current input, and output codes (clean + readable version)

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
