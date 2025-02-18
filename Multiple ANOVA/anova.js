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
