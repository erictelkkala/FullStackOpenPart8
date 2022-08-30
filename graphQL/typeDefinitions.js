const {gql} = require("apollo-server")

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

module.exports = typeDefs