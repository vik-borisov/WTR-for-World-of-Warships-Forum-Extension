var WTR = function(contentMap) {
  var raiting = function(contentMap, playerId) {
    
    var statLoadBeginTime = null;

    var fillStatistic = function(contentMap, playerId) {
      statLoadBeginTime = new Date().getTime();

      var cachedStat = getStatFromCache(playerId);
      if (
        cachedStat &&
        cachedStat.actualDate &&
        !forceCacheUpdate(cachedStat) &&
        cachedStat.overall &&
        cachedStat.overall.player &&
        cachedStat.overall.player.ratings
      ) {
        var timeDiff = Math.abs(
          new Date().getTime() - new Date(cachedStat.actualDate).getTime()
        );
        var updateTime = Math.ceil(timeDiff / (1000 * 3600 * 24 * 3));
        if (updateTime > 1) {
          loadStatistics(playerId, function(statFromServer) {
            processStatistics(contentMap, statFromServer);
          });
        } else {
          processStatistics(contentMap, cachedStat);
        }
      } else {
        loadStatistics(playerId, function(statFromServer) {
          processStatistics(contentMap, statFromServer);
        });
      }
    };

    var colorizeWinrate = function(winrate, serverWinrate) {
      if (winrate < serverWinrate) return "red";
      return "green";
    };

    var colorizeRaiting = function(raiting) {
      if (raiting < 0) return "black";

      if (raiting < 300) {
        return "#930D0D";
      }

      if (raiting < 700) {
        return "#CD3333";
      }

      if (raiting < 900) {
        return "#CC7A00";
      }

      if (raiting < 1000) {
        return "#CCB800";
      }

      if (raiting < 1100) {
        return "#4D7326";
      }

      if (raiting < 1200) {
        return "#4099BF";
      }

      if (raiting < 1400) {
        return "#3972C6";
      }

      if (raiting < 1800) {
        return "#793DB6";
      }

      return "#401070";
    };

    var processStatistics = function(contentMap, stat) {
      if (
        !stat.overall.player ||
        !stat.overall.player.ratings ||
        !stat.overall.player.ratings.ShipRatings
      ) {
        return;
      }

      var raiting = stat.overall.player.ratings.ShipRatings.warships_today_rating;
      var winratePlayer = Math.round(
        stat.overall.player.statistics.ShipCalculableStatistics.wins /
          stat.overall.player.statistics.ShipCalculableStatistics.battles *
          100
      );
      var winrateServer = Math.round(
        stat.overall.server.statistics.ShipCalculableStatistics.wins /
          stat.overall.server.statistics.ShipCalculableStatistics.battles *
          100
      );

      var playerContent = contentMap[stat.name];
      for (var i = 0; i < playerContent.length; i++) {
        var head = Zepto("<H4 class='ipsComment_author'></H4>");

        var wr = Zepto("<strong>WR: " + winratePlayer + "%</strong>   ")[0];
        wr.style.color = colorizeWinrate(winratePlayer, winrateServer);
        wr.style.paddingRight = "5px";

        var wtr = Zepto("<strong>WTR: " + Math.round(raiting) + "</strong>")[0];
        wtr.style.color = colorizeRaiting(raiting);

        head.append(wr);
        head.append(wtr);
        head.insertAfter(
          Zepto(playerContent[i])
            .parent()
            .parent()
        );
      }
    };

    const statKey = "stat_";

    var getStatFromCache = function(playerId) {
      return JSON.parse(localStorage.getItem(statKey + playerId));
    };

    var setStatToCache = function(playerId, stat) {
      if (!stat) {
        stat = {};
      }

      stat.playerId = playerId;
      stat.version = variables.version;
      stat.actualDate = new Date().getTime();
      localStorage.setItem(statKey + playerId, JSON.stringify(stat));
    };

    var loadStatistics = function(playerId, callback) {
      Zepto.ajax({
        type: "GET",
        crossDomain: true,
        global: false,
        url: "https://api." + variables.realmWT + ".warships.today/api/player/" + playerId + "/current",
        success: function(response) {
          var stat = {
            overall: {}
          };

          if (
            response.intervals.length != 0 &&
            response.intervals[response.intervals.length - 1].subResultViews &&
            response.intervals[response.intervals.length - 1].subResultViews.pvp
          ) {
            stat.overall.player = response.intervals[response.intervals.length - 1].subResultViews.pvp.overall.player.value;
            stat.overall.server = response.intervals[response.intervals.length - 1].subResultViews.pvp.overall.server.value;
            stat.name = response.name;
          }

          setStatToCache(playerId, stat);
          callback(stat);
        }
      });
    };

    fillStatistic(contentMap, playerId)
  };

  var playerInfo = function(playerName, callback){
    var playerLoadBeginTime = null;
    
    var loadPlayer = function(playerName, callback){
        playerLoadBeginTime = new Date().getTime()
    
        var cachedPlayer = getPlayerFromCache(playerName);
    
        if (cachedPlayer && !forceCacheUpdate(cachedPlayer)){
            processPlayer(cachedPlayer, callback)
            return;
        }
    
        loadFromServer(playerName, function(data){
            processPlayerFromServer(playerName, data, callback);
        })
    }
    var processPlayer = function(data, callback) {
        callback(data.id);
    }
    
    var processPlayerFromServer = function(playerName, data, callback){
        setPlayerToCache(playerName, data);
        var cachedPlayer = getPlayerFromCache(playerName);
        processPlayer(cachedPlayer, callback)
    }
    
    var loadFromServer = function(playerName, callback){
        return Zepto.ajax({
            type: "GET",
            crossDomain: true,
            global: false,
            success: callback,
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

    loadPlayer(playerName, callback)
  }

  var clanInfo = function(contentMap, playerId){
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
            var clanTag = Zepto(".cAuthorPane_clan", Zepto(playerContent[i]).offsetParent());

            var head = Zepto("<H2 class='cAuthorPane_author'>[" + clanInfo.clan.tag + "]</H2>");
            head.attr("style", clanTag.attr("style"));
            head[0].style.margin = "3px";

            head.insertBefore(Zepto(playerContent[i]).parent().parent());

            clanTag.remove();
         }
     }
    
     var loadClan = function(playerId, callback){
        Zepto.ajax({
            type: "GET",
            crossDomain: true,
            global: false,
            url: "https://api.worldofwarships." + variables.realmWG + "/wows/clans/accountinfo/?application_id=b074904177e1aa2e364e3ac1eca7ee1c&extra=clan&account_id=" + playerId,
            success: function(response){
                var clan = response.data[playerId];
                
                setClanToCache(playerId, clan);
                callback(clan);
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

    fillClan(contentMap, playerId);
  }

  for(var playerName in contentMap) {
    playerInfo(playerName, function(playerId){
        raiting(contentMap, playerId)
        clanInfo(contentMap, playerId)
      });
  }
};
