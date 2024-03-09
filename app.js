const express = require('express')
const app = express()
app.use(express.json())

const sqlite3 = require('sqlite3')
const {open} = require('sqlite')

const path = require('path')
const dbPath = path.join(__dirname, 'cricketMatchDetails.db')

let db = null
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server is Running at http:localhost:3000/'),
    )
  } catch (err) {
    console.log(`DB Error ${err.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

// GET API 1
app.get('/players/', async (request, response) => {
  const getBookQuery = `
        SELECT player_id AS playerId, player_name AS playerName FROM player_details;
    `
  const arrayOfPlayers = await db.all(getBookQuery)
  console.log(arrayOfPlayers)
  response.send(arrayOfPlayers)
})

// API 2
app.get('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
    SELECT player_id AS playerId, player_name AS playerName
     FROM player_details 
    WHERE player_id = ${playerId};
  `
  const getPlayerDetails = await db.get(getPlayerQuery)
  console.log(getPlayerDetails)
  response.send(getPlayerDetails)
})

// API 3
app.put('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const updateDetails = request.body
  const {playerName} = updateDetails
  const putUpdateQuery = `
      UPDATE player_details
      SET 
      player_name = '${playerName} ' 
      WHERE player_id = ${playerId};
  `
  const updateResponse = await db.run(putUpdateQuery)
  console.log(updateResponse)
  response.send('Player Details Updated')
})

// Get API 4
app.get('/matches/:matchId', async (request, response) => {
  const {matchId} = request.params
  const getMatchDetailsQuery = `
    SELECT * FROM match_details 
    WHERE match_id = ${matchId}; 

  `
  const dbResponse = await db.get(getMatchDetailsQuery)
  console.log(dbResponse)
  const {match_id, match, year} = dbResponse
  response.send({
    matchId: match_id,
    match: match,
    year: year,
  })
})

// Api 5
app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params
  const getQuery = `
    SELECT match_id AS matchId, match, year
     FROM player_match_score NATURAL JOIN match_details 
    WHERE player_id = ${playerId};
  `
  const dbResponse = await db.all(getQuery)
  console.log(dbResponse)
  response.send(dbResponse)
})

// API 6
app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const getQuery = `
    SELECT player_id AS playerId, player_name AS playerName 
    FROM player_match_score NATURAL JOIN player_details
    where match_id = ${matchId};
  `
  const dbResponse = await db.all(getQuery)
  console.log(dbResponse)
  response.send(dbResponse)
})

// API 7

app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params
  const getQuery3 = `
        SELECT player_id AS playerId, player_name AS playerName,
        SUM(score) AS totalScore,
        SUM(fours) AS totalFours,
        SUM(sixes) AS totalSixes 
        FROM player_details NATURAL JOIN player_match_score 
        
        WHERE player_id = ${playerId};
    `
  const dbResponse = await db.get(getQuery3)
  response.send(dbResponse)
})

module.exports = app
