var player;
var tile_scale = 16;
var vision_radius;
var draw_world_grid = true;
var draw_player = true;
var draw_game_objects = true;
var game_paused = false;

var game_object_count = 25;
var game_objects = [];
var world;
var canvas;
var tick_index = 0;

function setup() {
  canvas = createCanvas(
    floor(window.innerWidth / tile_scale) * tile_scale + tile_scale,
    floor(window.innerHeight / tile_scale) * tile_scale + tile_scale
  );
  canvas.parent('game');
  frameRate(60);

  vision_radius = floor(height / tile_scale) * floor(width / tile_scale) / random(300, 400);

  // Create player
  player = new Player();

  // Create initial world
  world = new World();
  for (var i = 0; i < game_object_count; i++) {
    var game_object = new GameObject();
    game_object.set_position(random_location());
    game_object.randomize_color();
    game_objects.push(game_object);
  }
}

function random_location() {
  return createVector(
    floor(random(player.x - vision_radius, player.x + vision_radius)),
    floor(random(player.y - vision_radius, player.y + vision_radius))
  );
}

function draw() {
  background(25, 105, 255);
  if (!game_paused) {
    player.update();
  }

  // Determine the area in which we want to render
  var cols                  = floor(width  / tile_scale);
  var rows                  = floor(height / tile_scale);
  var upper_left_boundary   = createVector(
    floor(player.x - cols / 2),
    floor(player.y - rows / 2)
  );
  // We render 1 extra square down and right to make sure we draw to window edge
  var bottom_right_boundary = createVector(
    1 + floor(player.x + cols / 2),
    1 + floor(player.y + rows / 2)
  );

  // Shift our rendering area to put our protagonist at the center of it
  var center_point          = createVector(floor(cols / 2), floor(rows / 2));
  var x_translation         = player.x - center_point.x;
  var y_translation         = player.y - center_point.y;

  // Turn a black stroke on/off depending on the player's preference
  draw_world_grid ? stroke(0, 0, 0) : noStroke();

  // Draw this visible chunk of the world for the player!
  for (var y = upper_left_boundary.y; y < bottom_right_boundary.y; y++) {
    for (var x = upper_left_boundary.x; x < bottom_right_boundary.x; x++) {
      var this_cell_position = createVector(x, y);
      var relative_coordinates = createVector(this_cell_position.x - x_translation, this_cell_position.y - y_translation);
      var cell_data = world.tiles[this_cell_position] || null;
      if (cell_data === null) {
        world.tiles[this_cell_position] = world.random_tile(cell_data);
        cell_data = world.tiles[this_cell_position];
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

  // Game logic: check for game_object captures
  for (var i = 0; i < game_objects.length; i++) {
    var game_object = game_objects[i];
    //console.log('game_object:', game_object.x, game_object.y);
    // todo loop over anyone that can capture game_objects here, not just player
    var interaction_check = player.interaction_check(game_object);

    if (!!interaction_check['standing_on']) {
      player.event_stand_on(game_object);
    }
    if (!!interaction_check['touching']) {
      player.event_touch(game_object);
    }
    if (!!interaction_check['actioning']) {
      player.event_action(game_object);
    }
  }

  // Paint player and the game_objects last, so they're always on top of the painted world
  if (draw_player) {
    player.show();
  }

  tick_index++;
  if (tick_index > 5000) {
    tick_index -= 5000;
  }

  // Do a quick health check to end the game if we're dead
  player.health_check();

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

function keyPressed() {
  switch (keyCode) {
    case UP_ARROW:
      if (player.current_direction() != 'down') {
        player.turn_to(0, -1);
      }
      break;

    case DOWN_ARROW:
      if (player.current_direction() != 'up') {
        player.turn_to(0, 1);
      }
      break;

    case RIGHT_ARROW:
      if (player.current_direction() != 'left') {
        player.turn_to(1, 0);
      }
      break;

    case LEFT_ARROW:
      if (player.current_direction() != 'right') {
        player.turn_to(-1, 0);
      }
      break;

    case 189: // minus key
      if (tile_scale > 5) {
        tile_scale -= 1;
      }
      break;

    case 187: // plus key
      if (tile_scale < 50) {
        tile_scale += 1;
      }
      break;

    case 71: // g
      draw_world_grid = !draw_world_grid;
      break;

    case 32: // space bar
      game_paused = !game_paused;
      break;

    case 68: // d
      var original_xspeed = player.xspeed;
      var original_yspeed = player.yspeed;
      player.xspeed = 0;
      player.yspeed = 0;
      draw_player = false;
      draw_game_objects = false;

      draw();

      var canvas_export = canvas.canvas.toDataURL('image/jpeg', 1.0);

      player.xspeed = original_xspeed;
      player.yspeed = original_yspeed;
      draw_player = true;
      draw_game_objects = true;

      var img = document.createElement('img');
      img.src = canvas_export;

      var a = document.createElement('a');
      a.setAttribute("download", "map.jpeg");
      a.setAttribute("href", canvas_export);
      a.appendChild(img);

      var w = open();
      w.document.title = 'Export Map';
      w.document.body.innerHTML = 'Left-click on the map below to save it to your downloads folder.';
      w.document.body.appendChild(a);
      break;

    default:
      console.log(keyCode + ' pressed.');

  }
}
