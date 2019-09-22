class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.scale = 1;
    this.object_to_follow = null;
  }

  update() {
    console.log('updating camera');
  }

  show() {
    console.log('showing camera');
  }

  follow(object) {
    this.object_to_follow = object;
  }

  render(world) {
    console.log('rendering world through camera');

    // Determine the area in which we want to render
    var cols_rendering        = floor(width  / tile_scale);
    var rows_rendering        = floor(height / tile_scale);
    var upper_left_boundary   = createVector(
      floor(this.object_to_follow.x - cols_rendering / 2),
      floor(this.object_to_follow.y - rows_rendering / 2)
    );
    // We render 1 extra square down and right to make sure we draw to window edge
    var bottom_right_boundary = createVector(
      1 + floor(this.object_to_follow.x + cols_rendering / 2),
      1 + floor(this.object_to_follow.y + rows_rendering / 2)
    );

    // Shift our rendering area to put our protagonist at the center of it
    var center_point          = createVector(floor(cols_rendering / 2), floor(rows_rendering / 2));
    var x_translation         = this.object_to_follow.x - center_point.x;
    var y_translation         = this.object_to_follow.y - center_point.y;

    // Turn a black stroke on/off depending on the user's preference
    draw_world_grid ? stroke(0, 0, 0) : noStroke();

    // Draw this visible chunk of the world for this object!
    for (var y = upper_left_boundary.y; y < bottom_right_boundary.y; y++) {
      for (var x = upper_left_boundary.x; x < bottom_right_boundary.x; x++) {
        var this_cell_position   = createVector(x, y);
        var relative_coordinates = createVector(
          this_cell_position.x - x_translation, 
          this_cell_position.y - y_translation
        );

        var cell_data = world.tiles[this_cell_position] || null;
        if (cell_data === null) {
          cell_data = world.initialize_cell(this_cell_position);
        }

        if (cell_data !== null) {
          fill(cell_data.x, cell_data.y, cell_data.z);

          // todo image of cell type (forest, mountains, etc) here
          rect(relative_coordinates.x * tile_scale, relative_coordinates.y * tile_scale, tile_scale, tile_scale);
        }
      }
    }
    // After we're done, reset stroke back to the default black
    stroke(0, 0, 0);

    // Draw all the game_objects we can capture
    if (draw_game_objects) {
      for (var i = 0; i < game_objects.length; i++) {
        var game_object = game_objects[i];
        var game_object_color = game_object.display_color();
        var relative_coordinates = createVector(game_object.x - x_translation, game_object.y - y_translation);
        //console.log("Drawing game_object @", relative_coordinates.x, relative_coordinates.y);
        fill(game_object_color.x, game_object_color.y, game_object_color.z);

        // todo game_object image in the circle
        ellipse(
          relative_coordinates.x * tile_scale + (tile_scale / 2),
          relative_coordinates.y * tile_scale + (tile_scale / 2),
          game_object.width * tile_scale * preferences.graphics.game_object_scale,
          game_object.height * tile_scale * preferences.graphics.game_object_scale
        );
      }
    }
  }
}
