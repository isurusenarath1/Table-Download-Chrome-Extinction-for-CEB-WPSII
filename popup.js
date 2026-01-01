const exportBtn = document.getElementById('exportBtn');
const statusEl = document.getElementById('status');
const filenameInput = document.getElementById('filename');
const formatSelect = document.getElementById('format');

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle('error', !!isError);
}

exportBtn.addEventListener('click', async () => {
  const base = (filenameInput.value || '').trim() || 'table';
  const format = formatSelect.value || 'xls';
  const filename = base.endsWith(`.${format}`) ? base : `${base}.${format}`;

  exportBtn.disabled = true;
  exportBtn.classList.add('loading');
  setStatus('Searching for a table on the active page...');

  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs || !tabs.length) {
      setStatus('No active tab found', true);
      return;
    }
    const tabId = tabs[0].id;

    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: exportTable,
      args: [filename, format]
    });

    setStatus('Export started — check your Downloads folder.');
  } catch (err) {
    console.error(err);
    setStatus('Failed to export: ' + (err && err.message ? err.message : String(err)), true);
  } finally {
    exportBtn.disabled = false;
    exportBtn.classList.remove('loading');
  }
});

function exportTable(filename, format) {
  const table = document.querySelector('table');
  if (!table) {
    alert('No table found on this page');
    return;
  }

  if (format === 'csv') {
    const rows = Array.from(table.rows).map(row =>
      Array.from(row.cells).map(cell => '"' + cell.innerText.replace(/"/g, '""') + '"').join(',')
    ).join('\n');

    const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return;
  }

  // default: simple HTML -> .xls download
  const html = table.outerHTML;
  const url = 'data:application/vnd.ms-excel,' + encodeURIComponent(html);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
