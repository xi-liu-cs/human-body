let gl, vertex_size;

function set_mesh(a)
{
    gl = a.gl;
    vertex_size = a.vertex_size;
}

function glue_mesh(a, b)
{
    let mesh = a.slice();
    mesh.push(a.slice(a.length - vertex_size, a.length));
    mesh.push(b.slice(0, vertex_size));
    mesh.push(b);
    return mesh.flat();
}

function uv_mesh(f, nu, nv)
{
    let mesh = [];
    for(let iv = 0; iv < nv; ++iv)
    {
        let v = iv / nv,
        strip = [];
        for(let iu = 0; iu <= nu; ++iu)
        {
            let u = iu / nu;
            strip = strip.concat(f(u, v));
            strip = strip.concat(f(u, v + 1 / nv));
        }
        mesh = glue_mesh(mesh, strip);
    }
    return mesh;
}

function sphere_mesh_function(u, v)
{
    let theta = 2 * Math.PI * u,
    phi = Math.PI * v - Math.PI / 2,
    cu = Math.cos(theta),
    su = Math.sin(theta),
    cv = Math.cos(phi),
    sv = Math.sin(phi);
    return [cu * cv, su * cv, sv,
            cu * cv, su * cv, sv,
            u, v];
}

let sphere_mesh = uv_mesh(sphere_mesh_function, 20, 10);

function uvr_mesh(f, nu, nv, r)
{
    let mesh = [];
    for(let iv = 0; iv < nv; ++iv)
    {
        let v = iv / nv,
        strip = [];
        for(let iu = 0; iu <= nu; ++iu)
        {
            let u = iu / nu;
            strip = strip.concat(f(u, v, r));
            strip = strip.concat(f(u, v + 1 / nv, r));
        }
        mesh = glue_mesh(mesh, strip);
    }
    return mesh;
}

function torus_mesh_function(u, v, r)
{
    let theta = 2 * Math.PI * u,
    phi = 2 * Math.PI * v,
    cu = Math.cos(theta),
    su = Math.sin(theta),
    cv = Math.cos(phi),
    sv = Math.sin(phi),
    x = cu * (1 + r * cv),
    y = su * (1 + r * cv),
    z = r * sv,
    nx = cu * cv,
    ny = su * cv,
    nz = sv;
    return [x, y, z,
            nx, ny, nz,
            u, v];
}

let torus_mesh = uvr_mesh(torus_mesh_function, 20, 10, .4);

function transform_mesh(mesh, matrix)
{
    let result = [],
    imt = matrixTranspose(matrixInverse(matrix));
    for(let i = 0; i < mesh.length; i += vertex_size)
    {
        let v = mesh.slice(i, i + vertex_size),
        p = v.slice(0, 3),
        n = v.slice(3, 6),
        uv = v.slice(6, 8);
        p = matrixTransform(matrix, [p[0], p[1], p[2], 1]);
        n = matrixTransform(imt, [n[0], n[1], n[2], 0]);
        result = result.concat([p[0], p[1], p[2], n[0], n[1], n[2], uv[0], uv[1]]);
    }
    return result;
}

function draw_mesh(mesh, matrix)
{
    let u_matrix = gl.getUniformLocation(gl.program, 'u_matrix');
    gl.uniformMatrix4fv(u_matrix, false, matrix);
    let u_inverse_matrix = gl.getUniformLocation(gl.program, 'u_inverse_matrix');
    gl.uniformMatrix4fv(u_inverse_matrix, false, matrixInverse(matrix));
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh), gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, mesh.length / vertex_size);
}