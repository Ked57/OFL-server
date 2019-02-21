const resolvers = {
  Query: {
    hello: (parent: any, { ...args }: any, { authorized }: any) => {
      return "context";
    }
  }
};

export default resolvers;
