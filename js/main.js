/**
 * INM-320 Dashboard — main.js
 * Handles: scroll-reveal, Chart.js graph, form validation, toast, tasks
 */

'use strict';

// ─────────────────────────────────────────────
// 1. SCROLL REVEAL
// ─────────────────────────────────────────────
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const delay = parseInt(e.target.dataset.delay) || 0;
        setTimeout(() => e.target.classList.add('visible'), delay);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  els.forEach((el) => obs.observe(el));
})();


// ─────────────────────────────────────────────
// 2. COUNTER ANIMATION
// ─────────────────────────────────────────────
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  const animate = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1200;
    const start = performance.now();
    const update = (now) => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.floor(easeOut(p) * target);
      if (p < 1) requestAnimationFrame(update);
      else el.textContent = target;
    };
    requestAnimationFrame(update);
  };

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { animate(e.target); obs.unobserve(e.target); }
    });
  }, { threshold: 0.5 });

  counters.forEach((el) => obs.observe(el));
})();


// ─────────────────────────────────────────────
// 3. TODAY'S TRENDS — Chart.js line chart
// ─────────────────────────────────────────────
(function initChart() {
  const canvas = document.getElementById('trendsChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'New Tickets',
          data: [42, 58, 47, 63, 71, 35, 28],
          borderColor: '#1f6feb',
          backgroundColor: 'rgba(31,111,235,0.08)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#1f6feb',
          pointRadius: 3,
          pointHoverRadius: 5,
        },
        {
          label: 'Resolved',
          data: [35, 45, 52, 49, 60, 30, 22],
          borderColor: '#2da44e',
          backgroundColor: 'rgba(45,164,78,0.06)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#2da44e',
          pointRadius: 3,
          pointHoverRadius: 5,
        },
        {
          label: 'Avg. Response (hrs)',
          data: [3.2, 2.8, 3.5, 2.4, 2.1, 4.0, 4.5],
          borderColor: '#f0883e',
          backgroundColor: 'rgba(240,136,62,0)',
          borderWidth: 2,
          tension: 0.4,
          fill: false,
          pointBackgroundColor: '#f0883e',
          pointRadius: 3,
          pointHoverRadius: 5,
          yAxisID: 'y2',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#24292f',
          titleFont: { size: 11, weight: '600' },
          bodyFont: { size: 11 },
          padding: 10,
          cornerRadius: 6,
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(0,0,0,0.04)' },
          ticks: { font: { size: 11 }, color: '#57606a' },
        },
        y: {
          grid: { color: 'rgba(0,0,0,0.04)' },
          ticks: { font: { size: 11 }, color: '#57606a', stepSize: 20 },
          min: 0,
        },
        y2: {
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: {
            font: { size: 11 },
            color: '#f0883e',
            callback: (v) => v + 'h',
          },
          min: 0,
          max: 8,
        },
      },
    },
  });
})();


// ─────────────────────────────────────────────
// 4. ADD TICKET MODAL — form validation
// ─────────────────────────────────────────────
(function initTicketForm() {
  const form = document.getElementById('ticketForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    e.stopPropagation();
    form.classList.add('was-validated');

    if (form.checkValidity()) {
      const modalEl = document.getElementById('addTicketModal');
      bootstrap.Modal.getInstance(modalEl)?.hide();
      form.reset();
      form.classList.remove('was-validated');
      showToast('Ticket created successfully!', 'success');
    }
  });
})();


// ─────────────────────────────────────────────
// 5. TASK CHECKBOXES — toggle done state
// ─────────────────────────────────────────────
(function initTasks() {
  document.querySelectorAll('.task-check').forEach((btn) => {
    btn.addEventListener('click', () => {
      const isDone = btn.classList.toggle('done');
      const title = btn.closest('.task-item')?.querySelector('.task-title');
      if (title) title.classList.toggle('done', isDone);

      if (isDone) {
        btn.innerHTML = '<i class="bi bi-check"></i>';
        showToast('Task marked complete.', 'success');
      } else {
        btn.innerHTML = '';
      }
    });
  });
})();


// ─────────────────────────────────────────────
// 6. TOAST HELPER
// ─────────────────────────────────────────────
function showToast(message, type = 'primary') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const colorMap = {
    success: 'text-bg-success',
    danger:  'text-bg-danger',
    primary: 'text-bg-primary',
  };
  const cls = colorMap[type] || 'text-bg-primary';
  const id = 'toast-' + Date.now();

  container.insertAdjacentHTML('beforeend', `
    <div id="${id}" class="toast align-items-center ${cls} border-0 shadow-sm" role="alert">
      <div class="d-flex">
        <div class="toast-body fw-semibold" style="font-size:.85rem">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>`);

  const toastEl = document.getElementById(id);
  new bootstrap.Toast(toastEl, { delay: 3500 }).show();
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}
