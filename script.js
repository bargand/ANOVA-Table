function generateTable() {
  let treatments = document.getElementById("treatmentCount").value;
  let replications = document.getElementById("replicationCount").value;
  document.getElementById("treatmentNumber").innerText = treatments;
  document.getElementById("replicationNumber").innerText = replications;

  let tableHTML = `<table><tr><th></th>`;

  for (let j = 1; j <= replications; j++) {
    tableHTML += `<th>R<sub>${j}</sub></th>`;
  }
  tableHTML += `<th>Total</th></tr>`;

  for (let i = 1; i <= treatments; i++) {
    tableHTML += `<tr><td>V<sub>${i}</sub></td>`;
    for (let j = 1; j <= replications; j++) {
      tableHTML += `<td><input type='number' id='V${i}R${j}'></td>`;
    }
    tableHTML += `<td id='V${i}Total'>0</td></tr>`;
  }

  tableHTML += `<tr><td>Total</td>`;
  for (let j = 1; j <= replications; j++) {
    tableHTML += `<td id='R${j}Total'>0</td>`;
  }
  tableHTML += `<td id='grandTotal'>0</td></tr>`;
  tableHTML += `</table>`;

  document.getElementById("tableContainer").innerHTML = tableHTML;
}

function calculateTotals() {
  let treatments = parseInt(
    document.getElementById("treatmentCount").value
  );
  let replications = parseInt(
    document.getElementById("replicationCount").value
  );
  let grandTotal = 0;
  let colTotals = new Array(replications).fill(0);
  let sumOfSquares = 0;
  let sumOfSquaresFormula = "";
  let treatmentSums = [];
  let treatmentSquaresFormula = "";

  for (let i = 1; i <= treatments; i++) {
    let rowTotal = 0;
    for (let j = 1; j <= replications; j++) {
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

  for (let j = 1; j <= replications; j++) {
    document.getElementById(`R${j}Total`).innerText = colTotals[j - 1];
  }
  document.getElementById("grandTotal").innerText = grandTotal;
  document.getElementById("finalGrandTotal").innerText = grandTotal;

  // N
  let N = treatments * replications;

  // Correction Factor
  let correctionFactor = grandTotal ** 2 / N;
  document.getElementById("correctionFactor").innerText =
    correctionFactor.toFixed(2);
  document.getElementById(
    "correctionFactorFormula"
  ).innerText = `${grandTotal}² / ${N}`;
  document.getElementById("correctionFactorValue").innerText =
    correctionFactor.toFixed(2);

  // Total Sum of Squares
  let totalSumOfSquares = sumOfSquares - correctionFactor;
  document.getElementById("sumOfSquaresFormula").innerText =
    sumOfSquaresFormula;
  document.getElementById("totalSumOfSquares").innerText =
    totalSumOfSquares.toFixed(2);

  // Treatment Sum of Squares
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

  // Replication Sum of Squares
  let replicationSumOfSquares = colTotals.reduce(
    (sum, value) => sum + value ** 2,
    0
  );
  let finalReplicationSum =
    replicationSumOfSquares / treatments - correctionFactor;
  document.getElementById("replicationSumOfSquares").innerText =
    finalReplicationSum.toFixed(2);

  let replicationFormula = colTotals
    .map((value) => `${value}²`)
    .join(" + ");
  document.getElementById(
    "replicationSquaresFormula"
  ).innerText = `(${replicationFormula}) / ${treatments} - ${correctionFactor.toFixed(
    2
  )}`;

  // Error Sum of Squares
  let errorSumOfSquares =
    totalSumOfSquares - (finalTreatmentSum + finalReplicationSum);
  document.getElementById("errorSumOfSquares").innerText =
    errorSumOfSquares.toFixed(2);
  document.getElementById(
    "errorSumCalculation"
  ).innerHTML = `(${totalSumOfSquares.toFixed(
    2
  )}) - (${finalTreatmentSum.toFixed(2)} + ${finalReplicationSum.toFixed(
    2
  )}) = ${errorSumOfSquares.toFixed(2)}`;

  let dfTreatment = treatments - 1;
  let dfReplication = replications - 1;
  let dfError = dfTreatment * dfReplication;

  let meanTreatmentSS = finalTreatmentSum / dfTreatment;
  let meanReplicationSS = finalReplicationSum / dfReplication;
  let meanErrorSS = errorSumOfSquares / dfError;

  let fcalTreatment = meanTreatmentSS / meanErrorSS;
  let fcalReplication = meanReplicationSS / meanErrorSS;

  let anovaTableHTML = `
    <table>
      <tr>
        <th>Source of Variation</th>
        <th>Degree of Freedom (d.f)</th>
        <th>Sum of Square (SS)</th>
        <th>Mean Sum of Square (MSS)</th>
        <th>F<sub>cal</sub></th>
        <th>F<sub>MSS</sub></th>
      </tr>
      <tr>
        <td><b>Treatment (T)</b></td>
        <td>(Total number of treatments - 1)<br><br><b>${dfTreatment}</b></td>
        <td>TrSS=<br><br><b>${finalTreatmentSum.toFixed(2)}</b></td>
        <td><b>(A)→</b>TrSS<hr class="Display_Divided">(Total number of treatments - 1)<br><br><b>${meanTreatmentSS.toFixed(
          2
        )}</b></td>
        <td>A<hr class="Display_Divided">C<br><br><b>${fcalTreatment.toFixed(2)}</b></td>
        <td>(σe + Rσ²g)<br><br><b>${meanTreatmentSS.toFixed(2)}</b></td>
      </tr>
      <tr>
        <td><b>Replication (R)</b></td>
        <td>(Total number of replication - 1)<br><br><b>${dfReplication}</b></td>
        <td>RSS=<br><br><b>${finalReplicationSum.toFixed(2)}</b></td>
        <td><RSS><b>(B)→</b>RSS<hr class="Display_Divided">(Total number of replication - 1)<br><br><b>${meanReplicationSS.toFixed(
          2
        )}</b></td>
        <td>B<hr class="Display_Divided">C<br><br><b>${fcalReplication.toFixed(2)}</b></td>
        <td>-</td>
      </tr>
      <tr>
        <td><b>Error (E)</b></td>
        <td><b>(Z)→</b> (Total number of treatments - 1) ×<br> (Total number of replication - 1)<br><br>${dfError}</td>
        <td>ESS=<br><br><b>${errorSumOfSquares.toFixed(2)}</b></td>
        <td><b>(C)→</b> RSS<hr class="Display_Divided">Z<br><br><b>${meanErrorSS.toFixed(2)}</b></td>
        <td>-</td>
        <td>σ2e=<br><br><b>${meanErrorSS.toFixed(2)}</b></td>
      </tr>
    </table>
  `;

  document.getElementById("anovaResults").innerHTML = anovaTableHTML;
}