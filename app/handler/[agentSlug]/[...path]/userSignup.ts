import { generateRandomString } from "from-anywhere";

export const userSignup = async (context: any) => {
  return {
    authToken: generateRandomString(64),
  };
};
