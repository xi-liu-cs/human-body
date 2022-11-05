let vertex =
`attribute vec4 a_position;
attribute vec4 a_color;
varying vec4 v_color;
void main()
{
    gl_Position = a_position;
    v_color = a_color;
}`;

let fragment =
`precision mediump float;
varying vec4 v_color;
void main()
{
    gl_FragColor = v_color;
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
    let vertex_size = 8;
    set_mesh(vertex_size);
    let canvas = document.getElementById('canvas'),
    gl = canvas.getContext('webgl');
    shader_init(gl, vertex, fragment);
    let n = vertex_buffer_init(gl);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}