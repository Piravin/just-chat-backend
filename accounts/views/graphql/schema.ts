import {gql} from "apollo-server-express";

const typeDefs = gql`
    type Query {
        checkCon: String
        login(email: String, password: String): LoginUser
        verifyAuth: Authorized
    }

    type Authorized {
        code: Int!
        success: Boolean!
    }

    type LoginUser {
        code: Int!
        success: Boolean!
        token: String!
    }

    input UserFieldsInput {
        name: String
        email: String
        password: String
        profile: String
    }

    type User {
        name: String!
        email: String!
        profile: String!
    }

    type Mutation {
        signUpUser(input: UserFieldsInput): SignUp
    }

    type SignUp {
        code: Int!
        success: Boolean!
        message: String!
    }
`;

export default typeDefs;