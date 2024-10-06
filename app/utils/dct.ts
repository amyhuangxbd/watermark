// 嵌入水印到 DCT 系数的函数
export function embedInDCT(dctBlock, watermarkBlock) {
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            if (watermarkBlock[x][y] > 128) { // 简单阈值判断
                dctBlock[x][y] += 1; // 修改 DCT 系数以嵌入水印
            }
        }
    }
}

// 获取图像的 8x8 块
export function getBlock(imageData, startX, startY) {
    const block = [];
    for (let i = 0; i < 8; i++) {
        const row = [];
        for (let j = 0; j < 8; j++) {
            row.push(imageData.data[((startY + i) * imageData.width + (startX + j)) * 4]);
        }
        block.push(row);
    }
    return block;
}

// 将处理后的块放回图像
export function setBlock(imageData, block, startX, startY) {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            imageData.data[((startY + i) * imageData.width + (startX + j)) * 4] = block[i][j];
        }
    }
}

// 1D DCT
export function dct1d(vector) {
    const N = vector.length;
    const result = new Array(N).fill(0);

    for (let k = 0; k < N; k++) {
        let sum = 0;
        for (let n = 0; n < N; n++) {
            sum += vector[n] * Math.cos(((2 * n + 1) * k * Math.PI) / (2 * N));
        }
        result[k] = sum * (k === 0 ? Math.sqrt(1 / N) : Math.sqrt(2 / N));
    }

    return result;
}

// 1D IDCT
export function idct1d(vector) {
    const N = vector.length;
    const result = new Array(N).fill(0);

    for (let n = 0; n < N; n++) {
        let sum = 0;
        for (let k = 0; k < N; k++) {
            sum += (k === 0 ? Math.sqrt(1 / N) : Math.sqrt(2 / N)) * vector[k] * Math.cos(((2 * n + 1) * k * Math.PI) / (2 * N));
        }
        result[n] = sum;
    }

    return result;
}

// 2D DCT
export function dct2d(matrix) {
    const N = matrix.length;
    const M = matrix[0].length;
    const result = new Array(N).fill(0).map(() => new Array(M).fill(0));

    // 对每一行做 1D DCT
    for (let i = 0; i < N; i++) {
        result[i] = dct1d(matrix[i]);
    }

    // 对每一列做 1D DCT
    for (let j = 0; j < M; j++) {
        const col = result.map(row => row[j]);
        const dctCol = dct1d(col);
        for (let i = 0; i < N; i++) {
            result[i][j] = dctCol[i];
        }
    }

    return result;
}

// 2D IDCT
export function idct2d(matrix) {
    const N = matrix.length;
    const M = matrix[0].length;
    const result = new Array(N).fill(0).map(() => new Array(M).fill(0));

    // 对每一行做 1D IDCT
    for (let i = 0; i < N; i++) {
        result[i] = idct1d(matrix[i]);
    }

    // 对每一列做 1D IDCT
    for (let j = 0; j < M; j++) {
        const col = result.map(row => row[j]);
        const idctCol = idct1d(col);
        for (let i = 0; i < N; i++) {
            result[i][j] = idctCol[i];
        }
    }

    return result;
}

