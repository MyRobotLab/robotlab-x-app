const MinimumShader = {
  vertexShader: `
    varying vec2 vUv; 

    void main() {
      vUv = uv;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D texture;
      
      void main()	{
          vec2 uv = vUv;
          vec4 color = texture2D(texture, uv);


          gl_FragColor = color;
      }
  `,
  uniforms: {
    texture: {
      type: "t",
      value: "",
    },
  },
}

export { MinimumShader }
