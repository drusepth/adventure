function GameObject() {
  this.x = 0;
  this.y = 0;
  this.width = 1;
  this.height = 1;
  this.color = null;
  this.reward = null;

  this.display_color = function () {
    return this.reward || world.TILE_INVISIBLE;
  };

  this.set_position = function(coordinate_vector) {
    this.x = coordinate_vector.x;
    this.y = coordinate_vector.y;
  };

  this.randomize_color = function() {
    var current_world_tile = world.tiles[this.coordinate_vector()];
    this.reward = world.random_tile(current_world_tile);
  }

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
