$(function() {
    // Global vars
    var chartHeight;

    // Elements
    var $body, $chart, $modal, $modalOverlay, $modalHeaderText, $modalBodyText;

    // Body 
    $body = $('body');

    // Chart
    $chart = $('.chart-history');

    // Modal UI elements
    $modal           = $('.modal');
    $modalOverlay    = $('.modal__overlay');
    $modalHeaderText = $('.modal__header');
    $modalBodyText   = $('.modal__body');

    // Time Consts
    var ONE_SECOND   = 1000,
        ONE_MINUTE   = 60000,
        ONE_MONTH    = 30,
        THREE_MONTHS = ONE_MONTH * 3,
        ONE_YEAR     = 365;

    var refreshCycle = ONE_MINUTE / 2;

    var quoteUrl          = 'http://dev.markitondemand.com/Api/v2/Quote/jsonp?symbol=',
        historyUrlFragOne = 'http://dev.markitondemand.com/Api/v2/InteractiveChart/jsonp?parameters=%7B%22Normalized%22%3Afalse%2C%22NumberOfDays%22%3A90%2C%22DataPeriod%22%3A%22Day%22%2C%22Elements%22%3A%5B%7B%22Symbol%22%3A%22',
        historyUrlFragTwo = '%22%2C%22Type%22%3A%22price%22%2C%22Params%22%3A%5B%22c%22%5D%7D%5D%7D';

    var stockArray = ['TWTR', 'GOOG', 'AAPL', 'GPRO','SQ', 'SBUX'];
        stockArray.sort();
        stockArrayLength = stockArrayLen();

    // This is to scale the grid
    function scaleChart() {
        var $nav, $stockList, $attribution, $companyInfo, navH, sLH, uiElements, windowH, total;
        $nav         = $('.navbar'),
        $stockList   = $('.stock__list');
        $attribution = $('.attribution');
        $companyInfo = $('.company-info');

        navH    = $nav.height(),
        sLH     = $stockList.height(),
        aH      = $attribution.height(),
        cIH     = $companyInfo.height();

        console.log(cIH);
    
        uiElements = navH + sLH + aH + cIH;

        windowH = $(window).height();
        total = windowH - uiElements; // Take into account .attribution and the distance it's moved from the bottom
        return total;
    }

    chartHeight = scaleChart();

    // Determine screen pixel density
    function isRetinaDisplay() {
        if (window.devicePixelRatio > 1 || window.devicePixelRatio === 2) {
            return true;
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
        var data, chartHeight;        
        data = d;
        console.log(data);

        // Account for UI Elements
        chartHeight = scaleChart();

        // Els
        var $companyInfoSymbol      = $('.company-info__symbol'),
            $companyInfoPriceMin  = $('.company-info__price--min'),
            $companyInfoPriceMax  = $('.company-info__price--max');

        $companyInfoSymbol.html(data.Elements[0].Symbol);
        $companyInfoPriceMin.html('Min: $' + data.Elements[0].DataSeries.close.min);
        $companyInfoPriceMax.html('Max: $' + data.Elements[0].DataSeries.close.max);
    
        // Send the object and data to Chartize.js
        var dates = data.Dates,
            /*positions = data.Positions,*/
            lastPrice = data.Elements[0].DataSeries.close.values;
        var data = {
            labels: dates,
            series: [
                lastPrice
            ]
        };

        var options = {
            height: chartHeight + 'px',
            stretch: true,
            showPoint: false,
            fullWidth: true,
        };

        // Draw the line
        new Chartist.Line('.chart-history', data, options);
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

    function animateUI() {
        var stockList = $('.stock__company');

        stockList.each(function(i) {
            var stock = $(this);
            setTimeout(function() {
                stock.addClass('active');
            }, i * 150);
        });
    }

    function showModal(headerText, bodyText) {
        // Accept params
        $modalHeaderText.html(headerText);
        $modalBodyText.html(bodyText)

        $body.addClass('modal-active');
        $modal.addClass('show');
        $modalOverlay.show();
    }

    function closeModal() {
        $modal.hide();
        $modalOverlay.hide();
    }

    // Make Ajax request
    function getStockPrices(stock) {
        $.ajax({
            url: quoteUrl + stock,
            type: 'GET',
            contentType: 'application/json',
            dataType: 'jsonp'
        })
        .done(function(data) {
            closeModal();
            animateUI();
            buildList(data);
            attachClickListeners();
        })
        .fail(function(data, textStatus, errorThrown) {
            console.log(data + textStatus + errorThrown);
            // showModal('Oops!', 'Well this is embarrasing, but we were unable to load your data! Try refreshing the page.');
        });
    }

    function getHistoryChart() {
        var sym = $(this).data('symbol');
        $.ajax({
            url: historyUrlFragOne + sym + historyUrlFragTwo,
            /*url: 'history.json',*/
            type: 'GET',
            contentType: 'application/json',
            dataType: 'jsonp'
            /*dataType: 'json'*/
        })
        .done(function(data) {
            buildChart(data);
        })
        .fail(function(data, textStatus, errorThrown) {
            console.log(data + textStatus + errorThrown);
            // showModal('Oops!', 'Well this is embarrasing, but we were unable to load your data! Try refreshing the page.');
        });
    }

    function attachClickListeners() {
        $('.stock__company').unbind().click(getHistoryChart);
    }

    // Run once
    animateUI();
    updatePrices();
    animateUpdateProgress();
    setInterval(function() {
        updatePrices();
        animateUpdateProgress();
    }, refreshCycle);

});