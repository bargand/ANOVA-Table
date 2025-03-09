function calculateTotals() {
  const locationCount = document.getElementById("locationCount").value;
  let totalErrors = 1; // Initialize totalErrors to 1 for multiplication

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
                  Number(
                      document.getElementById(`loc${i}treat${k}rep${j}`).value
                  ) || 0;
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
      let finalTreatmentSum =
          treatmentSumOfSquares / repCount - correctionFactor;

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
      let dfError = dfTreatment * dfReplication;
      totalErrors *= dfError; // Multiply the total errors

      // Mean Sum of Squares (MSS)
      let meanTreatmentSS = finalTreatmentSum / dfTreatment;
      let meanReplicationSS = finalReplicationSum / dfReplication;
      let meanErrorSS = errorSumOfSquares / dfError;

      // F-Calculated (Fcal)
      let fcalTreatment = meanTreatmentSS / meanErrorSS;
      let fcalReplication = meanReplicationSS / meanErrorSS;

      let MeanOfGrandMean = (grandTotal / N).toFixed(2);

      //Error co-efficient of variance
      let EnvRut = Math.sqrt(meanErrorSS);
      let EnvironCoffVariance = (EnvRut / MeanOfGrandMean).toFixed(2);

      //Genotypic co-efficient of varience
      let genotype = ((meanTreatmentSS - meanErrorSS) / repCount).toFixed(
          2
      );
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
              >F<sub>MSS</sub> for Error: σ²e =${meanErrorSS.toFixed(
                2
              )}</strong
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
      let existingFormulaBoxes =
          locationSection.querySelectorAll(".formula-box");
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

  // Log the total errors for all locations
  console.log(`The total errors for all locations is: ${totalErrors}`);
}