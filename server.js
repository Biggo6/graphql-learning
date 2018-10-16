const express = require('express');
const { ApolloServer } = require('apollo-server-express');

//SOme fake data
const authors = [
    {
        id: "1",
        info: {
            name: "Joe Kelly",
            age: 32,
            gender: "M"
        }
    },
    {
        id: "2",
        info: {
            name: "Mary Jane",
            age: 27,
            gender: "F"
        }
    }
];

// The GraphQL schema in string form
const typeDefs = `
    type Author {
        id: ID!
        info: Person
    }
    type Person {
        name: String!
        age: Int
        gender: String
    }
    type Query {
        getAuthors: [Author]
        retrieveAuthor(id: ID!): Author
    }
    type DeleteMessage {
        message: String!
    }
    type Mutation {
        createAuthor(name: String!, gender: String!): Author
        updateAuthor(id: ID!, name:String, gender:String, age:Int) : Author
        deleteAuthor(id: ID!): DeleteMessage
    }
`;

// The resolvers
const resolvers = {
    Query: {
        getAuthors: () => authors,
        retrieveAuthor:(obj, { id }) => authors.find(author => author.id === id) 
    },
    Mutation: {
        createAuthor: (obj, args) => {
            const id = String(authors.length + 1);
            const { name, gender } = args;
            const newAuthor = {
                id,
                info: {
                    name,
                    gender
                }
            } 
            authors.push(newAuthor);
            return newAuthor;
        },
        updateAuthor: (obj, { id, name, gender, age}) => {
            const author = authors.find(author => author.id === id);
        
            if(author) {
                let newAuthors = authors.map(a => {
                    if(a.id === id) {
                        a.info.name = name;
                        a.info.age  = age;
                        a.info.gender = gender;
                    }
                    return a;
                });
                return newAuthors.find(au => au.id === id);
            }else {
                throw new Error('Author ID not found')
            }
        }
    }
}

const PORT = 3600;

const server = new ApolloServer({ typeDefs, resolvers});

const app = express();

server.applyMiddleware({
    app,
    path: '/graphql'
});

app.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`)
});
