$(document).ready(function () {


    var topics = ["dog", "cat", "bird", "rabbit", "hamster", "skunk", "goldfish", "ferret", "turtle", "super glider", "chinchilla", "hedgehog", "hermit crab", "gerbil", "elephant", "rhino", "koala", "dragon"];

    var currentTopic;
    var numExtra = 0;

    var favorites = [];

    function getLocalStorageFavorites() {

        var localFavorites = localStorage.getItem("favorites");

        if (localFavorites) {
            var arr = JSON.parse(localFavorites);
            favorites = arr;
            getFavoriteGifs();
        }
    }

    function createGifCard(gif) {
        var $div = $("<div>");
        $div.attr("class", "card");
        $div.attr("id", gif.id);

        $div.attr("data-topic", currentTopic);

        var $img = $("<img>");
        $img.attr("class", "gif card-img-top");
        $img.attr("src", gif.images.fixed_height_still.url);

        $img.attr("data-state", "still");
        $img.attr("data-animate-url", gif.images.fixed_height.url);
        $img.attr("data-still-url", gif.images.fixed_height_still.url);

        var $cardBody = $("<div>");
        $cardBody.attr("class", "card-body");

        var $title = $("<h3>");
        $title.attr("class", "card-title");
        $title.text(gif.title);

        var $rating = $("<p>");
        $rating.attr("class", "card-text");
        $rating.text("Rating: " + gif.rating.toUpperCase());

        var $favorite = $("<button>");
        $favorite.attr("data-gif-id", gif.id);
        $favorite.attr("class", "btn btn-dark favoriteBtn");

        var faveText = "";
        if (favorites.includes(gif.id)) {
            faveText = "Remove from Favorites";
        }
        else {
            faveText = "Add to Favorites";
        }
        $favorite.text(faveText);


        $cardBody.append($title);
        $cardBody.append($rating);
        $cardBody.append($favorite);


        $div.append($img);
        $div.append($cardBody);

        return $div;
    }

    function createTopicButtons() {

        $("#topics").empty();

        topics.forEach((topic) => {
            var btn = $("<button>");
            btn.attr("class", "btn btn-primary topic");
            btn.attr("data-name", topic);
            btn.text(topic);
            $("#topics").append(btn);
        });

    }

    function getFavoriteGifs() {

        var favoritesStr = "";

        favorites.forEach((fave) => {
            favoritesStr += fave;

            if (favorites.indexOf(fave) != favorites.length - 1) {
                favoritesStr += ",";
            }

        });

        $.ajax({
            url: "https://api.giphy.com/v1/gifs?api_key=dc6zaTOxFJmzC&ids=" + favoritesStr,
            method: "GET"
        })
            .then(function (res) {

                res.data.forEach((gif) => {
                    var $fave = createGifCard(gif);
                    $("#favorites").append($fave);
                });

            });

    }

    function getGifs() {

        var base = "https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC";
        var search = $(this).attr("data-name");
        var limit = 10;

        if (search !== currentTopic) {
            $("#gifs").empty();
            numExtra = 0;
        }
        else {
            numExtra++;
        }


        var url = base + "&q=" + search + "&limit=" + limit + "&offset=" + (numExtra * limit);

        $.ajax({
            url: url,
            method: "GET"
        })
            .then(function (res) {

                res.data.forEach((gif) => {

                    var gif = createGifCard(gif);

                    $("#gifs").prepend(gif);
                });

            });

        currentTopic = search;
    }

    function toggleGif() {
        var state = $(this).attr("data-state");

        var newUrl = state === "still" ? $(this).attr("data-animate-url") : $(this).attr("data-still-url");

        if (state === "still") {
            $(this).attr("data-state", "animating");
        }
        else if (state === "animating") {
            $(this).attr("data-state", "still");
        }

        $(this).attr("src", newUrl);
    }

    getLocalStorageFavorites();

    $("body").on("click", ".favoriteBtn", function () {

        var id = $(this).attr("data-gif-id");

        var $card = $("#" + id);

        $card.remove();

        if (favorites.includes(id)) {
            var index = favorites.indexOf(id);
            favorites.splice(index, 1);
            $(this).text("Add to Favorites");

            if (currentTopic === $card.attr("data-topic") && currentTopic) {
                $("#gifs").prepend($card);
            }

        }
        else {
            favorites.push(id);
            $(this).text("Remove from Favorites");
            $("#favorites").append($card);
        }

        localStorage.setItem("favorites", JSON.stringify(favorites));

    });

    $("body").on("click", "#submitNewAnimal", function () {

        event.preventDefault();

        var $input = $("#newAnimalInput");

        topics.push($input.val());

        $input.val(null);

        createTopicButtons();
    });

    $("body").on("click", ".gif", toggleGif);

    $("body").on("click", ".topic", getGifs);

    createTopicButtons();

});