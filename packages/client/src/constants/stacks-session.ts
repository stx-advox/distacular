import { Configuration } from "@stacks/blockchain-api-client";
import { AppConfig, UserSession } from "@stacks/connect-react";

export const appConfig = new AppConfig(["store_write", "publish_data"]);

export const userSession = new UserSession({ appConfig });

export const apiConfig = new Configuration({
  basePath: process.env.REACT_APP_STACKS_URL,
});
