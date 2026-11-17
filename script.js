document.addEventListener("DOMContentLoaded", () => {
  const mhsForm = document.querySelector("#mhsForm");
  const mhsIdInput = document.querySelector("#mhsId");
  const nimInput = document.querySelector("#nim");
  const namaInput = document.querySelector("#nama");
  const jurusanInput = document.querySelector("#jurusan");
  const emailInput = document.querySelector("#email");
  const btnSubmit = document.querySelector("#btnSubmit");
  const btnCancel = document.querySelector("#btnCancel");
  const formTitle = document.querySelector("#formTitle");
  const mhsTableBody = document.querySelector("#mhsTableBody");
  const alertMessage = document.querySelector("#alertMessage");
  const searchInput = document.querySelector("#searchInput");
  const totalMahasiswa = document.querySelector("#totalMahasiswa");

  let listMahasiswa = [];

  const showAlert = (text, type = "success") => {
    alertMessage.textContent = text;
    alertMessage.className = `alert alert-${type}`;
    alertMessage.style.display = "block";
    setTimeout(() => { alertMessage.style.display = "none"; }, 3000);
  };

  const updateCounter = () => {
    totalMahasiswa.textContent = `Total Mahasiswa Terdaftar: ${listMahasiswa.length} Orang`;
  };

  const filterMahasiswa = () => {
    const keyword = searchInput.value.trim().toLowerCase();
    const hasil = listMahasiswa.filter(mhs =>
      mhs.nama.toLowerCase().includes(keyword) ||
      mhs.nim.toLowerCase().includes(keyword)
    );
    renderTable(hasil);
  };

  const loadMahasiswa = async () => {
    try {
      const res = await fetch("/api/mahasiswa");
      listMahasiswa = await res.json();
      updateCounter();
      filterMahasiswa();
    } catch (err) {
      showAlert("Gagal memuat data dari server backend", "error");
    }
  };

  const renderTable = (data) => {
    mhsTableBody.innerHTML = "";

    if (data.length === 0) {
      const pesan = searchInput.value.trim()
        ? "Data mahasiswa tidak ditemukan."
        : "Belum ada data mahasiswa tersimpan.";
      mhsTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#64748b;">${pesan}</td></tr>`;
      return;
    }

    data.forEach((mhs, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${mhs.nim}</td>
        <td>${mhs.nama}</td>
        <td>${mhs.jurusan}</td>
        <td>${mhs.email}</td>
        <td>
          <button class="btn-action btn-edit" data-id="${mhs.id}">Edit</button>
          <button class="btn-action btn-delete" data-id="${mhs.id}">Hapus</button>
        </td>
      `;
      mhsTableBody.appendChild(tr);
    });
  };

  const resetForm = () => {
    mhsForm.reset();
    mhsIdInput.value = "";
    formTitle.textContent = "Tambah Mahasiswa Baru";
    btnSubmit.textContent = "Simpan Mahasiswa";
    btnCancel.style.display = "none";
  };

  searchInput.addEventListener("input", filterMahasiswa);

  mhsForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      nim: nimInput.value.trim(),
      nama: namaInput.value.trim(),
      jurusan: jurusanInput.value,
      email: emailInput.value.trim()
    };

    const id = mhsIdInput.value;
    const isEdit = Boolean(id);

    const nimSudahAda = listMahasiswa.some(m => m.nim === payload.nim && m.id !== Number(id));
    if (nimSudahAda) {
      showAlert("NIM sudah terdaftar!", "error");
      return;
    }

    const url = isEdit ? `/api/mahasiswa/${id}` : "/api/mahasiswa";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await res.json();

      if (result.success) {
        showAlert(result.message);
        resetForm();
        loadMahasiswa();
      } else {
        showAlert("Terjadi kesalahan: " + result.message, "error");
      }
    } catch (err) {
      showAlert("Gagal mengirim data ke server", "error");
    }
  });

  mhsTableBody.addEventListener("click", async (e) => {
    const id = Number(e.target.dataset.id);
    if (!id) return;

    if (e.target.classList.contains("btn-edit")) {
      const targetMhs = listMahasiswa.find(m => m.id === id);
      if (targetMhs) {
        mhsIdInput.value = targetMhs.id;
        nimInput.value = targetMhs.nim;
        namaInput.value = targetMhs.nama;
        jurusanInput.value = targetMhs.jurusan;
        emailInput.value = targetMhs.email;
        formTitle.textContent = "Edit Data Mahasiswa";
        btnSubmit.textContent = "Perbarui Mahasiswa";
        btnCancel.style.display = "inline-block";
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else if (e.target.classList.contains("btn-delete")) {
      if (confirm("Apakah Anda yakin ingin menghapus data mahasiswa ini?")) {
        try {
          const res = await fetch(`/api/mahasiswa/${id}`, { method: "DELETE" });
          const result = await res.json();
          if (result.success) {
            showAlert(result.message);
            loadMahasiswa();
          }
        } catch (err) {
          showAlert("Gagal menghapus data dari server", "error");
        }
      }
    }
  });

  btnCancel.addEventListener("click", resetForm);

  loadMahasiswa();
});
