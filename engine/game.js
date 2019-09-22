var camera;
var player;

var tile_scale        = preferences.graphics.tile_pixels;
var draw_world_grid   = preferences.graphics.draw_world_grid;
var draw_player       = preferences.graphics.draw_player;
var draw_game_objects = preferences.graphics.draw_game_objects;

var game_paused = false;
var game_object_count = 25;
var game_objects = [];
var world;
var canvas;
var tick_index = 0;

function setup() {
  canvas = createCanvas(
    floor(window.innerWidth  / tile_scale) * tile_scale + tile_scale,
    floor(window.innerHeight / tile_scale) * tile_scale + tile_scale
  );
  canvas.parent('game');
  frameRate(preferences.graphics.frames_per_second);

  // Create camera
  camera = new Camera();

  // Create player
  player = new Player();
  camera.follow(player);

  // Create initial world
  world = new World();
  for (var i = 0; i < game_object_count; i++) {
    var game_object = new GameObject();
    game_object.set_position(random_location_in_viewport());
    game_object.randomize_color();
    game_objects.push(game_object);
  }
}

function random_location_in_viewport() {
  return createVector(
    floor(random(player.x - player.vision_radius, player.x + player.vision_radius)),
    floor(random(player.y - player.vision_radius, player.y + player.vision_radius))
  );
}

function draw() {
  background(preferences.graphics.background_rgb);

  if (!game_paused) {
    player.update();
  }

  camera.render(world);

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
