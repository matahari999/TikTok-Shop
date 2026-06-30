import { writeFileSync } from 'fs'
import { deflateSync } from 'zlib'

const R = 0xEE, G = 0x1D, B = 0x52

function createPNG(size) {
  const raw = Buffer.alloc(size * size * 4)
  const cx = size / 2, cy = size / 2, radius = size * 0.47

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const offset = (y * size + x) * 4
      const dx = x - cx, dy = y - cy
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist > radius) {
        raw[offset] = 0; raw[offset + 1] = 0; raw[offset + 2] = 0; raw[offset + 3] = 0
        continue
      }

      let alpha = 255
      if (dist > radius - 1.5 && dist <= radius) {
        alpha = Math.max(0, Math.round(255 * (1 - (radius - dist))))
      }

      raw[offset] = R; raw[offset + 1] = G; raw[offset + 2] = B; raw[offset + 3] = alpha
    }
  }

  const filtered = Buffer.alloc(size + size * size * 4)
  for (let y = 0; y < size; y++) {
    filtered[y * (size * 4 + 1)] = 0
    raw.copy(filtered, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }

  const deflated = deflateSync(filtered, { level: 9 })

  function chunk(type, data) {
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length)
    const crcData = Buffer.concat([Buffer.from(type, 'ascii'), data])
    const crc = crc32(crcData)
    const crcBuf = Buffer.alloc(4)
    crcBuf.writeUInt32BE(crc)
    return Buffer.concat([len, Buffer.from(type, 'ascii'), data, crcBuf])
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0

  return Buffer.concat([signature, chunk('IHDR', ihdr), chunk('IDAT', deflated), chunk('IEND', Buffer.alloc(0))])
}

function crc32(buf) {
  let crc = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i]
    for (let j = 0; j < 8; j++)
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0)
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

for (const size of [192, 512]) {
  const png = createPNG(size)
  writeFileSync(`public/pwa-${size}x${size}.png`, png)
  console.log(`Created public/pwa-${size}x${size}.png (${png.length} bytes)`)
}
