var getRealm = function(){
    var host_split = window.location.host.split('.');
    return host_split[host_split.length - 1];
}

var getVariables = function(){
    var manifestData;
    if (chrome && chrome.runtime){
         manifestData = chrome.runtime.getManifest();
    }
    else if (browser && browser.runtime){
        manifestData = browser.runtime.getManifest();
    }

    var realm = getRealm();

    return{
        version: manifestData.version,
        settings: manifestData.settings,
        minimalCacheVersion: manifestData.minimalCacheVersion,
        realmWT: realm == 'com' ? 'na': realm,
        realmWG: realm
    }
}

var variables = getVariables();

var forceCacheUpdate = function(cache){
    return !cache.version || cache.version < variables.minimalCacheVersion;
}


var ForumExtention = function(raitingType){
    var contentMap = {};
    var items = Zepto(".cAuthorPane_author strong a");

    var commentFeed = Zepto('div[data-role="commentFeed"]');
    commentFeed.parent().bind('DOMNodeRemoved', function(e) { 
        if (e.target == commentFeed[0]){
            window.setTimeout(ForumExtention, 1000);
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

    switch (raitingType){
        case "ProAlfa": 
        case null: 
        case undefined: 
            ProAlfa(contentMap);
        break;
        case "WTR": 
            WTR(contentMap);
        break;
    }
}

chrome.storage.sync.get('raitingType', function(settings) {
    ForumExtention(settings.raitingType);
});