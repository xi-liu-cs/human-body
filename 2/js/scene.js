rooms.scene = function() {

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
   [.25,.15,.025,0, .5,.3,.05,0, 1,.6,.1,6,  0,0,0,0], /* gold */
   [.25,0,0,0,      .5,0,0,0,    2,2,2,20,   0,0,0,0], /* plastic */
   [.05,.05,.05,0,  .1,.1,.1,0,  1,1,1,5,    0,0,0,0], /* lead */
   [.1,.1,.1,0,     .1,.1,.1,0,  1,1,1,5,    0,0,0,0], /* silver */
];

S.square_mesh =
[-1,1,0, 0,0,1, 0,1, 0,0,0,0,0,0,0,0,
1,1,0, 0,0,1, 1,1, 0,0,0,0,0,0,0,0,
-1,-1,0, 0,0,1, 0,0, 0,0,0,0,0,0,0,0,
1,-1,0, 0,0,1, 1,0, 0,0,0,0,0,0,0,0];

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
function(mesh, matrix, material)
{
    let gl = S.gl;
    S.setUniform('Matrix4fv', 'uMatrix', false, matrix);
    S.setUniform('Matrix4fv', 'uInvMatrix', false, matrixInverse(matrix));
    S.setUniform('Matrix4fv', 'material', false, material);
    S.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh), gl.STATIC_DRAW);
    S.gl.drawArrays(S.gl.TRIANGLE_STRIP, 0, mesh.length / S.VERTEX_SIZE);
}
`,

fragment: `
S.setFragmentShader(\`
const int n_light = \` + S.n_light + \`;
varying vec3 vPos, vNor;
uniform vec3 u_light_direct[n_light], u_light_color[n_light];
vec3 sky_color = vec3(0.6, 0.75, 0.95);
uniform mat4 u_material[5];
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
        c += u_light_color[i] * (diffuse * max(0., dot(vNor, u_light_direct[i]))
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
S.setUniform('Matrix4fv', 'u_material', false, S.material.flat());
S.setUniform('Matrix4fv', 'uProject', false,
[1,0,0,0, 0,1,0,0, 0,0,1,-.2, 0,0,0,1]);

let rate = 2 * time * move_rate.value / 100,
arm_length = .1 + .9 * arm_len.value / 100,
leg_length = .1 + .9 * leg_len.value / 100,
n_finger = finger_number.value,
n_toe = toe_number.value;

let m = new matrix();
m.identity();
m.roty(Math.sin(.5 * rate));
m.save();
    m.save(); /* head */
        m.translate(0, .73, 0);
        m.rotz(.3 * Math.cos(2 * time));
        m.save();
            m.translate(0, .12, 0);
            m.scale(.1, .12, .1);
            S.draw_mesh2(S.sphere_mesh, m.get(), S.material[1]);
        m.restore();
    m.restore();

    for(let i = -1; i <= 1; i += 2)
    {/* arm */
        let t = rate + i * Math.PI / 2;
        m.save();
            m.translate(i * .2, .6 + .03 * Math.cos(t), 0);
            m.rotx(Math.cos(t));
            m.save(); /* top */
                m.translate(0, -arm_length / 2, 0);
                m.scale(.03, arm_length / 2, .03);
                S.draw_mesh2(S.sphere_mesh, m.get(), S.material[0]);
                S.draw_mesh2(S.tube_mesh, m.get(), S.material[2]);
            m.restore();
            m.translate(0, -arm_length, 0);
            m.rotx(-1 + .7 * Math.sin(t));
            m.save(); /* joint */
                m.rotx(Math.PI / 2);
                m.scale(.018, arm_length / 11, .018);
                S.draw_mesh(S.tube_mesh, m.get());
            m.restore();
            m.save(); /* bottom */
                m.translate(0, -arm_length / 2, 0);
                m.scale(.027, arm_length / 2, .027);
                S.draw_mesh2(S.sphere_mesh, m.get(), S.material[0]);
                S.draw_mesh2(S.tube_mesh, m.get(), S.material[2]);
            m.restore();
            m.translate(0, -arm_length, .03);
            m.save(); /* hand */
                m.translate(0, -arm_length / 10, -.03);
                m.scale(.01, arm_length / 10, .02);
                S.draw_mesh2(S.cube_mesh, m.get(), S.material[1]);
            m.restore();
            for(let j = 0; j < n_finger; ++j)
            {/* finger */
                m.save();
                    m.rotx(j / Math.PI / 2);
                    m.translate(0, -arm_length / 5, 0);
                    m.scale(.01, arm_length / 5, .01);
                    S.draw_mesh2(S.sphere_mesh, m.get(), S.material[1]);
                m.restore();
            }
        m.restore();
    }

    for(let i = -1; i <= 1; i += 2)
    {/* leg */
        let t = rate - i * Math.PI / 2;
        m.save();
            m.translate(i * .1, .1 + .03 * Math.cos(t), 0);
            m.rotx(Math.cos(t));
            m.save(); /* top */
                m.translate(0, -leg_length / 2, 0);
                m.scale(.05, leg_length / 2, .05);
                S.draw_mesh2(S.sphere_mesh, m.get(), S.material[1]);
                m.save();
                    m.scale(.9, 1, .9);
                    S.draw_mesh2(S.tube_mesh, m.get(), S.material[0]);
                m.restore();
            m.restore();
            m.translate(0, -leg_length, 0);
            m.rotx(1 + Math.sin(t));
            m.save(); /* joint */
                m.rotx(Math.PI / 2);
                m.scale(.02, arm_length / 11, .02);
                S.draw_mesh2(S.tube_mesh, m.get(), S.material[1]);
            m.restore();
            m.save(); /* bottom */
                m.translate(0, -leg_length / 2, 0);
                m.scale(.05, leg_length / 2, .05);
                S.draw_mesh2(S.sphere_mesh, m.get(), S.material[1]);
                m.save();
                    m.scale(.8, .8, .8);
                    S.draw_mesh2(S.tube_mesh, m.get(), S.material[1]);
                m.restore();
            m.restore();
            m.translate(0, -leg_length, 0);
            m.rotx(-Math.PI);
            m.roty(Math.PI / 2);
            m.rotz(Math.PI / 2);
            m.save(); /* foot */
                m.translate(0, -arm_length / 6, 0);
                m.scale(.01, arm_length / 6, .02);
                S.draw_mesh2(S.cube_mesh, m.get(), S.material[1]);
            m.restore();
            m.rotx(-Math.PI / 10);
            for(let j = 0; j < n_toe; ++j)
            {/* toe */
                m.save();
                    m.rotx(j / Math.PI / 2.3);
                    m.translate(0, -arm_length / 5, 0);
                    m.scale(.01, arm_length / 5, .01);
                    S.draw_mesh2(S.sphere_mesh, m.get(), S.material[1]);
                m.restore();
            }
        m.restore();
    }
m.restore();

/* body */
m.save();
    m.save();
        m.translate(0, .32, 0);
        m.scale(.14, .35, .1);
        m.rotx(Math.PI / 2);
        S.draw_mesh2(S.sphere_mesh, m.get(), S.material[0]);
    m.restore();
    m.save(); /* top */
        m.translate(0, .55, 0);
        m.scale(.2, .2, .13);
        m.rotx(Math.PI / 2);
        S.draw_mesh2(S.sphere_mesh, m.get(), S.material[2]);
    m.restore();
    m.translate(0, .38, 0);
    m.scale(.12, .4, .1);
    m.rotx(Math.PI / 2);
    m.save();
        m.scale(1, 1, .8);
        m.translate(0, .1, 0);
        S.draw_mesh2(S.tube_mesh, m.get(), S.material[2]);
    m.restore();
m.restore();

/* neck */
m.save();
m.translate(0, .7, 0);
m.scale(.06, .08, .06);
m.rotx(Math.PI / 2);
S.draw_mesh2(S.tube_mesh, m.get(), S.material[3]);
m.restore();
`,
events: `
    ;
`
};

}
    
    