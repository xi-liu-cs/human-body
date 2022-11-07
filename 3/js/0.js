rooms.a0 = function() {

lib3d();

description =
`<b>scene</b>
<p>hierarchic 3d scene<br>
with triangle meshes<p>
<input type = range id = move_rate> rate<br>
<input type = range id = arm_len value = 28> arm length<br>
<input type = range id = leg_len value = 40> leg length<br>
<input type = range id = finger_number value = 5> finger number<br>
<input type = range id = toe_number value = 5> toe number<br>`;

code = {
'init':
line(26) +
`S.n_light = 2;
S.material =
[
    [.15,.05,.025,0, .3,.1,.05,0, .6,.2,.1,3, 0,0,0,0], /* copper */
    [.25,.15,.025,0, .5,.3,.3,0, 1,.6,.1,6,  0,0,0,0], /* yellow */
    [.25,0,0,0,      .5,0,0,0,    2,2,2,20,   0,0,0,0], /* plastic */
    [.05,.05,.05,0,  .1,.1,.1,0,  1,1,1,5,    0,0,0,0], /* lead */
    [.1,.1,.1,0,     .1,.1,.1,0,  1,1,1,5,    0,0,0,0], /* silver */
    [.25,.15,.025,0, .5,.3,.05,0, 1,.6,.1,6,  0,0,0,0], /* gold */
    [1,1,1,0, 1,1,1,0, 1,1,1,6,  0,0,0,0], /* white */
    [0,0,0,0, 0,0,0,0, 0,0,0,0,  0,0,0,0], /* black */
];
`,

fragment: `
S.setFragmentShader(\`
const int n_light = \` + S.n_light + \`;
varying vec3 vPos, vNor;
uniform vec3 u_light_direct[n_light], u_light_color[n_light];
vec3 sky_color = vec3(0.6, 0.75, 0.95);
uniform mat4 material;

float pattern(vec3 v)
{
    const int n = 10;
    float res = 0., f = 1.;
    for(int i = 1; i < n; ++i)
    {
        res += noise(f * v) / float(i);
        f *= float(i);
        f += float(i);
    }
    return res -.2 * noise(vNor);
}

vec3 shade(vec3 eye, mat4 material)
{
    vec3 ambient = material[0].rgb,
    diffuse = material[1].rgb,
    specular = material[2].rgb;
    float power = material[2].a;
    vec3 c = mix(ambient, sky_color, .3);
    for(int i = 0; i < n_light; ++i)
    {
        vec3 reflect = 2. * dot(vNor, u_light_direct[i]) * vNor - u_light_direct[i];
        c += u_light_color[i] * .8 * (diffuse * max(0., dot(vNor, u_light_direct[i]))
        + specular * pow(max(0., dot(reflect, eye)), power)); /* + specular * pow(max(0., dot(reflect, eye)), power)) + .5 * pattern(vNor); */
    }
    return c;
}

void main()
{/* float c = .2 + .8 * max(0., dot(vNor, vec3(.57))); gl_FragColor = vec4(.3, .1, 0., 0.) + vec4(c, c, c, 1.); */
    vec3 eye = vec3(0., 0., 1.);
    gl_FragColor = vec4(shade(eye, material), 1.);
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
\`);
`,

render: `
ld0 = normalize([Math.cos(time), Math.sin(time), 1]),
ld1 = normalize([-1, -1, 1]),
ld_data = [];
for(let i = 0; i < 3; ++i)
   ld_data.push(ld0[i]);
for(let i = 0; i < 3; ++i)
   ld_data.push(ld1[i]);
S.setUniform('3fv', 'u_light_direct', ld_data);
S.setUniform('3fv', 'u_light_color', [1, 1, 1, .5, .3, .1]);
S.setUniform('Matrix4fv', 'uProject', false,
[1,0,0,0, 0,1,0,0, 0,0,1,-1, 0,0,0,1]);

let rate = 2 * time * move_rate.value / 100,
t = rate - Math.PI / 2;
cone2(['x', 'y', 'z'], [t], S.material[0]);

let m = new matrix();
m.identity();
m.save();
m.scale(1, .5, 1);
m.translate(-.05, -1, 0);
S.draw_mesh2(S.square_mesh, m.get(), S.material[0]);
m.restore();

let m2 = new matrix();
m2.identity();
m2.save();
let mount = create_mount(100);
S.draw_mesh3(mount, m2.get());
m2.restore();
`,
events: `
    ;
`
};

}