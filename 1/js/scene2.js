rooms.scene = function() {

lib3d();

description =
`<b>scene</b>
<p>hierarchic 3d scene<br>
with triangle meshes<p>
<input type = range id = arm_len value = 28> arm length<br>
<input type = range id = leg_len value = 40> leg length<br>
<input type = range id = move_rate> rate`;

code = {
'init':
line(26) +
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
[1,0,0,0, 0,1,0,0, 0,0,1,-.2, 0,0,0,1]);

let rate = 2 * time * move_rate.value / 100,
arm_length = .1 + .9 * arm_len.value / 100,
leg_length = .1 + .9 * leg_len.value / 100;

let m = new matrix();
m.identity();
m.roty(Math.sin(.5 * rate));
for(let i = -1; i <= 1; i += 2)
{
    let t = rate + i * Math.PI / 2;
    m.save();
        m.translate(i * .2, .6, 0);
        m.rotx(Math.cos(t));
        m.save();
            m.translate(0, -arm_length / 2, 0);
            m.scale(.035, arm_length / 2, .035);
            S.draw_mesh(S.sphere_mesh, m.get());
        m.restore();
        m.translate(0, -arm_length, 0);
        m.rotx(-1 + Math.sin(t));
        m.save();
            m.translate(0, -arm_length / 2, 0);
            m.scale(.035, arm_length / 2, .035);
            S.draw_mesh(S.sphere_mesh, m.get());
        m.restore();
    m.restore();
}
`,
events: `
    ;
`
};

}
    
        