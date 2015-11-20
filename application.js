$(function() {
    // Global vars
    var l;

    // Time Consts
    var ONE_SECOND = 1000,
        ONE_MINUTE = 60000;

    var refreshCycle = ONE_MINUTE * 2;

    var quoteUrl          = 'http://dev.markitondemand.com/Api/v2/Quote/jsonp?symbol=',
        historyUrlFragOne = 'http://dev.markitondemand.com/Api/v2/InteractiveChart/jsonp?parameters=%7B%22Normalized%22%3Afalse%2C%22NumberOfDays%22%3A365%2C%22DataPeriod%22%3A%22Day%22%2C%22Elements%22%3A%5B%7B%22Symbol%22%3A%22',
        historyUrlFragTwo = '%22%2C%22Type%22%3A%22price%22%2C%22Params%22%3A%5B%22c%22%5D%7D%5D%7D';

    var stockArray = ['AAPL', 'NFLX', 'SQ', 'GE', 'GPRO', 'TWTR'],
        stockArrayLength = stockArrayLen();

    // Determine screen pixel density
    function isRetinaDisplay() {
        if (window.devicePixelRatio > 1 || window.devicePixelRatio === 2) {
            return true;
        } else {
            console.log('Non Retina');
        }
    }

    // Loading indicator
    function animateUpdateProgress() {
        var progressLoader = $('.loader');

        // Detect if the user has a retina device
        // If the user does then double the circle width and then scale the canvas using css
        var retina = isRetinaDisplay(),
            res;

        if (retina === true) {
            res = 40 * 2;
        } else {
            res = 40;
        }

        progressLoader.circleProgress({
            value: 1.0,
            size: res,
            thickness: 5,
            lineCap: 'round',
            emptyFill: 'rgba(255, 255, 255, 0.1)',
            fill: {
                gradient: ['#5BD8E4', '#0099FF']
            },
            animation: {
                duration: refreshCycle
            },
            animationStartValue: 0.0
        });
    }

    function stockArrayLen() {
        return stockArray.length;
    }

    function formatCurrency(value) {
        var suffixes = ["", "K", "M", "B", "T"];
        var suffixNum = Math.floor(("" + value).length / 3);
        var shortValue = parseFloat((suffixNum !== 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(2));
        if (shortValue % 1 != 0) {
            shortNum = shortValue.toFixed(1);
        }

        return shortValue + suffixes[suffixNum];
    }


    function buildChart(d) {
        var data = d;
        console.log(data);
    }

    function buildList(d) {
        var list = $('.stock__list');
        var data = d;
        console.log(data);

        var marketCap = formatCurrency(data.MarketCap);
        list.append(
            '<li class="stock__company" data-symbol="' + data.Symbol + '"' + '>' + '<span class="stock__row stock__row--name">' + data.Name + '</span>' + ' ' + '<span class="stock__row stock__row--sym">' + data.Symbol + '</span>' + ' ' + '<span class="stock__row stock__row--market-cap">' + '$' + marketCap + '</span>' + ' ' + '<span class="stock__row stock__row--change-pct">' + '$' + data.Change.toFixed(2) + ' :: ' + data.ChangePercent.toFixed(2) + '%' + '</span>' + ' ' + '<span class="stock__row stock__row--last-price>' + '$' + data.LastPrice + '</li>');
    }

    function updatePrices() {
        for (var i = 0; i < stockArrayLength; i++) {
            getStockPrices(stockArray[i]);
        }
    }

    // Make Ajax request
    function getStockPrices(stock) {
        $.ajax({
                url: quoteUrl + stock,
                type: 'GET',
                contentType: 'application/json',
                dataType: 'jsonp'
            })
            .success(function(data) {
                buildList(data);
            })
            .done(function() {
                attachClickListeners();
            });
    }

    function getHistoryChart() {
        var sym = $(this).data('symbol');
        console.log(sym);

        http://dev.markitondemand.com/Api/v2/InteractiveChart/jsonp?parameters=%7B%22Normalized%22%3Afalse%2C%22NumberOfDays%22%3A365%2C%22DataPeriod%22%3A%22Day%22%2C%22Elements%22%3A%5B%7B%22Symbol%22%3A%22GPRO%22%2C%22Type%22%3A%22price%22%2C%22Params%22%3A%5B%22c%22%5D%7D%5D%7D'

        $.ajax({
            url: historyUrlFragOne + sym + historyUrlFragTwo,
            type: 'GET',
            contentType: 'application/json',
            dataType: 'jsonp'
        })
        .success(function(data) {
            buildChart(data);
        });
    }

    function attachClickListeners() {
        $('.stock__company').unbind().click(getHistoryChart);
    }

    // Run once
    updatePrices();
    animateUpdateProgress();

    setInterval(function() {
        updatePrices();
        animateUpdateProgress();
    }, refreshCycle);

});