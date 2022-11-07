/* function create_mount(mount_size)
{
    let u = 20, v = 10,
    a = [];
    for(let i = 0; i < mount_size; ++i)
    {
        let v0 = [Math.random(), Math.random(), Math.random()],
        v1 = [Math.random(), Math.random(), Math.random()],
        v2 = [Math.random(), Math.random(), Math.random()];
        face = face_mesh(v0, v1, v2, u, v);
        a.push(face);

    }
    return combine_mesh_array(a);
} */
let amplitude = 100;

function gen_height(x, z)
{
    return 1;
}

function create_mount(mount_size)
{
    let u = 20, v = 10,
    a = [];
    for(let i = 0; i < mount_size; ++i)
    {
        let p = i / mount_size,
        v0 = [p, p, p],
        v1 = [p, p, p],
        v2 = [p, p, p],
        face = face_mesh(v0, v1, v2, u, v);
        a.push(face);
    }
    return combine_mesh_array(a);
}