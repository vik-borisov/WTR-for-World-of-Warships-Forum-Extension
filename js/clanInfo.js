var clanLoadBeginTime = null;

var fillClan = function(contentMap, playerId){
    clanLoadBeginTime = new Date().getTime()
    
    var cachedClan = getClanFromCache(playerId);
    if (cachedClan && cachedClan.raiting && cachedClan.actualDate){
        var timeDiff = Math.abs(new Date().getTime() - new Date(cachedClan.actualDate).getTime());
        var updateTime = Math.ceil(timeDiff / (1000 * 3600 * 24 * 7));
        if (updateTime > 1){
            loadClan(playerId, function(clanFromServer){ processClan(contentMap, clanFromServer)});
        }
        else{
            processClan(contentMap, cachedClan);
        }
    }
    else{
        loadClan(playerId, function(clanFromServer){ processClan(contentMap, clanFromServer)});
    }
}

var processClan = function(contentMap, clanInfo){
    if (!clanInfo || !clanInfo.clan){
        return;
    }
     var playerContent = contentMap[clanInfo.account_name];
     for(var i = 0; i < playerContent.length; i++){
        $(playerContent[i]).html("[" + clanInfo.clan.tag + "]<br>" + clanInfo.account_name);
     }
 }

 var loadClan = function(playerId, callback){
    ga('send', 'event', 'loadClan', playerId);

    $.ajax({
        type: "GET",
        url: "https://api.worldofwarships.ru/wows/clans/accountinfo/?application_id=b074904177e1aa2e364e3ac1eca7ee1c&extra=clan&account_id=" + playerId,
        success: function(response){
            var clan = response.data[playerId];

            setClanToCache(playerId, clan);
            callback(clan);

            ga('send', 'timing', "clan", "load", new Date().getTime() - clanLoadBeginTime);
        },
        error: function(error){
            ga('send', 'exception', {
                'exDescription': "loadClan - " + playerId,
                'exFatal': false
              });
        }
    });
}


const clanKey = "clan_";

var getClanFromCache = function(playerId){
    return JSON.parse(localStorage.getItem(clanKey + playerId))
}

var setClanToCache = function(playerName, clain){
    localStorage.setItem(clanKey + playerName, JSON.stringify(clain));
}