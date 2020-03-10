document.addEventListener( 'keypress', onDocumentKeyPress, false );
document.addEventListener( 'click', onDocumentKeyPress, false );
// misc
let scene, camera, renderer, ambientLight;
//ORBIT CONTROLS
let controls, ringGeometry2, spotLight, lightHelper2;
// variables
let meshFloor, meshRing, debris, meshRing2, debris2, meshStage, babyRobot, firstPlane, secondPlane, planeGeo, planesGeometry;
let light, lightHelper;
let rotationCounter = 0.01;
let cameraCounter = 0.01;
let status = 0;

//soundds
let listener = new THREE.AudioListener();
let sound = new THREE.Audio(listener);
let audioLoader = new THREE.AudioLoader();
   audioLoader.load('assets/sound/sample.mp3', function (buffer) {
   sound.setBuffer(buffer);
   sound.setLoop(true);
   sound.setVolume(3);
   sound.play();
});
 
//initialization
function init(){

   scene = new THREE.Scene();
   scene.fog = new THREE.Fog(0x000000, 10, 4000);

   //loading background
   loadBackground();
   loadLights();
   loadCamera();
   loadModels();
   loadFloor();   
   loadRenderer();

   //ORBIT CONTROLS
   controls = new THREE.OrbitControls (camera, renderer.domElement);
   controls.target.set( 0, 20, 0);
   animate();
}
// function to animate put movements here
function animate(){
   controls.update();

   requestAnimationFrame(animate);

  //animating objects
   debris.rotation.z += 0.003;
   debris2.rotation.z += -0.001;

   firstPlane.position.z -= 2;
   secondPlane.position.x -= 4;
   validatePlane();
   
   //planes particles
   planesGeometry.vertices.forEach(p => {
      p.velocity += p.acceleration
      p.z += p.velocity;
      if (p.z > 500) {
        p.z = -800;
        p.velocity = 0.2;
      }
    });
    planesGeometry.verticesNeedUpdate = true;

    //following camera
    if (status == 0 ){
      camera.position.set(0, 50, 500);
    }else if (status == 1 ){
      camera.position.set((firstPlane.position.x + 15), (firstPlane.position.y + 15), (firstPlane.position.z));
    }else if (status == 2 ){
      camera.position.set((secondPlane.position.x), (secondPlane.position.y + 13), (secondPlane.position.z + 20));
    }else if (status == 3 ){
      camera.position.set(0, 300, -500);
    }
    renderer.render(scene, camera);

}

//returns plane to original position
function validatePlane(){
   if (firstPlane.position.z < -400){
      firstPlane.position.z = 400;
      firstPlane.position.x = Math.random()*800;
   }else if (secondPlane.position.x < -400){
      secondPlane.position.x = 400;
      secondPlane.position.z = Math.random()*800;
   }
}



