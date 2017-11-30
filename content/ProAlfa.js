var ProAlfa = function(contentMap)
{
    var players = Object.keys(contentMap).join(",");

    Zepto.ajax({
        type: "GET",
        crossDomain: true,
        global: false,
        url: "https://cors.io/?http://proships.ru/stat/api.php?nicks=" + players ,
        success: function(response) {
            var data = JSON.parse(response);
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
        var head = Zepto("<H3 class='ipsComment_author'></H3>");

        var wr = Zepto("<strong>WR: " + stat.wins_percent + "%</strong>   ")[0];
        // wr.style.color = colorizeWinrate(winratePlayer, winrateServer);
        wr.style.paddingRight = "5px";

        var wtr = Zepto("<strong>Alfa: " + Math.round(stat.all_rate) + "</strong>")[0];
        // wtr.style.color = colorizeRaiting(raiting);

        head.append(wr);
        head.append(wtr);
        head.insertAfter(
            Zepto(playerContent[i])
            .parent()
            .parent()
        );
        }
    };

    var processClan = function(contentMap, stat){
        if (stat.clan_id <= 0){
            return;
        }
         var playerContent = contentMap[stat.name];
         for(var i = 0; i < playerContent.length; i++){
            var head = Zepto("<H2 class='cAuthorPane_author'>[" + stat.clan_tag + "]</H2>");
            head[0].style.margin = "3px";
    
            head.insertBefore(Zepto(playerContent[i]).parent().parent());
         }
     }
    
}
