const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};

initializeDBAndServer();

// const convertDBObjToResObj = () =>{
//     return {
//         playerId:
//     }
// }

//API 1

app.get("/players/", async (request, response) => {
  const getAllPlayersQuery = `
    SELECT 
        player_id AS playerId,
        player_name AS playerName
    FROM 
        player_details;
    `;

  const getAllPlayersRes = await db.all(getAllPlayersQuery);
  response.send(getAllPlayersRes);
});

//API 2

app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;

  const getPlayerDetailsQuery = `
    SELECT 
        player_id AS playerId,
        player_name AS playerName
    FROM 
        player_details
    WHERE
        player_id = '${playerId}';    
    `;

  const playerRes = await db.get(getPlayerDetailsQuery);
  response.send(playerRes);
});

//API 3

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;

  const { playerName } = playerDetails;

  const updatePlayerQ = `
    UPDATE
        player_details
    SET
        player_name = '${playerName}'
    WHERE
        player_id = '${playerId}';        
    `;

  await db.run(updatePlayerQ);
  response.send("Player Details Updated");
});

//API 4

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;

  const getMatchDetailQ = `
        SELECT 
            match_id AS matchId,
            match AS match,
            year AS year
        FROM 
            match_details
        WHERE
            match_id = '${matchId}';
    `;

  const getMatchDetailR = await db.get(getMatchDetailQ);
  response.send(getMatchDetailR);
});

//API 5

app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;

  const getMatchDetailsOfPlayerQ = `
    SELECT
        match_id AS matchId,
        match,
        year
    FROM 
        match_details
    NATURAL JOIN 
        player_match_score
    WHERE
        player_id = '${playerId}';        
    `;

  const MatchDetailsOfPlayerR = await db.all(getMatchDetailsOfPlayerQ);
  response.send(MatchDetailsOfPlayerR);
});

//API 6

app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;

  const getAllPlayersOfMatchQ = `
    SELECT
        *
    FROM
        player_details
    NATURAL JOIN 
        player_match_score
    WHERE
        player_match_score.match_id = '${matchId}';
    `;

  const allPlayersOfMatchR = await db.all(getAllPlayersOfMatchQ);
  response.send(allPlayersOfMatchR);
});

//API 7

app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;

  const getStatsQ = `
    SELECT 
        player_id AS playerId,
        player_name AS playerName,
        SUM(score) AS totalScore,
        SUM(fours) AS totalFours,
        SUM(sixes) AS totalSixes
    FROM 
        player_details
    NATURAL JOIN 
        player_match_score
    WHERE 
        player_id = '${playerId}'
    GROUP BY 
        playerId;        
    `;

  const statsR = await db.get(getStatsQ);
  response.send(statsR);
});

module.exports = app;
