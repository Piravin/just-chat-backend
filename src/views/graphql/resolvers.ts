const resolvers = {
    Query: {
        checkCon: () => {
            return "Hello from graphql";
        }
    }
};

export default resolvers;