let vertex =
`attribute vec4 a_position, a_color;
attribute vec3 a_normal;
varying vec4 v_color;
varying vec3 v_position, v_normal;
uniform mat4 u_matrix, u_inverse_matrix, u_project;

void main()
{
    vec4 pos = u_project * u_matrix * vec4(a_position);
    vec4 normal = vec4(a_normal, 0.) * u_inverse_matrix;
    v_position = pos.xyz;
    v_normal = normalize(normal.xyz);
    gl_Position = pos * vec4(1., 1., -.01, 1.);
    // gl_Position = a_position;
    // v_color = a_color;
}`;

let fragment =
`precision mediump float;
varying vec4 v_color;
varying vec3 v_position, v_normal;

void main()
{
    float c = .2 + .8 * max(0., dot(v_normal, vec3(.57)));
    gl_FragColor = vec4(c, c, c, 1.);
}`;

function vertex_buffer_init(gl)
{
    let vertex = new Float32Array
    ([
        -1, 0, 1.0, 0.0, 0.0,
        1, 0, 0.0, 1.0, 0.0,
        -1, -1, 0.0, 0.0, 1.0,
        1, -1, 0.0, 0.0, 1.0,
    ]),
    n = vertex.length / 5,
    vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertex, gl.STATIC_DRAW);
    let float_size = vertex.BYTES_PER_ELEMENT,
    a_position = gl.getAttribLocation(gl.program, 'a_position');
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 5 * float_size, 0);
    gl.enableVertexAttribArray(a_position);
    a_color = gl.getAttribLocation(gl.program, 'a_color');
    gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 5 * float_size, 2 * float_size);
    gl.enableVertexAttribArray(a_color);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return n;
}

function main()
{
    let canvas = document.getElementById('canvas'),
    gl = canvas.getContext('webgl');
    let vertex_size = 8,
    a = {gl: gl, vertex_size: vertex_size};
    set_mesh(a);
    shader_init(gl, vertex, fragment);
    // let n = vertex_buffer_init(gl);

    let bpe = Float32Array.BYTES_PER_ELEMENT;
    let a_position = gl.getAttribLocation(gl.program, 'a_position');
    gl.enableVertexAttribArray(a_position);
    gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, vertex_size * bpe,  0 * bpe);

    let a_normal = gl.getAttribLocation(gl.program, 'a_normal');
    gl.enableVertexAttribArray(a_normal);
    gl.vertexAttribPointer(a_normal, 3, gl.FLOAT, false, vertex_size * bpe,  3 * bpe);

    let a_uv = gl.getAttribLocation(gl.program, 'a_uv');
    gl.enableVertexAttribArray(a_uv);
    gl.vertexAttribPointer(a_uv, 2, gl.FLOAT, false, vertex_size * bpe,  6 * bpe);
    
    let square_mesh =
    [-1,1,0, 0,0,1, 0,1,
    1,1,0, 0,0,1, 1,1,
    -1,-1,0, 0,0,1, 0,0,
    1,-1,0, 0,0,1, 1,0];

    let face0 = transform_mesh(square_mesh, matrixTranslate([0, 0, 1])),
    face1 = transform_mesh(face0, matrixRotx(Math.PI / 2)),
    face2 = transform_mesh(face0, matrixRotx(Math.PI)),
    face3 = transform_mesh(face0, matrixRotx(-Math.PI / 2)),
    face4 = transform_mesh(face0, matrixRoty(-Math.PI / 2)),
    face5 = transform_mesh(face0, matrixRoty(Math.PI / 2));

    let cube_mesh = 
    glue_mesh(face0,
    glue_mesh(face1,
    glue_mesh(face2,
    glue_mesh(face3,
    glue_mesh(face4, face5)))));

    let u_project = gl.getUniformLocation(gl.program, 'u_project');
    gl.uniformMatrix4fv(u_project, false,
    [1,0,0,0, 0,1,0,0, 0,0,1,-.2, 0,0,0,1]);

    let rate = 2 * time * move_rate.value / 100,
    arm_length = .1 + .9 * arm_len.value / 100,
    leg_length = .1 + .9 * leg_len.value / 100;

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
                draw_mesh(sphere_mesh, m.get());
            m.restore();
        m.restore();

        for(let i = -1; i <= 1; i += 2)
        {/* arm */
            let t = rate + i * Math.PI / 2;
            m.save();
                m.translate(i * .2, .6 + .03 * Math.cos(t), 0);
                m.rotx(Math.cos(t));
                m.save();
                    m.translate(0, -arm_length / 2, 0);
                    m.scale(.035, arm_length / 2, .035);
                    draw_mesh(sphere_mesh, m.get());
                m.restore(); 
                m.translate(0, -arm_length, 0);
                m.rotx(-1 + .7 * Math.sin(t));
                m.save();
                    m.translate(0, -arm_length / 2, 0);
                    m.scale(.035, arm_length / 2, .035);
                    draw_mesh(sphere_mesh, m.get());
                m.restore();
            m.restore();
        }

        for(let i = -1; i <= 1; i += 2)
        {/* leg */
            let t = rate - i * Math.PI / 2;
            m.save();
                m.translate(i * .1, .1 + .03 * Math.cos(t), 0);
                m.rotx(Math.cos(t));
                m.save();
                    m.translate(0, -leg_length / 2, 0);
                    m.scale(.05, leg_length / 2, .05);
                    draw_mesh(sphere_mesh, m.get());
                m.restore();
                m.translate(0, -leg_length, 0);
                m.rotx(1 + Math.sin(t));
                m.save();
                    m.translate(0, -leg_length / 2, 0);
                    m.scale(.05, leg_length / 2, .05);
                    draw_mesh(sphere_mesh, m.get());
                m.restore();
            m.restore();
        }
    m.restore();

    // gl.clearColor(0, 0, 0, 1);
    // gl.clear(gl.COLOR_BUFFER_BIT);
    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}