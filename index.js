const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

// Create an Express application
const app = express();

// Use body-parser middleware to parse JSON and URL-encoded bodies
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Use cors middleware to enable CORS
app.use(cors());

// Example route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Example POST route
app.post("/get-data", async (req, res) => {
  const data = req.body;
  const netuid = data.netuid || 57;
  const coldkey = data.coldkey;
  axios
    .get(`https://taomarketcap.com/api/subnets/${netuid}/metagraph`)
    .then(({ data }) => {
      let out = data.filter((item) => item.coldkey === coldkey);
      let result = out.reduce(
        (acc, item) => {
          acc.taoPerDay += item.taoPerDay;
          acc.stake += item.stake;
          acc.pendingEmission += item.pendingEmission;
          return acc;
        },
        { taoPerDay: 0, stake: 0, pendingEmission: 0 }
      );
      const text = `🚨${netuid} ⛏️${out.length} 🔑${coldkey.substr(0, 7)} 🏠${
        Math.round(result.stake * 1000) / 1000
      } 🏅${Math.round(result.taoPerDay * 1000) / 1000} 🎯${
        Math.round(result.pendingEmission * 1000) / 1000
      }`;
      res.json({
        text,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text,
            },
          },
        ],
      });
    })
    .catch((error) => {
      console.log(error);
      res.json({ text: error });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
