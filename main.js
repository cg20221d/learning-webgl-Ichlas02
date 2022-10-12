function main() {
    var kanvas = document.getElementById("kanvas");
    var gl = kanvas.getContext("webgl");

    var vertices = [
        0.3, 0.3, 0.0, 1.0, 1.0,   // A: kanan atas    (BIRU LANGIT)
        0.3, -0.3, 1.0, 0.0, 1.0,   // B: bawah tengah  (MAGENTA)
        -0.3, -0.3, 1.0, 1.0, 0.0,  // C: kiri atas     (KUNING)
        -0.3, 0.3, 1.0, 1.0, 1.0    // D: atas tengah   (PUTIH)
    ];

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Vertex shader
    var vertexShaderCode =  `
    attribute vec2 aPosition;
    attribute vec3 aColor;
    uniform float uTheta;
    uniform vec2 uDelta;
    varying vec3 vColor;
    void main() {
        // float x = -sin(uTheta) * aPosition.y + cos(uTheta) * aPosition.x;
        // float y = cos(uTheta) * aPosition.y + sin(uTheta) * aPosition.x;
        // gl_Position = vec4(x + uDelta.x, y + uDelta.y, 0.0, 1.0);
        
        vec2 position = aPosition;
        vec3 d = vec3(0.5, -0.5, 0.0);
        mat4 translation = mat4(1.0, 0.0, 0.0, 0.0,
                                0.0, 1.0, 0.0, 0.0,
                                0.0, 0.0, 1.0, 0.0,
                                d.x, d.y, d.z, 1.0);
        gl_Position = translation * vec4(position, 0.0, 1.0);
        vColor = aColor;
    }
    `;
    var vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShaderObject, vertexShaderCode);
    gl.compileShader(vertexShaderObject);   // sampai sini sudah jadi .o

    // Fragment shader
    var fragmentShaderCode = `
    precision mediump float;
    varying vec3 vColor;
    void main() {
        gl_FragColor = vec4(vColor, 1.0);
    }
    `;
    var fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShaderObject, fragmentShaderCode);
    gl.compileShader(fragmentShaderObject);   // sampai sini sudah jadi .o

    var shaderProgram = gl.createProgram(); // wadah dari executable (.exe)
    gl.attachShader(shaderProgram, vertexShaderObject);
    gl.attachShader(shaderProgram, fragmentShaderObject);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    // Variabel lokal
    var theta = 0.0;
    var freeze = false;
    var up = false;
    var down = false;
    var left = false;
    var right = false;
    var x = window.innerWidth/2-130/2,
    y = window.innerHeight/2-130/2;

    // Variabel pointer ke GLSL
    var uTheta = gl.getUniformLocation(shaderProgram, "uTheta");

    // Kita mengajari GPU bagaimana caranya mengoleksi
    //  nilai posisi dari ARRAY_BUFFER
    //  untuk setiap verteks yang sedang diproses
    var aPosition = gl.getAttribLocation(shaderProgram, "aPosition");
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 
        5 * Float32Array.BYTES_PER_ELEMENT, 
        0);
    gl.enableVertexAttribArray(aPosition);
    var aColor = gl.getAttribLocation(shaderProgram, "aColor");
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 
        5 * Float32Array.BYTES_PER_ELEMENT, 
        2 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(aColor);

    // Grafika Interaktif
    function onMouseClick(event) {
        freeze = !freeze;
    }
    document.addEventListener("click", onMouseClick, false);

    document.addEventListener("keydown", press);
    document.addEventListener("keyup", release);

    function press(event) {
        if (event.keyCode === 65) { left = true  ; }
        if (event.keyCode === 68) { right = true  ; }
        if (event.keyCode === 87) { up = true  ; }
        if (event.keyCode === 83) { down = true  ; }
    }

    function release(event) {
        if (event.keyCode === 65) { left = false  ; }
        if (event.keyCode === 68) { right = false  ; }
        if (event.keyCode === 87) { up = false  ; }
        if (event.keyCode === 83) { down = false  ; }
    }

    function render(){
        gl.clearColor(0.2,      0.2,    0.4,    1.0);
        //            Merah     Hijau   Biru    Transparansi
        gl.clear(gl.COLOR_BUFFER_BIT);
        if(!freeze){
            theta += 0.1;
            gl.uniform1f(uTheta, theta); //1f karena hanya 1 float yang dianimasikan
        }
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        if (up){
            theta = y + 10;
        }
        if (right){
            theta = x + 10;
        }
        if (down){
            theta = y - 10;
        }
        if (left){
            theta = x - 10;
        }
        // window.requestAnimationFrame(render);
    }
// window.requestAnimationFrame(render);
setInterval(render, 4000/200);
}