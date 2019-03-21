main()

function main() {

    // 1️⃣ Configuracion base de WebGL

    // Encontramos el canvas y obtenemos el contexto de WebGL
    const canvas = document.getElementById("webgl-canvas")
    const gl = canvas.getContext("webgl2")

    // Setemos el color que vamos a usar para limpiar el canvas (i.e. el color de fondo)
    gl.clearColor(0, 0, 0, 1)

    // 2️⃣ Definimos la info de la geometria que vamos a dibujar (un triangulo) y la almacenamos en buffers

    const triangleVertexCount = 3
    const triangleVertexPositions = [
        -0.5, -0.5, // coordenadas XY del primer vertice
        0.5, -0.5,  // del segundo
        0.0, 0.5    // y del tercero
    ]

    /* 📝
     El triangulo tiene 3 vertices, cada uno con su posicion en coordenadas XY, recorridos en sentido anti-horario 🔄
     (el sentido anti-horario es una convencion que por ahora no va a tener ningun efecto, se podrian escribir los
     vertices en sentido horario y obtener el mismo triangulo, pero mas adelante vamos a ver el por qué de la convencion
     y su importancia).
     */

    // Cargamos las posiciones de los vertices en un buffer (VBO - Vertex Buffer Object)
    const vertexPositionsBuffer = createVertexBuffer(gl, triangleVertexPositions)

    // 3️⃣ Creamos los shaders y el programa de shaders que vamos a usar

    // Shader de vertices
    const vertexShaderSource = getVertexShaderSourceCode()
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)

    // Shader de fragmentos
    const fragmentShaderSource = getFragmentShaderSourceCode()
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

    // "Conectamos" los shaders en un Programa de Shaders
    const program = createShaderProgram(gl, vertexShader, fragmentShader)

    // 4️⃣ Asociamos el Programa de Shaders a los buffers de la geometria

    // Obtenemos la ubicacion del atributo que representa a la posicion de los vertices en nuestro programa ("vertexPosition")
    const vertexPositionLocation = gl.getAttribLocation(program, "vertexPosition")

    // Registramos cómo cada atributo va a acceder a su respectivo buffer en un "contenedor" (VAO - Vertex Array Object)
    const triangleVertexArray = gl.createVertexArray()
    gl.bindVertexArray(triangleVertexArray)
    addAttributeToBoundVertexArray(gl, vertexPositionLocation, vertexPositionsBuffer, 2)
    gl.bindVertexArray(null)

    /* 📝
     Nuestro "contenedor" (o VAO) ahora mantiene registro de que el atributo 'vertexPosition' de nuestro
     programa de shaders (representado por su ubicacion 'vertexPositionLocation') va a obtener su informacion
     del buffer "vertexPositionsBuffer", y que cada cada vez que se tenga que sacar un dato (i.e. la posicion
     de un vertice) se tiene que agarrar de a 2 items del buffer (las dos coordenadas - X e Y - de cada vertice).
     */

    // 5️⃣ Establecemos el programa de shaders e info de la geometria que vamos a usar para dibujar

    // Programa de Shaders
    gl.useProgram(program)

    // Info de la geometria (en el "contenedor" o VAO)
    gl.bindVertexArray(triangleVertexArray)

    // 6️⃣ Dibujamos la escena (el triangulo)

    // Limpiamos el canvas
    gl.clear(gl.COLOR_BUFFER_BIT)

    // Y dibujamos 🎨 (al fin!)
    gl.drawArrays(gl.TRIANGLES, 0, triangleVertexCount)
}

// Funciones auxiliares

function createShader(gl, type, sourceCode) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, sourceCode)
    gl.compileShader(shader)

    // Chequeamos que el shader haya compilado con exito
    const compiledSuccessfully = gl.getShaderParameter(shader, gl.COMPILE_STATUS)

    if ( ! compiledSuccessfully ) {
        // Obtenemos el log generado por el compilador de shaders y lo mostramos
        const shaderLog = gl.getShaderInfoLog(shader)
        console.group(type === gl.VERTEX_SHADER ? "Vertex Shader Logs" : "Fragment Shader Logs")
        console.log(shaderLog)
        console.groupEnd()
    }

    return shader
}

function createShaderProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    // Chequeamos que el programa se haya creado con exito
    const linkedSuccessfully = gl.getProgramParameter(program, gl.LINK_STATUS)

    if ( ! linkedSuccessfully ) {
        // Obtenemos el log generado al intentar crear el program y lo mostramos
        const programLog = gl.getProgramInfoLog(program)
        console.group("Shaders Program Log")
        console.log(programLog)
        console.groupEnd()
    }

    return program
}

function createVertexBuffer(gl, data) {
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    return buffer
}

function addAttributeToBoundVertexArray(gl, attributeLocation, attributeBuffer, attributeSize) {
    gl.bindBuffer(gl.ARRAY_BUFFER, attributeBuffer)
    gl.vertexAttribPointer(attributeLocation, attributeSize, gl.FLOAT, false, 0, 0)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.enableVertexAttribArray(attributeLocation)
}

function getVertexShaderSourceCode() {
    return`#version 300 es

    in vec2 vertexPosition;

    void main() {
        gl_Position = vec4(vertexPosition, 0, 1);
    }`
}

function getFragmentShaderSourceCode() {
    return `#version 300 es

    precision mediump float;

    out vec4 fragmentColor;

    void main() {
        fragmentColor = vec4(0.2, 0.4, 1, 1);
    }`
}
