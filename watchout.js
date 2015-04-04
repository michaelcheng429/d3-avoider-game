// start slingin' some d3 here.

(function(){

  var submitButton = d3.select('.submit');
  var numEnemies = 15;
  submitButton.on('click', function() {
    numEnemies = document.getElementById('numberOfEnemies').value;

    board.selectAll('.enemy').data([]).exit().remove();

    enemies = createEnemies(numEnemies);
  });

  var stepInterval = 1500;

  var board = d3.select('#board').append('svg')
                .attr({width: '700px', height: '400px'})
                .style('border', '10px solid black');

  var createEnemies = function(numEnemies) {
    return board.selectAll('.enemy')
                     .data(d3.range(numEnemies))
                     .enter()
                     // .append('image')
                     // .attr({x: function(){return Math.random() * 700}, y: function(){return Math.random() * 400}, width: '30px', height: '30px', 'xlink:href': 'shuriken.png'})
                     // .style('fill', 'black');
                     .append('circle')
                     .attr({class: 'enemy', cx: function(){return Math.random() * 700}, cy: function(){return Math.random() * 400}, r: 10})
                     .style('fill', 'darkred');
  }

  var enemies = createEnemies(numEnemies);

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
      stepInterval += 250;
      board.selectAll('.bullet-time').data([]).exit().remove();
      bulletTime = createBulletTime();
      notify('lightgreen');
      var percentage = Math.floor((1500 / stepInterval) * 100);
      d3.select('.enemy-speed span').text(percentage);
      d3.select('.enemy-speed').style('color', 'lightgreen');
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
        notify('red');
        d3.select('.enemy-speed span').text(100);
        d3.select('.enemy-speed').style('color', 'darkred');
      }
      
      currentScore = 0;
      d3.select('.current span').text(currentScore);
      stepInterval = 1500;
    }
  };

  var notify = function(color){
    board.style('border', '10px solid ' + color);
    setTimeout(function(){
      board.style('border', '10px solid black');
    }, 1000);
  }

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


//something notifying when you get hit.
//something notifying when you get bullettime
//a # showing how much bullettime you've gained
//when you get bullettime a quote pops up.


