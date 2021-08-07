// ugly code incoming... :D
Module['onRuntimeInitialized'] = () => {
  const radius = 20;
  const maxV = 32;


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
            node.r = radius;
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


  function stringPoly(C, x) {
    let outstr = '';
    for (let i = C.length - 1; i >= 0; --i) {
      if (C[i]) {
        let sign = C[i] > 0 ? '+' : '';
        if (i === C.length - 1 && sign === '+') sign = '';
        let coff = `${sign}`;

        if (C[i] !== 1 && C[i] !== -1) coff += `${C[i]}`;
        if (C[i] === -1) coff = '-';

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

      const arg = `${n} ${A1.join(' ')} ${A2.join(' ')}`;

      const result_from_cpp = Module.ccall('checkIsomorphism', 'string', ['string'], [arg]);
      if (result_from_cpp)
      {
        let map = JSON.parse(result_from_cpp);
        let outResult = `\\(\\text{The graphs are isomorphic, one valid mapping is}\\) 
        \\[
          f\\left(\\begin{bmatrix} `;
        for (let i = 0; i < n; ++i) {
          outResult += `u_{${i + 1}} \\\\ `;
        }
        outResult += `\\end{bmatrix}\\right) = \\begin{bmatrix} `;
        for (let i = 0; i < n; ++i) {
            outResult += `v_{${map[i] + 1}} \\\\ `;
        }
        outResult += `\\end{bmatrix}\\]`;
        setResult(outResult);
      }
      else {
        const char1 = JSON.parse(Module.ccall('characteristic', 'string', ['string'], [`${n} ${A1.join(' ')}`]));
        const char2 = JSON.parse(Module.ccall('characteristic', 'string', ['string'], [`${n} ${A2.join(' ')}`]));


        setResult(`\\(
          \\text{Not isomorphic because the characteristic polynomials are different}
          \\)
          \\[
          \\begin{cases}
          G_1: ${stringPoly(char1, '\\lambda')} \\\\
          G_2: ${stringPoly(char2, '\\lambda')}
          \\end{cases}
        \\]`);
      }
      
  }

  document.getElementById('checkBtn').onclick = () => isomorphic(graph1, graph2);


}