// --- Variabel Global Game ---
let score = 0; // Skor pemain
let misses = 0; // Jumlah pukulan meleset
let gameActive = false; // Status game (berjalan/tidak)
let lastHole; // Untuk memastikan tikus tidak muncul di lubang yang sama berturut-turut
let gameInterval; // Interval untuk kemunculan tikus
const POP_UP_TIME_MIN = 1000; // Waktu minimum tikus muncul (ms), diatur sedikit lebih cepat
const POP_UP_TIME_MAX = 2000; // Waktu maksimum tikus muncul (ms), diatur sedikit lebih cepat
const WIN_SCORE = 10; // Skor untuk memenangkan game
const MAX_MISSES = 5; // Jumlah meleset maksimum sebelum game over
const NUMBER_OF_HOLES = 9; // Jumlah lubang dalam game (akan dibuat secara dinamis)

// --- Elemen DOM ---
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const scoreSpan = document.getElementById("score");
const missesSpan = document.getElementById("misses");
const gameArea = document.getElementById("game-area");
const startButton = document.getElementById("start-button");
const exitGameButton = document.getElementById("exit-game-button");

// Pop-up Kemenangan
const winPopup = document.getElementById("win-popup");
const winMessageElement = document.getElementById("win-message");
const closeWinPopupButton = document.getElementById("close-win-popup");

// Pop-up Kekalahan
const losePopup = document.getElementById("lose-popup");
const restartGameButton = document.getElementById("restart-game-button");
const backToMenuButton = document.getElementById("back-to-menu-button");

// Pop-up Konfirmasi Keluar Game
const exitConfirmPopup = document.getElementById("exit-confirm-popup");
const confirmExitYesButton = document.getElementById("confirm-exit-yes");
const confirmExitNoButton = document.getElementById("confirm-exit-no");

// --- Fungsi Inisialisasi Game ---

// Memuat gambar tikus di awal untuk mencegah lag
const mouseImage = new Image();
// Path diubah menjadi 'mice.png' karena script.js berada di direktori yang sama dengan mice.png
mouseImage.src = "mice.png";
mouseImage.onerror = () => {
  console.error(
    "Gagal memuat gambar tikus. Pastikan path 'mice.png' sudah benar (berada di direktori yang sama dengan game.html dan script.js) dan nama filenya cocok (case-sensitive).",
  ); // Fallback: Anda bisa mengganti dengan emoji atau placeholder jika gambar tidak dimuat
  // Misalnya: document.querySelectorAll('.mice').forEach(img => img.alt = "🐭");
};

/**
 * Membuat elemen lubang dan tikus secara dinamis di area permainan.
 * Ini memastikan fleksibilitas dalam jumlah lubang.
 */
function createHoles() {
  gameArea.innerHTML = ""; // Bersihkan area game
  for (let i = 0; i < NUMBER_OF_HOLES; i++) {
    const hole = document.createElement("div");
    hole.classList.add("hole");
    hole.dataset.holeId = i; // Beri ID data untuk identifikasi

    const mouse = document.createElement("img");
    mouse.src = mouseImage.src; // Gunakan sumber gambar yang sudah dimuat
    mouse.alt = "Tikus";
    mouse.classList.add("mice");
    mouse.dataset.status = "hidden"; // Status tikus
    mouse.dataset.isWhacked = "false"; // Tambahan: Status apakah tikus sudah dipukul

    // Tambahkan event listener untuk setiap LUBANG, bukan lagi pada gambar tikus langsung
    // Ini membuat seluruh area lubang menjadi clickable saat tikus muncul
    hole.addEventListener("click", whack); // Perubahan di sini

    hole.appendChild(mouse);
    gameArea.appendChild(hole);
  }
}

/**
 * Menginisialisasi status game dan tampilan UI.
 */
