const {
	Ports,
	characters,
	stages
} = require("@slippi/slippi-js");
const {
	SlpRealTime,
	SlpLiveStream,
	ConnectionStatus
} = require("@vinceau/slp-realtime");
const RPC = require("discord-rpc");
const fs = require("fs");
const {
	exit
} = require("process");


function updatePresence(activity) {
	client.setActivity(activity);
}


function updateMelee(gameSettings) {
	if (gameSettings) {
		teams = [
			[],
			[],
			[],
			[]
		]
		gameSettings.players.forEach(player =>
			teams[gameSettings.isTeams ? player.teamId : player.playerIndex].push(config["player_string"]
				.replace("%CODE%", player.connectCode)
				.replace("%NICK%", player.displayName || player.nametag || `Player ${player.port}`)
				.replace("%SHORT%", characters.getCharacterShortName(player.characterId))
				.replace("%LONG%", characters.getCharacterName(player.characterId))))

		outputTeams = []

		teams.forEach((team) => {
			if (team[0]) outputTeams.push(team.join(config["teams_seperator"]))
		})

		player_character = gameSettings.players.find(player => player.connectCode == config["code"]) || gameSettings.players[0]

		globalActivity = {
			details: outputTeams.join(config["opponent_seperator"]),
			startTimestamp: new Date(),
			endTimestamp: new Date(new Date()
				.getTime() + 8.03 * 60000),
			largeImageKey: (stages.getStageName(gameSettings.stageId) == "Unknown Stage" ? "custom" : gameSettings.stageId.toString()) + "_map",
			largeImageText: stages.getStageName(gameSettings.stageId),
			smallImageKey: config["icon_character_ssbu"] ? player_character.characterId.toString() : characters.getCharacterName(player_character.characterId).replace(".", "").replace(" & ", "_").toLowerCase().replace(" ", "_") + "-" + (config["icon_character_color"] ? (characters.getCharacterColorName(player_character.characterId, player_character.characterColor) || "Default").toLowerCase().replace(" ", "_") : "default"),
			smallImageText: characters.getCharacterName(player_character.characterId),
		}
	} else {
		globalActivity = {
			details: config["menu_text"],
			startTimestamp: startTime,
			largeImageKey: 'menu',
			largeImageText: config["menu_image_text"],
		}
	}

	updatePresence(globalActivity)
}

function updateStocks(stocks) {
	outputStocks = []
	stocks.forEach((stock) => {
		if (stock || stock == 0) outputStocks.push(stock)
	})

	globalActivity["state"] = `Stocks: ${outputStocks.join(" - ")}`
	updatePresence(globalActivity)
}
const config = (() => {
	try {
	  return JSON.parse(fs.readFileSync('config.json'));
	} catch (error) {
	  console.log("Can't find config.json in directory! Quitting...");
	  return exit()
	}
  })();

const clientId = '635924792893112320';
const client = new RPC.Client({
	transport: 'ipc'
});

globalActivity = {}
const startTime = new Date();

client.on('ready', () => {
	console.log("Connected to Discord!")
	updateMelee(null)
});


const stream = new SlpLiveStream("dolphin");


const realtime = new SlpRealTime();
realtime.setStream(stream);
realtime.game.start$
	.subscribe((payload) => {
		stocks = []
		if (payload) {
			payload.players.forEach(player => {
				stocks[player.playerIndex] = player.startStocks
				updateMelee(payload);
			})
		} else {
			updateMelee(null)
		}
		updateStocks(stocks)
	})


realtime.stock.countChange$
	.subscribe((payload) => {
		if (payload) {
			stocks[payload.playerIndex] = payload.stocksRemaining
		}
		updateStocks(stocks)
	})

realtime.game.end$
	.subscribe(() => {
		stocks = []
		updateMelee(null)
	})

stream.connection.on("error", (err) => {});

stream.connection.on("statusChange", (status) => {
	if (status === ConnectionStatus.DISCONNECTED) {
		exit()
	}
});

stream.start("127.0.0.1", Ports.DEFAULT)
	.then(() => {
		console.log("Connected to Slippi successfully!")
	})
	.catch(() => {
		console.log("Couldn't connect to Slippi! Please open Dolphin Slippi and try again.");
		exit()
	})

client.login({
		clientId
	})
	.catch(err => {
		console.log("Can't connect to Discord. qutting...");
		exit();
	});
