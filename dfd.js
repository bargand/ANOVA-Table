let globalTotalErrorsSumPooled = 0;
let globalTotalESSumPooled = 0;
let globalTotalMSSumPooled = 0;

function resetButtons() {
  document.getElementById("nextBtn").disabled = false;
  document.getElementById("generateTablesBtn").disabled = false;
  document.getElementById("calculateBtn").disabled = false;
  document.getElementById("summaryBtn").disabled = false;
}

function updateProgress(currentStep) {
  const steps = document.querySelectorAll(".step");
  const progressBar = document.getElementById("progressBar");

  steps.forEach((step, index) => {
    if (index < currentStep) {
      step.classList.add("completed");
      step.classList.remove("active");
    } else if (index === currentStep) {
      step.classList.add("active");
      step.classList.remove("completed");
    } else {
      step.classList.remove("active", "completed");
    }
  });

  progressBar.style.width = `${(currentStep + 1) * 25}%`;
}

function generateInputFields() {
  const locationCount = document.getElementById("locationCount").value;
  if (!locationCount || locationCount < 1) {
    alert("Please enter a valid number of locations (at least 1)");
    return;
  }

  const inputFieldsDiv = document.getElementById("inputFields");
  inputFieldsDiv.innerHTML = "";

  // Create a new card for location inputs
  const locationCard = document.createElement("div");
  locationCard.className = "card";
  locationCard.innerHTML = `
      <div class="card-title">
        <i class="fas fa-map-marked-alt"></i>
        <h3>Location Configuration</h3>
      </div>
      <p>Enter the number of replications and treatments for each location:</p>
      <div id="locationInputs"></div>
    `;

  inputFieldsDiv.appendChild(locationCard);
  const locationInputsDiv = document.getElementById("locationInputs");

  for (let i = 1; i <= locationCount; i++) {
    locationInputsDiv.innerHTML += `
        <div class="form-group">
          <h4><i class="fas fa-location-arrow"></i> Location ${i}</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <label for="replicationCount${i}"><i class="fas fa-clone"></i> Replication Count:</label>
              <input type="number" id="replicationCount${i}" min="1" placeholder="e.g. 3" size="5">
            </div>
            <div>
              <label for="treatmentCount${i}"><i class="fas fa-flask"></i> Treatment Count:</label>
              <input type="number" id="treatmentCount${i}" min="1" placeholder="e.g. 5" size="5">
            </div>
          </div>
        </div>
      `;
  }

  document.getElementById("nextBtn").disabled = true;
  document.getElementById("generateTablesCard").style.display = "block";
  updateProgress(1);
}

