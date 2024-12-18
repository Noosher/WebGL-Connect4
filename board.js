let boardProgram;
let boardAttr_vpos;
let boardUnif_v_color;
let boardUnif_circle_centers;
let boardUnif_circle_radius;

const vsc_board = `
    attribute vec2 vpos;
    void main() {
        gl_Position = vec4(vpos, 0.0, 1.0);
    }
`;

const fsc_board = `
precision mediump float;
uniform vec4 v_color; 
uniform vec2 circle_centers[42];
uniform float circle_radius;

void main() {
    vec2 ndc_coords = (gl_FragCoord.xy / vec2(800.0, 800.0)) * 2.0 - 1.0;
    for (int i = 0; i < 42; i++) {
        float dist = distance(ndc_coords, circle_centers[i]);
        if (dist < circle_radius) {
            discard;
        }
    }
    gl_FragColor = v_color;
}
`;

function initBoardProgram(gl) {
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vsc_board);
    gl.compileShader(vs);
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fsc_board);
    gl.compileShader(fs);
    boardProgram = gl.createProgram();
    gl.attachShader(boardProgram, vs);
    gl.attachShader(boardProgram, fs);
    gl.linkProgram(boardProgram);
    boardAttr_vpos = gl.getAttribLocation(boardProgram, "vpos");
    boardUnif_v_color = gl.getUniformLocation(boardProgram, "v_color");
    boardUnif_circle_centers = gl.getUniformLocation(boardProgram, "circle_centers");
    boardUnif_circle_radius = gl.getUniformLocation(boardProgram, "circle_radius");
}

function drawBoardBackground(gl) {
    gl.useProgram(boardProgram);
    const width = 0.700;
    const height = 0.600;
    const radius = 0.1;
    const segments = 16;
    let vertices = [];
    vertices.push(-width, -height + radius);
    vertices.push(width, -height + radius);
    vertices.push(-width, height - radius);
    vertices.push(width, height - radius);
    vertices.push(-width + radius, -height);
    vertices.push(-width + radius, height);
    vertices.push(width - radius, -height);
    vertices.push(width - radius, height);

    function addArc(centerX, centerY, angleStart, angleEnd) {
        const step = (angleEnd - angleStart) / segments;
        vertices.push(centerX, centerY);
        for (let i = 0; i <= segments; i++) {
            const angle = angleStart + i * step;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            vertices.push(x, y);
        }
    }

    addArc(-width + radius, -height + radius, Math.PI, 1.5 * Math.PI);
    addArc(width - radius, -height + radius, 1.5 * Math.PI, 2.0 * Math.PI);
    addArc(width - radius, height - radius, 0, 0.5 * Math.PI);
    addArc(-width + radius, height - radius, 0.5 * Math.PI, Math.PI);

    const vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(boardAttr_vpos, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(boardAttr_vpos);
    gl.uniform4f(boardUnif_v_color, 0, 0, 1, 1);
    const circle_radius = 0.07;
    const circle_centers = [];
    const cols = 7;
    const rows = 6;
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = (col - 3) * 0.2;
            const y = 0.5 - (row * 0.2);
            circle_centers.push(x, y);
        }
    }
    gl.uniform2fv(boardUnif_circle_centers, new Float32Array(circle_centers));
    gl.uniform1f(boardUnif_circle_radius, circle_radius);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length / 2);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length / 2);
}
