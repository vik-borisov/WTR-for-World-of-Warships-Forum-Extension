var ProAlfa = function(contentMap)
{
    var players = Object.keys(contentMap).join(",");

    Zepto.ajax({
        type: "GET",
        crossDomain:false,
        global: false,
        headers: {
            "X-Requested-With": "XMLHttpRequest"
        },
        url: "https://forumwtr.warships.win/http://proships.ru/stat/api.php?nicks=" + players ,
        success: function(data) {
            for (const stat of data.data){
                processStatistics(contentMap, stat)
                processClan(contentMap, stat)
            }
        },
      });


    var processStatistics = function(contentMap, stat) {
        if (stat.isHidden === 1){
            return;
        }

        var playerContent = contentMap[stat.name];
        for (var i = 0; i < playerContent.length; i++) {
        var head = Zepto("<H3 class='ipsComment_author'><a></H3>");
        var link = Zepto("<a href='http://proships.ru/stat/user/" + stat.name +"' target='_blank'></a>");
        
        var wr = Zepto("<strong>WR: " + stat.wins_percent + "%</strong>   ")[0];
        wr.style.color = colorizeWinrate(stat.wins_percent);
        wr.style.paddingRight = "5px";

        var alfa = Zepto("<strong>ALFA: " + Math.round(stat.all_rate) + "</strong>")[0];
        alfa.style.color = colorizeAlfa(stat.all_rate);

        link.append(wr);
        link.append(alfa);
        head.append(link);
        head.insertAfter(
            Zepto(playerContent[i])
            .parent()
            .parent()
        );
        }
    }; 
    var colorizeWinrate = function(winrate){
        if (winrate < 0) return "black";

        if (winrate < 44.81) {
        return "#C6282E";
        }

        if (winrate < 48.92) {
        return "#FFAA00";
        }

        if (winrate < 54.31) {
        return "#44AA22";
        }

        if (winrate < 56.85) {
        return "#2E7D32";
        }

        if (winrate < 61.76) {
        return "#00ACC1";
        }

        return "#8E24AA";
    }

    var colorizeAlfa = function(alfa){
        if (alfa < 0) return "black";

        if (alfa < 718) {
        return "#C6282E";
        }

        if (alfa < 928) {
        return "#FFAA00";
        }

        if (alfa < 1026 ) {
        return "#44AA22";
        }

        if (alfa < 1026 ) {
        return "#2E7D32";
        }

        if (alfa < 1330) {
        return "#00ACC1";
        }

        return "#8E24AA";
    }

    var processClan = function(contentMap, stat){
        if (stat.clan_id <= 0){
            return;
        }
         var playerContent = contentMap[stat.name];
         for(var i = 0; i < playerContent.length; i++){
            var head = Zepto("<H2 class='cAuthorPane_author'><a href='http://proships.ru/stat/clan/" + stat.clan_tag +"' target='_blank'>[" + stat.clan_tag + "]</a></H2>");
            head[0].style.margin = "3px";
    
            head.insertBefore(Zepto(playerContent[i]).parent().parent());
         }
     }
    
}
