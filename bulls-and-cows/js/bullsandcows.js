(function () {

    var gameApi = "https://ply-bulls-and-cows.herokuapp.com/game";
    var getRes = {};
    var tries = 0;

    var startGame = function(){
        $('#game').slideDown( "slow");

        reset();
        var xhr = makeCorsRequest('GET', gameApi);
    };
    $("#play").on("click", startGame);

    var clear = function(){
        $('#req').val('');
        $('.digit').removeAttr("disabled");
        $('.clear').removeAttr("disabled");
        $('.zero').attr("disabled", "disabled"); 
    };
    var reset = function(){
        clear();

        tries = 0;
        $('#congrats').empty();
        $('#tries span').empty();
        $('#tbody').empty();
        $('section#output').hide();
        $('.zero').attr("disabled", "disabled");
    };


    var createCorsRequest = function (method, url) {
        var xhr = new XMLHttpRequest();
        if ("withCredentials" in xhr) {
            // Check if the XMLHttpRequest object has a "withCredentials" property.
            // "withCredentials" only exists on XMLHTTPRequest2 objects.
            xhr.open(method, url, true);
        }
        else if (typeof XDomainRequest != "undefined") {
            // Otherwise, check if XDomainRequest.
            // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
            xhr = new XDomainRequest();
            xhr.open(method, url);
        }
        else {
            // Otherwise, CORS is not supported by the browser.
            xhr = null;
        }
        return xhr;
    };

    var makeCorsRequest = function(method, url, request){
        var xhr = createCorsRequest(method, url);
        var postParams = (method == 'POST' ? '{"guess":"' + request.guess + '"}' : '');

        if (!xhr) {
            alert('CORS not supported');
            return;
        }
        xhr.onerror = function() {
            alert('Woops, there was an error making the request.');
        };
        // Response handlers.
        xhr.onload = function() {
            var text = xhr.responseText;
            var jsonRes = JSON.parse(text);

            if(method == 'GET'){
                getRes = jsonRes;
            }
            if(method == 'POST'){
                tries++;
                onPost(tries, jsonRes, request);
            }
            console.log('Response from CORS request to ' + url + ': ' + text);
        };

        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(postParams);
    };

    var onPost = function(tries, jsonRes, request){

        $('#tries span').text(tries);
        $('#tries').show();

        $('#tbody').append(
            "<tr>" +
            "<td>" + request.guess + "</td>" +
            "<td>" + jsonRes.bulls + "</td>" +
            "<td>" + (typeof jsonRes.cows === "undefined" ? 0 : jsonRes.cows) + "</td>" +
            "</tr>"
        );

        if (jsonRes.bulls === 4) {
            var minAttempts = addToLocalStorage('tries', tries);
            $('#congrats').append("Congratulations! You won with " + tries + " tries, Best attempt so far was: " + minAttempts + " tries");
        }
        clear();
    };

    var addToLocalStorage = function(key, val){
        var oldItems = JSON.parse(localStorage.getItem(key)) || [];
        var newItem = val;
        oldItems.push(newItem);

        localStorage.setItem(key, JSON.stringify(oldItems));

        return Array.min(oldItems);
    };

    Array.min = function( array ){
        return Math.min.apply( Math, array );
    };


    $(".clear").on("click", function(){ clear(); });
    $(".digit").on("click", function() { 
        var digit = $(this);
        var req = $('#req');

        $('.zero').removeAttr("disabled"); 

        if (req.val().length < 4) {
            req.val(req.val() + digit.val());
            digit.attr("disabled", "disabled");
        } else { 
            return false; 
        }
    });

    $("#send").on("click", function() {
        $('#output').slideDown( "slow");
        var guess = $('#req').val();
        var token = getRes.token;

        if (guess.length === 4) {
            makeCorsRequest("POST", gameApi + "/" + token, {guess: guess, token: token});
        }
        return false;
    });
})();
