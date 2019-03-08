var player;
var tile_scale = 20;
var expansion_radius;
var draw_world_grid = true;
var draw_player = true;
var draw_objectives = true;
var drawn_world = {};
var game_paused = false;

var objective_count = 25;
var objectives = [];
var canvas;

function setup() {
  canvas = createCanvas(
    floor(window.innerWidth / tile_scale) * tile_scale + tile_scale,
    floor(window.innerHeight / tile_scale) * tile_scale + tile_scale
  );
  canvas.parent('game');
  frameRate(10);

  expansion_radius = floor(height / tile_scale) * floor(width / tile_scale) / random(300, 400);

  player = new Snake();
  for (var i = 0; i < objective_count; i++) {
    var objective = new Objective();
    objective.set_position(random_location());
    objective.randomize_color();
    objectives.push(objective);
  }
}

function random_location() {
  return createVector(
    floor(random(player.x - expansion_radius, player.x + expansion_radius)),
    floor(random(player.y - expansion_radius, player.y + expansion_radius))
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
      var cell_data = drawn_world[this_cell_position] || null;
      if (cell_data !== null) {
        fill(cell_data.x, cell_data.y, cell_data.z);

        // todo image of cell type (forest, mountains, etc) here
        rect(relative_coordinates.x * tile_scale, relative_coordinates.y * tile_scale, tile_scale, tile_scale);
      }
    }
  }
  // After we're done, reset stroke back to the default black
  stroke(0, 0, 0);

  // Game logic: check for objective captures
  for (var i = 0; i < objectives.length; i++) {
    var objective = objectives[i];
    //console.log('Objective:', objective.x, objective.y);
    // todo loop over anyone that can capture objectives here, not just player
    if (player.capture_objective(objective)) {
      objective.capture(player, drawn_world);
    }
  }

  // Paint player and the objectives last, so they're always on top of the painted world
  if (draw_player) {
    player.show();
  }

  // Do a quick health check to end the game if we're dead
  player.health_check();

  // Draw all the objectives we can capture
  if (draw_objectives) {
    for (var i = 0; i < objectives.length; i++) {
      var objective = objectives[i];
      var objective_color = objective.pre_capture_color();
      var relative_coordinates = createVector(objective.x - x_translation, objective.y - y_translation);
      //console.log("Drawing objective @", relative_coordinates.x, relative_coordinates.y);
      fill(objective_color.x, objective_color.y, objective_color.z);

      // todo objective image in the circle
      ellipse(
        relative_coordinates.x * tile_scale + (tile_scale / 2),
        relative_coordinates.y * tile_scale + (tile_scale / 2),
        tile_scale * preferences.graphics.objective_scale,
        tile_scale * preferences.graphics.objective_scale
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
      draw_objectives = false;

      draw();

      var canvas_export = canvas.canvas.toDataURL('image/jpeg', 1.0);

      player.xspeed = original_xspeed;
      player.yspeed = original_yspeed;
      draw_player = true;
      draw_objectives = true;

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
