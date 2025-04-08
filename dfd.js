function generateTables() {
  const locationCount = document.getElementById("locationCount").value;
  const tablesContainer = document.getElementById("tablesContainer");
  tablesContainer.innerHTML = "";

  for (let i = 1; i <= locationCount; i++) {
    // ... [existing table generation code] ...
    
    // Wrap the table in a properly structured section
    let locationSection = document.createElement('div');
    locationSection.className = 'location-section card fade-in';
    locationSection.innerHTML = `
      <div class="card-header">
        <h3 class="card-title">Location ${i}</h3>
        <i class="fas fa-map-marker-alt text-primary"></i>
      </div>
      <div class="table-responsive">
        ${tableHTML}
      </div>
      <div class="summary">
        <p><strong>Replication Count:</strong> ${repCount}</p>
        <p><strong>Treatment Count:</strong> ${treatCount}</p>
        <p><strong>Grand Total:</strong> <span id="grandTotal${i}">0</span></p>
      </div>
    `;
    
    tablesContainer.appendChild(locationSection);
  }

  document.getElementById("locationDetailsCard").style.display = "none";
  document.getElementById("dataTablesCard").style.display = "block";
  updateStepper(3);
}