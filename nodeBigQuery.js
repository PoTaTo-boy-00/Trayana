// Install: npm install @google-cloud/bigquery
require("dotenv").config();

// Create dataset for Indian flood data
const { BigQuery } = require("@google-cloud/bigquery");
const bigquery = new BigQuery();

async function createIndiaDataset() {
  const [dataset] = await bigquery.createDataset("india_flood_data");
  console.log(`Dataset ${dataset.id} created for Indian flood data.`);
}
createIndiaDataset();
