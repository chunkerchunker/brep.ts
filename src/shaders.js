/**
 * Created by aval on 15/01/2016.
 */
var fragmentShaderLighting = `
	uniform vec4 color;
	uniform vec3 camPos;
	varying vec3 normal;
	varying vec4 vPosition;
	void main() {
		vec3 normal1 = normalize(normal);
		vec3 lightPos = vec3(1000, 2000, 4000);
		vec3 lightDir = normalize(vPosition.xyz - lightPos);
        vec3 reflectionDirection = reflect(lightDir, normal1);
        vec3 eyeDirection = normalize(camPos.xyz-vPosition.xyz);
        float uMaterialShininess = 128.0;
		float specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), uMaterialShininess);
		float lightIntensity = 0.6 + 0.2 * max(0.0, -dot(lightDir, normal1)) + 0.2*specularLightWeighting;
		gl_FragColor = vec4(vec3(color) * lightIntensity, 1);
	}
`
var vertexShaderLighting = `
	uniform vec4 color;
	varying vec3 normal;
	varying vec4 vPosition;
	void main() {
		gl_Position = LGL_ModelViewProjectionMatrix * LGL_Vertex;
       vPosition = LGL_ModelViewMatrix * LGL_Vertex;
		normal = LGL_NormalMatrix * LGL_Normal;
	}
`
var vertexShader = `
	varying vec4 pos;
	void main() {
		pos = vec4(position,1.0);
		gl_Position = projectionMatrix *
			modelViewMatrix *
			vec4(position,1.0);
	}
`
var fragmentShader = `
	uniform vec3 color;
	varying vec4 pos;
	void main() {
		float distance = pos.x * pos.x + pos.y * pos.y;
		if (distance <= 0.98) {
			gl_FragColor = vec4(color, 1.0);
		} else if (distance <= 1.0) {
			gl_FragColor = vec4(color, 0.5);
		} else {
			gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
		}
	}
	/*
	 precision mediump float;

	 varying vec4 pos;


	 void main() {
	 float inside = pos.r * pos.r + pos.g * pos.g;
	 if (inside <= 1) {
	 gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
	 } else {
	 gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
	 }
	 }
	 */
`
var vertexShaderBasic = `
	void main() {
		gl_Position = LGL_ModelViewProjectionMatrix * LGL_Vertex;
	}
`
var vertexShaderArc = `
	uniform float step, offset;
	uniform float innerRadius, outerRadius;
	void main() {
		float radius = LGL_Vertex.x == 1.0 ? outerRadius : innerRadius, angle = offset + LGL_Vertex.y * step;
		vec4 p = vec4(radius * cos(angle), radius * sin(angle), 0, 1);
		gl_Position = LGL_ModelViewProjectionMatrix * p;
}
`
var vertexShaderBezier = `
    // calculates a bezier curve using LGL_Vertex.x as the (t) parameter of the curve
	uniform float width, startT, endT;
	uniform vec3 p0, p1, p2, p3;
	void main() {
		// LGL_Vertex.y is in [0, 1]
		float t = (endT - startT) * LGL_Vertex.y + startT, s = 1.0 - t;
		float c0 = s * s * s, c1 = 3.0 * s * s * t, c2 = 3.0 * s * t * t, c3 = t * t * t;
		vec3 pPos = p0 * c0 + p1 * c1 + p2 * c2 + p3 * c3;
		float c01 = 3.0 * s * s, c12 = 6.0 * s * t, c23 = 3.0 * t * t;
		vec3 pTangent = (p1 - p0) * c01 + (p2 - p1) * c12 + (p3 - p2) * c23;
		vec3 pNormal = normalize(vec3(pTangent.y, -pTangent.x, 0));
		vec4 p = vec4(pPos + (LGL_Vertex.x - 0.5) * width * pNormal, 1);
		gl_Position = LGL_ModelViewProjectionMatrix * p;
	}
`
var vertexShaderRing = `
	#define M_PI 3.1415926535897932384626433832795
	uniform float step;
	uniform float innerRadius, outerRadius;
	attribute float index;
	void main() {
		gl_Position = LGL_ModelViewProjectionMatrix * vec4(index, index, index, 1);
		float id = atan(LGL_Vertex.x, LGL_Vertex.y) / M_PI  * 32.0;
		float radius = mod(id, 2.0) < 1.0 ? outerRadius : innerRadius;
		gl_Position = LGL_ModelViewProjectionMatrix * vec4(radius * cos(index * step), radius * sin(index * step), 0, 1);
	}
`
var fragmentShaderColor = `
	uniform vec4 color;
	void main() {
		gl_FragColor = color;
	}
`
var fragmentShaderColorHighlight = `
	uniform vec4 color;
	void main() {
		float diagonal = (gl_FragCoord.x + 2.0 * gl_FragCoord.y);
		if (mod(diagonal, 50.0) > 40.0) { // mod(diagonal, 2.0) > 1.0
			discard;
			//gl_FragColor = color + vec4(0.2,0.2,0.2,0);
		} else {
			gl_FragColor = color - vec4(0.2,0.2,0.2,0);
		}
	}
`
var vertexShaderTexture = `
	varying vec2 texturePos;
	void main() {
		texturePos = LGL_Vertex.xy;
		gl_Position = LGL_ModelViewProjectionMatrix * LGL_Vertex;
	}
`
var fragmentShaderTextureColor = `
	varying vec2 texturePos;
	uniform vec4 color;
	uniform sampler2D texture;
	void main() {
		gl_FragColor = texture2D(texture, texturePos) * color;
	}
`
var fragmentShaderTexture = `
	varying vec2 texturePos;
	uniform sampler2D texture;
	void main() {
		gl_FragColor = texture2D(texture, texturePos);
	}
`