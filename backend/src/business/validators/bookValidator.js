class BookValidator {
  validateBookData({ title, author, isbn }) {
    if (!title || !author || !isbn) {
      throw new Error("Title, author, and ISBN are required");
    }
  }

  validateISBN(isbn) {
    const pattern = /^(97[89])?\d{9}[\dXx]$/;
    const clean = isbn.replace(/-/g, "");
  if (!pattern.test(clean)) {
    throw new Error(
      "ISBN ไม่ถูกต้อง (ต้องเป็น ISBN-10 หรือ ISBN-13 เช่น 9780132350884)"
    );
  }
  }

  validateId(id) {
    const num = parseInt(id);
    if (isNaN(num) || num <= 0) {
      throw new Error("Invalid book ID");
    }
    return num;
  }
}

module.exports = new BookValidator();
