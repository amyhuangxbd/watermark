import { useContext, useEffect, useRef } from 'react'
import { FileContext } from './fileContext'
const getBase64 = file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}
const drawWatermark = (text, x, y) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  ctx!.font = '20px Arial' // 设置字体大小和类型
  ctx!.textAlign = 'center' // 设置水平对齐方式
  ctx!.textBaseline = 'middle' // 设置垂直对齐方式

  // 获取文字的度量信息
  const metrics = ctx!.measureText(text)
  const textWidth = metrics.width
  const textHeight = parseInt(ctx!.font) // 将字体大小转换为数字

  // 绘制文字
  ctx!.fillText(text, x - textWidth / 2, y + textHeight / 2)
  return canvas.toDataURL('image/png')
}
function extractWatermark(imageData) {
    const width = imageData.width;
    const height = imageData.height;

    // 创建一个空的灰度图像数据
    const watermarkData = new Uint8ClampedArray(width * height * 4);

    const colorData = imageData.data;

    // 遍历每个像素，提取水印
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;

            // 提取蓝色通道的最低有效位作为水印
            const watermarkPixel = colorData[index + 2] & 0x01;

            // 将水印值扩展为灰度图像像素值 (0 或 255)
            watermarkData[index] = watermarkData[index + 1] = watermarkData[index + 2] = watermarkPixel * 255;
            watermarkData[index + 3] = 255; // Alpha 通道
        }
    }

    return new ImageData(watermarkData, width, height);
}
const SpatialBinarization1 = props => {
  const { file } = useContext(FileContext)
  const watermarkFileRef = useRef()
  const watermarkCanvasRef = useRef()
  const canvasRef = useRef()
  console.log('file: ', file)
  useEffect(() => {
    watermarkFileRef.current = drawWatermark('空域二值化图像水印', 120, 64)
  
    
  }, [])
  
  useEffect(() => {
    function embedWatermark(colorImageData, watermarkImageData) {
        const width = colorImageData.width;
        const height = colorImageData.height;
    
        // 获取图像数据
        const colorData = colorImageData.data;
        const watermarkData = watermarkImageData.data;
    
        // 遍历每个像素，嵌入水印
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                
                // 取灰度水印图像的像素值 (R, G, B 相同)
                const watermarkPixel = watermarkData[index]; 
    
                // 将水印嵌入蓝色通道的最低有效位
                colorData[index + 2] = (colorData[index + 2] & 0xFE) | (watermarkPixel & 0x01);
            }
        }
    
        return colorImageData;
    }
    
    // 示例：嵌入水印
    // const canvas = document.createElement('canvas');
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 加载并绘制彩色图像
    const colorImg = new Image();
    colorImg.src = file; // 彩色图像路径
    colorImg.onload = function () {
        canvas.width = colorImg.width;
        canvas.height = colorImg.height;
        ctx.drawImage(colorImg, 0, 0);
        const colorImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
        // 加载并绘制灰度水印图像
        const watermarkImg = new Image();
        if (!watermarkFileRef.current) {
            watermarkFileRef.current = drawWatermark('空域二值化图像水印', 120, 64)
        }
        watermarkImg.src = watermarkFileRef.current; // 灰度图像路径
        watermarkImg.onload = function () {
            ctx.drawImage(watermarkImg, 0, 0, canvas.width, canvas.height);
            const watermarkImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
            // 嵌入水印
            const embeddedImageData = embedWatermark(colorImageData, watermarkImageData);
    
            // 显示嵌入水印后的图像
            ctx.putImageData(embeddedImageData, 0, 0);
            // document.body.appendChild(canvas);


            //
            // 提取并显示水印
            const extractedWatermark = extractWatermark(embeddedImageData);
            const watermarkCanvas = watermarkCanvasRef.current;
            watermarkCanvas.width = extractedWatermark.width;
            watermarkCanvas.height = extractedWatermark.height;
            watermarkCanvas.getContext('2d').putImageData(extractedWatermark, 0, 0);
        };
    };
    
  }, [file])
  
  return <div>
    <div>
        <h2>嵌入</h2>
        <canvas ref={canvasRef} />
    </div>
    <div>
        <h2>提取</h2>
        <canvas ref={watermarkCanvasRef} />
    </div>
    </div>
}

export default SpatialBinarization1
