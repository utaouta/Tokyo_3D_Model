Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzMGYwNzBmNy0xNzI2LTQ3MzAtOGU5NC1jZDM4NzNiNmJiZDEiLCJpZCI6Njc4MTEsImlhdCI6MTYzMjA4MTQ2OX0.fWC8Krja5JVKvNIttC_dtvSuzC_lDGozFhu4i_rivuk';

function getWater(){
    viewer.scene.globe.enableLighting = true;
    viewer.scene.globe.depthTestAgainstTerrain = true;


    viewer.scene.logarithmicDepthBuffer = false;


    let boundary = [139.56, 35.82, 0,
        139.92, 35.82, 0,
        139.92, 35.58, 0,
        139.56, 35.58, 0];

    let newHeight = 0;
    let water = new Cesium.Primitive({
        show: true,
        geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.PolygonGeometry({
                polygonHierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights(boundary)),
                vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                extrudedHeight: 0,

            })
        })
    })

    function addWaterAnimation (viewer) {
        water = new Cesium.Primitive({
            show: true,
            geometryInstances: new Cesium.GeometryInstance({
                geometry: new Cesium.PolygonGeometry({
                    polygonHierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights(boundary)),
                    vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                    extrudedHeight: newHeight,
                    height: 0
                })
            }),
            appearance: new Cesium.EllipsoidSurfaceAppearance({
                aboveGround: true,
                material: new Cesium.Material({
                    fabric: {
                        type: 'Water',
                        uniforms: {
                            normalMap: "water.jpg",
                            frequency: 100.0,
                            animationSpeed: 0.01,
                            amplitude: 10.0
                        }
                    }
                }),

                fragmentShaderSource: 'varying vec3 v_positionMC;\n' +
                    'varying vec3 v_positionEC;\n' +
                    'varying vec2 v_st;\n' +
                    'void main()\n' +
                    '{\n' +
                    'czm_materialInput materialInput;\n' +
                    'vec3 normalEC = normalize(czm_normal3D * czm_geodeticSurfaceNormal(v_positionMC, vec3(0.0), vec3(1.0)));\n' +
                    '#ifdef FACE_FORWARD\n' +
                    'normalEC = faceforward(normalEC, vec3(0.0, 0.0, 1.0), -normalEC);\n' +
                    '#endif\n' +
                    'materialInput.s = v_st.s;\n' +
                    'materialInput.st = v_st;\n' +
                    'materialInput.str = vec3(v_st, 0.0);\n' +
                    'materialInput.normalEC = normalEC;\n' +
                    'materialInput.tangentToEyeMatrix = czm_eastNorthUpToEyeCoordinates(v_positionMC, materialInput.normalEC);\n' +
                    'vec3 positionToEyeEC = -v_positionEC;\n' +
                    'materialInput.positionToEyeEC = positionToEyeEC;\n' +
                    'czm_material material = czm_getMaterial(materialInput);\n' +
                    '#ifdef FLAT\n' +
                    'gl_FragColor = vec4(material.diffuse + material.emission, material.alpha);\n' +
                    '#else\n' +
                    'gl_FragColor = czm_phong(normalize(positionToEyeEC), material, czm_lightDirectionEC);\n' +
                    'gl_FragColor.a=0.5;\n' +
                    '#endif\n' +
                    '}\n'
            })
        })

        viewer.scene.primitives.add(water)
    }

    addWaterAnimation(viewer)



    var tileset = viewer.scene.primitives.add(
        new Cesium.Cesium3DTileset({
            url: "https://tokyo-flood.herokuapp.com/Specs/Data/Cesium3DTiles/tileset.json",
        })
    );


    let viewModel = {
        height: 0,
        display: false
    };
    Cesium.knockout.track(viewModel);

    let toolbar = document.getElementById('toolbar');
    Cesium.knockout.applyBindings(viewModel, toolbar);


    Cesium.knockout.getObservable(viewModel, 'height').subscribe(
        function(newValue) {

            newHeight = newValue;
            viewer.scene.primitives.remove(water);
            console.log(water);
            addWaterAnimation( viewer)
            switch(true){
                case ( newValue <= 37):
                    tileset.style = undefined;
                    break;
                case ( newValue > 37 &&  newValue <= 47):
                    tileset.style = undefined;
                    tileset.style = new Cesium.Cesium3DTileStyle({
                        color: {
                            conditions: [
                                ["(${_z}>37 && ${_z} < 47)", "color('RED')"],
                                ["true", "color('white')"],
                            ],
                        },
                    });
                    break;
                case ( newValue > 47 &&  newValue <= 57):
                    tileset.style = undefined;
                    tileset.style = new Cesium.Cesium3DTileStyle({
                        color: {
                            conditions: [
                                ["(${_z}>37 && ${_z} < 57)", "color('RED')"],
                                ["true", "color('white')"],
                            ],
                        },
                    });
                    break;
                case ( newValue > 57 &&  newValue <= 67):
                    tileset.style = undefined;
                    tileset.style = new Cesium.Cesium3DTileStyle({
                        color: {
                            conditions: [
                                ["(${_z}>37 && ${_z} < 67)", "color('RED')"],
                                ["true", "color('white')"],
                            ],
                        },
                    });
                    break;
                case ( newValue > 67 &&  newValue <= 77):
                    tileset.style = undefined;
                    tileset.style = new Cesium.Cesium3DTileStyle({
                        color: {
                            conditions: [
                                ["(${_z}>37 && ${_z} < 77)", "color('RED')"],
                                ["true", "color('white')"],
                            ],
                        },
                    });
                    break;
                case ( newValue > 77 &&  newValue <= 87):
                    tileset.style = undefined;
                    tileset.style = new Cesium.Cesium3DTileStyle({
                        color: {
                            conditions: [
                                ["(${_z}>37 && ${_z} < 87)", "color('RED')"],
                                ["true", "color('white')"],
                            ],
                        },
                    });
                    break;
                case ( newValue > 87 &&  newValue <= 97):
                    tileset.style = undefined;
                    tileset.style = new Cesium.Cesium3DTileStyle({
                        color: {
                            conditions: [
                                ["(${_z}>37 && ${_z} < 97)", "color('RED')"],
                                ["true", "color('white')"],
                            ],
                        },
                    });
                    break;
                case ( newValue > 97 &&  newValue <= 107):
                    tileset.style = undefined;
                    tileset.style = new Cesium.Cesium3DTileStyle({
                        color: {
                            conditions: [
                                ["(${_z}>37 && ${_z} < 107)", "color('RED')"],
                                ["true", "color('white')"],
                            ],
                        },
                    });
                    break;
                case ( newValue > 107 &&  newValue <= 117):
                    tileset.style = undefined;
                    tileset.style = new Cesium.Cesium3DTileStyle({
                        color: {
                            conditions: [
                                ["(${_z}>37 && ${_z} < 117)", "color('RED')"],
                                ["true", "color('white')"],
                            ],
                        },
                    });
                    break;
                case ( newValue > 117 &&  newValue <= 127):
                    tileset.style = undefined;
                    tileset.style = new Cesium.Cesium3DTileStyle({
                        color: {
                            conditions: [
                                ["(${_z}>37 && ${_z} < 127)", "color('RED')"],
                                ["true", "color('white')"],
                            ],
                        },
                    });
                case ( newValue > 127 &&  newValue <= 144):
                    tileset.style = undefined;
                    tileset.style = new Cesium.Cesium3DTileStyle({
                        color: {
                            conditions: [
                                ["(${_z}>37 && ${_z} < 144)", "color('RED')"],
                                ["true", "color('white')"],
                            ],
                        },
                    });
                    break;
                default:
                    break;
            }
  
        }
    );

    Cesium.knockout.getObservable(viewModel, 'display').subscribe(
        function(flag) {
            if(flag) {

                tileset.style = new Cesium.Cesium3DTileStyle({
                    color: {
                        conditions: [
                            ["${荒川水系荒川洪水浸水想定区域_想定最大規模_浸水ランク} === 1", "color('GREENYELLOW')"],
                            ["${荒川水系荒川洪水浸水想定区域_想定最大規模_浸水ランク} === 2", "color('DARKSALMON')"],
                            ["${荒川水系荒川洪水浸水想定区域_想定最大規模_浸水ランク} === 3", "color('HOTPINK')"],
                            ["true", "color('white')"],
                        ],
                    },
                });

            }
            else {

                tileset.style = undefined;
            }
        }


    );

    viewer.scene.primitives.add(tileset);
}






