const { GraphQLServer } = require('graphql-yoga')
const { Prisma } = require('prisma-binding')

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

const APP_SECRET = "super_secret123";

const resolvers = {
  Query: {
    fetchAllBooks: (parent, args, ctx, info) => {
      return ctx.db.query.books({}, info);
    }
  },
  Mutation: {
    createBook: (parent, args, ctx, info) => {
      const { title, description } = args;

      return ctx.db.mutation.createBook(
        {data: {title, description}},
        info
      )
    },
    signUpUser: async (parent, args, context, info) => {
      const password = await bcrypt.hash(args.password, 10);
      const user = await context.db.mutation.createUser({
        data: {
          ...args, password
        }
      });
      return user;
    },

    loginUser: async (parent, args, context, info) => {
      const user = await context.db.query.user({
        where: { email: args.email }
      });
      if(!user) {
        throw new Error('User no found');
      }

      const valid = await bcrypt.compare(args.password, user.password);

      if(!user) {
        throw new Error('Invalid email password combineee...');
      }


      const token = jwt.sign({
        userId: user.id
      }, APP_SECRET);

      return {
        token,
        user
      };

    }
  }
}

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    db: new Prisma({
      typeDefs: 'src/generated/prisma.graphql', // the auto-generated GraphQL schema of the Prisma API
      endpoint: 'https://eu1.prisma.sh/public-crocusringer-910/prisma-books/dev', // the endpoint of the Prisma API
      debug: true, // log all GraphQL queries & mutations sent to the Prisma API
      // secret: 'mysecret123', // only needed if specified in `database/prisma.yml`
    }),
  }),
})

server.start(() => console.log('Server is running on http://localhost:4000'))
