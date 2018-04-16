/**
 * 构造渲染器
 */
var renderer;
function initRender() {
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}
/**
 * 构造镜头
 */
var camera;
function initCamera() {
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(-14, 8, 16);
}
/**
 * 构造物理世界
 */
var scene;
function initScene() {
    scene = new Physijs.Scene();
    scene.setGravity(new THREE.Vector3(0, -7.8, 0));//重力加速度
    scene.background = new THREE.Color(0xbfd1e5);
}
/**
 * 构造灯光
 */
var light;
function initLight() {
    scene.add(new THREE.AmbientLight(0x404040));
    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 1, 1);
    scene.add(light);
}

/**
 * 物理引擎
 */
function breakableObject(a, b, c, impactNormal, impactPoint, impulse) {
    if (impactNormal && impactPoint && impulse > 250) {
        var debris = convexBreaker.subdivideByImpact(this, impactPoint, impactNormal, 1, 2, 1.5);
        var numObjects = debris.length;
        for (var j = 0; j < numObjects; j++) {
            var material = new Physijs.createMaterial(
                new THREE.MeshPhongMaterial({color: 0xF0A024}),
                0.8, // high friction
                0.4 // low restitution
            );
            var object = new Physijs.ConvexMesh(debris[j].geometry, material, debris[j].userData.mass);
            object.copy(debris[j]);
            object.addEventListener("collision",breakableObject);
            scene.add(object);
            convexBreaker.prepareBreakableObject(object, debris[j].userData.mass, new THREE.Vector3(), new THREE.Vector3(), true);
        }
        scene.remove(this);
    }
}
var pos = new THREE.Vector3();
var quat = new THREE.Quaternion();
function createGround() {
    // Ground

    var object = new THREE.BoxGeometry(40, 1, 40, 1, 1, 1);
    var ground_material = new Physijs.createMaterial(
        new THREE.MeshLambertMaterial(),
        .8, // high friction
        .4 // low restitution
    );
    var ground = new Physijs.BoxMesh(object, ground_material, 0);
    scene.add(ground);
}
//初始化性能插件
var stats;
function initStats() {
    stats = new Stats();
    document.body.appendChild(stats.dom);
}

//用户交互插件 鼠标左键按住旋转，右键按住平移，滚轮缩放
var controls;
function initControls() {

    controls = new THREE.OrbitControls(camera, renderer.domElement);

    // 如果使用animate方法时，将此函数删除
    //controls.addEventListener( 'change', render );
    // 使动画循环使用时阻尼或自转 意思是否有惯性
    controls.enableDamping = true;
    //动态阻尼系数 就是鼠标拖拽旋转灵敏度
    //controls.dampingFactor = 0.25;
    //是否可以缩放
    controls.enableZoom = true;
    //是否自动旋转
    // controls.autoRotate = true;
    //设置相机距离原点的最近距离
    controls.minDistance = 10;
    //设置相机距离原点的最远距离
    controls.maxDistance = 600;
    //是否开启右键拖拽
    controls.enablePan = false;
    //鼠标点击按钮(旋转,缩放,平移)
    controls.mouseButtons = {ORBIT: THREE.MOUSE.RIGHT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.LEFT};
}
var time = 0;
var clock = new THREE.Clock();
function render() {
    var deltaTime = clock.getDelta();
    scene.simulate(deltaTime,10);
    renderer.render(scene, camera);
    time += deltaTime;
}

//窗口变动触发的函数
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    render();
    renderer.setSize(window.innerWidth, window.innerHeight);

}
var mouseCoords = new THREE.Vector2();
var raycaster = new THREE.Raycaster();
var ballMaterial = new THREE.MeshPhongMaterial({color: 0x202020});
function initInput() {

    window.addEventListener('mousedown', function (event) {
        if (THREE.MOUSE.RIGHT === event.button) return;
        mouseCoords.set(
            ( event.clientX / window.innerWidth ) * 2 - 1,
            -( event.clientY / window.innerHeight ) * 2 + 1
        );

        raycaster.setFromCamera(mouseCoords, camera);

        // Creates a ball and throws it
        var ballMass = 35;
        var ballRadius = 0.4;
        var object = new THREE.SphereGeometry(ballRadius, 14, 10);
        var ground_material = new Physijs.createMaterial(
            ballMaterial,
            0.8, // high friction
            0.4 // low restitution
        );
        var ground = new Physijs.SphereMesh(object, ground_material, ballMass);
        ground.position.copy(raycaster.ray.origin);
        //   ground.addEventListener( 'collision', breakableObject );
        scene.add(ground);
        pos.copy(raycaster.ray.direction);
        pos.multiplyScalar(50);
        ground.setLinearVelocity(pos);
    }, false);

}