// loading 3d models
function loadModels(){

   //loading main model
   let loader = new THREE.GLTFLoader();
   loader.load( 'assets/models/robot/scene.gltf', function ( gltf ) {
      scene.add( gltf.scene );
      babyRobot = gltf.scene;
      gltf.scene.scale.set(1, 1, 1);
      gltf.scene.position.set(0, 6, 0);
      gltf.scene.castShadow = true; gltf.scene.receiveShadow = true;
   }, undefined, function ( error ) {
      console.error( error );
   } );

   loader.load( 'assets/models/plane1/scene.gltf', function ( gltf ) {
      scene.add( gltf.scene );
      firstPlane = gltf.scene;
      gltf.scene.scale.set(0.7, 0.7, 0.7);
      gltf.scene.position.set(60, 47, 48);
   }, undefined, function ( error ) {
      console.error( error );
   } );

   loader.load( 'assets/models/plane1/scene.gltf', function ( gltf ) {
      scene.add( gltf.scene );
      secondPlane = gltf.scene;
      gltf.scene.scale.set(1, 1, 1);
      gltf.scene.position.set(400, 135, 168);
      gltf.scene.rotation.y = Math.PI/2;
   }, undefined, function ( error ) {
      console.error( error );
   } );

   //Clouds Textures 1
   loader.load('assets/models/clouds/scene.gltf', function(gltf){
      scene.add(gltf.scene);
      gltf.scene.scale.set(0.1, 0.1, 0.1);
      gltf.scene.position.x = 40;
      gltf.scene.position.y = 75;
      gltf.scene.position.z -= 65;
   }, undefined, function ( error ) {
      console.error( error );
   } );

   //Clouds Textures 2
   loader.load('assets/models/clouds/scene.gltf', function(gltf){
      scene.add(gltf.scene);
      gltf.scene.scale.set(0.1, 0.1, 0.1);
      gltf.scene.position.y = 50;
      gltf.scene.position.x -= 100;
      gltf.scene.position.z -= 30;
   }, undefined, function ( error ) {
      console.error( error );
   } );

   //Clouds Textures 3
   loader.load('assets/models/clouds/scene.gltf', function(gltf){
      scene.add(gltf.scene);
      gltf.scene.scale.set(0.1, 0.1, 0.1);
      gltf.scene.position.y = 55;
      gltf.scene.position.x = 75;
      gltf.scene.position.z = 95;
   }, undefined, function ( error ) {
      console.error( error );
   } );

   //materials
   let textureRing = new THREE.TextureLoader().load( 'assets/textures/stone_floor.jpg' );
   let materialRing = new THREE.MeshLambertMaterial( { map: textureRing, transparent: true } );
   materialRing.opacity = 0.3;
   let sprite = new THREE.TextureLoader().load('assets/textures/stone_floor.jpg');
   let ringMaterial = new THREE.PointsMaterial({color: 0xafc3cc,size: 5, map: sprite});
   let ship = new THREE.TextureLoader().load('assets/textures/spaceship.png');
   let shipMaterial = new THREE.PointsMaterial({color: 0xafc3cc,size: 40, map: ship});
   let textureStage = new THREE.TextureLoader().load( 'assets/textures/floor.jpg' );
   let materialStage = new THREE.MeshLambertMaterial( { map: textureStage } );

   //debris particles
   let ringGeometry = new THREE.Geometry();
   for (let i = 0; i < 100; i++) {
         star = new THREE.Vector3(
         Math.sin(rotationCounter) * 50,
         Math.cos(rotationCounter) * 50,
         Math.random()* 3
      );
         ringGeometry.vertices.push(star);
         rotationCounter += 0.600;
   }
   ringGeometry2 = new THREE.Geometry();
   rotationCounter = 0.001;
   for (let i = 0; i < 100; i++) {
         star = new THREE.Vector3(
         Math.sin(rotationCounter) * 40,
         Math.cos(rotationCounter) * 40,
         Math.random()* 3
      );
         ringGeometry2.vertices.push(star);
         rotationCounter += 0.600;
   }
   planesGeometry = new THREE.Geometry();
   for (let i = 0; i < 50; i++) {
         star = new THREE.Vector3(
            Math.random() * 500,
            Math.random() * 500,
            Math.random() * 1000
      );
      star.velocity = 0;
      star.acceleration = 0.02;
      planesGeometry.vertices.push(star);
   }


   //models initialization
   debris = new THREE.Points(ringGeometry, ringMaterial);
   debris.rotation.x = Math.PI/2;
   debris.position.set(0,50,0);
   debris2 = new THREE.Points(ringGeometry2, ringMaterial);
   debris2.rotation.x = Math.PI/1.5;
   debris2.position.set(0,50,0);

   planes = new THREE.Points(planesGeometry, shipMaterial);
   planes.position.set(-300,0,0);

   
   meshStage = new THREE.Mesh( new THREE.BoxBufferGeometry(150, 2, 150), materialStage);
   meshStage.castShadow = true; meshStage.receiveShadow = true;
   meshStage.position.set(0, 5, 0);

   meshRing = new THREE.Mesh( new THREE.TorusBufferGeometry(24, 3, 10, 24), ringMaterial);
   meshRing.castShadow = true; meshRing.receiveShadow = true;
   meshRing.rotation.x = Math.PI/2;
   meshRing.position.set(0, 6, 0);

   scene.add(debris, debris2, meshStage, meshRing, planes);
}

//debugging
function getMe(){
   return secondPlane;
}

//loading background
function loadBackground(){
   let CloudsMaterialArray = [];
   for (var i = 0; i < 6; i++)
   CloudsMaterialArray.push( new THREE.MeshBasicMaterial({
   map: new THREE.TextureLoader().load('assets/textures/background.jpg'),
   side: THREE.BackSide
   }));
   let CloudsGeometry = new THREE.CubeGeometry( 950,900, 1000 );
   let CloudsMaterial = new THREE.MeshFaceMaterial( CloudsMaterialArray );
   let CloudsBox = new THREE.Mesh(CloudsGeometry, CloudsMaterial);
   scene.add(CloudsBox);
   CloudsBox.position.y = 200;
}

// load lights
function loadLights(){
   ambientLight = new THREE.AmbientLight(0x404040, 0.6);
   scene.add(ambientLight);

   spotLight = new THREE.SpotLight( 0xFFA500 , 2);
   spotLight.target.position.set( 0, 50, 0);
   spotLight.castShadow = true;
   scene.add( spotLight.target );
   scene.add( spotLight );
   spotLight.shadow.mapSize.width = 512; 
   spotLight.shadow.mapSize.height = 512; 
   spotLight.shadow.camera.near = 0.5;
   spotLight.shadow.camera.far = 15000;
   spotLight.position.set(0, 50, 100);
   scene.add(spotLight);
   lightHelper2 = new THREE.PointLightHelper(spotLight);
   scene.add(spotLight, lightHelper2);
}

// floor options
function loadFloor(){
   let textureFloor = new THREE.TextureLoader().load( 'assets/textures/space.png' );
   let materialFloor = new THREE.MeshLambertMaterial( { map: textureFloor } );
   meshFloor = new THREE.Mesh( new THREE.CircleBufferGeometry(800, 24), materialFloor);
   meshFloor.receiveShadow = false;
   meshFloor.rotation.x -= Math.PI / 2;
   meshFloor.position.set(0, 0, 0);
   scene.add(meshFloor);
}

// camera options
function loadCamera(){
   camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 10000 );
   camera.position.set(0, 200, 100);
}

// renderer options
function loadRenderer(){
   renderer = new THREE.WebGLRenderer();
   renderer.setSize( window.innerWidth, window.innerHeight );
   renderer.shadowMap.enabled = true;
   renderer.shadowMap.type = THREE.BasicShadowMap;
   document.body.appendChild(renderer.domElement);

   lightHelper2.update();
}


// function for initializing movement
function onDocumentKeyPress(event){
   var keyCode = event.which;
   if (keyCode == 1){
      if (status == 3){
         status = 0;
      }else{  
         status ++;
      }
   }

}


window.onload = init;
