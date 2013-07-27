//graphy stuff
function drawGraphs(xLabels, ask, bid) {
  var barChartData = {
    labels : xLabels,
    datasets : [
      {
        fillColor : "rgba(106,174,242,0)",
        strokeColor : "rgba(106,174,242,1)",
        data : ask

      },
      {
        fillColor : "rgba(126, 179, 72, 1)",
        strokeColor : "rgba(126, 179, 72, 1)",
        data : bid
      }
    ]
    
  }

var myLine = new Chart(document.getElementById("myChart").getContext("2d")).Line(barChartData);
}

function GraphDataController($scope, $http) {
  // Open orders
  $scope.orders = {
    orders : [],
    update : function() {
      $http.get('/orders.json').success(function(data) {
        if (data.orders) {
          $scope.orders.orders = data.orders;
        } else {
          alert("error " + data.error);
        }
      });
    }
  };
  $scope.orders.update();

  // Executed trades
  $scope.trades = {
    trades : [],
    update : function() {
      $http.get('/trades.json').success(function(data) {
        if (data.trades) {
          $scope.trades.trades = data.trades;
        } else {
          alert("error " + data.error);
        }
      });
    }
  };
  $scope.trades.update();
  $scope.pricesAsk = [];
  $scope.pricesBid=[];
  $scope.xLabel=[];
  //$scope.upDown= $scope.pricesAsk[pricesAsk.length-2]-$scope.pricesAsk[pricesAsk.length-1];



  //this generates an array with our x labels 
  for (var i=0;i<31;i++) {
    $scope.xLabel.push(i);
    
  }

  // Mt Gox Prices
  $scope.mtgox = {
    
    lastBBO : {},
    update : function() {
      $http.get('/mtgox.json').success(function(data) {
        if (data.lastBBO) {
          $scope.mtgox.lastBBO = data.lastBBO;
          $scope.pricesAsk.push($scope.mtgox.lastBBO.ask);
          $scope.pricesBid.push($scope.mtgox.lastBBO.bid);
          //label the x axis of the chart 
          drawGraphs($scope.xLabel, $scope.pricesAsk.slice(Math.max($scope.pricesAsk.length - 30, 0)), $scope.pricesBid.slice(Math.max($scope.pricesBid.length - 30, 0)));
          $scope.upDown= $scope.pricesAsk[$scope.pricesAsk.length-2]-$scope.pricesAsk[$scope.pricesAsk.length-1];
        } else {
          alert("error - " + data.error);
        }
      });
    }
  };

  
  $scope.mtgox.update();
  setInterval(function() {$scope.mtgox.update();}, 10000);
  
}




