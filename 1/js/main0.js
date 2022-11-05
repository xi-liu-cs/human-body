let vertex =
`attribute vec4 a_position;
void main()
{
    gl_Position = a_position;
}`;

let fragment =
`void main()
{
    gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
}`;

function vertex_buffer_init(gl)
{
    let vertices = new Float32Array
    ([
        -1, 0,
        1, 0,
        -1, -1,
        1, -1,
    ]),
    n = vertices.length / 2;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    a_position = gl.getAttribLocation(gl.program, 'a_position');
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_position);
    return n;
}

function main()
{
    canvas = document.getElementById('canvas');
    gl = canvas.getContext('webgl');
    shader_init(gl, vertex, fragment);
    n = vertex_buffer_init(gl);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}