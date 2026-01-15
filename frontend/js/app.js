// ================= MAIN STATE =================
let currentFilter = "all";

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  forceCloseModal(); // 🔒 กัน modal โผล่ตอนรีเฟรช
  setupEventListeners();
  setupThemeToggle();
  restoreTheme();
  loadBooks();
});

// ================= EVENT SETUP =================
function setupEventListeners() {
  const addBtn = document.getElementById("add-btn");
  const closeBtn = document.querySelector(".close");
  const cancelBtn = document.getElementById("cancel-btn");
  const modal = document.getElementById("book-modal");
  const form = document.getElementById("book-form");

  if (addBtn) addBtn.addEventListener("click", showAddModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
  if (form) form.addEventListener("submit", handleSubmit);

  // filter buttons
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBooks(btn.dataset.filter);
    });
  });

  // click outside modal
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // ESC key close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

// ================= MODAL CONTROL =================
function forceCloseModal() {
  const modal = document.getElementById("book-modal");
  if (modal) modal.style.display = "none";
}

function showAddModal() {
  document.getElementById("modal-title").textContent = "Add New Book";
  document.getElementById("book-form").reset();
  document.getElementById("book-id").value = "";
  clearFormError();
  document.getElementById("book-modal").style.display = "flex";
}

function closeModal() {
  const modal = document.getElementById("book-modal");
  if (modal) modal.style.display = "none";
  clearFormError();
}

// ================= DARK MODE =================
function setupThemeToggle() {
  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");

    toggleBtn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

function restoreTheme() {
  const theme = localStorage.getItem("theme");
  const toggleBtn = document.getElementById("theme-toggle");

  if (theme === "dark") {
    document.body.classList.add("dark");
    if (toggleBtn) toggleBtn.textContent = "☀️ Light Mode";
  }
}

// ================= LOAD BOOKS =================
async function loadBooks(status = null) {
  try {
    showLoading();
    const data = await api.getAllBooks(status);
    displayBooks(data.books);
    updateStatistics(data.statistics);
  } catch (err) {
    alert("Failed to load books");
  } finally {
    hideLoading();
  }
}

// ================= DISPLAY =================
function displayBooks(books) {
  const container = document.getElementById("book-list");
  if (!container) return;

  if (!books.length) {
    container.innerHTML = `<div class="no-books">📚 No books found</div>`;
    return;
  }

  container.innerHTML = books.map(createBookCard).join("");
}

function createBookCard(book) {
  return `
    <div class="book-card">
      <h3>${escapeHtml(book.title)}</h3>
      <p>👤 ${escapeHtml(book.author)}</p>
      <p>🔖 ISBN: ${escapeHtml(book.isbn)}</p>
      <span class="status-badge status-${book.status}">
        ${book.status === "available" ? "✅ AVAILABLE" : "📖 BORROWED"}
      </span>

      <div class="actions">
        ${
          book.status === "available"
            ? `<button class="btn btn-success" onclick="borrowBook(${book.id})">Borrow</button>`
            : `<button class="btn btn-warning" onclick="returnBook(${book.id})">Return</button>`
        }
        <button class="btn btn-secondary" onclick="editBook(${
          book.id
        })">Edit</button>
        <button class="btn btn-danger" onclick="deleteBook(${
          book.id
        })">Delete</button>
      </div>
    </div>
  `;
}

// ================= STATS =================
function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;

  let start = 0;
  const duration = 500;
  const step = Math.max(1, Math.floor(target / 20));

  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      el.textContent = target;
      clearInterval(timer);
    } else {
      el.textContent = start;
    }
  }, duration / 20);
}

function updateStatistics(stats) {
  animateCount("stat-available", stats.available);
  animateCount("stat-borrowed", stats.borrowed);
  animateCount("stat-total", stats.total);
}

// ================= FILTER =================
function filterBooks(status) {
  currentFilter = status;

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === status);
  });

  loadBooks(status === "all" ? null : status);
}

// ================= LOADING =================
function showLoading() {
  document.getElementById("loading").style.display = "block";
  document.getElementById("book-list").style.display = "none";
}

function hideLoading() {
  document.getElementById("loading").style.display = "none";
  document.getElementById("book-list").style.display = "grid";
}

// ================= FORM =================
async function handleSubmit(e) {
  e.preventDefault();
  clearFormError();

  const id = document.getElementById("book-id").value;
  const bookData = {
    title: title.value.trim(),
    author: author.value.trim(),
    isbn: isbn.value.trim(),
  };

  try {
    id ? await api.updateBook(id, bookData) : await api.createBook(bookData);
    closeModal();
    loadBooks(currentFilter === "all" ? null : currentFilter);
  } catch (err) {
    showFormError(err.message);
  }
}

function showFormError(msg) {
  const box = document.getElementById("form-error");
  box.textContent = msg;
  box.style.display = "block";
}

function clearFormError() {
  const box = document.getElementById("form-error");
  box.textContent = "";
  box.style.display = "none";
}

// ================= ACTIONS =================
async function editBook(id) {
  try {
    const result = await api.getBookById(id);

    // ✅ ดึง book ตัวจริงออกมา
    const book = result.data ?? result;

    document.getElementById("modal-title").textContent = "Edit Book";

    document.getElementById("book-id").value = book.id;
    document.getElementById("title").value = book.title;
    document.getElementById("author").value = book.author;
    document.getElementById("isbn").value = book.isbn;

    clearFormError();
    document.getElementById("book-modal").style.display = "flex";
  } catch (err) {
    console.error(err);
    alert("Cannot load book data");
  }
}


async function borrowBook(id) {
  if (!confirm("Borrow this book?")) return;
  await api.borrowBook(id);
  loadBooks(currentFilter === "all" ? null : currentFilter);
}

async function returnBook(id) {
  if (!confirm("Return this book?")) return;
  await api.returnBook(id);
  loadBooks(currentFilter === "all" ? null : currentFilter);
}

async function deleteBook(id) {
  if (!confirm("Delete this book?")) return;
  await api.deleteBook(id);
  loadBooks(currentFilter === "all" ? null : currentFilter);
}

// ================= UTIL =================
function escapeHtml(text) {
  return text.replace(
    /[&<>"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      }[m])
  );
}
