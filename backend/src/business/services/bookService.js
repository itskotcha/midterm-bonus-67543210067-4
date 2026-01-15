const bookRepository = require("../../data/repositories/bookRepository");
const bookValidator = require("../validators/bookValidator");

class BookService {
  async getAllBooks(status) {
    const books = await bookRepository.findAll(status);

    const available = books.filter((b) => b.status === "available").length;
    const borrowed = books.filter((b) => b.status === "borrowed").length;

    return {
      books,
      statistics: {
        available,
        borrowed,
        total: books.length,
      },
    };
  }

  async getBookById(id) {
    const validId = bookValidator.validateId(id);
    const book = await bookRepository.findById(validId);

    if (!book) throw new Error("Book not found");
    return book;
  }

  async createBook(data) {
    bookValidator.validateBookData(data);
    bookValidator.validateISBN(data.isbn);

    try {
      return await bookRepository.create(data);
    } catch (error) {
      // ✅ แปลง Database error → Business error
      if (error.message.includes("UNIQUE")) {
        throw new Error("ISBN นี้มีอยู่ในระบบแล้ว");
      }
      throw error;
    }
  }

  async updateBook(id, data) {
    const validId = bookValidator.validateId(id);
    bookValidator.validateBookData(data);
    bookValidator.validateISBN(data.isbn);

    const book = await bookRepository.findById(validId);
    if (!book) throw new Error("Book not found");

    try {
      return await bookRepository.update(validId, data);
    } catch (error) {
      // ✅ กัน ISBN ซ้ำตอนแก้ไข
      if (error.message.includes("UNIQUE")) {
        throw new Error("ISBN นี้มีอยู่ในระบบแล้ว");
      }
      throw error;
    }
  }

  async borrowBook(id) {
    const validId = bookValidator.validateId(id);
    const book = await bookRepository.findById(validId);

    if (!book) throw new Error("Book not found");
    if (book.status === "borrowed") {
      throw new Error("Book is already borrowed");
    }

    return await bookRepository.updateStatus(validId, "borrowed");
  }

  async returnBook(id) {
    const validId = bookValidator.validateId(id);
    const book = await bookRepository.findById(validId);

    if (!book) throw new Error("Book not found");
    if (book.status !== "borrowed") {
      throw new Error("Book is not borrowed");
    }

    return await bookRepository.updateStatus(validId, "available");
  }

  async deleteBook(id) {
    const validId = bookValidator.validateId(id);
    const book = await bookRepository.findById(validId);

    if (!book) throw new Error("Book not found");
    if (book.status === "borrowed") {
      throw new Error("Cannot delete borrowed book");
    }

    return await bookRepository.delete(validId);
  }
}

module.exports = new BookService();
