var statLoadBeginTime = null;

var fillStatistic = function(contentMap, playerId){
    statLoadBeginTime = new Date().getTime()

    var cachedStat = getStatFromCache(playerId);
    if (cachedStat && cachedStat.raiting && cachedStat.actualDate){
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
   if (stat.ratings && stat.ratings.ShipRatings){
    var raiting = stat.ratings.ShipRatings.warships_today_rating;
    
    var playerContent = contentMap[stat.name];
    for(var i = 0; i < playerContent.length; i++){
        playerContent[i].parentElement.style.color = colorizeRaiting(raiting);
    }

    ga('send', 'timing', "stat", "load", new Date().getTime() - statLoadBeginTime);
   }

   
}
const statKey = "stat_";

var getStatFromCache = function(playerId){
    return JSON.parse(localStorage.getItem(statKey + playerId))
}

var setStatToCache = function(playerId, stat){
    localStorage.setItem(statKey + playerId, JSON.stringify(stat));
}


var loadStatistics = function(playerId, callback){
    ga('send', 'event', 'loadStat', playerId);

    $.ajax({
        type: "GET",
        url: "https://api.ru.warships.today/api/player/" + playerId + "/current",
        success: function(response){
            var stat = {};
            if (response.intervals.length != 0 && 
                response.intervals[response.intervals.length - 1].subResultViews &&
                response.intervals[response.intervals.length - 1].subResultViews.pvp &&
                response.intervals[response.intervals.length - 1].subResultViews.pvp.overall &&
                response.intervals[response.intervals.length - 1].subResultViews.pvp.overall.player){

                stat = response.intervals[response.intervals.length - 1].subResultViews.pvp.overall.player.value;
                stat.name = response.name;
            }

            stat.actualDate = new Date().getTime();
            stat.playerId = playerId;

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
