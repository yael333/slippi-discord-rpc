const { SlpRealTime, SlpLiveStream, ConnectionStatus} = require("@vinceau/slp-realtime");
const { Ports } = require("@slippi/slippi-js");
const { catchError } = require("rxjs/operators");
const RPC = require("discord-rpc");
const fs = require("fs");
const { exit } = require("process");

const characters =
[
  "Captain Falcon",
  "Donkey Kong",
  "Fox",
  "Game and Watch",
  "Kirby",
  "Bowser",
  "Young Link",
  "Luigi",
  "Mario",
  "Marth",
  "Mewtwo",
  "Ness",
  "Peach",
  "Pikachu",
  "Ice Climbers",
  "Jigglypuff",
  "Samus",
  "Yoshi",
  "Zelda",
  "Sheik",
  "Falco",
  "Link",
  "Dr. Mario",
  "Roy",
  "Pichu",
  "Ganondorf",
]
const stages = 
[
  "stage",
  "stage",
  "Fountains of Dreams",
  "Pokemon Stadium",
  "Princess Peach's Castle",
  "Kongo Jungle",
  "Brinstar",
  "Corneria",
  "Yoshi's Story",
  "Onett",
  "Mute City",
  "Rainbow Cruise",
  "Jungle Japes",
  "Great Bay",
  "Temple",
  "Brinstar Depths",
  "Yoshi's Island",
  "Green Greens",
  "Fourside",
  "Mushroom Kingdom",
  "Mushroom Kingdom II",
  "stage",
  "Venom",
  "Poke Floats",
  "Big Blue",
  "Icicle Mountain",
  "stage",
  "Flat Zone",
  "Dream Land 64",
  "Yoshi's Island 64",
  "Kongo Jungle 64",
  "Battlefield",
  "Final Destination"
]

function connectSlippi(stream)
{
  stream.start("127.0.0.1", Ports.DEFAULT).then(() => // dont be dumb and forget port thingy 
  {
    console.log("Connected to Slippi Relay"); 
  }).catch((err) => {console.log("Couldn't find a dolphin instance! quitting.."); exit()})
}

function updatePresence(activity)
{
    client.setActivity(activity);
}


function updateMelee(gameSettings)
{
  if (gameSettings)
  {
    teams = [[], [], [], []]
    if (gameSettings.isTeams)
    {
      gameSettings.players.forEach(player => teams[player.teamId].push(characters[player.characterId]))
    }
    else
    {
      gameSettings.players.forEach(player => teams[player.playerIndex].push(characters[player.characterId]))
    }
    outputTeams = []

    teams.forEach((team) => {if (team[0]) outputTeams.push(team.join(" and "))})

    player_character = gameSettings.players[0].characterId
    loop:
    for (let character of config["characters"])
    {
      for (let player of gameSettings.players)
      {
        if (characters.indexOf(character[0]) == player.characterId && (character[1]===null || character[1] == player.characterColor))
        {
          player_character = player.characterId
          break loop
        }
      }
    }

    globalActivity =  {
        details : outputTeams.join(" vs "),
        endTimestamp : new Date(new Date().getTime() + 8.05*60000),
        largeImageKey : gameSettings.stageId.toString() + "_map",
        largeImageText : stages[gameSettings.stageId],
        smallImageKey : player_character.toString() + (config["ssbu_logos"] ? "" : "_old"),
        smallImageText : characters[player_character],
    }
  }
  else
  {
    globalActivity = {
    details : config["menu_text"],
    startTimestamp : startTime,
    largeImageKey : 'menu',
    }
}

  updatePresence(globalActivity)
}

function updateStocks(stocks)
{
    outputStocks = []
    stocks.forEach((stock) => {if (stock || stock == 0) outputStocks.push(stock)})

    globalActivity["state"] = `Stocks: ${outputStocks.join(" - ")}`
    updatePresence(globalActivity)
}
const config = JSON.parse(fs.readFileSync("./config.json"))

const clientId = '635924792893112320';
const client = new RPC.Client({ transport: 'ipc' });

globalActivity = {}
const startTime = new Date();

client.on('ready', () => {
console.log("Connected to discord!")
updateMelee(null)
});


const stream = new SlpLiveStream("dolphin");


const realtime = new SlpRealTime();
realtime.setStream(stream);
realtime.game.start$
  .subscribe((payload) => {
    stocks = []
    payload.players.forEach(player => {stocks[player.playerIndex] = player.startStocks})
    updateMelee(payload);
    updateStocks(stocks)
  })


realtime.stock.countChange$
  .subscribe((payload) => {
    stocks[payload.playerIndex] = payload.stocksRemaining
    updateStocks(stocks)
    console.log(stocks)
  })

realtime.game.end$
  .subscribe(() => {
    updateMelee(null)
    stocks = []
  })

stream.connection.on("error", (err) => {});


stream.connection.on("statusChange", (status) => {
    if (status === ConnectionStatus.DISCONNECTED) {
      console.log("Slippi Relay disconnected!")
      updateMelee(null)
      stocks = []
      connectSlippi(stream)
    }
  });


connectSlippi(stream)
client.login({ clientId }).catch(err => console.log(err));