// start slingin' some d3 here.

(function(){

  /*
  *
  * Store initial variables
  *
  */

  var initialSettings = {
    width: '700px',
    height: '400px',
    stepInterval: 1500,
    currentScore: 0,
    highScore: 0,
    collisionCount: 0
  };

  /*
  *
  * Customize number of enemies on the board
  *
  */
  var submitButton = d3.select('.submit');
  // Initialize number of enemies to 15
  var numEnemies = 15;
  submitButton.on('click', function() {
    // Get input value from DOM
    numEnemies = document.getElementById('numberOfEnemies').value;
    // Remove all enemies from the board
    board.selectAll('.enemy').data([]).exit().remove();
    // Call createEnemies to repopulate board with new number of enemies
    enemies = createEnemies(numEnemies);
  });

  var board = d3.select('#board').append('svg')
                .attr({
                  width: '700px', 
                  height: '400px'
                })
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
      initialSettings.stepInterval += 250;
      board.selectAll('.bullet-time').data([]).exit().remove();
      bulletTime = createBulletTime();
      notify('lightgreen');
      var percentage = Math.floor((1500 / initialSettings.stepInterval) * 100);
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
      if(initialSettings.currentScore > initialSettings.highScore){
        initialSettings.highScore = initialSettings.currentScore;
        d3.select('.high span').text(initialSettings.highScore);
      }

      //only gets hit once per half second max
      if(initialSettings.currentScore > 10){
        initialSettings.collisionCount++;
        d3.select('.collisions span').text(initialSettings.collisionCount);
        notify('red');
        d3.select('.enemy-speed span').text(100);
        d3.select('.enemy-speed').style('color', 'darkred');
      }
      
      initialSettings.currentScore = 0;
      d3.select('.current span').text(initialSettings.currentScore);
      initialSettings.stepInterval = 1500;
    }
  };

  var notify = function(color, wait){
    wait = wait || 1000;

    board.style('border', '10px solid ' + color);
    setTimeout(function(){
      board.style('border', '10px solid black');
    }, wait);
  }

  var randomStep = function() {
    enemies.transition().duration(initialSettings.stepInterval)
      .attr({
        cx: function(){return Math.random() * 700}, 
        cy: function(){return Math.random() * 400}
      })
      .tween('collisionDetection', function(){
        var check = setInterval(innerCheckCollision.bind(this), 1);
        setTimeout(function(){
          clearInterval(check);
        }, initialSettings.stepInterval);
      });
  };

  var checkCollision = function(enemy){
    return Math.abs(d3.select(enemy).attr('cx') - player.attr('cx')) <= 20 &&
           Math.abs(d3.select(enemy).attr('cy') - player.attr('cy')) <= 20;
  }

  var stepper = function(interval){
    setTimeout(function(){
      randomStep();
      stepper(initialSettings.stepInterval);
    }, interval);
  };

  stepper(initialSettings.stepInterval);



  setInterval(function(){
    initialSettings.currentScore++;
    if(initialSettings.currentScore === initialSettings.highScore){
      notify('gold', 1500);
      board.append('text').attr({x: '86px', y: '180px', class: 'new-high-score'})
           .style({'font-size': '80px', 'font-weight':'bold', 'letter-spacing': '-6px', 'opacity':'0.3', 'fill': 'gold'})
           .text('New High Score');
      setTimeout(function(){
        board.selectAll('.new-high-score').data([]).exit().remove();
      }, 1500);
    }
    d3.select('.current span').text(initialSettings.currentScore);
  }, 50);

})();

