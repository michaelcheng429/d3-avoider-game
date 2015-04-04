
(function(){

  /*
  *
  * First section
  *
  */

  data = [{tryCount: 0, score: 0}];
  // this is our data array
   
  var startingDate = new Date(2012, 8, 18);
  // this is a date object
   
  // for (var i = 0; i < 10; i++) { // loop 10 times to create 10 data objects
   
  //     var tmpObj = {};
      
  //     // this is a temporary data object
  //     tmpObj.tryCnt = i * 40;
      
  //     // the data for this data object. Increment it from the starting date.
  //     tmpObj.score = i * 30; // random value. Round it to a whole number.
      
  //     data.push(tmpObj); // push the object into our data array
  // }

  /*
  *
  * Second section
  *
  */

  function getMaxObjectValue(this_array, element) {
    var max = 0;

    for(var i = 0; i < this_array.length; i++){
      if(this_array[i][element] > max){
        max = this_array[i][element];
      }
    }

    return max;
  }
   
  function getMinObjectValue(this_array, element) {
      var values = [];
   
      for (var i = 0; i < this_array.length; i++) {
          values.push(Math.floor(parseFloat(this_array[i][""+element])));
      }
      
      values.sort(function(a,b){return a-b});
   
      return values[0];
  }

  /*
  *
  * Third section
  *
  */

  //size the visible area of the graph using the margin values
  var width = 500, height = 500;
   
  var margin = {top: 30, right: 10, bottom: 40, left: 60},
      width = width - margin.left - margin.right,
      height = height - margin.top - margin.bottom;
   
  var minDate = (data[0].tryCount),
      maxDate = data[data.length-1].tryCount;
      minObjectValue = getMinObjectValue(data, 'score');
      maxObjectValue = getMaxObjectValue(data, 'score');
   
  //create the graph object
  var vis= d3.select("#metrics").append("svg")
      .data(data)
      .attr("class", "metrics-container")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var getMaxNum = function(prop){
    return getMaxObjectValue(data, prop);
  };
   
  var y = d3.scale.linear()
          .domain([ 0, getMaxNum('score')])
          .range([height, 0]),
      x = d3.scale.linear()
          .domain([0, 10])
          .range([0, 300]);

  /*
  *
  * Fourth section
  *
  */

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(5);
   
  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(5);
   
  vis.append("g")
      .attr("class", "axis")
      .call(yAxis);
   
  vis.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
   
  //add the axes labels
  vis.append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "end")
      .attr("x", 200)
      .attr("y", height + 34)
      .text('Avoider Tries')
      .style({'font-weight': 'bold'});
   
  vis.append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "end")
      .attr("y", 6)
      .attr("dy", "-3.4em")
      .attr("transform", "rotate(-90)")
      .text('Score')
      .style({'font-weight': 'bold'});

      /*
      *
      * Fifth section
      *
      */

    renderGraph = function(){
      d3.select('#metrics').selectAll('svg').data([]).exit().remove();

      var width = 500, height = 500;
   
      var margin = {top: 30, right: 10, bottom: 40, left: 60},
          width = width - margin.left - margin.right,
          height = height - margin.top - margin.bottom;
       
      var minDate = (data[0].tryCount),
          maxDate = data[data.length-1].tryCount;
          minObjectValue = getMinObjectValue(data, 'score');
          maxObjectValue = getMaxObjectValue(data, 'score');
       
      //create the graph object
      var vis= d3.select("#metrics").append("svg")
          .data(data)
          .attr("class", "metrics-container")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var maxTry = getMaxNum('tryCount') > 5 ? getMaxNum('tryCount') : 5;
      y = d3.scale.linear()
          .domain([ 0, getMaxNum('score') * 1.2])
          .range([430, 0]),
      x = d3.scale.linear()
          .domain([0, maxTry])
          .range([0, 430]);

      var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(5);
   
      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom")
          .ticks(5);
       
      vis.append("g")
          .attr("class", "axis")
          .call(yAxis);
       
      vis.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);
       
      //add the axes labels
      vis.append("text")
          .attr("class", "axis-label")
          .attr("text-anchor", "end")
          .attr("x", 200)
          .attr("y", height + 34)
          .text('Avoider Tries')
          .style({'font-weight': 'bold'});
       
      vis.append("text")
          .attr("class", "axis-label")
          .attr("text-anchor", "end")
          .attr("y", 6)
          .attr("dy", "-3.4em")
          .attr("transform", "rotate(-90)")
          .text('Score')
          .style({'font-weight': 'bold'});

      var line = d3.svg.line()
          .x(function(d) { return x(d.tryCount); })
          .y(function(d) { return y(d["score"]); })
       
      vis.append("svg:path")
          .attr("d", line(data))
          .style("stroke", function() {
              return "gold";
          })
          .style("fill", "none")
          .style("stroke-width", "2.5");
    }

    renderGraph();

    /*
    *
    * Sixth section
    *
    */

    var dataCirclesGroup = vis.append('svg:g');
     
    var circles = dataCirclesGroup
        .selectAll('.data-point')
        .data(data);
     
    circles
        .enter()
        .append('svg:circle')
        .attr('class', 'dot')
        .attr('fill', function() { return "red"; })
        .attr('cx', function(d) { return x(d.tryCount); })
        .attr('cy', function(d) { return y(d["score"]); })
        .attr('r', function() { return 3; })
        .on("mouseover", function(d) {
            d3.select(this)
                .attr("r", 8)
                .attr("class", "dot-selected")
                .transition()
                .duration(750);
        })
        .on("mouseout", function(d) {
            d3.select(this)
            .attr("r", 3)
            .attr("class", "dot")
            .transition()
            .duration(750);
        });
})();


