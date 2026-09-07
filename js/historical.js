/**
 * LANDSLIDE SENTINEL AI - Historical Landslide Database Component
 */

let allLandslides = [];

export function renderHistoricalView(landslides) {
  allLandslides = landslides || [];
  const tbody = document.getElementById('landslides-tbody');
  const countBadge = document.getElementById('landslides-count-badge');
  if (countBadge) countBadge.textContent = `${allLandslides.length} Documented Events`;
  
  if (!tbody) return;
  
  renderTableRows(allLandslides.slice(0, 50));
  
  // Search and Filter Listeners
  const searchInput = document.getElementById('landslide-search-input');
  const materialFilter = document.getElementById('landslide-material-filter');
  
  if (searchInput) {
    searchInput.oninput = () => filterLandslides();
  }
  if (materialFilter) {
    materialFilter.onchange = () => filterLandslides();
  }
}

function filterLandslides() {
  const search = (document.getElementById('landslide-search-input')?.value || '').toLowerCase();
  const material = document.getElementById('landslide-material-filter')?.value || 'ALL';
  
  const filtered = allLandslides.filter(item => {
    const loc = (item.nh_sh_location || '').toLowerCase();
    const slide = (item.slide_no || item.sl_no || '').toLowerCase();
    const matchesSearch = loc.includes(search) || slide.includes(search);
    const matchesMaterial = material === 'ALL' || (item.material_involved || '').toUpperCase() === material;
    return matchesSearch && matchesMaterial;
  });
  
  renderTableRows(filtered.slice(0, 50));
  const countBadge = document.getElementById('landslides-count-badge');
  if (countBadge) countBadge.textContent = `${filtered.length} Filtered Events`;
}

function renderTableRows(rows) {
  const tbody = document.getElementById('landslides-tbody');
  if (!tbody) return;
  
  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted p-4">No historical landslide events match the selected criteria.</td></tr>`;
    return;
  }
  
  tbody.innerHTML = rows.map(r => `
    <tr>
      <td class="font-mono text-cyan font-bold">${r.slide_no || r.sl_no}</td>
      <td><strong>${r.nh_sh_location || 'Rangpo-Singtam Highway'}</strong></td>
      <td class="font-mono text-xs">${parseFloat(r.latitude).toFixed(4)}°N, ${parseFloat(r.longitude).toFixed(4)}°E</td>
      <td><span class="status-badge" style="background: rgba(148, 163, 184, 0.15); color: #e2e8f0;">${r.material_involved || 'Debris'}</span></td>
      <td>${r.movement_type || 'Slide'}</td>
      <td>${r.district || 'East/South Sikkim'}</td>
      <td><span class="text-xs text-muted">Geological Survey of India</span></td>
    </tr>
  `).join('');
}
