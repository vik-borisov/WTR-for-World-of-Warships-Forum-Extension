var playerLoadBeginTime = null;

var loadPlayer = function(playerName, callback){
    playerLoadBeginTime = new Date().getTime()
    ga('send', 'event', 'loadPlayer', playerName);

    var cachedPlayer = getPlayerFromCache(playerName);

    if (cachedPlayer && !forceCacheUpdate(cachedPlayer)){
        processPlayer(cachedPlayer, callback)
        return;
    }

    loadFromServer(playerName).done(function(data){
        processPlayerFromServer(playerName, data, callback);
    })
}
var processPlayer = function(data, callback) {
    callback(data.id);
    ga('send', 'timing', "player", "load", new Date().getTime() - playerLoadBeginTime);
}

// var downloadFromRemoteCache = function(playerName, callback){
//     $.ajax({
//         type: "GET",
//         url: variables.settings.remoteCache + "/cache/player/" + playerName,
//         success: function(data){
//             if (!data){
//                 loadFromServer(playerName).done(function(data){
//                     uploadToRemoteCache(playerName, data).done(function(){
//                         processPlayerFromServer(playerName, data, callback);
//                     })
//                 })
//             }
//             processPlayerFromServer(playerName, data, callback);
//         },
//         error: function(error){
//             ga('send', 'exception', {
//                 'exDescription': "loadPlayerRemoteCache - " + playerName,
//                 'exFatal': false
//               });
//         }
//     })
// }

var processPlayerFromServer = function(playerName, data, callback){
    setPlayerToCache(playerName, data);
    var cachedPlayer = getPlayerFromCache(playerName);
    processPlayer(cachedPlayer, callback)
}

// var uploadToRemoteCache = function(playerName, data){
//     return $.ajax({
//         type: "POST",
//         dataType: 'json',
//         data: JSON.stringify(data),
//         url: variables.settings.remoteCache + "/cache/player/" + playerName,
//         error: function(error){
//             ga('send', 'exception', {
//                 'exDescription': "setPlayerRemoteCache - " + playerName,
//                 'exFatal': false
//               });
//         }
//     })
// }

var loadFromServer = function(playerName){
    return $.ajax({
        type: "GET",
        url: "https://api.ru.warships.today/api/players/search-by-name/" + playerName,
        error: function(error){
            ga('send', 'exception', {
                'exDescription': "loadPlayerFromServer - " + playerName,
                'exFatal': false
              });
        }
    })
}

const playerKey = "player_";

var getPlayerFromCache = function(playerName){
    return JSON.parse(localStorage.getItem(playerKey + playerName))
}

var setPlayerToCache = function(playerName, player){
    player.version = variables.version;
    localStorage.setItem(playerKey + playerName, JSON.stringify(player));
}