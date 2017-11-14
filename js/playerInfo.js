var playerLoadBeginTime = null;

var loadPlayer = function(playerName, callback){
    playerLoadBeginTime = new Date().getTime()

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
//     })
// }

var loadFromServer = function(playerName){
    return $.ajax({
        type: "GET",
        url: "https://api." + variables.realmWT + ".warships.today/api/players/search-by-name/" + playerName,
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