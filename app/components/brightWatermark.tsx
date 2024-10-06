import { useRef, useEffect } from 'react'

const BrightWatermark = () => {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    renderWatermark()
  }, [])

  const renderWatermark = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (ctx) {
      // const ratio = window.devicePixelRatio || 1;
      const txt = '明水印'
      const rotate = -22
      const [markWidth, markHeight] = [120, 64]
      canvas.width = markWidth
      canvas.height = markHeight
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#000'
      ctx.globalAlpha = 0.1
      ctx.font = `16px serif`
      ctx.rotate((Math.PI / 180) * rotate)
      ctx.fillText(txt, 0, 50)
    }
    if (ref.current) {
      console.log(`url(${canvas.toDataURL()})`)
      ref.current.style.backgroundImage = `url(${canvas.toDataURL()})`
    }
  }
  return (
    <div ref={ref} style={{ width: 800, height: 600 }}>
      <h2>明水印</h2>
      <p>
        canvas主要是利用canvas 绘制一个水印，然后将它转化为 base64
        的图片，通过canvas.toDataURL() 来拿到文件流的 url ， 然后将获取的 url
        填充在一个元素的背景中，然后我们设置背景图片的属性为重复。
      </p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Praesent elementum
        facilisis leo vel fringilla est ullamcorper eget. At imperdiet dui
        accumsan sit amet nulla facilities morbi tempus. Praesent elementum
        facilisis leo vel fringilla. Congue mauris rhoncus aenean vel. Egestas
        sed tempus urna et pharetra pharetra massa massa ultricies.
        <p>
          Venenatis cras sed felis eget velit. Consectetur libero id faucibus
          nisl tincidunt. Gravida in fermentum et sollicitudin ac orci phasellus
          egestas tellus. Volutpat consequat mauris nunc congue nisi vitae. Id
          aliquet risus feugiat in ante metus dictum at tempor. Sed blandit
          libero volutpat sed cras. Sed odio morbi quis commodo odio aenean sed
          adipiscing. Velit euismod in pellentesque massa placerat. Mi bibendum
          neque egestas congue quisque egestas diam in arcu. Nisi lacus sed
          viverra tellus in. Nibh cras pulvinar mattis nunc sed. Luctus accumsan
          tortor posuere ac ut consequat semper viverra. Fringilla ut morbi
          tincidunt augue interdum velit euismod.
        </p>
        <h3>## Lorem Ipsum</h3>
        Tristique senectus et netus et malesuada fames ac turpis. Ridiculous mus
        mauris vitae ultricies leo integer malesuada nunc vel. In mollis nunc
        sed id semper. Egestas tellus rutrum tellus pellentesque. Phasellus
        vestibulum lorem sed risus ultricies tristique nulla. Quis blandit
        turpis cursus in hac habitasse platea dictumst quisque. Eros donec ac
        odio tempor orci dapibus ultrices. Aliquam sem et tortor consequat id
        porta nibh. Adipiscing elit duis tristique sollicitudin nibh sit amet
        commodo nulla. Diam vulputate ut pharetra sit amet. Ut tellus elementum
        sagittis vitae et leo. Arcu non odio euismod lacinia at quis risus sed
        vulputate.
      </p>
    </div>
  )
}

export default BrightWatermark
