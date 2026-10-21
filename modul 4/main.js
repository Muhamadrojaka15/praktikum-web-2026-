// File: main.js
// Tugas Mandiri: Interactive Portfolio Tracker

// ===== DATA & STATE =====
let projects = [
  { id: 1, title: "Sistem Inventaris Keuangan", category: "Web App", budget: 2500000, completed: true },
  { id: 2, title: "Sistem Kasir Digital POS", category: "Desktop App", budget: 5000000, completed: true },
  { id: 3, title: "Landing Page Profil Perusahaan", category: "Web App", budget: 1500000, completed: false },
  { id: 4, title: "Aplikasi Presensi GPS Mobile", category: "Mobile App", budget: 4500000, completed: false }
];

let selectedCategory = "Semua";
let searchKeyword = "";

// ===== HELPER =====
const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(angka);
};

// Mencegah teks dari input pengguna dibaca sebagai HTML
const escapeHtml = (text) => {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

// ===== STATISTIK (selalu dihitung dari seluruh data) =====
const updateStats = (dataList) => {
  const totalBudget = dataList.reduce((acc, curr) => acc + curr.budget, 0);
  const completedCount = dataList.filter(item => item.completed).length;

  document.getElementById("stat-total-projects").textContent = dataList.length;
  document.getElementById("stat-total-budget").textContent = formatRupiah(totalBudget);
  document.getElementById("stat-completed-projects").textContent = completedCount;
};

// ===== RENDER DAFTAR =====
const renderProjects = (list) => {
  const container = document.getElementById("project-list");
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = "<p class='empty-state'>Tidak ada proyek yang cocok. Ubah kata kunci, pilih kategori lain, atau tambahkan proyek baru.</p>";
    return;
  }

  container.innerHTML = list.map(proj => {
    const badgeClass = proj.completed ? "badge-success" : "badge-pending";
    const statusText = proj.completed ? "Selesai" : "Dalam Pengerjaan";

    return `
      <div class="project-card">
        <div class="project-info">
          <span class="project-category">${escapeHtml(proj.category)}</span>
          <h4>${escapeHtml(proj.title)}</h4>
          <p class="project-budget">${formatRupiah(proj.budget)}</p>
        </div>
        <div class="project-side">
          <span class="badge ${badgeClass}">${statusText}</span>
          <div class="card-actions">
            <button class="btn-action btn-toggle" data-id="${proj.id}">Ubah Status</button>
            <button class="btn-action btn-delete" data-id="${proj.id}">Hapus Proyek</button>
          </div>
        </div>
      </div>
    `;
  }).join("");
};

// ===== FILTER TERPADU: kategori + pencarian =====
const getVisibleProjects = () => {
  return projects
    .filter(p => selectedCategory === "Semua" || p.category === selectedCategory)
    .filter(p => p.title.toLowerCase().includes(searchKeyword.toLowerCase()));
};

// Satu fungsi untuk memperbarui seluruh tampilan
const refreshView = () => {
  renderProjects(getVisibleProjects());
  updateStats(projects);
};

// ===== VALIDASI FORM =====
const setError = (groupId, errorId, message) => {
  document.getElementById(errorId).textContent = message;
  document.getElementById(groupId).classList.toggle("invalid", message !== "");
};

const validateForm = (title, budget) => {
  let valid = true;

  if (title.trim() === "") {
    setError("group-title", "error-title", "Judul proyek wajib diisi.");
    valid = false;
  } else {
    setError("group-title", "error-title", "");
  }

  if (Number.isNaN(budget) || budget <= 0) {
    setError("group-budget", "error-budget", "Anggaran harus lebih besar dari 0.");
    valid = false;
  } else {
    setError("group-budget", "error-budget", "");
  }

  return valid;
};

// ===== EVENT LISTENER =====
document.addEventListener("DOMContentLoaded", () => {
  refreshView();

  // Fitur 1: submit form
  const form = document.getElementById("project-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("input-title").value;
    const category = document.getElementById("input-category").value;
    const budget = parseFloat(document.getElementById("input-budget").value);
    const completed = document.getElementById("input-completed").checked;

    if (!validateForm(title, budget)) return;

    const newProject = {
      id: Date.now(),
      title: title.trim(),
      category,
      budget,
      completed
    };

    // Spread operator: proyek baru tampil paling atas
    projects = [newProject, ...projects];

    form.reset();
    refreshView();
  });

  // Fitur 2: pencarian real-time
  document.getElementById("search-input").addEventListener("input", (e) => {
    searchKeyword = e.target.value.trim();
    refreshView();
  });

  // Filter kategori
  const filterButtons = document.querySelectorAll(".btn-filter");
  filterButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      filterButtons.forEach(b => b.classList.remove("active"));
      e.currentTarget.classList.add("active");
      selectedCategory = e.currentTarget.getAttribute("data-category");
      refreshView();
    });
  });

  // Fitur 3: aksi kartu (event delegation, karena kartu dibuat ulang saat render)
  document.getElementById("project-list").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-id]");
    if (!btn) return;

    const id = Number(btn.getAttribute("data-id"));

    if (btn.classList.contains("btn-toggle")) {
      projects = projects.map(p => p.id === id ? { ...p, completed: !p.completed } : p);
    } else if (btn.classList.contains("btn-delete")) {
      projects = projects.filter(p => p.id !== id);
    }

    refreshView();
  });
});
