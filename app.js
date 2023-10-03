const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

// Create a scene
const createScene = function () {
  var scene = new BABYLON.Scene(engine);

  // Create a camera
  var camera = new BABYLON.ArcRotateCamera(
    "camera",
    -Math.PI / 2,
    Math.PI / 4,
    10,
    new BABYLON.Vector3(0, 0, 0),
    scene
  ); // Create a Babylon.js scene
  var canvas = document.getElementById("renderCanvas");
  var engine = new BABYLON.Engine(canvas, true);

  var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    var camera = new BABYLON.FreeCamera(
      "camera",
      new BABYLON.Vector3(0, 5, -10),
      scene
    );
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    var light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(0, 1, 0),
      scene
    );

    // Variables for drawing and moving
    var drawing = false;
    var drawnPoints = [];
    var selectedMesh = null;
    var selectedVertex = null;
    var extrusionHeight = 1;

    // Function to create a shape mesh
    function createShapeMesh(points) {
      var shape = new BABYLON.MeshBuilder.ExtrudePolygon(
        "shape",
        { shape: points, depth: extrusionHeight },
        scene
      );
      return shape;
    }

    // Function to handle left-click (add points)
    function handleCanvasLeftClick(event) {
      if (drawing) {
        var pickResult = scene.pick(scene.pointerX, scene.pointerY);
        if (pickResult.hit) {
          var point = pickResult.pickedPoint;
          drawnPoints.push(new BABYLON.Vector3(point.x, 0, point.z));
        }
      }
    }

    // Function to handle right-click (complete shape)
    function handleCanvasRightClick(event) {
      if (drawing) {
        if (drawnPoints.length >= 3) {
          var shape = createShapeMesh(drawnPoints);
          drawing = false;
          drawnPoints = [];
        }
      }
    }

    // Add event listeners for mouse clicks
    canvas.addEventListener("mousedown", function (event) {
      if (event.button === 0) {
        // Left-click
        handleCanvasLeftClick(event);
      } else if (event.button === 2) {
        // Right-click
        handleCanvasRightClick(event);
      }
    });

    return scene;
  };

  var scene = createScene();

  // Render loop
  engine.runRenderLoop(function () {
    scene.render();
  });

  // Resize the canvas with the window
  window.addEventListener("resize", function () {
    engine.resize();
  });

  camera.attachControl(canvas, true);

  // Create a light
  var light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );

  // Create a ground plane
  var ground = BABYLON.MeshBuilder.CreateGround(
    "ground",
    { width: 10, height: 10 },
    scene
  );
  ground.position.y = -1;

  // Create a 2D shape
  var shape = [];
  var shapeMode = false;
  var extrudeHeight = 2;
  var extrudedObject;
  var selectedObject;
  var editMode = false;
  var moveMode = false;

  // Draw mode
  var drawButton = document.getElementById("drawButton");
  drawButton.addEventListener("click", function () {
    shapeMode = true;
  });

  // Extrude mode
  var extrudeButton = document.getElementById("extrudeButton");
  extrudeButton.addEventListener("click", function () {
    if (shape.length > 0) {
      extrudedObject = BABYLON.MeshBuilder.ExtrudePolygon(
        "extruded",
        { shape: shape, depth: extrudeHeight },
        scene
      );
      extrudedObject.position.y = extrudeHeight / 2;
      shape = [];
    }
  });

  // Move mode
  var moveButton = document.getElementById("moveButton");
  moveButton.addEventListener("click", function () {
    moveMode = true;
    editMode = false;
  });

  // Vertex edit mode
  var vertexEditButton = document.getElementById("vertexEditButton");
  vertexEditButton.addEventListener("click", function () {
    editMode = true;
    moveMode = false;
  });
  var drawnPoints = []; // To store the points of the drawn shape

  // Listen for left-click to add points
  canvas.addEventListener("pointerdown", function (event) {
    if (shapeMode && event.button === 0) {
      var pickResult = scene.pick(event.clientX, event.clientY);
      if (pickResult.hit) {
        var point = pickResult.pickedPoint;
        drawnPoints.push(point.clone());
        // Create a mesh or visualization for the point if needed
      }
    }
  });

  // Listen for right-click to complete the shape
  canvas.addEventListener("pointerdown", function (event) {
    if (shapeMode && event.button === 2) {
      if (drawnPoints.length >= 3) {
        // Create a polygon mesh using drawnPoints
        var polygon = BABYLON.MeshBuilder.CreatePolygon("polygon", {
          shape: drawnPoints,
          scene: scene,
        });
        // Optionally, set material and position
        // polygon.material = new BABYLON.StandardMaterial("polygonMat", scene);
        // polygon.position.y = extrudeHeight / 2;
        drawnPoints = []; // Clear points
      }
    }
  });

  var selectedVertex = null; // To store the selected vertex
  var editingObject = null; // To store the object being edited

  // Listen for pointer events to select and move vertices
  canvas.addEventListener("pointerdown", function (event) {
    if (editMode) {
      var pickResult = scene.pick(event.clientX, event.clientY);
      if (pickResult.hit && pickResult.pickedMesh === editingObject) {
        // Vertex selection logic here (find the closest vertex)
        selectedVertex = pickResult.pickedPoint;
      }
    }
  });

  canvas.addEventListener("pointermove", function (event) {
    if (editMode && selectedVertex) {
      var pickResult = scene.pick(event.clientX, event.clientY);
      if (pickResult.hit) {
        // Update the selected vertex's position
        selectedVertex.copyFrom(pickResult.pickedPoint);
      }
    }
  });

  canvas.addEventListener("pointerup", function () {
    selectedVertex = null; // Clear the selected vertex
  });

  var selectedObject = null; // To store the selected object

  // Listen for pointer events to select and move objects
  canvas.addEventListener("pointerdown", function (event) {
    if (moveMode) {
      var pickResult = scene.pick(event.clientX, event.clientY);
      if (pickResult.hit && pickResult.pickedMesh !== ground) {
        selectedObject = pickResult.pickedMesh;
      }
    }
  });

  canvas.addEventListener("pointermove", function (event) {
    if (moveMode && selectedObject) {
      var pickResult = scene.pick(event.clientX, event.clientY);
      if (pickResult.hit) {
        // Move the selected object based on pointer movement
        selectedObject.position.copyFrom(pickResult.pickedPoint);
      }
    }
  });

  canvas.addEventListener("pointerup", function () {
    selectedObject = null; // Clear the selected object
  });

  return scene;
};

const scene = createScene(); //Call the createScene function
// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
  scene.render();
});
// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
  engine.resize();
});
