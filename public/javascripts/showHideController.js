//graphy stuff for line graph
function drawLineGraph(xLabels, ask, bid) {
  var lineChartData = {
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

  var myLine = new Chart(document.getElementById("myChart").getContext("2d")).Line(lineChartData);
}

//sort ascending 
function compareNumbers(a, b) {
       return a-b;
      }

//draw bar graph
function drawBarGraph(labels, quantity) {
  var barChartData = {
    labels : labels,
    datasets : [
      {
        fillColor : "rgba(106,174,242,0.5)",
        strokeColor : "rgba(220,220,220,1)",
        data : quantity
      }
      
    ]
  }
  var myLine = new Chart(document.getElementById("barChart").getContext("2d")).Bar(barChartData);
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

function heatMap(dataArray) {
      var array=dataArray.sort(compareNumbers);
      var traunchSize= Math.round(array.length*.33);
      var level1=[];
      var level2=[];
      var level3=[];
      var value= document.getElementsByClassName('quantityCell');

      for(i=0;i<array.length;i++) {
        var value= document.getElementsByClassName('quantityCell');
        if(i<(traunchSize)) {
          level1.push(array[i]);
          //value[i].style.backgroundColor="red";
        }
        else if(i<(traunchSize*2)) {
          level2.push(array[i]);
        }
        else {
          level3.push(array[i]);
        }
      }
      //iterate over all values of quantityCell
      for(i=0;i<value.length;i++){
        for(x=0;x<level1.length;x++) {
          if(value[i].innerHTML==level1[x]) {
            
          }
          else{

          }
        }
        for(x=0;x<level2.length;x++) {
          if(value[i].innerHTML==level2[x]) {
            
          }
          else{
          }
        }
        for(x=0;x<level3.length;x++) {
          if(value[i].innerHTML==level3[x]) {
            var opacity=1/level3.length;
            //alert(.2+(opacity*x));
            value[i].style.backgroundColor="rgba(239,19,19,"+(.2+(opacity*x))+")";
          }
          else{
          }
        }

      }
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
  $scope.orderPrices=[];
  for(var i=0; i<$scope.orders.orders.length; i++) {
    //$scope.orderPrices.push($scope.orders.orders[i].price);
    alert($scope.orders.orders[i]);
  
}

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
    order: function() {
      //create array of all order prices
      $scope.orderPrices=[];
      $scope.orderQTY=[];
      for(var i=0; i<$scope.orders.orders.length; i++) {
        $scope.orderPrices.push($scope.orders.orders[i].price);
        $scope.orderQTY.push($scope.orders.orders[i].quantity);
        }
      //draw bar graph
      drawBarGraph($scope.orderPrices.sort(compareNumbers), $scope.orderQTY);

      //draw heat map
      heatMap($scope.orderQTY);         
          
    },
    lastBBO : {},
    update : function() {
      $http.get('/mtgox.json').success(function(data) {
        if (data.lastBBO) {
          //get mtgox data 
          $scope.mtgox.lastBBO = data.lastBBO;
          $scope.pricesAsk.push($scope.mtgox.lastBBO.ask);
          $scope.pricesBid.push($scope.mtgox.lastBBO.bid);
          //label the x axis of the chart 
          drawLineGraph($scope.xLabel, $scope.pricesAsk.slice(Math.max($scope.pricesAsk.length - 30, 0)), $scope.pricesBid.slice(Math.max($scope.pricesBid.length - 30, 0)));
          
          //draw arrows based on uptick or downtick for ask 
          $scope.askUpDown= $scope.pricesAsk[$scope.pricesAsk.length-2]-$scope.pricesAsk[$scope.pricesAsk.length-1];
          if ($scope.askUpDown>0) {
          	drawRedArrow("arrow");
            $scope.askColor='red';
          }
          else {
          	drawGreenArrow("arrow");
            $scope.askColor="green";
          }
          
          //draw arrows based on uptick or downtick for bid 
          $scope.bidUpDown= $scope.pricesBid[$scope.pricesBid.length-2]-$scope.pricesBid[$scope.pricesBid.length-1];
          if ($scope.bidUpDown>0) {
          	drawRedArrow("arrow2");
            $scope.bidColor='red';
          }
          else {
          	drawGreenArrow("arrow2");
            $scope.bidColor='green';
          }
                    
        } else {
          alert("error - " + data.error);
        }
      });
    }
  };

  
  $scope.mtgox.update();
  setInterval(function() {$scope.mtgox.update();}, 1000);
  $scope.mtgox.order();
  setInterval(function(){$scope.mtgox.order();},1000);

}




