import { config } from "dotenv";
import { connect } from "mongoose";

config();

const credentials = process.env.CERT_FILE_PATH;
export async function connectDB() {
  try {
    await connect(process.env.MONGO_URI!, {
      sslKey: credentials,
      sslCert: credentials,
    });
    console.log("connected!");
    // perform actions using client
  } catch (e) {
    console.log(e);
    // Ensures that the client will close when you finish/error
  }
}