function initializeGame() {
  score = 0;
  misses = 0;
  scoreSpan.textContent = score;
  missesSpan.textContent = misses;
  gameActive = false; // Sembunyikan semua pop-up

  winPopup.classList.add("hidden");
  losePopup.classList.add("hidden");
  exitConfirmPopup.classList.add("hidden"); // Tampilkan layar awal

  startScreen.classList.remove("hidden");
  startScreen.classList.add("active");
  gameScreen.classList.remove("active");
  gameScreen.classList.add("hidden");

  createHoles(); // Buat ulang lubang setiap kali inisialisasi
}

// --- Logika Permainan ---

/**
 * Mengambil lubang acak untuk kemunculan tikus, memastikan tidak sama dengan lubang terakhir.
 * @returns {HTMLElement} Elemen lubang yang dipilih.
 */
function randomHole() {
  const holes = document.querySelectorAll(".hole");
  const idx = Math.floor(Math.random() * holes.length);
  const hole = holes[idx];
  if (hole === lastHole) {
    return randomHole(); // Rekursif jika lubang sama
  }
  lastHole = hole;
  return hole;
}

/**
 * Mengatur waktu kemunculan tikus secara acak.
 * @returns {number} Waktu kemunculan dalam milidetik.
 */
function randomTime(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

/**
 * Membuat tikus "mengintip" dari lubang.
 */
function peep() {
  if (!gameActive) {
    return; // Hentikan jika game tidak aktif
  }

  const time = randomTime(POP_UP_TIME_MIN, POP_UP_TIME_MAX);
  const hole = randomHole();
  const mouse = hole.querySelector(".mice"); // Pastikan tikus belum dipukul atau sudah turun sebelum muncul lagi

  mouse.dataset.isWhacked = "false"; // Reset status pukulan
  hole.classList.add("up");
  mouse.dataset.status = "up"; // Atur timer agar tikus kembali ke bawah

  const timeoutId = setTimeout(() => {
    // Hanya tambahkan miss jika tikus belum dipukul (isWhacked masih 'false')
    if (mouse.dataset.isWhacked === "false") {
      misses++;
      missesSpan.textContent = misses;
      checkGameOver(); // Periksa kondisi game over
    }
    // Hapus class 'up' dari hole
    hole.classList.remove("up");
    mouse.dataset.status = "hidden";

    peep(); // Panggil peep lagi untuk tikus berikutnya
  }, time); // Simpan timeoutId di data-attribute hole agar bisa dibersihkan saat dipukul

  hole.dataset.timeoutId = timeoutId;
}

/**
 * Menangani event klik saat tikus dipukul.
 * @param {Event} e - Objek event klik.
 */
function whack(e) {
  // e.target sekarang bisa jadi 'hole' atau 'mice' jika klik tepat di gambar
  const hole = e.target.closest(".hole"); // Ambil elemen hole terdekat
  const mouse = hole.querySelector(".mice"); // Ambil elemen mouse di dalam hole ini
  // Memastikan game aktif, ini adalah klik asli, hole memiliki class 'up', dan status mouse adalah 'up'

  if (
    !gameActive ||
    !e.isTrusted ||
    !hole.classList.contains("up") ||
    mouse.dataset.status !== "up"
  )
    return;

  score++;
  scoreSpan.textContent = score;
  mouse.dataset.isWhacked = "true"; // Set status isWhacked menjadi 'true' untuk mouse ini
  // Hapus class 'up' dari hole
  hole.classList.remove("up");
  mouse.dataset.status = "hidden"; // Update status tikus di dalam hole ini
  // Hapus timeout yang membuat tikus turun secara otomatis

  if (hole && hole.dataset.timeoutId) {
    clearTimeout(parseInt(hole.dataset.timeoutId)); // Hapus timeout yang tersimpan
  }

  checkGameWin(); // Periksa kondisi kemenangan

  // Panggil peep() lagi untuk membuat tikus baru muncul setelah dipukul
  if (gameActive) {
    // Hanya panggil jika game masih aktif (belum menang atau kalah)
    peep();
  }
}

/**
 * Memulai permainan.
 */
function startGame() {
  initializeGame(); // Reset game state
  startScreen.classList.remove("active");
  startScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  gameScreen.classList.add("active");

  gameActive = true;
  peep(); // Mulai tikus muncul
}

/**
 * Menghentikan permainan (membersihkan interval dan mengatur gameActive ke false).
 */
function stopGame() {
  gameActive = false; // Clear all existing timeouts for mice that are 'up'
  document.querySelectorAll(".hole").forEach((hole) => {
    const mouse = hole.querySelector(".mice");
    if (hole.dataset.timeoutId) {
      clearTimeout(parseInt(hole.dataset.timeoutId));
    }
    // Pastikan class 'up' dihapus dari hole
    hole.classList.remove("up");
    mouse.dataset.status = "hidden";
    mouse.dataset.isWhacked = "false"; // Reset isWhacked saat game berhenti/ulang
  });
}

/**
 * Memeriksa apakah pemain sudah mencapai skor kemenangan.
 */
function checkGameWin() {
  if (score >= WIN_SCORE) {
    stopGame();
    displayWinMessage();
  }
}

/**
 * Memeriksa apakah pemain sudah mencapai jumlah meleset maksimum.
 */
function checkGameOver() {
  if (misses >= MAX_MISSES) {
    stopGame();
    losePopup.classList.remove("hidden");
  }
}

/**
 * Menampilkan pesan kemenangan acak (termasuk pantun alay) menggunakan Gemini API.
 */
async function displayWinMessage() {
  winPopup.classList.remove("hidden"); // Tampilkan pop-up loading/kosong dulu
  // Array pantun romantis alay yang Anda berikan

  const pantunRomantis = [
    "Makan soto pakai tomat,\nLiat kamu jantungku lompat.\nBoleh gak aku jadi semangat,\nDalam hidup kamu yang penat?",
    "Jalan-jalan ke kota Paris,\nNaik vespa sambil nangis.\nCintaku ini bukan gratis,\nBayarnya cukup kamu manis 😘",
    "Beli semangka di pinggir jalan,\nIsinya merah, rasanya manja.\nKamu tuh kayak setan,\nTapi setan yang bikin jatuh cinta 🥴",
    "Nonton drama sambil makan tahu,\nMuka kamu tuh kayak anime Naruto.\nBoleh gak aku curi waktu,\nBuat nemenin kamu sampe tua gitu?",
    "Burung gagak hinggap di rimba,\nAku naksir kamu, sumpah demi mama.\nKamu itu bikin trauma,\nTapi trauma pengen dicinta lama-lama 😆",
    "Naik becak bareng Pak Joko,\nLiat kamu bawaannya pengen nyoko.\nCintaku ini serius, loh,\nWalau gaya chat-ku kayak bocah SD nyari jodoh.",
    "Kucing oren lagi rebahan,\nAku sayang kamu tapi malu bilang.\nKalo kamu nyari ketulusan,\nSini aku kasih, tapi balesin dong sayang! 😜",
    "Beli ciki dapet hadiah,\nAku sayang kamu, itu rahasia.\nTapi kalo kamu nanya-nya tiap hari,\nAku ngaku kok, kamu pacarku dari mimpi 🥹",
    "Main game sampe pagi,\nTapi inget kamu tiap detik di hati.\nJangan suka godain orang lagi,\nNanti hatiku mogok kayak motor mati.",
    "Makan cilok di pinggir kali,\nKamu lewat, langsung hati bergetar gini.\nKalo kamu punya hati,\nTolong deh, titipin kuncinya ke aku, sini! 😍",
    "Mie ayam disiram kuah pedas,\nLiat kamu auto speechless.\nCintaku tuh gak bisa dikemas,\nTapi bisa kamu simpan di address 😏",
    "Naik motor sambil nyanyi,\nTiap lihat kamu aku jadi aneh sendiri.\nMau bilang suka tapi malu,\nJadi aku cuma chat: “hii kamu udah makan blm? 🥺”",
    "Pergi ke sawah nyari kodok,\nLiat kamu bawaannya pengen ngedok.\nBukan modus bukan ngelawak,\nTapi kamu cakepnya kayak karakter webtoon berbakat 🥵",
    "Minum kopi sambil rebahan,\nKamu tuh kayak casing HP idaman.\nNempel terus tiap harian,\nBikin hati ini rawan ketagihan!",
    "Burung nuri terbang ke atas,\nKalo kamu senyum aku yang panas.\nBukan cemburu, bukan was-was,\nTapi takut kamu direbut orang pas aku lagi malas �",
    "Makan nasi campur jengkol,\nCintaku ke kamu tuh ga bisa dikontrol.\nKalo kamu ngilang, langsung error,\nMacam WiFi di rumah pas hujan deras horor!",
    "Liat kamu pas lagi ngambek,\nRasanya pengen jadi boneka doraemon sek.\nBiar bisa nemenin kamu terus,\nWalau kadang muka kamu kayak virus 😭",
    "Beli cilok dapet sambel,\nKamu senyum aku langsung bebel.\nBukan bego, bukan telat mikir,\nTapi cinta sama kamu tuh kayak chip rusak dikit-dikit bikin error.",
    "Main lato-lato sampe pagi,\nMikirin kamu kok malah jadi puisi.\nMau ngomong tapi nyali nyempil,\nBoleh gak aku jadi ‘milik kamu’ tanpa skill?",
    "Ngopi hitam di warung Udin,\nLiat kamu bawaannya pengen bikin din-din.\nAku sih gak bisa janjiin dunia,\nTapi bisa janjiin chat tiap pagi: “selamat tidur ya cinta” 😚",
  ];

  const randomPantun =
    pantunRomantis[Math.floor(Math.random() * pantunRomantis.length)];
  winMessageElement.textContent = randomPantun;

  // Tidak perlu memanggil Gemini API lagi karena pantun sudah statis
  // const prompts = [ ... ];
  // const prompt = prompts[Math.floor(Math.random() * prompts.length)];
  // let chatHistory = [];
  // chatHistory.push({ role: "user", parts: [{ text: prompt }] });
  // const payload = { contents: chatHistory };
  // const apiKey = "";
  // const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  // winMessageElement.textContent = "Sedang membuat pesan romantis...";
  // try { /* ... fetch logic ... */ } catch (error) { /* ... error handling ... */ }
}

// --- Event Listeners ---

// Saat DOM selesai dimuat, inisialisasi game
document.addEventListener("DOMContentLoaded", initializeGame);

// Tombol Mulai Game
startButton.addEventListener("click", startGame);

// Tombol Keluar Game (di dalam game screen)
exitGameButton.addEventListener("click", () => {
  if (gameActive) {
    // Jika game sedang berjalan, tampilkan konfirmasi
    exitConfirmPopup.classList.remove("hidden");
  } else {
    // Jika game tidak aktif, langsung kembali ke menu
    initializeGame();
  }
});

// Tombol Tutup Pop-up Kemenangan
closeWinPopupButton.addEventListener("click", () => {
  winPopup.classList.add("hidden");
  initializeGame(); // Kembali ke menu awal setelah kemenangan
});

// Tombol Coba Lagi (dari pop-up kekalahan)
restartGameButton.addEventListener("click", startGame);

// Tombol Kembali ke Menu (dari pop-up kekalahan)
backToMenuButton.addEventListener("click", initializeGame);

// Konfirmasi Keluar Game
confirmExitYesButton.addEventListener("click", () => {
  stopGame(); // Hentikan game
  exitConfirmPopup.classList.add("hidden");
  initializeGame(); // Kembali ke menu awal
});

confirmExitNoButton.addEventListener("click", () => {
  exitConfirmPopup.classList.add("hidden"); // Sembunyikan pop-up konfirmasi
});
