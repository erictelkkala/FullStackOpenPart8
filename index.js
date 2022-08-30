const { ApolloServer } = require("apollo-server")
const mongoose = require("mongoose")

const typeDefs = require("./graphQL/typeDefinitions")
const resolvers = require("./graphQL/resolvers")
require("dotenv").config()

const JWT_SECRET = process.env.JWT_SECRET
const jwt = require("jsonwebtoken")
const User = require("./models/userModel")

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
    context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null
        if (auth && auth.toLowerCase().startsWith("bearer ")) {
            const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET)
            const currentUser = await User.findById(decodedToken.id)
            return { currentUser }
        }
    }
})

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`)
})
