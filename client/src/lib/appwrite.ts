import { Client, Account, Databases } from "appwrite";

const client = new Client();
client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || "https://nyc.cloud.appwrite.io/v1")
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || "6880564b002c869a2999");

export const account = new Account(client);
export const databases = new Databases(client);
export { client };