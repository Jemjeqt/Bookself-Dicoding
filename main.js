// Membuat ID unik menggunakan timestamp (waktu saat ini)
function buatId() {
  return Date.now().toString();
}

// Membuat pesan notifikasi yang muncul dan menghilang
function tampilkanPesan(pesan, tipe = "success") {
  // Pastikan untuk menghapus pesan sebelumnya sebelum menampilkan pesan baru
  const notifikasiSebelumnya = document.querySelector(".toast");
  if (notifikasiSebelumnya) {
    notifikasiSebelumnya.remove();
  }

  // Buat element div untuk pesan
  const pesanElement = document.createElement("div");
  pesanElement.className = `toast ${tipe}`;
  pesanElement.textContent = pesan;

  // Tambahkan pesan ke halaman
  document.body.appendChild(pesanElement);

  // Hapus pesan setelah 3 detik
  setTimeout(function () {
    document.body.removeChild(pesanElement);
  }, 3000);
}

// Menyimpan data buku ke penyimpanan browser
function simpanBuku(daftarBuku) {
  localStorage.setItem("buku", JSON.stringify(daftarBuku));
  tampilkanPesan("Buku berhasil disimpan!");
}

// Mengambil data buku dari penyimpanan browser
function ambilBuku() {
  const bukuTersimpan = localStorage.getItem("buku");
  // Jika ada data buku, kembalikan data. Jika tidak, kembalikan array kosong
  return bukuTersimpan ? JSON.parse(bukuTersimpan) : [];
}

// Menyiapkan variabel untuk menyimpan daftar buku
let daftarBuku = ambilBuku();
let idBukuYangDiedit = null;

// Membuat tampilan untuk satu buku
function buatElementBuku(buku) {
  const bukuElement = document.createElement("div");
  bukuElement.setAttribute("data-bookid", buku.id);
  bukuElement.setAttribute("data-testid", "bookItem");

  // Isi HTML untuk satu buku
  bukuElement.innerHTML = `
      <h3 data-testid="bookItemTitle">${buku.title}</h3>
      <p data-testid="bookItemAuthor">Penulis: ${buku.author}</p>
      <p data-testid="bookItemYear">Tahun: ${buku.year}</p>
      <div class="book-actions">
          <button data-testid="bookItemIsCompleteButton">
              ${buku.isComplete ? "Belum selesai dibaca" : "Selesai dibaca"}
          </button>
          <button data-testid="bookItemDeleteButton">Hapus Buku</button>
          <button data-testid="bookItemEditButton">Edit Buku</button>
      </div>
  `;

  // Menambah fungsi tombol "Selesai/Belum Selesai"
  bukuElement
    .querySelector('[data-testid="bookItemIsCompleteButton"]')
    .addEventListener("click", function () {
      buku.isComplete = !buku.isComplete;
      simpanBuku(daftarBuku);
      tampilkanSemuaBuku();
      tampilkanPesan(
        `Buku ${buku.isComplete ? "selesai" : "belum selesai"} dibaca`
      );
    });

  // Menambah fungsi tombol "Hapus"
  bukuElement
    .querySelector('[data-testid="bookItemDeleteButton"]')
    .addEventListener("click", function () {
      if (confirm("Yakin ingin menghapus buku ini?")) {
        daftarBuku = daftarBuku.filter(function (b) {
          return b.id !== buku.id;
        });
        simpanBuku(daftarBuku);
        tampilkanSemuaBuku();
        tampilkanPesan("Buku berhasil dihapus!", "danger");
      }
    });

  // Menambah fungsi tombol "Edit"
  bukuElement
    .querySelector('[data-testid="bookItemEditButton"]')
    .addEventListener("click", function () {
      // Mengisi form dengan data buku yang akan diedit
      idBukuYangDiedit = buku.id;
      document.getElementById("bookFormTitle").value = buku.title;
      document.getElementById("bookFormAuthor").value = buku.author;
      document.getElementById("bookFormYear").value = buku.year;
      document.getElementById("bookFormIsComplete").checked = buku.isComplete;
      document.getElementById("bookFormSubmit").innerHTML = "Edit Buku";

      // Scroll ke form
      document
        .getElementById("bookForm")
        .scrollIntoView({ behavior: "smooth" });
      tampilkanPesan("Silakan edit buku", "warning");
    });

  return bukuElement;
}

