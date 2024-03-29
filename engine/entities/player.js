class Player {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.xspeed = 0;
    this.yspeed = 0;
    this.heartrate = 25;
    this.party_members = [];
    this.party_total   = 0;
    this.height = 1 * preferences.graphics.game_object_scale;
    this.width  = 1 * preferences.graphics.game_object_scale;

    this.vision_radius = 10;
  }

  // Preload images (needs a local server because cors lol)
  // this.assets = {
  //   snake_head: loadImage('images/snake_head.png')
  // };

  update() {
    // Build party
    if (this.party_total === this.party_members.length) {
      for (var i = 0; i < this.party_members.length - 1; i++) {
        this.party_members[i] = this.party_members[i + 1];
      }
    }
    this.party_members[this.party_total - 1] = createVector(this.x, this.y);

    this.x = this.x + this.xspeed;
    this.y = this.y + this.yspeed;

    this.xspeed = 0;
    this.yspeed = 0;
  }

  show() {
    var cols = floor(width / tile_scale);
    var rows = floor(height / tile_scale);
    var center_point = createVector(floor(cols / 2), floor(rows / 2));
    var x_translation = player.x - center_point.x;
    var y_translation = player.y - center_point.y;

    fill(255);
    for (var i = 0; i < this.party_members.length; i++) {
      if (this.party_members[i] !== undefined) {
        var relative_position = createVector(this.party_members[i].x - x_translation, this.party_members[i].y - y_translation);
        rect(
          relative_position.x * tile_scale, 
          relative_position.y * tile_scale, 
          tile_scale, 
          tile_scale
        );
      }
    }

    // Since the map is moving under us, we can safely assume we're always in the middle of it.
    // todo draw snake_head rotated and the correct size here instead
    var game_tick = tick_index || 0;
    var tick_size_flux = 1 + Math.sin(game_tick * this.heartrate);
    rect(
      floor(cols / 2) * tile_scale - floor(tick_size_flux) - floor(this.width / 2), 
      floor(rows / 2) * tile_scale - floor(tick_size_flux) - floor(this.height / 2), 
      this.width * tile_scale + tick_size_flux, 
      this.height * tile_scale + tick_size_flux
    );
  }

  turn_to(x, y) {
    this.xspeed = x;
    this.yspeed = y;
  }

  current_direction() {
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

  interaction_check(game_object) {
    // These will both check AND execute-if-true for each interaction event type
    return {
      standing_on: this.is_standing_on_game_object(game_object),
      touching:    this.is_touching_game_object(game_object),
      actioning:   this.is_actioning_game_object(game_object)
    };
  }

  is_standing_on_game_object(game_object) {
    var distance = dist(this.x, this.y, game_object.x, game_object.y);

    if (distance < 1) {
      this.party_total++;
      if (this.party_total % 40 == 0 && tile_scale > 5) {
        tile_scale -= 5;
      }

      if (this.party_total % 2 == 0) {
        console.log('new obj');
        var new_game_object = new GameObject();
        new_game_object.set_position(random_location_in_viewport());
        new_game_object.randomize_color();
        game_objects.push(new_game_object);
      }

      return true;
    } else {
      return false;
    }
  }

  is_touching_game_object(game_object) {
    // todo adjacent tile (just do distance == 0 from above, maybe hotcache distance)
  }

  is_actioning_game_object(game_object, action) {
    // todo touching && action button (&action() proc) is true 
  }

  event_stand_on(game_object) {
    game_object.interact_with(player);
  }
  event_touch(game_object) {

  }
  event_action(game_object) {

  }

  health_check() {
    this.death();
  }

  death() {
    for (var i = 0; i < this.party_members.length; i++) {
      var pos = this.party_members[i];
      if (pos === undefined) {
        continue;
      }
      var distance = dist(this.x, this.y, pos.x, pos.y);
      if (distance < 1) {
        this.party_total  = 0;
        this.party_members   = [];
        this.xspeed = 0;
        this.yspeed = 0;
        tile_scale = 20;
      }
    }
  }
}
