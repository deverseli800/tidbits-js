//graphy stuff
function drawGraphs(ask, bid) {
  var barChartData = {
    labels : ["January","February","March","April","May","June","July"],
    datasets : [
      {
        fillColor : "rgba(106,174,242,0.5)",
        strokeColor : "rgba(106,174,242,0.5)",
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
  // Mt Gox Prices
  $scope.mtgox = {
    
    lastBBO : {},
    update : function() {
      $http.get('/mtgox.json').success(function(data) {
        if (data.lastBBO) {
          $scope.mtgox.lastBBO = data.lastBBO;
          $scope.pricesAsk.push($scope.mtgox.lastBBO.ask);
          $scope.pricesBid.push($scope.mtgox.lastBBO.bid);
          drawGraphs($scope.pricesAsk, $scope.pricesBid);
        } else {
          alert("error - " + data.error);
        }
      });
    }
  };

  
  
  setInterval(function() {$scope.mtgox.update();}, 1000);
}

function showHideController($scope) {

$scope.butter="3";  
}


