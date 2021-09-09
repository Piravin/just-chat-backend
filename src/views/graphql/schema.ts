import {gql} from "apollo-server-express";

const typeDefs = gql`
    type Query {
        checkCon: String
    }
`;

export default typeDefs;