// start slingin' some d3 here.

(function(){
  var stepInterval = 1500;

  var board = d3.select('#board').append('svg')
                .attr({width: '700px', height: '400px'})
                .style('border', '10px solid black');

  var enemies = board.selectAll('.enemy')
                     .data(d3.range(30))
                     .enter()
                     // .append('image')
                     // .attr({x: function(){return Math.random() * 700}, y: function(){return Math.random() * 400}, width: '30px', height: '30px', 'xlink:href': 'shuriken.png'})
                     // .style('fill', 'black');
                     .append('circle')
                     .attr({cx: function(){return Math.random() * 700}, cy: function(){return Math.random() * 400}, r: 10, d: 'M150 0 L75 200 L225 200 Z'})
                     .style('fill', 'black');

  var drag = d3.behavior.drag().on('drag', function(){
    player.attr({cx: d3.event.x, cy: d3.event.y});
  });

  var player = board.append('circle')
                  .attr({
                    cx: '350',
                    cy: '200',
                    r: '10'
                  })
                  .style('fill', 'red')
                  .call(drag);

  var innerCheckCollision = function(){
    if(checkCollision(this)){
      if(currentScore > highScore){
        highScore = currentScore;
        d3.select('.high span').text(highScore);
      }

      //only gets hit once per half second max
      if(currentScore > 10){
        collisionCount++;
        d3.select('.collisions span').text(collisionCount);
      }
      
      currentScore = 0;
      d3.select('.current span').text(currentScore);
    }
  };

  var randomStep = function() {
    enemies.transition().duration(stepInterval)
      .attr({
        cx: function(){return Math.random() * 700}, 
        cy: function(){return Math.random() * 400}
      })
      .tween('collisionDetection', function(){
        var check = setInterval(innerCheckCollision.bind(this), 1);
        setTimeout(function(){
          clearInterval(check);
        }, stepInterval);
      });
  };

  var checkCollision = function(enemy){
    return Math.abs(d3.select(enemy).attr('cx') - player.attr('cx')) <= 20 &&
           Math.abs(d3.select(enemy).attr('cy') - player.attr('cy')) <= 20;
  }

  setInterval(randomStep, stepInterval);

  var currentScore = 0;
  var highScore = 0;
  var collisionCount= 0;

  setInterval(function(){
    currentScore++;
    d3.select('.current span').text(currentScore);
  }, 50);
})();


