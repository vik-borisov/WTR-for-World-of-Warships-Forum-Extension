var clanLoadBeginTime = null;

var fillClan = function(contentMap, playerId){
    clanLoadBeginTime = new Date().getTime()
    
    var cachedClan = getClanFromCache(playerId);
    if (cachedClan  && cachedClan.actualDate && !forceCacheUpdate(cachedClan)){
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
        var head = $("<H2 class='cAuthorPane_author'>[" + clanInfo.clan.tag + "]</H2>");
        head[0].style.margin = "3px";

        head.insertBefore($(playerContent[i]).parent().parent());
     }
 }

 var loadClan = function(playerId, callback){
    ga('send', 'event', 'loadClan', playerId);

    $.ajax({
        type: "GET",
        url: "https://api.worldofwarships." + variables.realmWG + "/wows/clans/accountinfo/?application_id=b074904177e1aa2e364e3ac1eca7ee1c&extra=clan&account_id=" + playerId,
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

var setClanToCache = function(playerName, clan){
    if (!clan){
        clan = {};
    }

    clan.version = variables.version;
    clan.actualDate = new Date().getTime();

    localStorage.setItem(clanKey + playerName, JSON.stringify(clan));
}