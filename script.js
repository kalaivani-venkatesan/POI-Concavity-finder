function analyzeFunction() {
  const input = document.getElementById("functionInput").value;
  const output = document.getElementById("output");
  output.innerHTML = "";
  document.getElementById("graph").innerHTML = "";

  try {
    const expr = math.parse(input);
    const f = math.compile(input);

    const fPrime = math.derivative(expr, 'x');
    const fDoublePrime = math.derivative(fPrime, 'x');
    const fDoublePrimeEval = fDoublePrime.compile();

    output.innerHTML += `<strong>Second Derivative:</strong> ${fDoublePrime.toString()}<br><br>`;

    const xValues = math.range(-10, 10, 0.1).toArray();
    const yValues = xValues.map(x => f.evaluate({ x }));
    const ySecondDeriv = xValues.map(x => fDoublePrimeEval.evaluate({ x }));

    const inflectionPoints = [];
    for (let i = 1; i < xValues.length; i++) {
      const y1 = ySecondDeriv[i - 1];
      const y2 = ySecondDeriv[i];
      if (y1 * y2 < 0) {
        const xMid = (xValues[i - 1] + xValues[i]) / 2;
        inflectionPoints.push({
          x: xMid,
          y: f.evaluate({ x: xMid })
        });
      }
    }

    if (inflectionPoints.length === 0) {
      output.innerHTML += "No inflection points found.";
    } else {
      output.innerHTML += `<strong>Estimated Inflection Points:</strong><br>`;
      inflectionPoints.forEach(p => {
        const val = fDoublePrimeEval.evaluate({ x: p.x });
        const concavity = val > 0 ? "Concave Up" : "Concave Down";
        output.innerHTML += `x ≈ ${p.x.toFixed(2)} → f''(x) ≈ ${val.toFixed(3)} → ${concavity}<br>`;
      });
    }

    // Plot using Plotly
    const trace1 = {
      x: xValues,
      y: yValues,
      mode: 'lines',
      name: 'f(x)',
      line: { color: 'blue' }
    };

    const trace2 = {
      x: xValues,
      y: ySecondDeriv,
      mode: 'lines',
      name: "f''(x)",
      line: { color: 'orange', dash: 'dot' }
    };

    const trace3 = {
      x: inflectionPoints.map(p => p.x),
      y: inflectionPoints.map(p => p.y),
      mode: 'markers',
      name: 'Inflection Points',
      marker: { color: 'red', size: 8, symbol: 'circle' }
    };

    Plotly.newPlot('graph', [trace1, trace2, trace3], {
      title: 'Function and Second Derivative',
      xaxis: { title: 'x' },
      yaxis: { title: 'y' }
    });

  } catch (err) {
    output.innerHTML = "⚠️ Error parsing function. Please enter a valid expression like <code>x^3 - 3x + 2</code>.";
  }
  xValues.forEach(x => {
  try {
    yValues.push(f.evaluate({ x }));
    ySecondDeriv.push(fDoublePrimeEval.evaluate({ x }));
  } catch {
    yValues.push(null); // Skip invalid points
    ySecondDeriv.push(null);
  }
});

}