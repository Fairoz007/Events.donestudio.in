export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN || "https://clerk.d-one-studio.com",
      applicationID: "convex",
    },
  ],
};
