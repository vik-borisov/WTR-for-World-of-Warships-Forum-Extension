
var setRaiting = function(){
    var contentMap = {};
    var items = $(".cAuthorPane_author a");

    var commentFeed = $('div[data-role="commentFeed"]');
    commentFeed.parent().bind('DOMNodeRemoved', function(e) { 
        if (e.target == commentFeed[0]){
            window.setTimeout(setRaiting, 1000);
        }
    });
        
    items.each(function(index, item){
        if (contentMap[item.innerText] == null){
            contentMap[item.innerText] = [ item ];
        }
        else{
            contentMap[item.innerText].push(item)
        }
    })

    var playerStatistics = {};
    for(var playerName in contentMap) {
        var cachedStat = getFromCache(playerName);

        if (cachedStat && cachedStat.actualDate){
            var timeDiff = Math.abs(new Date().getTime() - new Date(cachedStat.actualDate).getTime());
            var updateTime = Math.ceil(timeDiff / (1000 * 3600 * 24));
            if (updateTime > 1){
                loadStatistics(playerName, function(statFromServer){ processStatistics(contentMap, statFromServer)});
            }
            else{
                processStatistics(contentMap, cachedStat);
            }
        }
        else{
            loadStatistics(playerName, function(statFromServer){ processStatistics(contentMap, statFromServer)});
        }
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
   if (jQuery.isEmptyObject(stat)){
        return;
   }

    var raiting = stat.ratings.ShipRatings.warships_today_rating;

    var playerContent = contentMap[stat.name];
    for(var i = 0; i < playerContent.length; i++){
        playerContent[i].parentElement.style.color = colorizeRaiting(raiting);
    }
}
const statKey = "stat_";

var getFromCache = function(playerName){
    return JSON.parse(localStorage.getItem(statKey + playerName))
}

var setToCache = function(playerName, stat){
    localStorage.setItem(statKey + playerName, JSON.stringify(stat));
}

var loadStatistics = function(playerName, callback){
    $.ajax({
        type: "GET",
        url: "https://api.ru.warships.today/api/players/search-by-name/" + playerName,
        success: function(data){
            var playerId = data.id;
            $.ajax({
                type: "GET",
                url: "https://api.ru.warships.today/api/player/" + playerId + "/current",
                success: function(response){
                    var stat = {};
                    if (response.intervals.length != 0){
                        stat = response.intervals[response.intervals.length - 1].subResultViews.pvp.overall.player.value;
                        stat.name = response.name;
                        stat.actualDate = new Date().getTime();
                    }

                    setToCache(playerName, stat);
                    callback(stat);
                }
            });
        }
    })
}

setRaiting();