function calculateSummaryStats() {
  const locationCount = document.getElementById("locationCount").value;
  let maxTreatments = 0;
  let grandTotal = 0;
  let treatmentTotals = [];
  let sumOfSquares = 0;

  // Prevents recalculating ANOVA tables and clears previous summary results
  if (
    document.getElementById("summaryStatsContainer").innerHTML.trim() !== ""
  ) {
    console.log(
      "Summary statistics already calculated. Skipping recalculation."
    );
    return;
  }

  // Fetch global pooled error and sums without re-rendering ANOVA tables
  let { totalErrorsSumPooled, totalESSumPooled, totalMSSumPooled } =
    calculateTotals();

  // Find max treatments across locations
  for (let t = 1; t <= locationCount; t++) {
    let treatCount = parseInt(
      document.getElementById(`treatmentCount${t}`).value
    );
    maxTreatments = Math.max(maxTreatments, treatCount);
  }

  console.log(`💡 Using Global Values in Summary Table`);
  console.log(`✅ Pooled Errors Sum: ${totalErrorsSumPooled}`);
  console.log(`✅ Pooled ESS: ${totalESSumPooled.toFixed(2)}`);
  console.log(`✅ Pooled MSS: ${totalMSSumPooled.toFixed(3)}`);

  // Compute Treatment Totals and Sum of Squares
  for (let t = 1; t <= maxTreatments; t++) {
    let rowTotal = 0;
    for (let i = 1; i <= locationCount; i++) {
      let treatCount = parseInt(
        document.getElementById(`treatmentCount${i}`).value
      );
      let meanValue =
        t <= treatCount
          ? parseFloat(
              document.getElementById(`loc${i}treat${t}mean`).innerText
            ) || 0
          : 0;
      rowTotal += meanValue;
      sumOfSquares += meanValue ** 2;
    }
    treatmentTotals.push(rowTotal);
    grandTotal += rowTotal;
  }

  let N = maxTreatments * locationCount;
  let correctionFactor = grandTotal ** 2 / N;
  let totalSumOfSquares = sumOfSquares - correctionFactor;
  let treatmentSquaresSum = treatmentTotals.reduce(
    (sum, value) => sum + value ** 2,
    0
  );
  let treatmentSumOfSquares =
    treatmentSquaresSum / locationCount - correctionFactor;

  // Replication Sum of Squares (RSS)
  let replicationTotals = new Array(locationCount).fill(0);
  for (let i = 1; i <= locationCount; i++) {
    let colTotal = 0;
    for (let t = 1; t <= maxTreatments; t++) {
      let treatCount = parseInt(
        document.getElementById(`treatmentCount${i}`).value
      );
      let meanValue =
        t <= treatCount
          ? parseFloat(
              document.getElementById(`loc${i}treat${t}mean`).innerText
            ) || 0
          : 0;
      colTotal += meanValue;
    }
    replicationTotals[i - 1] = colTotal;
  }
  let replicationSquaresSum = replicationTotals.reduce(
    (sum, value) => sum + value ** 2,
    0
  );
  let replicationSumOfSquares =
    replicationSquaresSum / maxTreatments - correctionFactor;

  let errorSumOfSquares =
    totalSumOfSquares - (treatmentSumOfSquares + replicationSumOfSquares);

  // Display Results
  let summaryStatsHTML = `
  <h3>Summary Table Calculations</h3>
  <div class="formula-box">
      <p><strong>Correction Factor (CF):</strong> (${grandTotal}² / ${N}) = <b>${correctionFactor.toFixed(
    2
  )}</b></p>
      <p><strong>Total Sum of Squares (TSS):</strong> (${sumOfSquares} - ${correctionFactor}) = <b>${totalSumOfSquares.toFixed(
    2
  )}</b></p>
      <p><strong>Treatment Sum of Squares (TrSS):</strong> (${treatmentSquaresSum} / ${locationCount} - ${correctionFactor}) = <b>${treatmentSumOfSquares.toFixed(
    2
  )}</b></p>
      <p><strong>Replication Sum of Squares (RSS):</strong> (${replicationSquaresSum} / ${maxTreatments} - ${correctionFactor}) = <b>${replicationSumOfSquares.toFixed(
    2
  )}</b></p>
      <p><strong>Error Sum of Squares (ESS):</strong> (${totalSumOfSquares} - (${treatmentSumOfSquares} + ${replicationSumOfSquares})) = <b>${errorSumOfSquares.toFixed(
    2
  )}</b></p>
  </div>`;

  document.getElementById("summaryStatsContainer").innerHTML = summaryStatsHTML;
  document.getElementById("calculateSummaryBtn").disabled = true; // Disable button after calculation

  let Z = (maxTreatments - 1) * (locationCount - 1);
  let A = treatmentSumOfSquares / (maxTreatments - 1);
  let B = replicationSumOfSquares / (locationCount - 1);
  let C = errorSumOfSquares / Z;

  let I = (A / C).toFixed(2);
  let J = (B / C).toFixed(2);

  let SummaryAnovaTableHTML = `
    <table>
      <tr>
        <th>Source of Variation</th>
        <th>Degree of Freedom (d.f)</th>
        <th>Sum of Square (SS)</th>
        <th>Mean Sum of Square (MSS)</th>
        <th>F<sub>cal</sub></th>
        <th>E<sub>MSS</sub></th>
      </tr>
      <tr>
        <td><b>Treatment (T)</b></td>
        <td>${maxTreatments - 1}</td>
        <td>${treatmentSumOfSquares.toFixed(2)}</td>
        <td>${A.toFixed(2)}</td>
        <td>${I}</td>
        <td>${A.toFixed(2)}</td>
      </tr>
      <tr>
        <td><b>Replication (R)</b></td>
        <td>${locationCount - 1}</td>
        <td>${replicationSumOfSquares.toFixed(2)}</td>
        <td>${B.toFixed(2)}</td>
        <td>${J}</td>
        <td>-</td>
      </tr>
      <tr>
        <td><b>Error (E)</b></td>
        <td>${Z}</td>
        <td>${errorSumOfSquares.toFixed(2)}</td>
        <td>${C.toFixed(2)}</td>
        <td>-</td>
        <td>${C.toFixed(2)}</td>
      </tr>
      <tr>
          <td><b>Pooled Error</b></td>
          <td>${totalErrorsSumPooled}</td>
          <td>${totalESSumPooled.toFixed(2)}</td>
          <td>${totalMSSumPooled.toFixed(2)}</td>
          <td>-</td>
          <td>${totalMSSumPooled.toFixed(2)}</td>
      </tr>
    </table>`;

  document.getElementById("SummaryAnovaResults").innerHTML =
    SummaryAnovaTableHTML;
}
