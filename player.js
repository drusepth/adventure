function Player() {
  this.x = 0;
  this.y = 0;
  this.xspeed = 0;
  this.yspeed = -1;
  this.total = 0;
  this.tail = [];

  // Preload images (needs a local server because cors lol)
  // this.assets = {
  //   snake_head: loadImage('images/snake_head.png')
  // };

  this.update = function() {
    // Build tail
    if (this.total === this.tail.length) {
      for (var i = 0; i < this.tail.length - 1; i++) {
        this.tail[i] = this.tail[i + 1];
      }
    }
    this.tail[this.total - 1] = createVector(this.x, this.y);

    this.x = this.x + this.xspeed;
    this.y = this.y + this.yspeed;
  };

  this.show = function() {
    var cols = floor(width / tile_scale);
    var rows = floor(height / tile_scale);
    var center_point = createVector(floor(cols / 2), floor(rows / 2));
    var x_translation = player.x - center_point.x;
    var y_translation = player.y - center_point.y;

    fill(255);
    for (var i = 0; i < this.tail.length; i++) {
      if (this.tail[i] !== undefined) {
        var relative_position = createVector(this.tail[i].x - x_translation, this.tail[i].y - y_translation);
        rect(relative_position.x * tile_scale, relative_position.y * tile_scale, tile_scale, tile_scale);
      }
    }

    // Since the map is moving under us, we can safely assume we're always in the middle of it.
    // todo draw snake_head rotated and the correct size here instead
    rect(floor(cols / 2) * tile_scale, floor(rows / 2) * tile_scale, tile_scale, tile_scale);
  };

  this.turn_to = function(x, y) {
    this.xspeed = x;
    this.yspeed = y;
  };

  this.current_direction = function () {
    if (this.xspeed == 0 && this.yspeed == -1) {
      return 'up';
    } else if (this.xspeed == 0 && this.yspeed == 1) {
      return 'down';
    } else if (this.xspeed == 1 && this.yspeed == 0) {
      return 'right';
    } else if (this.xspeed == -1 && this.yspeed == 0) {
      return 'left';
    } else {
      console.log(this.xspeed, this.yspeed);
    }
  }

  this.capture_game_object = function (game_object) {
    var distance = dist(this.x, this.y, game_object.x, game_object.y);

    if (distance < 1) {
      this.total++;
      if (this.total % 40 == 0 && tile_scale > 5) {
        tile_scale -= 5;
      }

      if (this.total % 2 == 0) {
        console.log('new obj');
        var new_game_object = new GameObject();
        new_game_object.set_position(random_location());
        new_game_object.randomize_color();
        game_objects.push(new_game_object);
      }

      return true;
    } else {
      return false;
    }
  };

  this.health_check = function () {
    this.death();
  };

  this.death = function() {
    for (var i = 0; i < this.tail.length; i++) {
      var pos = this.tail[i];
      if (pos === undefined) {
        continue;
      }
      var distance = dist(this.x, this.y, pos.x, pos.y);
      if (distance < 1) {
        this.total  = 0;
        this.tail   = [];
        this.xspeed = 0;
        this.yspeed = 0;
        tile_scale = 20;
      }
    }
  }
}
