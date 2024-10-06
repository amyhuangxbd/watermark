import React, { useContext } from 'react'
import { InboxOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { message, Upload } from 'antd'
import { FileContext } from './fileContext'

const { Dragger } = Upload

const FileUpload: React.FC = () => {
  const { setFile } = useContext(FileContext)
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }
  const drawWatermark = (text, x, y) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.font = "20px Arial"; // 设置字体大小和类型
    ctx!.textAlign = "center"; // 设置水平对齐方式
    ctx!.textBaseline = "middle"; // 设置垂直对齐方式
 
    // 获取文字的度量信息
    const metrics = ctx!.measureText(text);
    const textWidth = metrics.width;
    const textHeight = parseInt(ctx!.font); // 将字体大小转换为数字
 
    // 绘制文字
    ctx!.fillText(text, x - textWidth / 2, y + textHeight / 2);
    return canvas.toDataURL("image/png")
  }
  // 获取二进制
  const getBinary = file => {
    // 创建FileReader对象
    const reader = new FileReader()

    // 文件读取成功完成后的处理
    reader.onload = function (e) {
      const binaryData = e.target.result
      // 这里的binaryData就是文件的二进制数据，可以进行后续处理
      console.log(binaryData)
    }

    // 以二进制形式读取文件
    reader.readAsArrayBuffer(file)
  }
  const props: UploadProps = {
    name: 'file',
    multiple: false,
    // action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
    onChange (info) {
      const { status } = info.file
      // console.log(info)
      if (status !== 'uploading') {
        console.log(info.file, info.fileList)
      }
      if (status === 'done') {
        // setFile([info.file])
        // getBinary(info.file)
        const { file } = info;
        // const blob = new Blob([file], { type: file.type });
        // console.log({blob})
        message.success(`${info.file.name} file uploaded successfully.`)
        // getBinary(blob)
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`)
      }
    },
    beforeUpload: (file, ...args) => {
      console.log({file, args})
      // getBinary(file)
      getBase64(file).then(data => setFile(data))
      const isPNG = file.type === 'image/png';
      if (!isPNG) {
        message.error(`${file.name} is not a png file`);
      }

      return isPNG || Upload.LIST_IGNORE;
    },
    onDrop (e) {
      // setFile(e.dataTransfer.files)
      // getBinary(e.dataTransfer.files)
      console.log('Dropped files', e.dataTransfer.files)
    }
  }
  function readBlobAsDataURL (blob, callback) {
    var a = new FileReader()
    a.onload = function (e) {
      callback(e.target.result)
    }
    a.readAsDataURL(blob)
  }
  // readBlobAsDataURL(blob, function (dataurl) {
  //   console.log(dataurl)
  // })
  // readBlobAsDataURL(file, function (dataurl) {
  //   console.log(dataurl)
  // })
  // function dataURLtoBlob (dataurl) {
  //   var arr = dataurl.split(','),
  //     mime = arr[0].match(/:(.*?);/)[1],
  //     bstr = atob(arr[1]),
  //     n = bstr.length,
  //     u8arr = new Uint8Array(n)
  //   while (n--) {
  //     u8arr[n] = bstr.charCodeAt(n)
  //   }
  //   return new Blob([u8arr], { type: mime })
  // }
  return (
    <Dragger {...props}>
      <p className='ant-upload-drag-icon'>
        <InboxOutlined />
      </p>
      <p className='ant-upload-text'>
        Click or drag file to this area to upload
      </p>
      <p className='ant-upload-hint'>
        Support for a single or bulk upload. Strictly prohibited from uploading
        company data or other banned files.
      </p>
    </Dragger>
  )
}

export default FileUpload
