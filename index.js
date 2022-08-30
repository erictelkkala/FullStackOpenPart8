const { ApolloServer } = require("apollo-server")
const mongoose = require("mongoose")

const typeDefs = require("./graphQL/typeDefinitions")
const resolvers = require("./graphQL/resolvers")
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

const server = new ApolloServer({
    typeDefs,
    resolvers,
})

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`)
})
