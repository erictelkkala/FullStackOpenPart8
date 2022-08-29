const { ApolloServer, gql } = require("apollo-server")
const { uuid } = require("uuidv4")

let authors = [
    {
        name: "Robert Martin",
        id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
        born: 1952,
    },
    {
        name: "Martin Fowler",
        id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
        born: 1963,
    },
    {
        name: "Fyodor Dostoevsky",
        id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
        born: 1821,
    },
    {
        name: "Joshua Kerievsky", // birthyear not known
        id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
    },
    {
        name: "Sandi Metz", // birthyear not known
        id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
    },
]

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

let books = [
    {
        title: "Clean Code",
        published: 2008,
        author: "Robert Martin",
        id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
        genres: ["refactoring"],
    },
    {
        title: "Agile software development",
        published: 2002,
        author: "Robert Martin",
        id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
        genres: ["agile", "patterns", "design"],
    },
    {
        title: "Refactoring, edition 2",
        published: 2018,
        author: "Martin Fowler",
        id: "afa5de00-344d-11e9-a414-719c6709cf3e",
        genres: ["refactoring"],
    },
    {
        title: "Refactoring to patterns",
        published: 2008,
        author: "Joshua Kerievsky",
        id: "afa5de01-344d-11e9-a414-719c6709cf3e",
        genres: ["refactoring", "patterns"],
    },
    {
        title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
        published: 2012,
        author: "Sandi Metz",
        id: "afa5de02-344d-11e9-a414-719c6709cf3e",
        genres: ["refactoring", "design"],
    },
    {
        title: "Crime and punishment",
        published: 1866,
        author: "Fyodor Dostoevsky",
        id: "afa5de03-344d-11e9-a414-719c6709cf3e",
        genres: ["classic", "crime"],
    },
    {
        title: "The Demon ",
        published: 1872,
        author: "Fyodor Dostoevsky",
        id: "afa5de04-344d-11e9-a414-719c6709cf3e",
        genres: ["classic", "revolution"],
    },
]

const typeDefs = gql`
    type Author {
        name: String!
        born: Int
        id: ID!
        bookCountByAuthor: Int!
    }

    type Book {
        title: String!
        published: Int!
        author: String!
        id: ID!
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
        bookCount: () => books.length,
        authorCount: () => authors.length,
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
        addBook(root, args) {
            // Create a new book object with the provided arguments
            const book = {
                title: args.title,
                published: args.published,
                author: args.author,
                id: uuid(),
                genres: args.genres,
            }
            // Check if the author exists
            const author = authors.find((author) => author.name === args.author)
            if (author === undefined) {
                // If the author does not exist, add the author to the authors array
                authors.push({
                    name: args.author,
                    born: null,
                })
            }
            // Add the book to the books array
            books.push(book)
            return book
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
