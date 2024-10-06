import { useRef, useEffect, useState, useContext } from 'react'
import { FileContext } from './fileContext'
import { embedInDCT, getBlock, setBlock, idct2d, dct2d } from '@/app/utils/dct';

const DCTWatermark = () => {

    const { file } = useContext(FileContext)

  const wrapperRef = useRef<HTMLDivElement | null>(null) // 文字水印容器
  const watermarkRef = useRef<HTMLCanvasElement | null>(null) // 水印提取canvas

  const [watermarkImageData, setWatermarkImageData] = useState<ImageData>()
  const [originImageData, setOriginImageData] = useState<ImageData>()

  const originalCtxRef = useRef<CanvasRenderingContext2D | null>(null)
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    
    renderFile()
    img2agba();
    // originImg2agba();
  }, [])

  useEffect(() => {
    if (file) {
        renderFile()
    }
  }, [file])
  

  const renderFile = () => {
    const canvas = canvasRef.current
    const ctx = canvas!.getContext('2d');

    // 加载原图像
    const originalImg = new Image();
    originalImg.src = file;
    originalImg.onload = function () {
        canvas!.width = originalImg.width;
        canvas!.height = originalImg.height;
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
        ctx!.drawImage(originalImg, 0, 0);

        originalCanvasRef.current = canvas
        originalCtxRef.current = ctx
        const imgData=ctx!.getImageData(0,0,canvas!!.width, canvas!.height);
        setOriginImageData(imgData);
    };
  }

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
    setWatermarkImageData(imgData);
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
    setOriginImageData(imgData);
  }

  useEffect(() => {
    // 将原图的argb中的red位置元素的最后一位舍去（red取值为0～255）即偶数不变，奇数-1
    if (watermarkImageData && originImageData) {
        embedWatermark(originImageData, watermarkImageData)
        // const originalImageData = originalCtxRef.current!.getImageData(0, 0, 120, 64);
        // const originalPixels = originalImageData.data;
        // const watermarkPixels = watermarkRgba
        // // 嵌入水印
        // for (let i = 0; i < originalPixels.length; i += 4) {
        //     const alpha = watermarkPixels[i + 3]; // 获取水印图像当前像素点的透明度值

        //     // 原图红色通道处理
        //     originalPixels[i] = originalPixels[i] & 0xFE; // 将红色通道的 LSB 置为 0

        //     if (alpha !== 0) { // 如果水印像素点存在 (alpha 不为 0)
        //         originalPixels[i] = originalPixels[i] | 0x01; // 将红色通道的 LSB 置为 1
        //     }
        // }

        // 将处理后的像素数据写入 canvas
        // originalCtxRef.current!.putImageData(originalImageData, 0, 0);
        const watermarkedImage = originalCanvasRef.current!.toDataURL();
        // wrapperRef.current!.style.backgroundImage = `url(${watermarkedImage})`
        console.log("hhh")
        // 水印提取
        extractWatermark(originalCtxRef.current!.getImageData(0, 0, originalCanvasRef.current!.width, originalCanvasRef.current!.height))
    }
  }, [watermarkImageData, originImageData])

  function embedWatermark(originImageData: ImageData, originWatermarkData: ImageData) {
    const imageData = originalCtxRef.current!.getImageData(0,0,originalCanvasRef.current!.width, originalCanvasRef.current!.height);
    const watermarkData = originWatermarkData
    const width = imageData.width;
    const height = imageData.height;
    
    // 将图像分块处理，每块8x8
    for (let i = 0; i < height; i += 8) {
        for (let j = 0; j < width; j += 8) {
            // 获取图像块和水印块
            const imageBlock = getBlock(imageData, i, j);
            const watermarkBlock = getBlock(watermarkData, i, j);
            
            // 对图像块进行 DCT 变换
            const dctBlock = dct2d(imageBlock);
            
            // 将水印嵌入到 DCT 系数中 (例如低频系数)
            embedInDCT(dctBlock, watermarkBlock);
            
            // 逆 DCT 转换
            const idctBlock = idct2d(dctBlock);
            
            // 将处理后的块放回原图像
            setBlock(imageData, idctBlock, i, j);
        }
    }
    // 将处理后的像素数据写入 canvas
    originalCtxRef.current!.putImageData(imageData, 0, 0);
    return imageData;
}

// 伪代码 - 假设有 DCT 和 IDCT 的实现
function extractWatermark(imageData: ImageData) {
    console.log(imageData)
    const width = imageData.width;
    const height = imageData.height;
    const watermarkData = new Array(height).fill(0).map(() => new Array(width).fill(0));

    for (let i = 0; i < height; i += 8) {
        for (let j = 0; j < width; j += 8) {
            // 获取图像块
            const imageBlock = getBlock(imageData, i, j);
            
            // 对图像块进行 DCT 变换
            const dctBlock = dct2d(imageBlock);
            
            // 从 DCT 系数中提取水印
            extractFromDCT(dctBlock, watermarkData, i, j);
        }
    }
    console.log({watermarkData})
    drawWatermark(rotate(watermarkData))
    return watermarkData;
}

