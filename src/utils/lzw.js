// ----- LZW COMPRESSED SIZE -----
export function getLZWCompressedSize(data) {
  if (!data || !data.steps || data.steps.length === 0) return 0;

  const lastStep = data.steps[data.steps.length - 1];
  const output = lastStep.output || [];

  if (!output.length) return 0;

  const maxCode = Math.max(...output);
  const bitsPerCode = Math.max(8, Math.ceil(Math.log2(maxCode + 1)));
  return output.length * bitsPerCode;
}


// ----- LZW ENCODING WITH STEP TRACKING + FINAL DICTIONARY -----
export function lzwEncodeSteps(input) {
  if (!input || input.length === 0) return { steps: [], finalDictionary: [] };

  let dict = new Map();
  let nextCode = 256;

  for (let i = 0; i < 256; i++) {
    dict.set(String.fromCharCode(i), i);
  }

  let w = "";
  const steps = [];
  const output = [];

  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    const wc = w + c;

    if (dict.has(wc)) {
      w = wc;
    } else {
      output.push(dict.get(w));
      dict.set(wc, nextCode++);

      steps.push({
        step: steps.length + 1,
        w,
        current: c,
        added: wc,
        addedCode: dict.get(wc),
        output: [...output],
        dictionary: Array.from(dict.entries()),
        remaining: input.slice(i + 1)
      });

      w = c;
    }
  }

  if (w !== "") {
    output.push(dict.get(w));
    steps.push({
      step: steps.length + 1,
      w,
      current: null,
      added: null,
      addedCode: null,
      output: [...output],
      dictionary: Array.from(dict.entries()),
      remaining: ""
    });
  }

  return {
    steps,
    finalDictionary: Array.from(dict.entries())
  };
}


// ----- EXPAND FINAL OUTPUT TO VALUE TABLE -----
export function expandLZWOutput(output, finalDict) {
  const dict = new Map();
  finalDict.forEach(([str, code]) => dict.set(code, str));

  return output.map(code => ({
    code,
    value: dict.get(code)
  }));
}
