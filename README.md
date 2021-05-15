# slippi-discord-rpc
Simple Super Smash Bros. Melee Discord Rich Presence using Project Slippi!

### code is very bad dont judge :3

## Usage
Run the compiled build or main.js with node in a directory where's theres a valid config.json file present when Dolphin Slippi is running.

The script needs Slippi Dolphin in order to start and shuts down automatically when it is closed.

## Configuration
An example config file would look something like this:
```json
{
    "code" : "CODE#111",
    "player_string" : "%NICK% (%SHORT%)",
    "icon_character_color" : true,
    "icon_character_ssbu" : false,
    "menu_text" : "Text to show on idle",
    "menu_image_text" : "Text to show on idle when hovering on the image", 
    "opponent_seperator" : " vs. ",
    "teams_seperator" : " and "
}
```
#### Fields:
* `code`: The connect code of the player.
* `player_string`: A formatted string for each player in game.
    * `%CODE%`: The connect code of the player
    * `%NICK%`: The display name of the player (nickname on Sippi or tag on Console).
    * `%SHORT%`: The short name of the player's character (Fox, ICs...).
    * `%LONG%`: The long name of the player's character (Fox, Ice Climbers...).
* `icon_character_color`: Whether to show the player's current character color or use the default color.
* `icon_character_ssbu`: Whether to use Ultimate's more modern character icon or not.
* `menu_text`: The text to show when not in-game.
* `menu_image_text`: The text to show when hovering on the image that is present when not in-game.
* `opponent_seperator`: The string that joins two opponents.
* `teams_seperator`: The string that joins two team members.



## Contributing
This is an amateur script in dire need of someone who knows what they're doing with Javascript. 

Will merge every PR if it's good :>