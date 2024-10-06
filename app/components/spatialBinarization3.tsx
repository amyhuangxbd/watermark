import { useContext, useEffect, useRef, useState } from 'react'
import { FileContext } from './fileContext'
import BgWatermark from '@/public/bg-watermark.png';
import base64 from '@/app/utils/base64'
const getBase64 = file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

const getWatermarkRGBA = (x,y) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d');

    const img = new Image()
    img.crossOrigin = ''
    img.src = base64
    img.onload = function() {
        ctx?.drawImage(img, 0, 0, img.width, img.height);
        const originalImageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        const watermarkRGBA = originalImageData?.data;
        console.log({watermarkRGBA})
        return watermarkRGBA
    }
    
}



// const drawWatermark = (text, x, y) => {
//   const canvas = document.createElement('canvas')
//   const ctx = canvas.getContext('2d')
//   // 设置globalCompositeOperation为'destination-over'，这是默认值
//   ctx.globalCompositeOperation = 'destination-over';
//   ctx!.fillStyle = 'rgba(0,0,0,255)'; // 设置文本颜色为黑色
//   ctx!.font = '20px Arial' // 设置字体大小和类型
//   ctx!.textAlign = 'center' // 设置水平对齐方式
//   ctx!.textBaseline = 'middle' // 设置垂直对齐方式

//   // 获取文字的度量信息
//   const metrics = ctx!.measureText(text)
//   const textWidth = metrics.width
//   const textHeight = parseInt(ctx!.font) // 将字体大小转换为数字

//   // 绘制文字
//   ctx!.fillText(text, x - textWidth / 2, y + textHeight / 2)
//   // 绘制一个白色矩形填充整个canvas
//     // ctx!.fillStyle = '#000'; // 设置填充颜色为黑色
//     // ctx!.fillRect(0, 0, canvas.width, canvas.height);
//   return canvas.toDataURL('image/png')
// }
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


