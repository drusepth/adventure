function GameObject() {
  this.x = 0;
  this.y = 0;
  this.color = null;
  this.reward = null;

  this.TILE_WATER     = createVector(25, 105, 255);
  this.TILE_SAND      = createVector(194, 178, 128);
  this.TILE_GRASS     = createVector(144, 238, 144);
  this.TILE_DIRT      = createVector(237, 201, 175);
  this.TILE_FOREST    = createVector(34, 139, 34);
  this.TILE_MOUNTAINS = createVector(128, 128, 128);
  this.TILE_INVISIBLE = createVector(0, 0, 0, 0);

  this.display_color = function () {
    return this.reward || this.TILE_INVISIBLE;
  };

  this.set_position = function(coordinate_vector) {
    this.x = coordinate_vector.x;
    this.y = coordinate_vector.y;
  };

  this.randomize_color = function() {
    var current_world_tile = drawn_world[this.coordinate_vector()];

    if (current_world_tile === undefined || current_world_tile === null) {
      this.reward = this.random_selection([
        this.TILE_GRASS
      ]);
      return;
    }

    switch (this.comparable_vector(current_world_tile)) {
      case this.comparable_vector(this.TILE_WATER):
        this.reward = this.random_selection([
          this.TILE_GRASS,
          this.TILE_MOUNTAINS
        ]);
        break;

        case this.comparable_vector(this.TILE_GRASS):
          this.reward = this.random_selection([
            this.TILE_WATER,
            this.TILE_DIRT,
            this.TILE_FOREST,
            this.TILE_FOREST,
            this.TILE_MOUNTAINS
          ]);
          break;

      case this.comparable_vector(this.TILE_DIRT):
        this.reward = this.random_selection([
          this.TILE_SAND,
          this.TILE_GRASS,
          this.TILE_WATER,
          this.TILE_MOUNTAINS
        ]);
        break;

      case this.comparable_vector(this.TILE_FOREST):
        this.reward = this.random_selection([
          this.TILE_FOREST,
          this.TILE_FOREST,
          this.TILE_FOREST,
          this.TILE_GRASS,
        ]);
        break;

      case this.comparable_vector(this.TILE_SAND):
        this.reward = this.random_selection([
          this.TILE_DIRT,
          this.TILE_SAND
        ]);
        break;

      case this.comparable_vector(this.TILE_MOUNTAINS):
        this.reward = this.random_selection([
          this.TILE_MOUNTAINS,
          this.TILE_DIRT
        ]);
        break;

      default:
        console.log('unknown tile: ' + current_world_tile);
        this.reward = this.random_selection([
          this.TILE_GRASS,
          this.TILE_WATER,
          this.TILE_FOREST,
          this.TILE_DIRT
        ]);
        break;
    }
  }

  this.random_selection = function(options_list) {
    var chosen_option = floor(random(options_list.length));
    return options_list[chosen_option];
  };

  this.comparable_vector = function(vector) {
    return vector.x + '-' + vector.y + '-' + vector.z;
  };

  this.coordinate_vector = function() {
    return createVector(this.x, this.y);
  };

  this.interact_with = function(who_captured, world) {
    var coordinates_to_paint = this.reward_coordinate_vectors();
    for (var i = 0; i < coordinates_to_paint.length; i++) {
      world[coordinates_to_paint[i]] = this.reward;
    }

    // Re-use this game_object instead of making a new one + garbage collecting
    this.set_position(random_location());
    this.randomize_color();
  };

  this.reward_coordinate_vectors = function () {
    // todo other shapes depending on the game_object and/or a property on it?
    // e.g. river = 3-4 in a line

    return [
      createVector(this.x, this.y),
      // up/down/left/right
      createVector(this.x - 1, this.y),
      createVector(this.x + 1, this.y),
      createVector(this.x, this.y - 1),
      createVector(this.x, this.y + 1),
      // even further up/down/left/right
      createVector(this.x - 2, this.y),
      createVector(this.x + 2, this.y),
      createVector(this.x, this.y - 2),
      createVector(this.x, this.y + 2),
      // diagonals
      createVector(this.x - 1, this.y - 1),
      createVector(this.x - 1, this.y + 1),
      createVector(this.x + 1, this.y - 1),
      createVector(this.x + 1, this.y + 1)
    ];
  };
}
