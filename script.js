function generateTable() {
  let treatments = document.getElementById("treatmentCount").value;
  document.getElementById("treatmentNumber").innerText = treatments;
  let tableHTML = `<table><tr><th></th><th>R<sub>1</sub></th><th>R<sub>2</sub></th><th>R<sub>3</sub></th><th>Total</th></tr>`;
  for (let i = 1; i <= treatments; i++) {
    tableHTML += `<tr><td>V<sub>${i}</sub></td>`;
    for (let j = 1; j <= 3; j++) {
      tableHTML += `<td><input type='number' id='V${i}R${j}' oninput='calculateTotals()'></td>`;
    }
    tableHTML += `<td id='V${i}Total'>0</td></tr>`;
  }
  tableHTML += `<tr><td>Total</td><td id='R1Total'>0</td><td id='R2Total'>0</td><td id='R3Total'>0</td><td id='grandTotal'>0</td></tr>`;
  tableHTML += `</table>`;
  document.getElementById("tableContainer").innerHTML = tableHTML;
}

function calculateTotals() {
  let treatments = document.getElementById("treatmentCount").value;
  let replications = 3;
  let grandTotal = 0;
  let colTotals = [0, 0, 0];
  let sumOfSquares = 0;
  let sumOfSquaresFormula = "";
  let treatmentSums = [];
  let treatmentSquaresFormula = "";
  let replicationSquaresFormula = "";

  for (let i = 1; i <= treatments; i++) {
    let rowTotal = 0;
    for (let j = 1; j <= 3; j++) {
      let val =
        parseFloat(document.getElementById(`V${i}R${j}`).value) || 0;
      rowTotal += val;
      colTotals[j - 1] += val;
      sumOfSquares += val * val;
      sumOfSquaresFormula +=
        (sumOfSquaresFormula ? " + " : "") + `${val}²`;
    }
    treatmentSums.push(rowTotal);
    treatmentSquaresFormula +=
      (treatmentSquaresFormula ? " + " : "") + `${rowTotal}²`;
    document.getElementById(`V${i}Total`).innerText = rowTotal;
    grandTotal += rowTotal;
  }

  document.getElementById("R1Total").innerText = colTotals[0];
  document.getElementById("R2Total").innerText = colTotals[1];
  document.getElementById("R3Total").innerText = colTotals[2];
  document.getElementById("grandTotal").innerText = grandTotal;
  document.getElementById("finalGrandTotal").innerText = grandTotal;

  let N = treatments * replications;
  let correctionFactor = grandTotal ** 2 / N;
  document.getElementById("correctionFactor").innerText =
    correctionFactor.toFixed(2);
  document.getElementById(
    "correctionFactorFormula"
  ).innerText = `${grandTotal}² / ${N}`;
  document.getElementById("correctionFactorValue").innerText =
    correctionFactor.toFixed(2);

  let totalSumOfSquares = sumOfSquares - correctionFactor;
  document.getElementById("sumOfSquaresFormula").innerText =
    sumOfSquaresFormula;
  document.getElementById("totalSumOfSquares").innerText =
    totalSumOfSquares.toFixed(2);

  let treatmentSumOfSquares = treatmentSums.reduce(
    (sum, value) => sum + value ** 2,
    0
  );
  let finalTreatmentSum =
    treatmentSumOfSquares / replications - correctionFactor;
  document.getElementById("treatmentSumOfSquares").innerText =
    finalTreatmentSum.toFixed(2);
  document.getElementById(
    "treatmentSquaresFormula"
  ).innerText = `(${treatmentSquaresFormula}) / ${replications} - ${correctionFactor.toFixed(
    2
  )}`;

  let replicationSumOfSquares = colTotals.reduce(
    (sum, value) => sum + value ** 2,
    0
  );
  let finalReplicationSum =
    replicationSumOfSquares / treatments - correctionFactor;
  document.getElementById("replicationSumOfSquares").innerText =
    finalReplicationSum.toFixed(2);
  document.getElementById("replicationSquaresFormula").innerText = `(${
    colTotals[0]
  }² + ${colTotals[1]}² + ${
    colTotals[2]
  }²) / ${treatments} - ${correctionFactor.toFixed(2)}`;

  let errorSumOfSquares =
    totalSumOfSquares - (finalTreatmentSum + finalReplicationSum);
  document.getElementById("errorSumOfSquares").innerText =
    errorSumOfSquares.toFixed(2);

  // **Update Calculation Display for ESS**
  document.getElementById(
    "errorSumCalculation"
  ).innerHTML = `(${totalSumOfSquares.toFixed(
    2
  )}) - (${finalTreatmentSum.toFixed(2)} + ${finalReplicationSum.toFixed(
    2
  )}) = ${errorSumOfSquares.toFixed(2)}`;
}