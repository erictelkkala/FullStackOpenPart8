const Author = require("../models/authorModel")
const Book = require("../models/bookModel")
const mongoose = require("mongoose")

const resolvers = {
    Query: {
        bookCount: async () => Book.find({}).countDocuments(),
        authorCount: async () => Author.find({}).countDocuments(),
        allBooks: async (root, args) => {
            console.log("arguments for allBooks:", args)
            // Check author and genre are not provided
            if (args.author === undefined && args.genre === undefined) {
                await Book.find({}).then((books) => {
                    return books
                }).catch((error) => {
                    console.log("Error getting all books:", error.message)
                })
                
                // If only the author is provided, return all books by that author
            } else if (args.author !== undefined && args.genre === undefined) {
                await Book.find({ author: args.author }).then((books) => {
                    return books
                }).catch((error) => {
                    console.log("Error getting all books:", error.message)
                })
                // If only the genre is provided, return all books in that genre
            } else if (args.author === undefined && args.genre !== undefined) {
                await Book.find({ genres: args.genre }).then((books) => {
                    return books
                }).catch((error) => {
                    console.log("Error getting all books:", error.message)
                })
                // If both author and genre are provided, return all books by that author in that genre
            } else if (args.author !== undefined && args.genre !== undefined) {
                await Book.find({ author: args.author, genres: args.genre }).then((books) => {
                    return books
                }).catch((error) => {
                    console.log("Error getting all books:", error.message)
                })
            }
        },
        allAuthors: async () => await Author.find({}).then((authors) => {
            return authors
        }).catch((error) => {
            console.log("Error getting all authors:", error.message)
        }),
    },
    Author: {
        // Find the number of books by an author and return the number of occurrences
        bookCountByAuthor: async (root) => {
            return await Book.find({ author: root._id }).countDocuments()
        }
    },
    Mutation: {
        addBook: async(root, args) => {
            console.log("arguments:", args)
            // Check if the author exists
            let bookAuthor = await Author.findOne({ name: args.author })
            console.log("Author:", bookAuthor)
            
            // If the author does not exist, create a new author
            if (bookAuthor === undefined || bookAuthor === null) {
                await Author.create({ name: args.author, born: null }).then((author) => {
                    console.log("New author:", author)
                    // Assign the new author to the bookAuthor variable
                    bookAuthor = author
                }).catch((error) => {
                    console.log("Error adding author:", error.message)
                })
            }

            // Separate the _id field from the author
            const authorID = bookAuthor._id.toString()
            console.log("authorID:", authorID)
            // Create a new book object with the provided arguments
            const book = {
                title: args.title,
                published: args.published,
                author: authorID,
                _id: mongoose.Types.ObjectId(),
                genres: args.genres,
            }
            
            // Add the book to the database
            try {
                await Book.create(book)
            } catch (error) {
                console.log("Error adding book:", error.message)
            }

            // Find the book in the database and return it
            const newBook = await Book.findOne({title: args.title, published: args.published, author: authorID}).populate("author").then((book) => {
                console.log("Book @ newBook:", book)
                // Return book
                return book
            }).catch((error) => {
                console.log("Error finding book:", error.message)
            })
            return newBook
        },
        editAuthor: async (root, args) => {
            // Find the author in the authors array
            const author = await Author.findOneAndUpdate({ name: args.name }, { born: args.setBornTo }, { new: true }).then((author) => {
                console.log("Author edited to:", author)
                return author
            }).catch((error) => {
                console.log("Error updating author:", error.message)
            })
            // Don't do anything if the author does not exist
            if (author === undefined) {
                return null
            }
            // console.log(args)
            return author
        },
    },
}

module.exports = resolvers