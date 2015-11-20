$(function() {

  var url = 'http://dev.markitondemand.com/Api/v2/Quote/jsonp?symbol=';
  
  var stockArray = ['AAPL', 'NFLX', 'SQ', 'GE', 'GPRO', 'TWTR'];
    
    function stockArrayLen() {
        return stockArray.length;
    }
    
    l = stockArrayLen();
    console.log(l);
    
    function buildUI(d) {
        var list = $('.stock__list');                
        var data = d;
        console.log(data);
        list.append(
            '<li>'
            + '<span class="stock__row">' + data.Name + '</span>'
            + ' ' 
            + '<span class="stock__row">' + data.Symbol + '</span>'
            + ' ' 
            + '<span class="stock__row">' + data.MarketCap + '</span>'
            + ' ' 
            + '<span class="stock__row">' + data.ChangePercent + '</span>'
            + ' '
            + '$'
            + data.LastPrice 
            + '</li>');
    }
  
    function updatePrices() {
      for (var i = 0, len = stockArray.length; i < len; i++) {                  getStockPrices(stockArray[i]);   
      }
  }

  // Make Ajax request
    function getStockPrices(stock) {
        $.ajax({
            url: url + stock,
            contentType: 'application/json',
            dataType: 'jsonp'
        })
        .success(function(data) {
            buildUI(data);
        });
    }
    
    // Run once
    updatePrices();
    
    setInterval(function() {
        updatePrices();
    }, 60000);
    
});