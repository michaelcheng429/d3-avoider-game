// start slingin' some d3 here.

(function(){
  var stepInterval = 1500;

  var board = d3.select('#board').append('svg')
                .attr({width: '700px', height: '400px'})
                .style('border', '10px solid black');

  var enemies = board.selectAll('.enemy')
                     .data(d3.range(10))
                     .enter()
                     // .append('image')
                     // .attr({x: function(){return Math.random() * 700}, y: function(){return Math.random() * 400}, width: '30px', height: '30px', 'xlink:href': 'shuriken.png'})
                     // .style('fill', 'black');
                     .append('circle')
                     .attr({cx: function(){return Math.random() * 700}, cy: function(){return Math.random() * 400}, r: 10, d: 'M150 0 L75 200 L225 200 Z'})
                     .style('fill', 'darkred');

  var createBulletTime = function(){
    return board.append('circle')
           .attr({class: 'bullet-time', cx: function(){return Math.random() * 700}, cy: function(){return Math.random() * 400}, r: 10})
           .style('fill', 'lightgreen');
  };

  var bulletTime = createBulletTime();

  var drag = d3.behavior.drag().on('drag', function(){
    var x = d3.event.x;
    var y = d3.event.y;

    if(x > 700){
      x = 690;
    }
    if(x < 0){
      x = 10;
    }
    if(y > 400){
      y = 390;
    }
    if(y < 0){
      y = 10;
    }
    if (Math.abs(x - bulletTime.attr('cx')) <= 20 && Math.abs(y - bulletTime.attr('cy')) <= 20) {
      stepInterval += 1500;
      board.selectAll('.bullet-time').data([]).exit().remove();
      bulletTime = createBulletTime();
    }
    player.attr({cx: x, cy: y});
  });

  var player = board.append('circle')
                  .attr({
                    cx: '350',
                    cy: '200',
                    r: '10'
                  })
                  .style('fill', 'steelblue')
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
      stepInterval = 1500;
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

  var stepper = function(interval){
    setTimeout(function(){
      randomStep();
      stepper(stepInterval);
    }, interval);
  };

  stepper(stepInterval);

  var currentScore = 0;
  var highScore = 0;
  var collisionCount= 0;

  setInterval(function(){
    currentScore++;
    d3.select('.current span').text(currentScore);
  }, 50);
})();


