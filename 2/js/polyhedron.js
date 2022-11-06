rooms.polyhedron = function() {

lib3d();

description =
`<b>cone</b><br>
<input type = range id = move_rate> rate<br>`;

code = {
'init':
line(27) +
``,
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
t = rate - Math.PI / 2,
m = new matrix();
m.identity();
m.save();
    m.scale(.4, .4, .4);
    m.translate(-.4, -.4, 0);
    m.rotx(t);
    m.roty(t);
    m.rotz(t);
    // m.roty(-t);
    // S.draw_mesh3(hexahedron(20, 10), m.get());
    // m.rotz(Math.PI);
    m.rotx(-Math.PI / 2);
    m.roty(-Math.PI / 2);
    S.draw_mesh3(octahedron(20, 10), m.get());
    // m.rotx(-Math.PI);
    // m.translate(1, 1, 1);
    // S.draw_mesh3(tetrahedron(20, 10), m.get());
m.restore();
`,
events: `
    ;
`
};

}
                
                