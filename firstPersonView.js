//Strict mode makes it easier to write "secure" JavaScript. Only declared variable can be used
"use strict";

Cesium.FirstPersonCameraSimulator = (function () {
    const Cartesian3 = Cesium.Cartesian3;

    let key_pressed={};
    let DIRECTION_NONE = -1;
    let HUMAN_WALKING_SPEED = 0;

    const DIRECTION_FORWARD = 0;
    const DIRECTION_BACKWARD = 1;
    const DIRECTION_LEFT = 2;
    const DIRECTION_RIGHT = 3;

    // const STOP_MOVING = 0;
    // const HUMAN_WALKING_SPEED = 1.5;
    // const HUMAN_RUNNING_SPEED = 8;

    const HUMAN_EYE_HEIGHT = 1.7;
    const MAX_PITCH_IN_DEGREE = 88;
    const ROTATE_SPEED = -5;

    function FirstPersonSimulator(options) {
        this._enabled = false;
        this._cesiumViewer = options.cesiumViewer;
        this._canvas = this._cesiumViewer.canvas;
        this._camera = this._cesiumViewer.camera;

        this._connectEventHandlers();
    }

    let firstPersonSimulator = FirstPersonSimulator.prototype;

    firstPersonSimulator._connectEventHandlers = function () {
        const canvas = this._cesiumViewer.canvas;

        this._screenSpaceEventHandler = new Cesium.ScreenSpaceEventHandler(this._canvas);

        this._screenSpaceEventHandler.setInputAction(this._onMouseLButtonClicked.bind(this), Cesium.ScreenSpaceEventType.LEFT_DOWN);
        this._screenSpaceEventHandler.setInputAction(this._onMouseUp.bind(this), Cesium.ScreenSpaceEventType.LEFT_UP);
        this._screenSpaceEventHandler.setInputAction(this._onMouseMove.bind(this),Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this._screenSpaceEventHandler.setInputAction(this._onMouseLButtonDoubleClicked.bind(this), Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        // put focus on the Canvas
        canvas.setAttribute("tabindex", "0");

        canvas.onclick = function () {
            canvas.focus();
        };

        canvas.addEventListener("keydown", this._onKeyDown.bind(this));
        canvas.addEventListener("keyup", this._onKeyUp.bind(this));

        this._disconectOnClockTick = this._cesiumViewer.clock.onTick.addEventListener(firstPersonSimulator._onClockTick, this);
    };

    firstPersonSimulator._onMouseLButtonClicked = function (movement) {
        this._looking = true;
        this._mousePosition = this._startMousePosition = Cartesian3.clone(movement.position);
    };

    firstPersonSimulator._onMouseLButtonDoubleClicked = function (movement) {
        this._looking = true;
        this._mousePosition = this._startMousePosition = Cartesian3.clone(movement.position);
    };

    firstPersonSimulator._onMouseUp = function (position) {
        this._looking = false;
    };

    firstPersonSimulator._onMouseMove = function (movement) {
        this._mousePosition = movement.endPosition;
    };




   firstPersonSimulator._onKeyDown = function (event) {
        const keyCode = event.keyCode;

        console.log(key_pressed);

       key_pressed[event.keyCode] = event.type == 'keydown';
       if (keyCode != 32){
           this._direction = DIRECTION_NONE;
           console.log("I'm triggered");
       }

       if (key_pressed[32]) {
           HUMAN_WALKING_SPEED = 6;
            }
       else{ HUMAN_WALKING_SPEED = 1.5 }
       console.log(HUMAN_WALKING_SPEED);
       switch (keyCode) {
           case "W".charCodeAt(0):
               this._direction = DIRECTION_FORWARD;
               break;
           case "S".charCodeAt(0):
               this._direction = DIRECTION_BACKWARD;
               break;
           case "D".charCodeAt(0):
               this._direction = DIRECTION_RIGHT;
               break;
           case "A".charCodeAt(0):
               this._direction = DIRECTION_LEFT;
               break;
           default:
               break;
       }
       console.log(this._direction);
       return;
   }


   firstPersonSimulator._onKeyUp = function (e) {
        console.log("release" + e.keyCode);
        if(e.keyCode != 32){
        this._direction = DIRECTION_NONE;
            key_pressed[e.keyCode]= false;
        return;
        }

       else{
            HUMAN_WALKING_SPEED = 1.5;
           key_pressed[e.keyCode]= false;
        return;}
    };

   //change heading pitch
    firstPersonSimulator._changeHeadingPitch = function (dt) {
        let width = this._canvas.clientWidth;
        let height = this._canvas.clientHeight;


        let deltaX = (this._mousePosition.x - this._startMousePosition.x) / width;
        let deltaY = -(this._mousePosition.y - this._startMousePosition.y) / height;

        let currentHeadingInDegree = Cesium.Math.toDegrees(this._camera.heading);
        let deltaHeadingInDegree = (deltaX * ROTATE_SPEED);
        let newHeadingInDegree = currentHeadingInDegree + deltaHeadingInDegree;

        let currentPitchInDegree = Cesium.Math.toDegrees(this._camera.pitch);
        let deltaPitchInDegree = (deltaY * ROTATE_SPEED);
        let newPitchInDegree = currentPitchInDegree + deltaPitchInDegree;


        if( newPitchInDegree > MAX_PITCH_IN_DEGREE * 2 && newPitchInDegree < 360 - MAX_PITCH_IN_DEGREE) {
            newPitchInDegree = 360 - MAX_PITCH_IN_DEGREE;
        }
        else {
            if (newPitchInDegree > MAX_PITCH_IN_DEGREE && newPitchInDegree < 360 - MAX_PITCH_IN_DEGREE) {
                newPitchInDegree = MAX_PITCH_IN_DEGREE;
            }
        }

        this._camera.setView({
            orientation: {
                heading : Cesium.Math.toRadians(newHeadingInDegree),
                pitch : Cesium.Math.toRadians(newPitchInDegree),
                roll : this._camera.roll
            }
        });
    };

    let scratchCurrentDirection = new Cartesian3();
    let scratchDeltaPosition = new Cartesian3();
    let scratchNextPosition = new Cartesian3();
    let scratchTerrainConsideredNextPosition = new Cartesian3();
    let scratchNextCartographic = new Cesium.Cartographic();

    firstPersonSimulator._onClockTick = function (clock) {

        if(!this._enabled)
            return;

        let dt = clock._clockStep;

        if(this._looking)
            this._changeHeadingPitch(dt);

        if(this._direction === DIRECTION_NONE)
            return;

        let distance = this._walkingSpeed() * dt;

        if(this._direction === DIRECTION_FORWARD)
            Cartesian3.multiplyByScalar(this._camera.direction, 1, scratchCurrentDirection);
        else if(this._direction === DIRECTION_BACKWARD)
            Cartesian3.multiplyByScalar(this._camera.direction, -1, scratchCurrentDirection);
        else if(this._direction === DIRECTION_LEFT)
            Cartesian3.multiplyByScalar(this._camera.right, -1, scratchCurrentDirection);
        else if(this._direction === DIRECTION_RIGHT)
            Cartesian3.multiplyByScalar(this._camera.right, 1, scratchCurrentDirection);

        Cartesian3.multiplyByScalar(scratchCurrentDirection, distance, scratchDeltaPosition);

        let currentCameraPosition = this._camera.position;

        Cartesian3.add(currentCameraPosition, scratchDeltaPosition, scratchNextPosition);


        let globe = this._cesiumViewer.scene.globe;
        let ellipsoid = globe.ellipsoid;

        ellipsoid.cartesianToCartographic(scratchNextPosition, scratchNextCartographic);

        let height = globe.getHeight(scratchNextCartographic);

        if(height === undefined) {
            console.warn('height is undefined!');
            return;
        }

        if(height < 0) {
            console.warn(`height is negative!`);
        }

        scratchNextCartographic.height = height + HUMAN_EYE_HEIGHT;

        ellipsoid.cartographicToCartesian(scratchNextCartographic, scratchTerrainConsideredNextPosition);

        this._camera.setView({
            destination: scratchTerrainConsideredNextPosition,
            orientation: new Cesium.HeadingPitchRoll(this._camera.heading, this._camera.pitch, this._camera.roll),
            endTransform : Cesium.Matrix4.IDENTITY
        });
    };

    firstPersonSimulator._walkingSpeed = function (){

        return HUMAN_WALKING_SPEED;
    };

    firstPersonSimulator._enableDefaultScreenSpaceCameraController = function (enabled) {
        const scene = this._cesiumViewer.scene;


        scene.screenSpaceCameraController.enableRotate = enabled;
        scene.screenSpaceCameraController.enableTranslate = enabled;
        scene.screenSpaceCameraController.enableZoom = enabled;
        scene.screenSpaceCameraController.enableTilt = enabled;
        scene.screenSpaceCameraController.enableLook = enabled;
        // scene.screenSpaceCameraController.lookEventTypes.CameraEventType=  {modifier : KeyboardEventModifier.CTRL, eventType : CameraEventType.LEFT_DRAG };
    };

    firstPersonSimulator.start = function () {
        this._enabled = true;

        this._enableDefaultScreenSpaceCameraController(false);

        let currentCameraPosition = this._camera.position;

        let cartographic = new Cesium.Cartographic();

        let globe = this._cesiumViewer.scene.globe;

        globe.ellipsoid.cartesianToCartographic(currentCameraPosition, cartographic);

        let height = globe.getHeight(cartographic);

        if(height === undefined)
            return false;

        if(height < 0) {
            console.warn(`height is negative`);
        }

        cartographic.height = height + HUMAN_EYE_HEIGHT;

        let newCameraPosition = new Cartesian3();

        globe.ellipsoid.cartographicToCartesian(cartographic, newCameraPosition);

        let currentCameraHeading = this._camera.heading;

        this._heading = currentCameraHeading;

        this._camera.flyTo({
            destination : newCameraPosition,
            orientation : {
                heading : currentCameraHeading,
                pitch : Cesium.Math.toRadians(0),
                roll : 0.0
            }
        });

        return true;
    };

    firstPersonSimulator.stop = function () {
        this._enabled = false;

        this._enableDefaultScreenSpaceCameraController(true);

        const centre = Cesium.Cartesian3.fromDegrees( 139.7594327, 35.67905);

        const offset = new Cesium.Cartesian3(0.0, -4790.0, 3930.0)


        viewer.camera.lookAt(centre, offset);
        viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    };

    return FirstPersonSimulator;
})();