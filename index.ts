import { ServerApiVersion } from "mongodb";

import { config } from "dotenv";

config();
import { connect } from "mongoose";
const credentials = process.env.CERT_FILE_PATH;

async function run() {
  try {
    await connect(process.env.MONGO_URI!, {
      sslKey: credentials,
      sslCert: credentials,
      serverApi: ServerApiVersion.v1,
    });
    console.log("connected!");
    // perform actions using client
  } catch (e) {
    console.log(e);
    // Ensures that the client will close when you finish/error
  }
}

run().catch(console.dir);
