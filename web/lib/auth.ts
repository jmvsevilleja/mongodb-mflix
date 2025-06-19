import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `
                mutation Login($input: LoginInput!) {
                  login(input: $input) {
                    accessToken
                    refreshToken
                    user {
                      id
                      name
                      email
                      profilePicture
                    }
                  }
                }
              `,
              variables: {
                input: {
                  email: credentials.email,
                  password: credentials.password,
                },
              },
            }),
          });

          const data = await response.json();

          if (data.errors) {
            throw new Error(data.errors[0].message);
          }

          const { accessToken, refreshToken, user } = data.data.login;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.profilePicture,
            accessToken,
            refreshToken,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          throw new Error(
            error instanceof Error
              ? error.message
              : "An unexpected error occurred. Please try again."
          );
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in with Google
      if (account?.provider === "google" && user) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `
                mutation GoogleLogin($idToken: String!) {
                  googleLogin(idToken: $idToken) {
                    accessToken
                    refreshToken
                    user {
                      id
                      name
                      email
                      profilePicture
                    }
                  }
                }
              `,
              variables: {
                idToken: account.id_token,
              },
            }),
          });

          const data = await response.json();

          if (data.errors) {
            throw new Error(data.errors[0].message);
          }

          const {
            accessToken,
            refreshToken,
            user: googleUser,
          } = data.data.googleLogin;

          token.accessToken = accessToken;
          token.refreshToken = refreshToken;
          token.id = googleUser.id;
        } catch (error) {
          console.error("Google login error:", error);
        }
      }

      // Initial sign in with credentials
      if (user && "accessToken" in user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.id = user.id;
      }

      // Check if access token needs to be refreshed
      if (token.accessToken) {
        const tokenExpiry = JSON.parse(
          atob(token.accessToken.split(".")[1])
        ).exp;
        const shouldRefresh =
          Math.floor((tokenExpiry * 1000 - Date.now()) / 1000) < 60;

        if (shouldRefresh && token.refreshToken) {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                query: `
                  mutation RefreshTokens($userId: String!, $refreshToken: String!) {
                    refreshTokens(userId: $userId, refreshToken: $refreshToken) {
                      accessToken
                      refreshToken
                      user {
                        id
                        name
                        email
                        profilePicture
                      }
                    }
                  }
                `,
                variables: {
                  userId: token.id,
                  refreshToken: token.refreshToken,
                },
              }),
            });

            const data = await response.json();
            if (!data.errors) {
              token.accessToken = data.data.refreshTokens.accessToken;
              token.refreshToken = data.data.refreshTokens.refreshToken;
            } else {
              throw new Error(data.errors[0].message);
            }
          } catch (error) {
            throw error;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;

        if (token.id) {
          session.user.id = token.id as string;
        }
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirect to profile page after successful login
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/profile`;
      }
      // Allow relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: {
    async signOut({ token }) {
      console.log("signOut event triggered");
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.accessToken}`,
          },
          body: JSON.stringify({
            query: `
              mutation Logout {
                logout
              }
            `,
          }),
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};