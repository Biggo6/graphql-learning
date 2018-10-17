const  {GraphQLServer, PubSub} = require('graphql-yoga');

const pubsub = new PubSub();

var records = [];

const typeDefs = `
    type Query {
        fetchRecords: [String]
    }
    type Mutation{
        createRecord(recordData: String!): String!
        updateRecord(recordIndex: Int!, recordName: String!) : String!
    }
    type Subscription {
        newRecord: String
    }
`;

const RECORD_CHANNEL = "RECORDS";

const resolvers = {
    Query: {
        fetchRecords: () => records
    },
    Mutation: {
        createRecord: (obj, { recordData}) => {
            records.push(recordData);
            pubsub.publish(RECORD_CHANNEL, {newRecord: recordData});
            return `New record created: ${recordData}`;
        }
    },
    Subscription: {
        newRecord: {
            subscribe : (parent, args, {pubsub}) => {
                return pubsub.asyncIterator(RECORD_CHANNEL)
            }
        }
    }
};

const server = new GraphQLServer({typeDefs, resolvers, context: { pubsub }});
server.start(() => {
    console.log('Running!...')
})