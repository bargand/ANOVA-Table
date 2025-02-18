function calculateAll() {
    // Perform all previous calculations (TSS, TrSS, RSS, ESS)
    calculateAnova();

    // Now, generate and display the ANOVA table
    let dfTreatment = treatments - 1;
    let dfReplication = replications - 1;
    let dfError = dfTreatment * dfReplication;

    let meanTreatmentSS = finalTreatmentSum / dfTreatment;
    let meanReplicationSS = finalReplicationSum / dfReplication;
    let meanErrorSS = errorSumOfSquares / dfError;

    let fcalTreatment = meanTreatmentSS / meanErrorSS;
    let fcalReplication = meanReplicationSS / meanErrorSS;

    let anovaTableHTML = `
      <h3>ANOVA Table</h3>
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
          <td>${dfTreatment}</td>
          <td>${finalTreatmentSum.toFixed(2)}</td>
          <td>${meanTreatmentSS.toFixed(2)}</td>
          <td>${fcalTreatment.toFixed(2)}</td>
          <td>${meanTreatmentSS.toFixed(2)}</td>
        </tr>
        <tr>
          <td><b>Replication (R)</b></td>
          <td>${dfReplication}</td>
          <td>${finalReplicationSum.toFixed(2)}</td>
          <td>${meanReplicationSS.toFixed(2)}</td>
          <td>${fcalReplication.toFixed(2)}</td>
          <td>-</td>
        </tr>
        <tr>
          <td><b>Error (E)</b></td>
          <td>${dfError}</td>
          <td>${errorSumOfSquares.toFixed(2)}</td>
          <td>${meanErrorSS.toFixed(2)}</td>
          <td>-</td>
          <td>${meanErrorSS.toFixed(2)}</td>
        </tr>
      </table>
    `;

    // Insert the ANOVA table into the div
    document.getElementById("anovaResults").innerHTML = anovaTableHTML;
}






























function calculateAnova() {
  const locationCount = document.getElementById("locationCount").value;
  let anovaResultsHTML = "";

  for (let i = 1; i <= locationCount; i++) {
    const replications = parseInt(
      document.getElementById(`replicationCount${i}`).value
    );
    const treatments = parseInt(
      document.getElementById(`treatmentCount${i}`).value
    );

    let finalTreatmentSum = parseFloat(
      document.getElementById(`treatmentSumOfSquares${i}`).innerText
    );
    let finalReplicationSum = parseFloat(
      document.getElementById(`replicationSumOfSquares${i}`).innerText
    );
    let errorSumOfSquares = parseFloat(
      document.getElementById(`errorSumOfSquares${i}`).innerText
    );

    // Degrees of Freedom (d.f.)
    let dfTreatment = treatments - 1;
    let dfReplication = replications - 1;
    let dfError = dfTreatment * dfReplication;

    // Mean Sum of Squares (MSS)
    let meanTreatmentSS = finalTreatmentSum / dfTreatment;
    let meanReplicationSS = finalReplicationSum / dfReplication;
    let meanErrorSS = errorSumOfSquares / dfError;

    // F-calculated values
    let fcalTreatment = meanTreatmentSS / meanErrorSS;
    let fcalReplication = meanReplicationSS / meanErrorSS;

    anovaResultsHTML += `
  <div class="anova-section">
      <h3>ANOVA Table - Location ${i}</h3>
      <table border="1">
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
              <td>(${treatments} - 1)<br><b>${dfTreatment}</b></td>
              <td>TrSS=<br><b>${finalTreatmentSum.toFixed(2)}</b></td>
              <td><b>(A)→</b> TrSS<hr class="Display_Divided">(${treatments} - 1)<br><b>${meanTreatmentSS.toFixed(
      2
    )}</b></td>
              <td>A<hr class="Display_Divided">C<br><b>${fcalTreatment.toFixed(
                2
              )}</b></td>
              <td>(σ²e + Rσ²g)<br><b>${meanTreatmentSS.toFixed(
                2
              )}</b></td>
          </tr>
          <tr>
              <td><b>Replication (R)</b></td>
              <td>(${replications} - 1)<br><b>${dfReplication}</b></td>
              <td>RSS=<br><b>${finalReplicationSum.toFixed(2)}</b></td>
              <td><b>(B)→</b> RSS<hr class="Display_Divided">(${replications} - 1)<br><b>${meanReplicationSS.toFixed(
      2
    )}</b></td>
              <td>B<hr class="Display_Divided">C<br><b>${fcalReplication.toFixed(
                2
              )}</b></td>
              <td>-</td>
          </tr>
          <tr>
              <td><b>Error (E)</b></td>
              <td><b>(Z)→</b> (${treatments} - 1) × (${replications} - 1)<br><b>${dfError}</b></td>
              <td>ESS=<br><b>${errorSumOfSquares.toFixed(2)}</b></td>
              <td><b>(C)→</b> RSS<hr class="Display_Divided">Z<br><b>${meanErrorSS.toFixed(
                2
              )}</b></td>
              <td>-</td>
              <td>σ²e=<br><b>${meanErrorSS.toFixed(2)}</b></td>
          </tr>
      </table>
  </div>`;
  }

  document.getElementById("anovaResults").innerHTML = anovaResultsHTML;
}