var statLoadBeginTime = null;

var fillStatistic = function(contentMap, playerId){
    statLoadBeginTime = new Date().getTime()

    var cachedStat = getStatFromCache(playerId);
    if (cachedStat && 
        cachedStat.actualDate && 
        !forceCacheUpdate(cachedStat) &&
        cachedStat.overall &&
        cachedStat.overall.player &&
        cachedStat.overall.player.ratings) {

        var timeDiff = Math.abs(new Date().getTime() - new Date(cachedStat.actualDate).getTime());
        var updateTime = Math.ceil(timeDiff / (1000 * 3600 * 24 * 3));
        if (updateTime > 1){
            loadStatistics(playerId, function(statFromServer){ processStatistics(contentMap, statFromServer)});
        }
        else{
            processStatistics(contentMap, cachedStat);
        }
    }
    else{
        loadStatistics(playerId, function(statFromServer){ processStatistics(contentMap, statFromServer)});
    }
}

var colorizeWinrate = function(winrate, serverWinrate){
    if (winrate < serverWinrate)
        return "red";
    return "green";
}

var colorizeRaiting = function(raiting){
    if (raiting < 0)
        return "black";
        
    if (raiting < 300){
        return "#930D0D";
    }

    if (raiting < 700){
        return "#CD3333";
    }

    if (raiting < 900){
        return "#CC7A00";
    }

    if (raiting < 1000){
        return "#CCB800";
    }

    if (raiting < 1100){
        return "#4D7326";
    }

    if (raiting < 1200){
        return "#4099BF";
    }

    if (raiting < 1400){
        return "#3972C6";
    }

    if (raiting < 1800){
        return "#793DB6";
    }

    return "#401070";
}

var processStatistics = function(contentMap, stat){
   if (!stat.overall.player || !stat.overall.player.ratings || !stat.overall.player.ratings.ShipRatings){
       return;
   }

    var raiting = stat.overall.player.ratings.ShipRatings.warships_today_rating;
    var winratePlayer = Math.round((stat.overall.player.statistics.ShipCalculableStatistics.wins / stat.overall.player.statistics.ShipCalculableStatistics.battles) * 100);
    var winrateServer = Math.round((stat.overall.server.statistics.ShipCalculableStatistics.wins / stat.overall.server.statistics.ShipCalculableStatistics.battles) * 100);

    var playerContent = contentMap[stat.name];
    for(var i = 0; i < playerContent.length; i++){
        var head = $("<H3 class='ipsComment_author'></H3>");
        
        var wr = $("<strong>WR: " + winratePlayer + "%</strong>   ")[0];
        wr.style.color = colorizeWinrate(winratePlayer, winrateServer);
        wr.style.paddingRight = "5px";
        
        var wtr = $("<strong>WTR: " + Math.round(raiting) + "</strong>")[0];
        wtr.style.color = colorizeRaiting(raiting);

        head.append(wr);
        head.append(wtr);
        head.insertAfter($(playerContent[i]).parent().parent());
    }

    ga('send', 'timing', "stat", "load", new Date().getTime() - statLoadBeginTime);
}

const statKey = "stat_";

var getStatFromCache = function(playerId){
    return JSON.parse(localStorage.getItem(statKey + playerId))
}

var setStatToCache = function(playerId, stat){
    if (!stat){
        stat = {};
    }

    stat.playerId = playerId;
    stat.version = variables.version;
    stat.actualDate = new Date().getTime();
    localStorage.setItem(statKey + playerId, JSON.stringify(stat));
}


var loadStatistics = function(playerId, callback){
    ga('send', 'event', 'loadStat', playerId);

    $.ajax({
        type: "GET",
        url: "https://api." + variables.realmWT + ".warships.today/api/player/" + playerId + "/current",
        success: function(response){
            var stat = {
                overall: {}                
            };

            if (response.intervals.length != 0 && 
                response.intervals[response.intervals.length - 1].subResultViews &&
                response.intervals[response.intervals.length - 1].subResultViews.pvp){

                stat.overall.player = response.intervals[response.intervals.length - 1].subResultViews.pvp.overall.player.value;
                stat.overall.server = response.intervals[response.intervals.length - 1].subResultViews.pvp.overall.server.value;
                stat.name = response.name;
            }


            setStatToCache(playerId, stat);
            callback(stat);
        },
        error: function(error){
            ga('send', 'exception', {
                'exDescription': "loadStat - " + playerId,
                'exFatal': false
              });
        }
    });
}
