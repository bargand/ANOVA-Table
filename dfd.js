function generateSummaryTable() {
  let summaryHTML = `<h3>Overall Summary Table</h3>`;
  summaryHTML += `<div id="SummaryAnovaResults"></div>`;
  document.getElementById("summaryTableContainer").innerHTML = summaryHTML;
  calculateSummaryStats();
}

function calculateSummaryStats() {
  let summaryAnovaContainer = document.getElementById("SummaryAnovaResults");

  if (!summaryAnovaContainer.innerHTML.trim()) {
    let summaryAnovaHTML = `
            <h3>Summary ANOVA Results</h3>
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
                    <td>--</td>
                    <td>--</td>
                    <td>--</td>
                    <td>--</td>
                    <td>--</td>
                </tr>
                <tr>
                    <td><b>Replication (R)</b></td>
                    <td>--</td>
                    <td>--</td>
                    <td>--</td>
                    <td>--</td>
                    <td>--</td>
                </tr>
                <tr>
                    <td><b>Error (E)</b></td>
                    <td>--</td>
                    <td>--</td>
                    <td>--</td>
                    <td>4</td>
                    <td>2</td>
                </tr>
            </table>`;

    summaryAnovaContainer.innerHTML = summaryAnovaHTML;
  }
}
