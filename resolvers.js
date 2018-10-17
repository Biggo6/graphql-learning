const authors   = require('./auhor')

const {PubSub} = require('apollo-server-express');

const pubsub = new PubSub();

const AUTHORS_TOPIC = "newAuthor";


// The resolvers
const resolvers = {
    Query: {
        getAuthors: () => authors,
        retrieveAuthor:(obj, { id }) => authors.find(author => author.id === id) 
    },
    Subscription: {
        createAuthorWithSubscription: {
            subscribe: () => pubsub.asyncIterator(AUTHORS_TOPIC)
        }
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
            pubsub.publish(AUTHORS_TOPIC,  { createAuthorWithSubscription: newAuthor })
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
        },
        deleteAuthor: (obj, {id}) => {
            const author = authors.find(author => author.id === id);
            if(author) {
                let newAuthors = authors.map(a => {
                    if(a.id !== id) {
                       return a;
                    }
                });
                authors = [...newAuthors];
                return {
                    id,
                    message: "Deleted!"
                }
            }else {
                throw new Error('Author ID not found') 
            }
        } 
    }
}

module.exports = resolvers;