// 从 DCT 系数中提取水印的函数
function extractFromDCT(dctBlock, watermarkData, startX, startY) {
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            if (dctBlock[x][y] % 2 !== 0) { // 简单的奇偶判断
                watermarkData[startX + x][startY + y] = 255; // 水印像素点为白色
            } else {
                watermarkData[startX + x][startY + y] = 0; // 水印像素点为黑色
            }
        }
    }
}

var rotate = function(matrix) {
    const n = matrix.length;
    const matrix_new = new Array(n).fill(0).map(() => new Array(n).fill(0));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            matrix_new[j][n - i - 1] = matrix[i][j];
        }
    }
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            matrix[i][j] = matrix_new[i][j];
        }
    }
    return matrix
};

  function drawWatermark(watermarkData: any[][]) {
    const width = watermarkData.length;
    const height = watermarkData[0].length;

    const imageData = originalCtxRef.current!.getImageData(0, 0, originalCanvasRef.current!.width, originalCanvasRef.current!.height)

    const pixels = imageData.data;
    const watermarkPixels = new Uint8ClampedArray(pixels.length);
    // for(let i = 0; i < width; i++) {
    //     for (let j = 0; j < height; j++) {
    //         watermarkPixels[i*width + height] = watermarkData[i][j]
    //     }
    // }
    // for(let i = 0; i < height; i++) {
    //     for (let j = 0; j < width; j++) {
    //         watermarkPixels[i*height + j] = watermarkData[j][i]
    //     }
    // }
    
    const canvas = watermarkRef.current;
    const ctx = canvas!.getContext('2d');
    canvas!.width = originalCanvasRef.current!.width
    canvas!.height = originalCanvasRef.current!.height
    console.log('width: ', canvas!.width)
    console.log('height: ', canvas!.height)
    for (let i = 0; i < pixels.length; i += 4) {
        const d = Math.trunc(i / width);
        const m = i % width;
        const d1 = Math.trunc((i + 1) / width);
        const m1 = (i + 1) % width;
        const d2 = Math.trunc((i + 2) / width);
        const m2 = (i + 2) % width;
        const d3 = Math.trunc((i + 3) / width);
        const m3 = (i + 3) % width;
        
        watermarkPixels[i] = watermarkData[i * d]?.[m] || 0;     // R
        watermarkPixels[i + 1] = watermarkData[i * d1]?.[m1] || 0; // G
        watermarkPixels[i + 2] = watermarkData[i * d2]?.[m2] || 0; // B
        watermarkPixels[i + 3] = 255; // A (alpha 不变)
    }
    // 将水印像素数据写入 canvas 并显示水印图像
    const watermarkImageData = new ImageData(watermarkPixels, canvas!.width, canvas!.height);
    ctx!.putImageData(watermarkImageData, 0, 0);

    // 导出水印图像并通过回调返回
    const watermarkImage = canvas!.toDataURL();
    // const canvas = watermarkRef.current;
    // const ctx = canvas!.getContext('2d');

    // // 加载嵌入了水印的图像
    // const img = new Image();
    // img.src = imageSrc;
    // img.onload = function () {
    //     canvas!.width = img.width;
    //     canvas!.height = img.height;
    //     ctx!.drawImage(img, 0, 0);
    //     const imageData = ctx!.getImageData(0, 0, canvas!.width, canvas!.height);
    //     const pixels = imageData.data;

    //     // 创建水印图像的像素数组
    //     const watermarkPixels = new Uint8ClampedArray(pixels.length);

    //     for (let i = 0; i < pixels.length; i += 4) {
    //         // 提取红色通道的最低有效位
    //         const redLSB = pixels[i] & 0x01;
    //         // console.log({redLSB})
            
    //         // 根据 LSB 值生成水印图像像素
    //         if (redLSB === 1) {
    //             watermarkPixels[i] = 255;     // R
    //             watermarkPixels[i + 1] = 255; // G
    //             watermarkPixels[i + 2] = 255; // B
    //         } else {
    //             console.log("不等于1: ", redLSB)
    //             watermarkPixels[i] = 0;       // R
    //             watermarkPixels[i + 1] = 0;   // G
    //             watermarkPixels[i + 2] = 0;   // B
    //         }
    //         watermarkPixels[i + 3] = 255; // A (alpha 不变)
    //     }

    //     // 将水印像素数据写入 canvas 并显示水印图像
    //     const watermarkImageData = new ImageData(watermarkPixels, canvas!.width, canvas!.height);
    //     ctx!.putImageData(watermarkImageData, 0, 0);

    //     // 导出水印图像并通过回调返回
    //     const watermarkImage = canvas!.toDataURL();
    // };
  }
  return (
    <div className='flex '>
        <div className=' flex-1'>
        <h2>嵌入</h2>
        <canvas ref={canvasRef} />
    </div>
      {/* <div>
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
      </div> */}
      <div className=' w-64'>
        <h2>水印提取</h2>
        <canvas ref={watermarkRef} />
      </div>
    </div>
  )
}

export default DCTWatermark
