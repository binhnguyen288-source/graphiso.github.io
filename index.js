const radius = 20;
const maxV = 100;


class InteractiveGraph {
    constructor(canvasID, pre) {
        this.canvas = document.getElementById(canvasID);
        this.nodes = [];
        this.graph = new Graph(canvasID);
        this.adj = new Array(maxV * maxV).fill(0);
        this.mapIdx = {};

        this.graph.setNodeCreatedCallback(node => {
          this.mapIdx[node.id] = this.nodes.length;
          node.setText(`${pre}${1 + this.nodes.length}`);
          node.r = 20;
          this.nodes.push(node);
        });

        this.graph.setConnectionCreatedCallback(edge => {
          const idxFrom = this.mapIdx[edge.getStartid()];
          const idxTo = this.mapIdx[edge.getEndid()];
          this.adj[idxFrom * maxV + idxTo] = this.adj[idxTo * maxV + idxFrom] = 1;
        });
    }
}


const graph1 = new InteractiveGraph('graph1', 'u');

const graph2 = new InteractiveGraph('graph2', 'v');


function permute(n) {
  const permutation = Array.from(Array(n), (_, idx) => idx);
  var length = permutation.length,
      result = [permutation.slice()],
      c = new Array(length).fill(0),
      i = 1, k, p;

  while (i < length) {
    if (c[i] < i) {
      k = i % 2 && c[i];
      p = permutation[i];
      permutation[i] = permutation[k];
      permutation[k] = p;
      ++c[i];
      i = 1;
      result.push(permutation.slice());
    } else {
      c[i] = 0;
      ++i;
    }
  }
  return result;
}


function countInversion(A) {
  let count = 0;
  for (let i = 0; i < A.length; ++i) {
    for (let j = i + 1; j < A.length; ++j) {
      if (A[j] < A[i]) ++count;
    }
  }
  return count % 2 == 0 ? 1n : -1n;
}

function characteristic(A, n) {

  const lambda = 1n << 32n;
  const offset = lambda / 2n;
  const mat = A.map(v => BigInt(v));
  for (let i = 0; i < n; ++i) {
    mat[i * n + i] -= lambda;
  }

  let det = 0n;

  for (const sigma of permute(n)) {
    let prod = 1n;
    for (let i = 0; i < n; ++i) {
      prod *= mat[i * n + sigma[i]];
    }

    det += countInversion(sigma) * prod;
  }

  let next_add = offset;
  for (let i = 0; i <= n; ++i) {
    det += next_add;
    next_add <<= 32n;
  }
  const coff = [];
  while (det > 0n) {
    const shifted = det & (lambda - 1n);
    coff.push(shifted - offset);
    det >>= 32n;
  }
  return coff;
}


const result = document.querySelector('p');

function stringPoly(C, x) {
  let outstr = '';
  for (let i = C.length - 1; i >= 0; --i) {
    if (C[i]) {
      let sign = C[i] > 0n ? '+' : '';
      if (i === C.length - 1 && sign === '+') sign = '';
      let coff = `${sign}`;

      if (C[i] !== 1n && C[i] !== -1n) coff += `${C[i]}`;

      if (i > 1) outstr += `${coff}${x}^{${i}}`;
      else if (i === 1) outstr += `${coff}${x}`;
      else outstr += `${sign}${C[i]}`;
    }
  }
  return outstr;
}


function setResult(result) {
  
  function typeset(code) {
    MathJax.startup.promise = MathJax.startup.promise
      .then(() => MathJax.typesetPromise(code))
      .catch((err) => console.log('Typeset failed: ' + err.message));
    return MathJax.startup.promise;
  }
  const resultDoc = document.querySelector('p');
  resultDoc.innerText = result;
  typeset([resultDoc]);
}

function isomorphic(graph1, graph2) {

    const n1 = graph1.nodes.length;
    const n2 = graph2.nodes.length;
    if (n1 !== n2) {

        setResult('\\(\\text{Not isomorphic because the numbers of vertices are different}\\)');
        return false;
    }

    const n = n1;

    const A1 = Array.from(Array(n * n), (_, idx) => graph1.adj[maxV * Math.floor(idx / n) + idx % n]);
    
    
    const A2 = Array.from(Array(n * n), (_, idx) => graph2.adj[maxV * Math.floor(idx / n) + idx % n]);
    
    

    let found = false;

    for (let map of permute(n)) {
        let ok = true;
        for (let i = 0; i < n && ok; ++i) {
            for (let j = 0; j < n && ok; ++j) {
                if (A1[i * n + j] != A2[map[i] * n + map[j]]) {
                    ok = false;
                }
            }
        }
    
        if (ok) { 
            found = true;
            let outResult = `\\(\\text{The graphs are isomorphic, one valid mapping is}\\) 
            \\[
              f\\left(\\begin{bmatrix} `;
            for (let i = 0; i < n; ++i) {
              outResult += `u_${i + 1} \\\\ `;
            }

            outResult += `\\end{bmatrix}\\right) = \\begin{bmatrix} `;


            for (let i = 0; i < n; ++i) {
                outResult += `v_${map[i] + 1} \\\\ `;
            }

            outResult += `\\end{bmatrix}\\]`;

            setResult(outResult);

            break;
        }
    }

    

    if (!found) {
      const char1 = characteristic(A1, n);
      const char2 = characteristic(A2, n);
      console.log(char1);
      console.log(char2);

      setResult(`\\(
        \\text{Not isomorphic because the charateristic equations are different}
        \\)
        \\[
        \\begin{cases}
        G_1: ${stringPoly(char1, '\\lambda')} \\\\
        G_2: ${stringPoly(char2, '\\lambda')}
        \\end{cases}
      \\]`);
    }

    return found;
}


