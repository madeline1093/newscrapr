$.getJSON("/articles", function(data){
    //console.log(data);
    for (let i=0; i <data.length; i++) {
        console.log(data[i].title);
        $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link +"</p>");
    } 
});