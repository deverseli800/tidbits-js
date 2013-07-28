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

// draw arrow for up/down 
function drawGreenArrow(id) {
	var canvas=document.getElementById(id);
	var context= canvas.getContext("2d");
		context.clearRect(0, 0, canvas.width, canvas.height);
      context.beginPath();
      context.moveTo(0, 40);
      context.lineTo(20,10);
      context.lineTo(40,40);
      
      context.closePath();
      context.fillStyle = "rgba(126, 179, 72, 1)";
      context.fill();
      context.lineWidth = 1;
}

// draw red for up/down 
function drawRedArrow(id) {
	var canvas=document.getElementById(id);
	var context= canvas.getContext("2d");
	context.clearRect(0, 0, canvas.width, canvas.height);

      context.beginPath();
      context.moveTo(0, 10);
      context.lineTo(20,40);
      context.lineTo(40,10);
      
      context.closePath();
      context.fillStyle = "red";
      context.fill();
      context.lineWidth = 1;
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
  $scope.pricesAsk = [100];
  $scope.pricesBid=[110,100];
  $scope.xLabel=[];



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
          //draw arrows based on uptick or downtick for ask 
          $scope.askUpDown= $scope.pricesAsk[$scope.pricesAsk.length-2]-$scope.pricesAsk[$scope.pricesAsk.length-1];
          if ($scope.askUpDown>0) {
          	drawRedArrow("arrow");
          }
          else {
          	drawGreenArrow("arrow");
          }
          //draw arrows based on uptick or downtick for bid 
          $scope.bidUpDown= $scope.pricesBid[$scope.pricesBid.length-2]-$scope.pricesBid[$scope.pricesBid.length-1];
          if ($scope.bidUpDown>0) {
          	drawRedArrow("arrow2");
          }
          else {
          	drawGreenArrow("arrow2");
          }
                    
        } else {
          alert("error - " + data.error);
        }
      });
    }
  };

  
  $scope.mtgox.update();
  setInterval(function() {$scope.mtgox.update();}, 5000);
  
}




