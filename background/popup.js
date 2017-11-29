
$("input[name=rating-group]").on("change", function(value){
    var value = $(this).val();
    chrome.storage.sync.set({"raitingType": value});
    localStorage.setItem("raitingType", value);
});

let type = localStorage.getItem("raitingType");
if (type){
    $("input[name=rating-group]").each(function(i, item){
        $(item).prop('checked', type === item.value);
    });
}
