// start slingin' some d3 here.

(function(){

  var getScores = function() {
    $('.user-list').empty();

    $.ajax({
      type: 'GET',
      url: 'api/scores',
      success: function(data) {
        data.forEach(function(item){
          $('.user-list').append('<li>' + item['username'] + ' - ' + item['score'] + '</li>');
        });
      }
    });
  };

  /*
  *
  * Initial variables
  *
  */

  var initialSettings = {
    width: 700,
    height: 400,
    stepInterval: 1500,
    currentScore: 0,
    highScore: 0,
    collisionCount: 0,
    numEnemies: 7,
    level: 1
  };

  /*
  *
  * Function factory
  *
  */

  app = {

    // Sets random x-coordinate
    randomX: function() {
      return initialSettings.width * Math.random();
    },

    // Sets random y-coordinate
    randomY: function() {
      return initialSettings.height * Math.random();
    },

    // Creates a given number of enemies
    createEnemies: function(numEnemies) {
      return board.selectAll('.enemy')
        .data(d3.range(initialSettings.numEnemies))
        .enter()
        .append('circle')
        .attr({
          class: 'enemy', 
          cx: function(){
            return app.randomX();
          }, 
          cy: function(){
            return app.randomY();
          }, 
          r: 10})
        .style('fill', 'darkred');
        // .append('image')
        // .attr({x: function(){return app.randomX()}, y: function(){return app.randomY()}, width: '30px', height: '30px', 'xlink:href': 'shuriken.png'})
        // .style('fill', 'black');
    },

    // Transitions enemies to another random spot on the board
    randomStep: function() {
      enemies.transition()
        .duration(initialSettings.stepInterval)
        .attr({
          cx: function(){
            return app.randomX();
          }, 
          cy: function(){
            return app.randomY();
          }
        })
        // Listens for collisions during transitions
        .tween('collisionDetection', app.listenForCollision);
    },

    // Returns true when player collides with an enemy
    checkCollisionLogic: function(enemy){
      var enemyX = d3.select(enemy).attr('cx');
      var enemyY = d3.select(enemy).attr('cy');
      var playerX = player.attr('cx');
      var playerY = player.attr('cy');
      return Math.abs(enemyX - playerX) <= 20 &&
        Math.abs(enemyY - playerY) <= 20;
    },

    // Continuously listen for collisions during "tween" of transition
    listenForCollision: function(){
      // Check every millisecond for collisions
      var check = setInterval(app.responseToCollision.bind(this), 1);
      // Prevents setIntervals from building up
      setTimeout(function(){
        clearInterval(check);
      }, initialSettings.stepInterval);
    },

    // Response when collisions is detected
    responseToCollision: function(){
      // If there is a collision
      if(app.checkCollisionLogic(this)){

        
        app.updateHighScore();

        app.updateCollisionCount();

        app.resetEnemySpeedElement();

        app.resetCurrentScoreAndStepInterVal();

        d3.select('.level-count span').text(initialSettings.level);
      }
    },

    // Reset current score to 0, reset stepInterval to 1500
    resetCurrentScoreAndStepInterVal: function() {
      initialSettings.currentScore = 0;
      d3.select('.current span').text(initialSettings.currentScore);
      initialSettings.stepInterval = 1500;
    },

    // Update if there is new high score
    updateHighScore: function() {
      // Update scoreboard if there is a new high score
      if(initialSettings.currentScore > initialSettings.highScore){
        initialSettings.highScore = initialSettings.currentScore;
        d3.select('.high span').text(initialSettings.highScore);

        if(initialSettings.currentScore > 50){
          var username = $('.username').val();
          if(username.length){
            $.post('api/scores',
              {username: username, score: initialSettings.currentScore},
              function(data) {
                getScores();
              }
            );
          }
        }

      }
    },

    // Update collision count
    updateCollisionCount: function() {
      if(initialSettings.currentScore > 10){
        initialSettings.collisionCount++;
        d3.select('.collisions span').text(initialSettings.collisionCount);
        app.changeBorderColor('red');

        data.push({score: initialSettings.currentScore, tryCount: initialSettings.collisionCount});
        renderGraph();
        // d3.select('.enemy-speed span').text(100);
        // d3.select('.enemy-speed').style('color', 'darkred');
      }
    },

    // Reset "Enemy Speed" element to 100% and dark red
    resetEnemySpeedElement: function() {
      d3.select('.enemy-speed span').text(100);
      d3.select('.enemy-speed').style('color', 'darkred');
      initialSettings.level = 1;
      initialSettings.numEnemies = 7;
      d3.selectAll('.enemy').data([]).exit().remove();
      d3.select('.enemy-count span').text(initialSettings.numEnemies);
      enemies = app.createEnemies(initialSettings.numEnemies);
    },

    // Creates a green orb that slows down enemies
    createBulletTime: function(){
      return board.append('circle')
        .attr({
          // Class used to remove orb later when collected
          class: 'bullet-time-board', 
          cx: function(){
            return app.randomX();
          }, 
          cy: function(){
            return app.randomY()
          }, 
          r: 10
        })
        .style('fill', 'lightgreen');
    },

    // Change border to green when green orb is collected
    listenForBulletTimeCollection: function(playerX, playerY) {

      var bulletTimeX = bulletTime.attr('cx');
      var bulletTimeY = bulletTime.attr('cy');

      if (Math.abs(playerX - bulletTimeX) <= 20 && 
        Math.abs(playerY - bulletTimeY) <= 20) {

        app.slowDownEnemies();

        app.spawnNewBulletTime();

        app.changeBorderColor('lightgreen');

        app.updateEnemySpeedElement();
      }
    },

    // Slows down enemies by increasing transition interval
    slowDownEnemies: function() {
      initialSettings.stepInterval += 250;
    },

    // Spawn new green orb in new spot
    spawnNewBulletTime: function() {
      board.selectAll('.bullet-time-board').data([]).exit().remove();
      bulletTime = app.createBulletTime();
    },

    // Update "Enemy Speed" element and change color when green orb is collected
    updateEnemySpeedElement: function() {
      var percentage = Math.floor((1500 / initialSettings.stepInterval) * 100);
      var color = percentage < 100 ? 'lightgreen' : 'darkred';
      d3.select('.enemy-speed span').text(percentage);
      d3.select('.enemy-speed').style('color', color);
    },

    // Update step interval when green orb is collected
    // and when player loses
    listenForStepIntervalChanges: function(interval){
      setTimeout(function(){
        app.randomStep();
        app.listenForStepIntervalChanges(initialSettings.stepInterval);
      }, interval);
    },

    // Change border color on event
    changeBorderColor: function(color, wait){
      wait = wait || 1000;

      board.style('border', '10px solid ' + color);
      setTimeout(function(){
        board.style('border', '10px solid black');
      }, wait);
    },

    // Listen for new high score
    scoreCounter: function() {
      setInterval(function(){
        initialSettings.currentScore++;

        d3.select('.current span').text(initialSettings.currentScore);
        
        app.listenForNewHighScore();
        
      }, 50);
    },

    // Change border color and display message when new high score is reached
    listenForNewHighScore: function() {
      // If new high score is reached
      if(initialSettings.currentScore === initialSettings.highScore){
        // Change border color
        app.changeBorderColor('gold', 1500);
        // Display "New High Score" message
        board.append('text')
          .attr({
            x: '86px', 
            y: '180px', 
            class: 'new-high-score'
          })
          .style({
            'font-size': '80px', 
            'font-weight':'bold', 
            'letter-spacing': '-6px', 
            'opacity':'0.3', 
            'fill': 'gold'
          })
          .text('New High Score');
        // Reset border and message after 1.5 seconds
        setTimeout(function(){
          board.selectAll('.new-high-score').data([]).exit().remove();
        }, 1500);
      }
    },

    // Update number of enemies based on form submission
    updateNumberOfEnemies: function() {
      // Get input value from DOM
      initialSettings.numEnemies = document.getElementById('numberOfEnemies').value;
      // Remove all enemies from the board
      board.selectAll('.enemy').data([]).exit().remove();
      // Call createEnemies to repopulate board with new number of enemies
      enemies = app.createEnemies(initialSettings.numEnemies);
    },

    increaseLevel: function(){
      initialSettings.numEnemies++;
      initialSettings.level++;
      d3.select('.level-count span').text(initialSettings.level);
      d3.select('.enemy-count span').text(initialSettings.numEnemies);
      app.createEnemies(initialSettings.numEnemies);
      enemies = board.selectAll('.enemy');
      initialSettings.stepInterval = initialSettings.stepInterval * 0.75;
      app.updateEnemySpeedElement();
    }

  };

  // Customize number of enemies on the board
  var submitButton = d3.select('.submit');
  submitButton.on('click', app.updateNumberOfEnemies);

  // Initialize game board
  var board = d3.select('#board')
                .append('svg')
                .attr({
                  width: initialSettings.width + 'px', 
                  height: initialSettings.height + 'px'
                })
                .style('border', '10px solid black');

  // Initialize enemies
  var enemies = app.createEnemies(initialSettings.numEnemies);

  // Initialize green orb (bulletTime)
  var bulletTime = app.createBulletTime();

  // Initialize mouse drag for player
  var drag = d3.behavior.drag().on('drag', function(){
    var x = d3.event.x;
    var y = d3.event.y;

    // Keep player in bounds
    if(x > initialSettings.width){
      x = 690;
    }
    if(x < 0){
      x = 10;
    }
    if(y > initialSettings.height){
      y = 390;
    }
    if(y < 0){
      y = 10;
    }

    // Update player x and y coordinates according to mouse drag
    player.attr({cx: x, cy: y});

    // Listen for when player collides with green orb
    app.listenForBulletTimeCollection(x,y);
  });

  // Initialize player
  // var player = board.append('circle')
  //                 .attr({
  //                   cx: '350',
  //                   cy: '200',
  //                   r: '10'
  //                 })
  //                 .style('fill', 'steelblue')
  //                 .call(drag);

  var levelInterval = setInterval(function(){
    app.increaseLevel();
  }, 10000);

  // Initialize score counter
  app.scoreCounter();

  // Listen for green orb collection and losing to update stepInterval
  app.listenForStepIntervalChanges(initialSettings.stepInterval);
  getScores();

  var player = board.selectAll('.mouse')
    .data([1]).enter().append('circle')
    .attr({
      class: 'mouse',
      cx: '350',
      cy: '200',
      r: '10'
    })
    .style('fill', 'steelblue')

  board.on('mousemove', function() {
    var loc = d3.mouse(this);

    mouse = {x:loc[0], y:loc[1]};
    var x = mouse.x;
    var y = mouse.y;

    // Keep player in bounds
    if(x > initialSettings.width){
      x = 690;
    }
    if(x < 0){
      x = 10;
    }
    if(y > initialSettings.height){
      y = 390;
    }
    if(y < 0){
      y = 10;
    }

    d3.select('.mouse').attr({
      cy: y,
      cx: x
    });
    
    app.listenForBulletTimeCollection(x,y);
  });
  
})();

