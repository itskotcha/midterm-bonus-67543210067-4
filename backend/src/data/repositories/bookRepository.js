const db = require("../database/connection");

class BookRepository {
  async findAll(status) {
    return new Promise((resolve, reject) => {
      let sql = "SELECT * FROM books";
      let params = [];

      if (status) {
        sql += " WHERE status = ?";
        params.push(status);
      }

      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async findById(id) {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM books WHERE id = ?", [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async create({ title, author, isbn }) {
    return new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO books (title, author, isbn) VALUES (?, ?, ?)",
        [title, author, isbn],
        function (err) {
          if (err) reject(err);
          else {
            db.get(
              "SELECT * FROM books WHERE id = ?",
              [this.lastID],
              (err, row) => {
                if (err) reject(err);
                else resolve(row);
              }
            );
          }
        }
      );
    });
  }

  async update(id, { title, author, isbn }) {
    return new Promise((resolve, reject) => {
      db.run(
        "UPDATE books SET title = ?, author = ?, isbn = ? WHERE id = ?",
        [title, author, isbn, id],
        (err) => {
          if (err) reject(err);
          else {
            db.get("SELECT * FROM books WHERE id = ?", [id], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          }
        }
      );
    });
  }

  async updateStatus(id, status) {
    return new Promise((resolve, reject) => {
      db.run(
        "UPDATE books SET status = ? WHERE id = ?",
        [status, id],
        (err) => {
          if (err) reject(err);
          else {
            db.get("SELECT * FROM books WHERE id = ?", [id], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          }
        }
      );
    });
  }

  async delete(id) {
    return new Promise((resolve, reject) => {
      db.run("DELETE FROM books WHERE id = ?", [id], (err) => {
        if (err) reject(err);
        else resolve({ message: "Book deleted successfully" });
      });
    });
  }
}

module.exports = new BookRepository();