// Menampilkan semua buku ke halaman
function tampilkanSemuaBuku() {
  const rakBelumSelesai = document.getElementById("incompleteBookList");
  const rakSudahSelesai = document.getElementById("completeBookList");

  // Kosongkan rak buku
  rakBelumSelesai.innerHTML = "";
  rakSudahSelesai.innerHTML = "";

  // Tampilkan setiap buku ke rak yang sesuai
  daftarBuku.forEach(function (buku) {
    const bukuElement = buatElementBuku(buku);
    if (buku.isComplete) {
      rakSudahSelesai.appendChild(bukuElement);
    } else {
      rakBelumSelesai.appendChild(bukuElement);
    }
  });
}

// Menangani submit form tambah/edit buku
document
  .getElementById("bookForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    // Ambil nilai dari form
    const judul = document.getElementById("bookFormTitle").value;
    const penulis = document.getElementById("bookFormAuthor").value;
    const tahun = parseInt(document.getElementById("bookFormYear").value);
    const sudahSelesai = document.getElementById("bookFormIsComplete").checked;

    if (idBukuYangDiedit) {
      // Mode edit buku
      const indeksBuku = daftarBuku.findIndex(function (buku) {
        return buku.id === idBukuYangDiedit;
      });

      daftarBuku[indeksBuku].title = judul;
      daftarBuku[indeksBuku].author = penulis;
      daftarBuku[indeksBuku].year = tahun;
      daftarBuku[indeksBuku].isComplete = sudahSelesai;

      idBukuYangDiedit = null;
      document.getElementById("bookFormSubmit").innerHTML =
        "Masukkan Buku ke rak";
      tampilkanPesan("Buku berhasil diubah!");
    } else {
      // Mode tambah buku baru
      const bukuBaru = {
        id: buatId(),
        title: judul,
        author: penulis,
        year: tahun,
        isComplete: sudahSelesai,
      };

      daftarBuku.push(bukuBaru);
      tampilkanPesan("Buku baru berhasil ditambahkan!");
    }

    simpanBuku(daftarBuku);
    tampilkanSemuaBuku();
    this.reset();
  });

// Menangani pencarian buku
document
  .getElementById("searchBook")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const kataKunci = document
      .getElementById("searchBookTitle")
      .value.toLowerCase();

    // Jika ada kata kunci, cari buku. Jika tidak, tampilkan semua buku
    const bukuDitemukan = kataKunci
      ? daftarBuku.filter(function (buku) {
          return buku.title.toLowerCase().includes(kataKunci);
        })
      : daftarBuku;

    const rakBelumSelesai = document.getElementById("incompleteBookList");
    const rakSudahSelesai = document.getElementById("completeBookList");

    rakBelumSelesai.innerHTML = "";
    rakSudahSelesai.innerHTML = "";

    // Tampilkan hasil pencarian
    bukuDitemukan.forEach(function (buku) {
      const bukuElement = buatElementBuku(buku);
      if (buku.isComplete) {
        rakSudahSelesai.appendChild(bukuElement);
      } else {
        rakBelumSelesai.appendChild(bukuElement);
      }
    });

    if (kataKunci && bukuDitemukan.length === 0) {
      tampilkanPesan("Tidak ada buku yang ditemukan", "warning");
    }
  });

// Jalankan fungsi tampilkan buku saat halaman dimuat
document.addEventListener("DOMContentLoaded", function () {
  tampilkanSemuaBuku();
});
