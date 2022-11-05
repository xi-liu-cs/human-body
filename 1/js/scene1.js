rooms.scene = function() {

lib3d();

description =
`<b>Scene</b>
<p>Hierarchic 3D scene
<br>with triangle meshes.
<p><input type = range id = arm_length value = 28> arm length
<br><input type = range id = leg_length value = 40> leg length
<br><input type = range id = rate> rate`;

code = {
'init':
line(25) +
`S.square_mesh =
[-1,1,0, 0,0,1, 0,1,
1,1,0, 0,0,1, 1,1,
-1,-1,0, 0,0,1, 0,0,
1,-1,0, 0,0,1, 1,0];

let face0 = transform_mesh(S.square_mesh, matrixTranslate([0, 0, 1])),
face1 = transform_mesh(face0, matrixRotx(Math.PI / 2)),
face2 = transform_mesh(face0, matrixRotx(Math.PI)),
face3 = transform_mesh(face0, matrixRotx(-Math.PI / 2)),
face4 = transform_mesh(face0, matrixRoty(-Math.PI / 2)),
face5 = transform_mesh(face0, matrixRoty(Math.PI / 2));

S.cube_mesh = 
glue_mesh(face0,
glue_mesh(face1,
glue_mesh(face2,
glue_mesh(face3,
glue_mesh(face4, face5)))));

S.draw_mesh =
function(mesh, matrix)
{
    let gl = S.gl;
    S.setUniform('Matrix4fv', 'uMatrix', false, matrix);
    S.setUniform('Matrix4fv', 'uInvMatrix', false, matrixInverse(matrix));
    S.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh), gl.STATIC_DRAW);
    S.gl.drawArrays(S.gl.TRIANGLE_STRIP, 0, mesh.length / S.VERTEX_SIZE);
}

S.draw_mesh2 =
function(mesh, matrix)
{
    let gl = S.gl;
    S.setUniform('Matrix4fv', 'uMatrix', false, matrix);
    S.setUniform('Matrix4fv', 'uInvMatrix', false, matrixInverse(matrix));
    S.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh), gl.STATIC_DRAW);
    S.gl.drawArrays(S.gl.TRIANGLE, 0, mesh.length / S.VERTEX_SIZE);
}
`,
fragment: `
S.setFragmentShader(\`
varying vec3 vPos, vNor;
void main()
{
    float c = .2 + .8 * max(0., dot(vNor, vec3(.57)));
    gl_FragColor = vec4(c, c, c, 1.);
}
\`);
`,
vertex: `
S.setVertexShader(\`
attribute vec3 aPos, aNor;
varying vec3 vPos, vNor;
uniform mat4 uMatrix, uInvMatrix, uProject;

void main()
{
    vec4 pos = uProject * uMatrix * vec4(aPos, 1.);
    vec4 nor = vec4(aNor, 0.) * uInvMatrix;
    vPos = pos.xyz;
    vNor = normalize(nor.xyz);
    gl_Position = pos * vec4(1.,1.,-.01,1.);
}
\`)
`,
render: `
S.setUniform('Matrix4fv', 'uProject', false,
[1,0,0,0, 0,1,0,0, 0,0,1,-1, 0,0,0,1]);

let m = new matrix();
m.identity();
m.translate(0, .6, 0);
m.rotz(Math.sin(time));
m.save();
    m.translate(0, -.2, 0);
    m.scale(.05, .2, .05);
    S.draw_mesh(S.sphere_mesh, m.get());
m.restore();
m.translate(0, -.4, 0);
m.rotz(Math.sin(time));
m.save();
    m.translate(0, -.2, 0);
    m.scale(.05, .2, .05);
    S.draw_mesh(S.sphere_mesh, m.get());
m.restore();
`,
events: `
    ;
`
};

}
        
        