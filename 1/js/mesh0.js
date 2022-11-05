function glue_mesh(a, b)
{
    let mesh = a.slice();
    mesh.push(a.slice(a.length - S.VERTEX_SIZE, a.length));
    mesh.push(b.slice(0, S.VERTEX_SIZE));
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

S.sphere_mesh = uv_mesh(sphere_mesh_function, 20, 10);

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

S.torus_mesh = uvr_mesh(torus_mesh_function, 20, 10, .4);

function tube_mesh_function(u, v)
{
    let theta = 2 * Math.PI * u,
    c = Math.cos(theta),
    s = Math.sin(theta),
    z = 2 * v - 1;
    return [c, s, z,
            c, s, z,
            u, v];
}

S.tube_mesh = uv_mesh(tube_mesh_function, 20, 10);

function disk_mesh_function(u, v)
{
    let theta = 2 * Math.PI * u,
    c = Math.cos(theta),
    s = Math.sin(theta);
    return [v * c, v * s, 0,
            0, 0, 1,
            u, v];
}

S.disk_mesh = uv_mesh(disk_mesh_function, 20, 10);

function rectangle_mesh_function(u, v)
{
    let x = 2 * u - 1,
    y = 2 * v - 1;
    return [x, y, 0,
            0, 0, 1,
            u, v];
}

S.rectangle_mesh = uv_mesh(rectangle_mesh_function, 20, 10);

function cone_mesh_function(u, v)
{
    let theta = 2 * Math.PI * u,
    c = Math.cos(theta),
    s = Math.sin(theta),
    cv = v * c,
    sv = v * s,
    z = 2 * v - 1;
    return [cv, sv, z,
            c, s, 1 / 2,
            u, v];
}

S.cone_mesh = uv_mesh(cone_mesh_function, 20, 10);

function transform_mesh(mesh, matrix)
{
    let result = [],
    imt = matrixTranspose(matrixInverse(matrix));
    for(let i = 0; i < mesh.length; i += S.VERTEX_SIZE)
    {
        let v = mesh.slice(i, i + S.VERTEX_SIZE),
        p = v.slice(0, 3),
        n = v.slice(3, 6),
        uv = v.slice(6, 8);
        p = matrixTransform(matrix, [p[0], p[1], p[2], 1]);
        n = matrixTransform(imt, [n[0], n[1], n[2], 0]);
        result = result.concat([p[0], p[1], p[2], n[0], n[1], n[2], uv[0], uv[1]]);
    }
    return result;
}