const SpatialBinarization = props => {
  const { file } = useContext(FileContext)
  const watermarkFileRef = useRef()
  const watermarkCanvasRef = useRef()
  const canvasRef = useRef()
  const [watermarkRGBA, setWatermarkRGBA] = useState()
//   console.log('file: ', file)
const drawWatermark = (x,y) => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d');

        const img = new Image()
        img.crossOrigin = ''
        img.src = '/bg-watermark.png'
        ctx?.drawImage(img, 0, 0, img.width, img.height);
        const originalImageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        const watermarkRGBA = originalImageData?.data;
        console.log({watermarkRGBA})
        setWatermarkRGBA(watermarkRGBA)
        return resolve(canvas.toDataURL('image/png'))
      })
}
  useEffect(() => {
    // watermarkFileRef.current = drawWatermark( 900, 300)
    drawWatermark( 900, 300).then(data => {
        watermarkFileRef.current = data;
    })
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d');

    const img = new Image()
    img.crossOrigin = ''
    img.src = base64
    img.onload = function() {
        ctx?.drawImage(img, 0, 0, img.width, img.height);
        const originalImageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        const watermarkRGBA = originalImageData?.data;
        console.log({watermarkRGBA})
        console.log('哈哈哈哈哈哈哈哈')
        setWatermarkRGBA(watermarkRGBA)
    }
    
  }, [])
  
  useEffect(() => {
    if (!watermarkFileRef.current) {
        watermarkFileRef.current = drawWatermark(900, 300)
    }
    const originalImageSrc = file;
    let watermarkImageSrc = watermarkFileRef.current

    console.log({watermarkImageSrc})
    embedWatermark(originalImageSrc, '/bg-watermark.png', function (resultImage) {
        // console.log(resultImage); // 输出带水印的 Base64 图像
        document.getElementById('output').src = resultImage; // 显示水印图像
    });
    // function embedWatermark(colorImageData, watermarkImageData) {
    //     const width = colorImageData.width;
    //     const height = colorImageData.height;
    
    //     // 获取图像数据
    //     const colorData = colorImageData.data;
    //     const watermarkData = watermarkImageData.data;
    
    //     // 遍历每个像素，嵌入水印
    //     for (let y = 0; y < height; y++) {
    //         for (let x = 0; x < width; x++) {
    //             const index = (y * width + x) * 4;
                
    //             // 取灰度水印图像的像素值 (R, G, B 相同)
    //             const watermarkPixel = watermarkData[index]; 
    
    //             // 将水印嵌入蓝色通道的最低有效位
    //             colorData[index + 2] = (colorData[index + 2] & 0xFE) | (watermarkPixel & 0x01);
    //         }
    //     }
    
    //     return colorImageData;
    // }
    
    // // 示例：嵌入水印
    // // const canvas = document.createElement('canvas');
    // const canvas = canvasRef.current;
    // const ctx = canvas.getContext('2d');
    
    // // 加载并绘制彩色图像
    // const colorImg = new Image();
    // colorImg.src = file; // 彩色图像路径
    // colorImg.onload = function () {
    //     canvas.width = colorImg.width;
    //     canvas.height = colorImg.height;
    //     ctx.drawImage(colorImg, 0, 0);
    //     const colorImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    //     // 加载并绘制灰度水印图像
    //     const watermarkImg = new Image();
    //     if (!watermarkFileRef.current) {
    //         watermarkFileRef.current = drawWatermark('空域二值化图像水印', 120, 64)
    //     }
    //     watermarkImg.src = watermarkFileRef.current; // 灰度图像路径
    //     watermarkImg.onload = function () {
    //         ctx.drawImage(watermarkImg, 0, 0, canvas.width, canvas.height);
    //         const watermarkImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    //         // 嵌入水印
    //         const embeddedImageData = embedWatermark(colorImageData, watermarkImageData);
    
    //         // 显示嵌入水印后的图像
    //         ctx.putImageData(embeddedImageData, 0, 0);
    //         // document.body.appendChild(canvas);


    //         //
    //         // 提取并显示水印
    //         const extractedWatermark = extractWatermark(embeddedImageData);
    //         const watermarkCanvas = watermarkCanvasRef.current;
    //         watermarkCanvas.width = extractedWatermark.width;
    //         watermarkCanvas.height = extractedWatermark.height;
    //         watermarkCanvas.getContext('2d').putImageData(extractedWatermark, 0, 0);
    //     };
    // };
    
  }, [file])

  function embedWatermark(originalImage, watermarkImage, callback) {
    // const canvas = document.createElement('canvas');
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d');

    // 加载原图像
    const originalImg = new Image();
    originalImg.src = originalImage;
    originalImg.onload = function () {
        canvas.width = originalImg.width;
        canvas.height = originalImg.height;
        console.log('width: ', canvas.width)
        console.log('height: ', canvas.height)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(originalImg, 0, 0);
        const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const originalPixels = originalImageData.data;

        // 加载水印图像
        const watermarkImg = new Image();
        watermarkImg.src = watermarkImage;
        watermarkImg.onload = function () {
            
            ctx.drawImage(watermarkImg, 0, 0, canvas.width, canvas.height);
            // const watermarkImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            // const watermarkPixels = watermarkImageData.data;
            // console.log(watermarkPixels)
            const watermarkPixels = watermarkRGBA
            // 嵌入水印
            for (let i = 0; i < originalPixels.length; i += 4) {
                const alpha = watermarkPixels[i + 3]; // 获取水印图像当前像素点的透明度值
                // console.log({alpha})
                const red = watermarkPixels[i + 0];
                const green = watermarkPixels[i + 1];
                const blue = watermarkPixels[i + 2];
                if (red === 0 && green === 0 && blue === 0 && alpha ===0) {
                    console.log('嘿嘿哈哈哈哈哈哈哈哈')
                } else {
                    console.log('粉丝经济斤斤计较')
                }

                // 原图红色通道处理
                originalPixels[i] = originalPixels[i] & 0xFE; // 将红色通道的 LSB 置为 0

                if (alpha !== 0) { // 如果水印像素点存在 (alpha 不为 0)
                    console.log('如果水印像素点存在 (alpha 不为 0)')
                    originalPixels[i] = originalPixels[i] | 0x01; // 将红色通道的 LSB 置为 1
                }
                
                // 白色背景
                // if (watermarkPixels[i + 0] > 250 && watermarkPixels[i + 1] > 250 && watermarkPixels[i + 2] > 250 && watermarkPixels[i + 3] === 255) {
                //     console.log('白色背景')
                // }
                // if (watermarkPixels[i + 0] < 50 && watermarkPixels[i + 1] < 50 && watermarkPixels[i + 2] < 50 && watermarkPixels[i + 3] === 255) {
                //     console.log('黑色背景')
                // }
            }

            // 将处理后的像素数据写入 canvas
            ctx.putImageData(originalImageData, 0, 0);

            // 导出为 Base64 图像
            const watermarkedImage = canvas.toDataURL();
            callback(watermarkedImage);

            // 提取
            extractWatermark(watermarkedImage, function (watermarkImage) {
                // console.log(watermarkImage); // 输出提取的水印 Base64 图像
                document.getElementById('watermark-output').src = watermarkImage; // 显示水印图像
            });
        };
    };
}

function extractWatermark(imageSrc, callback) {
    // const canvas = document.createElement('canvas');
    const canvas = watermarkCanvasRef.current;
    const ctx = canvas.getContext('2d');

    // 加载嵌入了水印的图像
    const img = new Image();
    img.src = imageSrc;
    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        // 创建水印图像的像素数组
        const watermarkPixels = new Uint8ClampedArray(pixels.length);

        for (let i = 0; i < pixels.length; i += 4) {
            // 提取红色通道的最低有效位
            const redLSB = pixels[i] & 0x01;
            // console.log({redLSB})
            
            // 根据 LSB 值生成水印图像像素
            if (redLSB === 1) {
                watermarkPixels[i] = 255;     // R
                watermarkPixels[i + 1] = 255; // G
                watermarkPixels[i + 2] = 255; // B
            } else {
                console.log("不等于1: ", redLSB)
                watermarkPixels[i] = 0;       // R
                watermarkPixels[i + 1] = 0;   // G
                watermarkPixels[i + 2] = 0;   // B
            }
            watermarkPixels[i + 3] = 255; // A (alpha 不变)
        }

        // 将水印像素数据写入 canvas 并显示水印图像
        const watermarkImageData = new ImageData(watermarkPixels, canvas.width, canvas.height);
        ctx.putImageData(watermarkImageData, 0, 0);

        // 导出水印图像并通过回调返回
        const watermarkImage = canvas.toDataURL();
        callback(watermarkImage);
    };
}
  
  return <div>
    <div>
        <h2>嵌入</h2>
        <canvas ref={canvasRef} />
    </div>
    <div>
        <h2>提取</h2>
        <canvas ref={watermarkCanvasRef} />
    </div>
    <img id="output" />
    <img id="watermark-output" />
    </div>
}

export default SpatialBinarization