function animate() {
    //更新控制器
    controls.update();
    render();
    //更新性能插件
    stats.update();
    requestAnimationFrame(animate);
}
var convexBreaker = new THREE.ConvexObjectBreaker();
function createObject() {
    var mass = 1000;
    var towerHalfExtents = new THREE.Vector3(2, 5, 2);
    pos.set(-8, 5.6, 0);
    quat.set(0, 0, 0, 1);
    var geometry = new THREE.BoxGeometry(towerHalfExtents.x * 2, towerHalfExtents.y * 2, towerHalfExtents.z * 2);
    var material = new Physijs.createMaterial(
        new THREE.MeshPhongMaterial({color: 0xF0A024}),
        0.8, // high friction
        0.4 // low restitution
    );
    var object = new Physijs.ConvexMesh(geometry, material, mass);
    object.position.copy(pos);
    object.quaternion.copy(quat);
    object.addEventListener("collision", breakableObject);
    scene.add(object);
    convexBreaker.prepareBreakableObject(object, mass, new THREE.Vector3(), new THREE.Vector3(), true);
//
//			// Tower 2
//			pos.set( 8, 5, 0 );
//			quat.set( 0, 0, 0, 1 );
//			createObject( towerMass, towerHalfExtents, pos, quat, createMaterial( 0xF4A321 ) );
//
//			//Bridge
//			var bridgeMass = 100;
//			var bridgeHalfExtents = new THREE.Vector3( 7, 0.2, 1.5 );
//			pos.set( 0, 10.2, 0 );
//			quat.set( 0, 0, 0, 1 );
//			createObject( bridgeMass, bridgeHalfExtents, pos, quat, createMaterial( 0xB38835 ) );
//
//			// Stones
//			var stoneMass = 120;
//			var stoneHalfExtents = new THREE.Vector3( 1, 2, 0.15 );
//			var numStones = 8;
//			quat.set( 0, 0, 0, 1 );
//			for ( var i = 0; i < numStones; i++ ) {
//
//				pos.set( 0, 2, 15 * ( 0.5 - i / ( numStones + 1 ) ) );
//
//				createObject( stoneMass, stoneHalfExtents, pos, quat, createMaterial( 0xB0B0B0 ) );
//
//			}
//
//			// Mountain
//			var mountainMass = 860;
//			var mountainHalfExtents = new THREE.Vector3( 4, 5, 4 );
//			pos.set( 5, mountainHalfExtents.y * 0.5, - 7 );
//			quat.set( 0, 0, 0, 1 );
//			var mountainPoints = [];
//			mountainPoints.push( new THREE.Vector3( mountainHalfExtents.x, - mountainHalfExtents.y, mountainHalfExtents.z ) );
//			mountainPoints.push( new THREE.Vector3( - mountainHalfExtents.x, - mountainHalfExtents.y, mountainHalfExtents.z ) );
//			mountainPoints.push( new THREE.Vector3( mountainHalfExtents.x, - mountainHalfExtents.y, - mountainHalfExtents.z ) );
//			mountainPoints.push( new THREE.Vector3( - mountainHalfExtents.x, - mountainHalfExtents.y, - mountainHalfExtents.z ) );
//			mountainPoints.push( new THREE.Vector3( 0, mountainHalfExtents.y, 0 ) );
//			var mountain = new THREE.Mesh( new THREE.ConvexGeometry( mountainPoints ), createMaterial( 0xFFB443 ) );
//			mountain.position.copy( pos );
//			mountain.quaternion.copy( quat );
//			convexBreaker.prepareBreakableObject( mountain, mountainMass, new THREE.Vector3(), new THREE.Vector3(), true );
//			createDebrisFromBreakableObject( mountain );

}
function draw() {
    initRender();
    initScene();
    initCamera();
    initLight();
    initControls();
    initStats();
    animate();
    createGround();
    initInput();
    createObject();
    window.onresize = onWindowResize;
}
window.onload = draw;

