rooms.cone = function() {

lib3d();

description =
`<b>cone</b><br>
<input type = range id = move_rate> rate<br>`;

code = {
'init':
line(27) +
`S.draw_mesh =
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
[1,0,0,0, 0,1,0,0, 0,0,1,-1, 0,0,0,1]);

let rate = 2 * time * move_rate.value / 100,
t = rate - Math.PI / 2;
cone(['x', 'y', 'z'], [t]);
/* m = new matrix();
m.identity();
m.save();
    m.scale(.5, .5, .5);
    m.translate(-.2, .1, -1);
    m.rotx(t);
    m.roty(t);
    m.rotz(t);
    S.draw_mesh(S.cone_mesh, m.get());
    m.save();
        m.translate(0, 0, 1);
        S.draw_mesh(S.disk_mesh, m.get());
    m.restore();
m.restore(); */
`,
events: `
    ;
`
};

}
            
            