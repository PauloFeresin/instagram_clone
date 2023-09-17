const { MongoClient } = require("mongodb");

// MongoDB connection URI
const uri =
  "mongodb+srv://pauloferesin:Smarters%402023@meucluster.mfvzhcx.mongodb.net/?retryWrites=true&w=majority";

// Create a new MongoClient instance
const client = new MongoClient(uri, {});

// Function to connect to MongoDB
async function connMongoDB() {
  try {
    // Connect the client to the MongoDB server
    await client.connect();
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

// Export the connected client and the connect function
module.exports = {
  client,
  connMongoDB,
};