function generateTables() {
  const locationCount = document.getElementById("locationCount").value;
  if (!locationCount || locationCount < 1) return;

  const tablesContainer = document.getElementById("tablesContainer");
  tablesContainer.innerHTML = "";

  // Validate all inputs first
  for (let i = 1; i <= locationCount; i++) {
    const repCount = document.getElementById(`replicationCount${i}`).value;
    const treatCount = document.getElementById(`treatmentCount${i}`).value;

    if (!repCount || repCount < 1 || !treatCount || treatCount < 1) {
      alert(`Please enter valid numbers for Location ${i}`);
      return;
    }
  }

  for (let i = 1; i <= locationCount; i++) {
    const repCount = document.getElementById(`replicationCount${i}`).value;
    const treatCount = document.getElementById(`treatmentCount${i}`).value;

    let tableHTML = `<div class="location-section card">
                <div class="card-title">
                  <i class="fas fa-table"></i>
                  <h3>Location ${i} Data Entry</h3>
                </div>
                <div class="table-responsive">
                    <table class="data-entry-table">
                        <tr>
                            <th>Treatment</th>`;
    for (let j = 1; j <= repCount; j++) {
      tableHTML += `<th>R${j}</th>`;
    }
    tableHTML += `<th>Total</th><th>Mean</th></tr>`;

    for (let k = 1; k <= treatCount; k++) {
      tableHTML += `<tr>
                        <td>Treatment ${k}</td>`;
      for (let j = 1; j <= repCount; j++) {
        tableHTML += `<td><input type="number" id="loc${i}treat${k}rep${j}" placeholder="0" size="5"></td>`;
      }
      tableHTML += `<td id="loc${i}treat${k}total">0</td>
                      <td id="loc${i}treat${k}mean">0</td>
                    </tr>`;
    }
    tableHTML += `</table>
                </div>
                <div class="summary" style="margin-top: 15px;">
                    <p><strong><i class="fas fa-info-circle"></i> Replication Count:</strong> ${repCount}</p>
                    <p><strong><i class="fas fa-info-circle"></i> Treatment Count:</strong> ${treatCount}</p>
                    <p><strong><i class="fas fa-calculator"></i> Grand Total:</strong> <span id="grandTotal${i}">0</span></p>
                </div>
            </div>`;

    tablesContainer.innerHTML += tableHTML;
  }

  document.getElementById("generateTablesBtn").disabled = true;
  document.getElementById("calculateCard").style.display = "block";
  updateProgress(2);
}
function calculateTotals() {
  const locationCount = document.getElementById("locationCount").value;

  let totalErrorsSumPooled = 0;
  let totalESSumPooled = 0; // Store sum of Error Sum of Squares (ESS) across all locations
  let totalMSSumPooled = 0; // Store sum of Mean Sum of Squares (MSS) across all locations

  for (let i = 1; i <= locationCount; i++) {
    const repCount = parseInt(
      document.getElementById(`replicationCount${i}`).value
    );
    const treatCount = parseInt(
      document.getElementById(`treatmentCount${i}`).value
    );
    let grandTotal = 0;

    let columnTotals = new Array(repCount).fill(0); // Stores totals for each replication
    let treatmentSums = []; // Stores treatment totals for TrSS
    let sumOfSquares = 0; // Stores sum of squares of all values
    let sumOfSquaresFormula = []; // Stores squared values for formula display

    for (let k = 1; k <= treatCount; k++) {
      let total = 0;
      for (let j = 1; j <= repCount; j++) {
        let cellValue =
          Number(document.getElementById(`loc${i}treat${k}rep${j}`).value) || 0;
        total += cellValue;
        columnTotals[j - 1] += cellValue;
        sumOfSquares += cellValue ** 2;
        sumOfSquaresFormula.push(`${cellValue}²`); // Store squared values
      }
      let mean = total / repCount;
      document.getElementById(`loc${i}treat${k}total`).innerText = total;
      document.getElementById(`loc${i}treat${k}mean`).innerText =
        mean.toFixed(2);
      grandTotal += total;
      treatmentSums.push(total);
    }

    let N = treatCount * repCount; // Total number of observations
    let correctionFactor = grandTotal ** 2 / N; // C.F.

    // Total Sum of Squares (TSS)
    let totalSumOfSquares = sumOfSquares - correctionFactor;

    // Treatment Sum of Squares (TrSS)
    let treatmentSumOfSquares = treatmentSums.reduce(
      (sum, value) => sum + value ** 2,
      0
    );
    let treatmentSquaresFormula = treatmentSums
      .map((value) => `${value}²`)
      .join(" + "); // Show formula breakdown
    let finalTreatmentSum = treatmentSumOfSquares / repCount - correctionFactor;

    // Replication Sum of Squares (RSS)
    let replicationSumOfSquares = columnTotals.reduce(
      (sum, value) => sum + value ** 2,
      0
    );
    let replicationFormula = columnTotals
      .map((value) => `${value}²`)
      .join(" + ");
    let finalReplicationSum =
      replicationSumOfSquares / treatCount - correctionFactor;

    // Error Sum of Squares (ESS)
    let errorSumOfSquares =
      totalSumOfSquares - (finalTreatmentSum + finalReplicationSum);

    // Degrees of Freedom (df)
    let dfTreatment = treatCount - 1;
    let dfReplication = repCount - 1;
    let dfError = dfTreatment * dfReplication; // Error for this location
    totalErrorsSumPooled += dfError; // Accumulate errors
    totalESSumPooled += errorSumOfSquares; // Accumulate ESS

    // Mean Sum of Squares (MSS)
    let meanTreatmentSS = finalTreatmentSum / dfTreatment;
    let meanReplicationSS = finalReplicationSum / dfReplication;
    let meanErrorSS = errorSumOfSquares / dfError;

    totalMSSumPooled += meanErrorSS; // Accumulate MSS

    // F-Calculated (Fcal)
    let fcalTreatment = meanTreatmentSS / meanErrorSS;
    let fcalReplication = meanReplicationSS / meanErrorSS;

    let MeanOfGrandMean = (grandTotal / N).toFixed(2);

    //Error co-efficient of variance
    let EnvRut = Math.sqrt(meanErrorSS);
    let EnvironCoffVariance = (EnvRut / MeanOfGrandMean).toFixed(2);

    //Genotypic co-efficient of varience
    let genotype = ((meanTreatmentSS - meanErrorSS) / repCount).toFixed(2);
    let GeanRut = Math.sqrt(genotype);
    let GeanCoffVariance = (GeanRut / MeanOfGrandMean).toFixed(2);

    //Phenotypic Co-efficient of Variance
    let phenotype = (parseFloat(genotype) + meanErrorSS).toFixed(2);
    let PhinoRut = Math.sqrt(phenotype);
    let PhenoCoffVariance = (PhinoRut / MeanOfGrandMean).toFixed(2);

    // Generate ANOVA Table
    let anovaTableHTML = `
        <h3>ANOVA Table for Location ${i}</h3>
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
          <td>(Total number of treatments - 1)<br><br><b>${dfTreatment}</b></td>
          <td>TrSS=<br><br><b>${finalTreatmentSum.toFixed(2)}</b></td>
          <td><b>(A)→</b>TrSS<hr class="Display_Divided">(Total number of treatments - 1)<br><br><b>${meanTreatmentSS.toFixed(
            2
          )}</b></td>
          <td>A<hr class="Display_Divided">C<br><br><b>${fcalTreatment.toFixed(
            2
          )}</b></td>
          <td>(σ²e + Rσ²g)<br><br><b>${meanTreatmentSS.toFixed(2)}</b></td>
        </tr>
        <tr>
          <td><b>Replication (R)</b></td>
          <td>(Total number of replication - 1)<br><br><b>${dfReplication}</b></td>
          <td>RSS=<br><br><b>${finalReplicationSum.toFixed(2)}</b></td>
          <td><RSS><b>(B)→</b>RSS<hr class="Display_Divided">(Total number of replication - 1)<br><br><b>${meanReplicationSS.toFixed(
            2
          )}</b></td>
          <td>B<hr class="Display_Divided">C<br><br><b>${fcalReplication.toFixed(
            2
          )}</b></td>
          <td>-</td>
        </tr>
        <tr>
          <td><b>Error (E)</b></td>
          <td><b>(Z)→</b> (Total number of treatments - 1) ×<br> (Total number of replication - 1)<br><br>${dfError}</td>
          <td>ESS=<br><br><b>${errorSumOfSquares.toFixed(2)}</b></td>
          <td><b>(C)→</b> RSS<hr class="Display_Divided">Z<br><br><b>${meanErrorSS.toFixed(
            2
          )}</b></td>
          <td>-</td>
          <td>σ²e=<br><br><b>${meanErrorSS.toFixed(2)}</b></td>
        </tr>
      </table>
      <br>
      

            <div class="formula-box">
        <p>
          <strong
            >E<sub>MSS</sub> for Treatment: σ²e + Rσ²g =${meanTreatmentSS.toFixed(
              2
            )}</strong
          >
        </p>
        <p>
          <strong
            >F<sub>MSS</sub> for Error: σ²e =${meanErrorSS.toFixed(2)}</strong
          >
        </p>
        <p>
          <strong
            >F<sub>MSS</sub> for Genotype: σ²g = [{(σ²e + Rσ²g) - σ²e}/r] =${(
              (meanTreatmentSS - meanErrorSS) /
              repCount
            ).toFixed(2)}</strong
          >
        </p>
        <p>
          <strong
            >F<sub>MSS</sub> for Phenotype: σ²p = (σ²g + σ²e) =${(
              parseFloat(
                ((meanTreatmentSS - meanErrorSS) / repCount).toFixed(2)
              ) + meanErrorSS
            ).toFixed(2)}</strong
          >
        </p>
      </div>



          <div class="formula-box">
            <p>
              <strong
                >Mean Deviation Of Grand Total (GM): (GT / N) = ${MeanOfGrandMean}</strong
              >
            </p>
            <p>
              <strong
                >Error Co-efficient of variance: (√σe) / GM = ${EnvironCoffVariance}</strong
              >
            </p>
            <p>
              <strong
                >Genotypic Co-efficient of variance: (√σg) / GM = ${GeanCoffVariance}</strong
              >
            </p>
            <p>
              <strong
                >Phenotypic Co-efficient of variance: (√σp) / GM =${PhenoCoffVariance}</strong
              >
            </p>
          </div>
      `;

    // Find the location section to insert results
    let locationSection = document.querySelector(
      `.location-section:nth-child(${i})`
    );
    let existingFormulaBoxes = locationSection.querySelectorAll(".formula-box");
    existingFormulaBoxes.forEach((box) => box.remove()); // Remove previous results to prevent duplicates

    // Insert all formulas (CF, TSS, TrSS, RSS, ESS)
    let formulaBoxHTML = `
        <div class="formula-box">
            <h3>Correction Factor (C.F) Formula</h3>
            <p><strong>C.F = (GT²) / (N)</strong></p>
            <p><strong>Calculation:</strong> (${grandTotal}² / ${N}) = 
            <span id="correctionFactor${i}">${correctionFactor.toFixed(
      2
    )}</span></p>
        </div>

        <div class="formula-box">
            <h3>Total Sum of Squares (TSS) Formula</h3>
            <p><strong>TSS = (Sum of Squares of all values) - C.F</strong></p>
            <p><strong>Calculation:</strong> (${sumOfSquaresFormula.join(
              " + "
            )}) - (${correctionFactor.toFixed(2)}) = 
            <span id="totalSumOfSquares${i}">${totalSumOfSquares.toFixed(
      2
    )}</span></p>
        </div>

        <div class="formula-box">
            <h3>Treatment Sum of Squares (TrSS) Formula</h3>
            <p><strong>TrSS = (Sum of Squares of Treatment Totals / Number of Replication) - C.F</strong></p>
            <p><strong>Calculation:</strong> ((${treatmentSquaresFormula}) / ${repCount}) - (${correctionFactor.toFixed(
      2
    )}) = 
            <span id="treatmentSumOfSquares${i}">${finalTreatmentSum.toFixed(
      2
    )}</span></p>
        </div>

        <div class="formula-box">
            <h3>Replication Sum of Squares (RSS) Formula</h3>
            <p><strong>RSS = (Sum of Squares of Replication Totals / Number of Treatments) - C.F</strong></p>
            <p><strong>Calculation:</strong> ((${replicationFormula}) / ${treatCount}) - (${correctionFactor.toFixed(
      2
    )}) = 
            <span id="replicationSumOfSquares${i}">${finalReplicationSum.toFixed(
      2
    )}</span></p>
        </div>

        <div class="formula-box">
            <h3>Error Sum of Squares (ESS) Formula</h3>
            <p><strong>ESS = TSS - (TrSS + RSS)</strong></p>
            <p><strong>Calculation:</strong> (${totalSumOfSquares.toFixed(
              2
            )}) - (${finalTreatmentSum.toFixed(
      2
    )} + ${finalReplicationSum.toFixed(2)}) = 
            <span id="errorSumOfSquares${i}">${errorSumOfSquares.toFixed(
      2
    )}</span></p>
        </div>`;

    locationSection.insertAdjacentHTML("beforeend", formulaBoxHTML);

    // Add Replication (Column) Totals at the Bottom
    let table = locationSection.querySelector("table");
    let existingTotalRow = table.querySelector(".total-row");

    if (existingTotalRow) {
      table.deleteRow(existingTotalRow.rowIndex);
    }

    let totalRow = table.insertRow();
    totalRow.classList.add("total-row");
    totalRow.innerHTML =
      `<td><strong>Total</strong></td>` +
      columnTotals
        .map((total) => `<td><strong>${total}</strong></td>`)
        .join("") +
      `<td><strong>Grand Total = ${grandTotal}</strong></td><td></td>`;

    document.getElementById(`grandTotal${i}`).innerText = grandTotal;

    // Insert the ANOVA Table in the location section
    locationSection.insertAdjacentHTML("beforeend", anovaTableHTML);
  }
  document.getElementById("calculateBtn").disabled = true;
  document.getElementById("summaryBtn").style.display = "block";

  // console.log(`✅ Total Errors Sum Pooled: ${totalErrorsSumPooled}`);
  // console.log(`✅ Total ESS Pooled: ${totalESSumPooled.toFixed(2)}`);
  // console.log(`✅ Total MSS Pooled: ${totalMSSumPooled.toFixed(2)}`);

  // return { totalErrorsSumPooled, totalESSumPooled, totalMSSumPooled };

  globalTotalErrorsSumPooled = totalErrorsSumPooled;
  globalTotalESSumPooled = totalESSumPooled;
  globalTotalMSSumPooled = totalMSSumPooled;
}
function generateSummaryTable() {
  const locationCount = document.getElementById("locationCount").value;
  let maxTreatments = 0;

  // Find max treatments across locations
  for (let i = 1; i <= locationCount; i++) {
    let treatCount = parseInt(
      document.getElementById(`treatmentCount${i}`).value
    );
    if (treatCount > maxTreatments) {
      maxTreatments = treatCount;
    }
  }

  let summaryHTML = `<h3>Overall Summary Table</h3>
             <table border="1">
             <tr>
               <th>Treatment</th>`;

  // Add column headers for each location
  for (let i = 1; i <= locationCount; i++) {
    summaryHTML += `<th>Location ${i}</th>`;
  }
  summaryHTML += `<th>Total</th></tr>`; // Total Column

  let grandTotal = 0;
  let locationTotals = new Array(parseInt(locationCount)).fill(0); // Store total for each location

  // Iterate through treatments (rows)
  for (let t = 1; t <= maxTreatments; t++) {
    let rowTotal = 0;
    summaryHTML += `<tr><td><strong>Treatment ${t}</strong></td>`;

    // Iterate through locations (columns)
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

      summaryHTML += `<td>${meanValue.toFixed(2)}</td>`;
      rowTotal += meanValue;
      locationTotals[i - 1] += meanValue; // Correctly storing total for each location
    }

    summaryHTML += `<td><strong>${rowTotal.toFixed(2)}</strong></td></tr>`;
    grandTotal += rowTotal;
  }

  // Add Total Row (Sum of each column)
  summaryHTML += `<tr><td><strong>Total</strong></td>`;
  for (let i = 0; i < locationCount; i++) {
    summaryHTML += `<td><strong>${locationTotals[i].toFixed(2)}</strong></td>`;
  }
  summaryHTML += `<td><strong>${grandTotal.toFixed(2)}</strong></td></tr>`;

  summaryHTML += `</table>
<button id="calculateSummaryBtn" onclick="calculateSummaryStats()">Calculate Summary Statistics</button>
<div id="summaryStatsContainer"></div>`;

  // Display Summary Table
  document.getElementById("summaryBtn").disabled = true;
  document.getElementById("summaryTableContainer").innerHTML = summaryHTML;
}
function calculateSummaryStats() {
  if (globalTotalErrorsSumPooled === 0) {
    console.warn("Please calculate totals first!");
    return;
  }

  // Use the stored global values
  let totalErrorsSumPooled = globalTotalErrorsSumPooled;
  let totalESSumPooled = globalTotalESSumPooled;
  let totalMSSumPooled = globalTotalMSSumPooled;

  console.log("Using precomputed values for summary calculations");
  const locationCount = document.getElementById("locationCount").value;
  let maxTreatments = 0;
  let grandTotal = 0;
  let treatmentTotals = [];
  let sumOfSquares = 0;

  // const { totalErrorsSumPooled, totalESSumPooled, totalMSSumPooled } =
  //   calculateTotals();

  // Find max treatments and calculate grand total
  for (let t = 1; t <= locationCount; t++) {
    let treatCount = parseInt(
      document.getElementById(`treatmentCount${t}`).value
    );
    maxTreatments = Math.max(maxTreatments, treatCount);
  }

  // console.log(`💡 Using Global Values in Summary Table`);
  // console.log(`✅ Pooled Errors Sum: ${totalErrorsSumPooled}`);
  // console.log(`✅ Pooled ESS: ${totalESSumPooled.toFixed(2)}`);
  // console.log(`✅ Pooled MSS: ${totalMSSumPooled.toFixed(2)}`);

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

  let N = maxTreatments * locationCount; // Total number of observations
  let correctionFactor = grandTotal ** 2 / N; // CF Calculation

  // Total Sum of Squares (TSS)
  let totalSumOfSquares = sumOfSquares - correctionFactor;

  // Treatment Sum of Squares (TrSS)
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

  // Error Sum of Squares (ESS)
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
  document.getElementById("calculateSummaryBtn").disabled = true; // Disable the button after calculation

  let Z = (maxTreatments - 1) * (locationCount - 1);

  let A = treatmentSumOfSquares.toFixed(2) / (maxTreatments - 1);
  let B = replicationSumOfSquares.toFixed(2) / (locationCount - 1);
  let C = errorSumOfSquares.toFixed(2) / Z; //ESS MSS (C)

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
          <td>(Total number of treatments - 1)<br><br><b>${
            maxTreatments - 1
          }</b></td>
          <td>TrSS=<br><br><b>${treatmentSumOfSquares.toFixed(2)}</b></td>
          <td><b>(A)→</b>TrSS<hr class="Display_Divided">(Total number of treatments - 1)<br><br><b>${A}</b></td>
          <td>A<hr class="Display_Divided">C<br><br><b>${I}</b></td>
          <td>(σ²e + Rσ²g + lσ²g)<br><br><b>${A}</b></td>
        </tr>
        <tr>
          <td><b>Replication (R)</b></td>
          <td>(Total number of replication - 1)<br><br><b>${
            locationCount - 1
          }</b></td>
          <td>RSS=<br><br><b>${replicationSumOfSquares.toFixed(2)}</b></td>
          <td><RSS><b>(B)→</b>RSS<hr class="Display_Divided">(Total number of replication - 1)<br><br><b>${B}</b></td>
          <td>B<hr class="Display_Divided">C<br><br><b>${J}</b></td>
          <td>(σ²e + σ²gl + gσ²l)</td>
        </tr>
        <tr>
          <td><b>Error (E)</b></td>
          <td><b>(Z)→</b> (Total number of treatments - 1) ×<br> (Total number of replication - 1)<br><br>${Z}</td>
          <td>ESS=<br><br><b>${errorSumOfSquares.toFixed(2)}</b></td>
          <td><b>(C)→</b> RSS<hr class="Display_Divided">Z<br><br><b>${C}</b></td>
          <td>-</td>
          <td>(σ²e + σ²gl)<br><br><b>${C}</b></td>
        </tr>
        <tr>
            <td><b>Pooled Error</b></td>
            <td>Sum of individual locations<br><br>${totalErrorsSumPooled}</td>
            <td>Sum of individual locations SS<br><br><b>${totalESSumPooled.toFixed(
              2
            )}</b></td>
            <td><b>Sum of individual locations MSS</b><br><br>${totalMSSumPooled.toFixed(
              2
            )}</td>
            <td>-</td>
            <td>σ²e=<br><br><b>${totalMSSumPooled.toFixed(2)}</b></td>
        </tr>
      </table>
    `;
  document.getElementById("SummaryAnovaResults").innerHTML =
    SummaryAnovaTableHTML;
}
// Add this new function to update the progress indicator
function updateProgress(currentStep) {
  const steps = document.querySelectorAll(".step");
  const progressBar = document.getElementById("progressBar");

  steps.forEach((step, index) => {
    if (index < currentStep) {
      step.classList.add("completed");
      step.classList.remove("active");
    } else if (index === currentStep) {
      step.classList.add("active");
      step.classList.remove("completed");
    } else {
      step.classList.remove("active", "completed");
    }
  });

  // Update progress bar (25% per step)
  progressBar.style.width = `${(currentStep + 1) * 25}%`;
}
// Modify your existing functions to update progress
function generateInputFields() {
  // [Existing code...]
  updateProgress(1); // Move to step 2
}

function generateTables() {
  // [Existing code...]
  updateProgress(2); // Move to step 3
}

function calculateTotals() {
  // [Existing code...]
  updateProgress(3); // Move to step 4
}

// Initialize progress
updateProgress(0);

document.getElementById("downloadBtn").addEventListener("click", function () {
  generatePDF();
  generateExcel();
});

function generatePDF() {
  const { jsPDF } = window.jspdf;
  let doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  window.scrollTo(0, 0); // Ensure full-page capture
  html2canvas(document.body, {
    scale: 2,
    useCORS: true,
  }).then((canvas) => {
    let imgData = canvas.toDataURL("image/png");
    let imgWidth = 210; // A4 width in mm
    let pageHeight = 297; // A4 height in mm
    let imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Function to add gray transparent header text
    // function addHeader(doc) {
    //   doc.setTextColor(200, 200, 200); // Light gray color
    //   doc.setFontSize(16);
    //   doc.setFont("helvetica", "bold");
    //   doc.text("BARGAND", 5, 10, { opacity: 0.5 }); // Top-left corner, semi-transparent
    // }

    doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    // addHeader(doc); // Add header on first page
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      doc.addPage();
      doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      // addHeader(doc); // Add header on each new page
      heightLeft -= pageHeight;
    }

    doc.save("ANOVA_Calculations.pdf");
  });
}

// [Keep all your existing calculateTotals(), generateSummaryTable(), and other functions exactly as they were]
// Only replace the first three functions above and keep everything else the same

// Initialize progress on load
document.addEventListener("DOMContentLoaded", function () {
  updateProgress(0);

  // Download button event listener
  document.getElementById("downloadBtn").addEventListener("click", function () {
    generatePDF();
    generateExcel();
  });
});
console.log(5)