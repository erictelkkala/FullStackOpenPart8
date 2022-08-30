const { ApolloServer, gql } = require("apollo-server")
const mongoose = require("mongoose")
const Author = require("./models/authorModel")
const Book = require("./models/bookModel")
require("dotenv").config()

const MONGODB_URI = process.env.MONGODB_URI

console.log("Connecting to:", MONGODB_URI)

mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB")
    })
    .catch((error) => {
        console.log("Error connection to MongoDB:", error.message)
    })

let authors = Author.find({}).then((authors) => {
    return authors
}).catch((error) => {
    console.log("Error getting authors:", error.message)
})

/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 *
 * English:
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
 *
 * Spanish:
 * Podría tener más sentido asociar un libro con su autor almacenando la id del autor en el contexto del libro en lugar del nombre del autor
 * Sin embargo, por simplicidad, almacenaremos el nombre del autor en conección con el libro
 */

let books = Book.find({}).then((books) => {
    return books
}).catch((error) => {
    console.log("Error getting books:", error.message)
})

const typeDefs = gql`
    type Author {
        name: String!
        born: Int
        _id: ID!
        bookCountByAuthor: Int!
    }

    type Book {
        title: String!
        published: Int!
        author: Author!
        _id: ID!
        genres: [String!]!
    }

    type Query {
        bookCount: Int!
        authorCount: Int!
        allBooks(author: String, genre: String): [Book!]!
        allAuthors: [Author!]!
    }

    type Mutation {
        addBook(
            title: String!
            published: Int!
            author: String!
            genres: [String!]!
        ): Book
        editAuthor(name: String!, setBornTo: Int!): Author
    }
`

const resolvers = {
    Query: {
        bookCount: async () => Book.find({}).countDocuments(),
        authorCount: async () => Author.find({}).countDocuments(),
        allBooks(root, args) {
            // console.log(args.author)
            // Check author and genre are not provided
            if (args.author === undefined && args.genre === undefined) {
                return books
                // If only the author is provided, return all books by that author
            } else if (args.author !== undefined && args.genre === undefined) {
                return books.filter((book) => book.author === args.author)
                // If only the genre is provided, return all books in that genre
            } else if (args.author === undefined && args.genre !== undefined) {
                return books.filter((book) => book.genres.includes(args.genre))
                // If both author and genre are provided, return all books by that author in that genre
            } else if (args.author !== undefined && args.genre !== undefined) {
                return books.filter(
                    (book) =>
                        book.author === args.author &&
                        book.genres.includes(args.genre)
                )
            }
        },
        allAuthors: () => authors,
    },
    Author: {
        // Find the number of books by an author and return the number of occurrences
        bookCountByAuthor: (root) =>
            books.filter((book) => book.author === root.name).length,
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
        editAuthor(root, args) {
            // Find the author in the authors array
            const author = authors.find((author) => author.name === args.name)
            // console.log(args)
            // Don't do anything if the author does not exist
            if (author === undefined) {
                return null
            }
            // Note the argument variable name
            author.born = args.setBornTo
            return author
        },
    },
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
})

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`)
})
