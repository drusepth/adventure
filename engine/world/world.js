class World {
  constructor() {
    this.tiles = {};

    this.TILE_WATER     = createVector(25, 105, 255);
    this.TILE_SAND      = createVector(194, 178, 128);
    this.TILE_GRASS     = createVector(144, 238, 144);
    this.TILE_DIRT      = createVector(237, 201, 175);
    this.TILE_FOREST    = createVector(34, 139, 34);
    this.TILE_MOUNTAINS = createVector(128, 128, 128);
    this.TILE_INVISIBLE = createVector(0, 0, 0, 0);
  }

  static random_tile(current_tile) {
    if (current_tile === undefined || current_tile === null) {
        return this.random_selection([
          world.TILE_GRASS,
          world.TILE_GRASS,
          world.TILE_GRASS,
          world.TILE_GRASS,
          world.TILE_WATER
        ]);
    }

    switch (this.comparable_vector(current_tile)) {
      case this.comparable_vector(world.TILE_WATER):
        return this.random_selection([
            world.TILE_GRASS,
            world.TILE_MOUNTAINS
        ]);
        break;

      case this.comparable_vector(world.TILE_GRASS):
        return this.random_selection([
          world.TILE_WATER,
          world.TILE_DIRT,
          world.TILE_FOREST,
          world.TILE_FOREST,
          world.TILE_MOUNTAINS
        ]);
        break;

      case this.comparable_vector(world.TILE_DIRT):
        return this.random_selection([
          world.TILE_SAND,
          world.TILE_GRASS,
          world.TILE_WATER,
          world.TILE_MOUNTAINS
        ]);
        break;

      case this.comparable_vector(world.TILE_FOREST):
        return this.random_selection([
          world.TILE_FOREST,
          world.TILE_FOREST,
          world.TILE_FOREST,
          world.TILE_GRASS,
        ]);
        break;

      case this.comparable_vector(world.TILE_SAND):
        return this.random_selection([
          world.TILE_DIRT,
          world.TILE_SAND
        ]);
        break;

      case this.comparable_vector(world.TILE_MOUNTAINS):
        return this.random_selection([
          world.TILE_MOUNTAINS,
          world.TILE_DIRT
        ]);
        break;

      default:
        console.log('unknown tile: ' + current_tile);
        return this.random_selection([
          world.TILE_GRASS,
          world.TILE_WATER,
          world.TILE_FOREST,
          world.TILE_DIRT
        ]);
        break;
    }
  }
  
  static comparable_vector(vector) {
    return vector.x + '-' + vector.y + '-' + vector.z;
  }
  
  static random_selection(options_list) {
    var chosen_option = floor(random(options_list.length));
    return options_list[chosen_option];
  }
}

