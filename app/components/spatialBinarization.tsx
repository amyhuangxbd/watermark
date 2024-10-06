import { useRef, useEffect, useState } from 'react'

const SpatialBinarization = () => {

  const wrapperRef = useRef<HTMLDivElement | null>(null) // 文字水印容器
  const watermarkRef = useRef<HTMLCanvasElement | null>(null) // 水印提取canvas

  const [watermarkRgba, setWatermarkRgba] = useState<Uint8ClampedArray>()
  const [originRgba, setOriginRgba] = useState<Uint8ClampedArray>()

  const originalCtxRef = useRef<CanvasRenderingContext2D | null>(null)
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    img2agba();
    originImg2agba();
  }, [])

  // 通过canvas将水印图像转化成agba数据
  const img2agba = () => {
    let c = document.createElement('canvas')
    let ctx = c.getContext('2d')
    const txt = '暗水印'
    const rotate = -22
    const [markWidth, markHeight] = [120, 64]
    c.width = markWidth
    c.height = markHeight
    ctx!.clearRect(0, 0, c.width, c.height)
    ctx!.fillStyle = '#000'
    ctx!.font = `16px serif`
    ctx!.rotate((Math.PI / 180) * rotate)
    ctx!.fillText(txt, 20, 60)
    const imgData=ctx!.getImageData(0,0,c.width, c.height);
    setWatermarkRgba(imgData.data);
  }

  // 通过canvas将原图转化为argb数组
  const originImg2agba = () => {
    let c = document.createElement('canvas')
    let ctx = c.getContext('2d')
    const [markWidth, markHeight] = [120, 64]
    c.width = markWidth
    c.height = markHeight
    ctx!.fillStyle="white";
    ctx!.fillRect(0,0,c.width, c.height);
    const imgData=ctx!.getImageData(0,0,c.width, c.height);
    console.log({imgData})
    originalCanvasRef.current = c
    originalCtxRef.current = ctx
    setOriginRgba(imgData.data);
  }

  useEffect(() => {
    // 将原图的argb中的red位置元素的最后一位舍去（red取值为0～255）即偶数不变，奇数-1
    if (watermarkRgba && originRgba) {
        const originalImageData = originalCtxRef.current!.getImageData(0, 0, 120, 64);
        const originalPixels = originalImageData.data;
        const watermarkPixels = watermarkRgba
        // 嵌入水印
        for (let i = 0; i < originalPixels.length; i += 4) {
            const alpha = watermarkPixels[i + 3]; // 获取水印图像当前像素点的透明度值

            // 原图红色通道处理
            originalPixels[i] = originalPixels[i] & 0xFE; // 将红色通道的 LSB 置为 0

            if (alpha !== 0) { // 如果水印像素点存在 (alpha 不为 0)
                originalPixels[i] = originalPixels[i] | 0x01; // 将红色通道的 LSB 置为 1
            }
        }

        // 将处理后的像素数据写入 canvas
        originalCtxRef.current!.putImageData(originalImageData, 0, 0);
        const watermarkedImage = originalCanvasRef.current!.toDataURL();
        wrapperRef.current!.style.backgroundImage = `url(${watermarkedImage})`

        // 水印提取
        extractWatermark(watermarkedImage)
    }
  }, [watermarkRgba, originRgba])
  
  function extractWatermark(imageSrc: string) {
    const canvas = watermarkRef.current;
    const ctx = canvas!.getContext('2d');

    // 加载嵌入了水印的图像
    const img = new Image();
    img.src = imageSrc;
    img.onload = function () {
        canvas!.width = img.width;
        canvas!.height = img.height;
        ctx!.drawImage(img, 0, 0);
        const imageData = ctx!.getImageData(0, 0, canvas!.width, canvas!.height);
        const pixels = imageData.data;

        // 创建水印图像的像素数组
        const watermarkPixels = new Uint8ClampedArray(pixels.length);

        for (let i = 0; i < pixels.length; i += 4) {
            // 提取红色通道的最低有效位
            const redLSB = pixels[i] & 0x01;
            // console.log({redLSB})
            
            // 根据 LSB 值生成水印图像像素
            if (redLSB === 1) {
                watermarkPixels[i] = 0;     // R
                watermarkPixels[i + 1] = 0; // G
                watermarkPixels[i + 2] = 0; // B
            } else {
                watermarkPixels[i] = 255;       // R
                watermarkPixels[i + 1] = 255;   // G
                watermarkPixels[i + 2] = 255;   // B
            }
            watermarkPixels[i + 3] = 255; // A (alpha 不变)
        }

        // 将水印像素数据写入 canvas 并显示水印图像
        const watermarkImageData = new ImageData(watermarkPixels, canvas!.width, canvas!.height);
        ctx!.putImageData(watermarkImageData, 0, 0);

        // 导出水印图像并通过回调返回
        const watermarkImage = canvas!.toDataURL();
    };
  }
  return (
    <div className='flex '>
      <div>
        <h2>水印添加</h2>
        <div ref={wrapperRef}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Praesent
          elementum facilisis leo vel fringilla est ullamcorper eget. At
          imperdiet dui accumsan sit amet nulla facilities morbi tempus.
          Praesent elementum facilisis leo vel fringilla. Congue mauris rhoncus
          aenean vel. Egestas sed tempus urna et pharetra pharetra massa massa
          ultricies. Venenatis cras sed felis eget velit. Consectetur libero id
          faucibus nisl tincidunt. Gravida in fermentum et sollicitudin ac orci
          phasellus egestas tellus. Volutpat consequat mauris nunc congue nisi
          vitae. Id aliquet risus feugiat in ante metus dictum at tempor. Sed
          blandit libero volutpat sed cras. Sed odio morbi quis commodo odio
          aenean sed adipiscing. Velit euismod in pellentesque massa placerat.
          Mi bibendum neque egestas congue quisque egestas diam in arcu. Nisi
          lacus sed viverra tellus in. Nibh cras pulvinar mattis nunc sed.
          Luctus accumsan tortor posuere ac ut consequat semper viverra.
          Fringilla ut morbi tincidunt augue interdum velit euismod. ## Lorem
          Ipsum Tristique senectus et netus et malesuada fames ac turpis.
          Ridiculous mus mauris vitae ultricies leo integer malesuada nunc vel.
          In mollis nunc sed id semper. Egestas tellus rutrum tellus
          pellentesque. Phasellus vestibulum lorem sed risus ultricies tristique
          nulla. Quis blandit turpis cursus in hac habitasse platea dictumst
          quisque. Eros donec ac odio tempor orci dapibus ultrices. Aliquam sem
          et tortor consequat id porta nibh. Adipiscing elit duis tristique
          sollicitudin nibh sit amet commodo nulla. Diam vulputate ut pharetra
          sit amet. Ut tellus elementum sagittis vitae et leo. Arcu non odio
          euismod lacinia at quis risus sed vulputate.
        </div>
      </div>
      <div>
        <h2>水印提取</h2>
        <canvas ref={watermarkRef} />
      </div>
    </div>
  )
}

export default SpatialBinarization
