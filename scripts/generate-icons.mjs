// Gera os ícones PNG do PWA (192 e 512) sem dependências externas.
// Desenha uma lupa estilizada sobre fundo ardósia — tema "detetive".
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'public')
mkdirSync(outDir, { recursive: true })

// Tabela CRC32 para os chunks PNG
const crcTable = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const body = Buffer.concat([typeBuf, data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([len, body, crc])
}

function encodePng(size, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0
  // Aplica filtro 0 (none) por linha
  const stride = size * 4
  const raw = Buffer.alloc((stride + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride)
  }
  const idat = deflateSync(raw, { level: 9 })
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function draw(size) {
  const buf = Buffer.alloc(size * size * 4)
  const cx = size * 0.42
  const cy = size * 0.42
  const lens = size * 0.26 // raio externo da lente
  const ring = size * 0.06 // espessura do aro
  const bg = [15, 23, 42] // #0f172a
  const metal = [148, 163, 184] // ardósia clara
  const glass = [56, 78, 117] // azul vidro
  const accent = [245, 196, 83] // âmbar (cabo)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      let [r, g, b] = bg
      const dx = x - cx
      const dy = y - cy
      const dist = Math.sqrt(dx * dx + dy * dy)

      // Cabo da lupa (diagonal inferior-direita)
      const hx = x - size * 0.66
      const hy = y - size * 0.66
      const along = (hx + hy) / Math.SQRT2
      const across = (hx - hy) / Math.SQRT2
      const handleW = size * 0.05
      if (along > 0 && along < size * 0.26 && Math.abs(across) < handleW) {
        ;[r, g, b] = accent
      }

      if (dist < lens - ring) {
        ;[r, g, b] = glass
      } else if (dist < lens) {
        ;[r, g, b] = metal
      }

      buf[i] = r
      buf[i + 1] = g
      buf[i + 2] = b
      buf[i + 3] = 255
    }
  }
  return buf
}

for (const size of [192, 512]) {
  const png = encodePng(size, draw(size))
  const path = join(outDir, `icon-${size}.png`)
  writeFileSync(path, png)
  console.log(`gerado ${path} (${png.length} bytes)`)
}
