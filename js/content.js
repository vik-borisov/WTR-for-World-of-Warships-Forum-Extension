ga('create', 'UA-108484251-1', 'auto');

var getVariables = function(){
    var manifestData;
    if (chrome && chrome.runtime){
         manifestData = chrome.runtime.getManifest();
    }
    else if (browser && browser.runtime){
        manifestData = browser.runtime.getManifest();
    }

    return{
        version: manifestData.version,
        settings: manifestData.settings,
        minimalCacheVersion: manifestData.minimalCacheVersion,
    }
}

var variables = getVariables();


var forceCacheUpdate = function(cache){
    return !cache.version || cache.version < variables.minimalCacheVersion;
}

var WOWsExtention = function(){
    
    ga('send', 'pageview');
    ga('set', 'appName', window.location.origin);
    ga('set', 'appVersion', variables.version);
    
    var contentMap = {};
    var items = $(".cAuthorPane_author a");

    var commentFeed = $('div[data-role="commentFeed"]');
    commentFeed.parent().bind('DOMNodeRemoved', function(e) { 
        if (e.target == commentFeed[0]){
            window.setTimeout(WOWsExtention, 1000);
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
        loadPlayer(playerName, function(playerId){
            fillStatistic(contentMap, playerId)
            fillClan(contentMap, playerId)
        });
    }
}



WOWsExtention();