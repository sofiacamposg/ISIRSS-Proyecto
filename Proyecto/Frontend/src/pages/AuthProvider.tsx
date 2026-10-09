import type { AuthProvider } from "react-admin";

export const authProvider: AuthProvider = {
  async login({ username }) {
    localStorage.setItem("username", username);
  },

  async logout() {
    localStorage.removeItem("username");
  },

  async checkError({ status }: { status: number }) {
    if (status === 401 || status === 403) {
      localStorage.removeItem("username");
      throw new Error("Session expired");
    }
  },

  async checkAuth() {
    return Promise.resolve();
  },
};