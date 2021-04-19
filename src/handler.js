const { nanoid } = require('nanoid');
const bookshelf = require('./bookshelf');
const { convertNumberToBoolean } = require('./utils');

const getAllBooksHandler = (request, h) => {
  const { reading, finished, name } = request.query;

  let filteredBookShelf = bookshelf.slice();

  if (reading !== undefined) {
    filteredBookShelf = filteredBookShelf.filter(
      (book) => book.reading === convertNumberToBoolean(reading),
    );
  }
  if (finished !== undefined) {
    filteredBookShelf = filteredBookShelf.filter(
      (book) => book.finished === convertNumberToBoolean(finished),
    );
  }
  if (name !== undefined) {
    filteredBookShelf = filteredBookShelf.filter(
      (book) => book.name.toLowerCase().includes(name.toLowerCase()),
    );
  }

  const books = filteredBookShelf.map((book) => ({
    id: book.id,
    name: book.name,
    publisher: book.publisher,
  }));

  const response = h.response({
    status: 'success',
    data: {
      books,
    },
  });
  response.code(200);
  return response;
};

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const requestedBook = bookshelf.find((book) => book.id === bookId);

  if (requestedBook) {
    return {
      status: 'success',
      data: {
        book: requestedBook,
      },
    };
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

const addBookHandler = (request, h) => {
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;

  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;
  const finished = pageCount === readPage;

  if (!name) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  bookshelf.push(newBook);

  const isSuccess = bookshelf.filter((note) => note.id === id).length > 0;

  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }

  const response = h.response({
    status: 'error',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};

const updateBookHandler = (request, h) => {
  const { bookId } = request.params;
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;

  if (!name) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const requestedBookIndex = bookshelf.findIndex((book) => book.id === bookId);

  if (requestedBookIndex !== -1) {
    const updatedAt = new Date().toISOString();
    const finished = pageCount === readPage;

    const updatedBook = {
      ...bookshelf[requestedBookIndex],
      updatedAt,
      finished,
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
    };

    bookshelf[requestedBookIndex] = updatedBook;

    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

const deleteBookHandler = (request, h) => {
  const { bookId } = request.params;

  const requestedBookIndex = bookshelf.findIndex((book) => book.id === bookId);

  if (requestedBookIndex !== -1) {
    bookshelf.splice(requestedBookIndex, 1);

    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  updateBookHandler,
  deleteBookHandler,
};
