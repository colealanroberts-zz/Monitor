$(function() {

  var url = 'http://dev.markitondemand.com/Api/v2/Quote/jsonp?symbol=';
  
  var stockArray = ['AAPL', 'NFLX', 'SQ', 'GE', 'GPRO', 'TWTR'];
    
    function stockArrayLen() {
        return stockArray.length;
    }

    function formatCurrency (value) {
        var suffixes = ["", "K", "M", "B","T"];
        var suffixNum = Math.floor(("" + value).length / 3);
        var shortValue = parseFloat((suffixNum !== 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(2));
        if (shortValue % 1 != 0) {
            shortNum = shortValue.toFixed(1);
        }

    return shortValue + suffixes[suffixNum];
    }
    
    var l = stockArrayLen();
    console.log(l);

    function buildList(d) {
        var list = $('.stock__list');                
        var data = d;
        console.log(data);

        var marketCap = formatCurrency(data.MarketCap);
        list.append(
            '<li class="stock__company" data-symbol="' + data.Symbol +  '"' + '>'
            + '<span class="stock__row stock__row--name">' + data.Name + '</span>'
            + ' ' 
            + '<span class="stock__row stock__row--sym">' + data.Symbol + '</span>'
            + ' ' 
            + '<span class="stock__row stock__row--market-cap">' + '$' + marketCap + '</span>'
            + ' ' 
            + '<span class="stock__row stock__row--change-pct">' +  '$' + data.Change.toFixed(2) + ' :: ' + data.ChangePercent.toFixed(2) + '%' + '</span>'
            + ' '
            + '<span class="stock__row stock__row--last-price>' + '$' + data.LastPrice 
            + '</li>');
    }
  
    function updatePrices() {
      for (var i = 0, len = stockArray.length; i < len; i++) {                  
        getStockPrices(stockArray[i]);   
      }
  }

  // Make Ajax request
    function getStockPrices(stock) {
        $.ajax({
            url: url + stock,
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
        var $el = $(this);
        console.log($el.data('symbol'));
    }

    function attachClickListeners() {
        $('.stock__company').unbind().click(getHistoryChart);
    }

    // Run once
    updatePrices();
    
    setInterval(function() {
        updatePrices();
    }, 30000);
    
});