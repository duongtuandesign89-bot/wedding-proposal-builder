import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

let serial = 0
const revoked: string[] = []
class DecodingImage {
  naturalWidth = 1600
  naturalHeight = 1200
  onload: null | (() => void) = null
  onerror: null | (() => void) = null
  set src(value: string) { queueMicrotask(() => value.includes('corrupt') ? this.onerror?.() : this.onload?.()) }
}

beforeEach(() => {
  serial = 0
  revoked.length = 0
  vi.stubGlobal('Image', DecodingImage)
  vi.stubGlobal('URL', class extends URL {
    static createObjectURL(file: File) { return `blob:${file.name}-${++serial}` }
    static revokeObjectURL(src: string) { revoked.push(src) }
  })
})
afterEach(() => vi.unstubAllGlobals())

async function selectImage(name = 'wedding.png', type = 'image/png') {
  fireEvent.change(screen.getByLabelText('Chọn ảnh Hero'), { target: { files: [new File(['local image'], name, { type })] } })
  await waitFor(() => expect(screen.queryByText('Đang đọc ảnh…')).not.toBeInTheDocument())
}
const heroImage = () => screen.getByAltText('Ngọc and Huy wedding cover')

describe('local Hero image editing', () => {
  it('accepts an image, updates live crop, resets crop while retaining the selected source', async () => {
    const user = userEvent.setup()
    render(<App />)
    await selectImage()
    expect(heroImage()).toHaveAttribute('src', 'blob:wedding.png-1')
    expect(screen.getByRole('button', { name: 'Thay ảnh' })).toBeInTheDocument()
    fireEvent.change(screen.getByRole('slider', { name: 'Zoom' }), { target: { value: '1.5' } })
    expect(screen.getByText('150%')).toBeInTheDocument()
    fireEvent.keyDown(screen.getByRole('group', { name: 'Điều chỉnh ảnh Hero' }), { key: 'ArrowRight' })
    await user.click(screen.getByRole('button', { name: 'Đặt lại' }))
    expect(screen.getByRole('slider', { name: 'Zoom' })).toHaveValue('1')
    expect(heroImage()).toHaveAttribute('src', 'blob:wedding.png-1')
  })
  it('replaces an image at center/default zoom and releases the old URL', async () => {
    render(<App />)
    await selectImage()
    fireEvent.change(screen.getByRole('slider', { name: 'Zoom' }), { target: { value: '2' } })
    await selectImage('replacement.webp', 'image/webp')
    expect(heroImage()).toHaveAttribute('src', 'blob:replacement.webp-2')
    expect(screen.getByRole('slider', { name: 'Zoom' })).toHaveValue('1')
    expect(revoked).toContain('blob:wedding.png-1')
  })
  it('removes an image and restores the default Hero without hiding it', async () => {
    const user = userEvent.setup()
    render(<App />)
    await selectImage()
    await user.click(screen.getByRole('button', { name: 'Xóa ảnh' }))
    expect(heroImage()).toHaveAttribute('src', '/assets/solis-wedding-details-cover.png')
    expect(revoked).toContain('blob:wedding.png-1')
    expect(screen.getByRole('button', { name: 'Chọn ảnh' })).toBeInTheDocument()
  })
  it('rejects unsupported/corrupt files without replacing the valid image', async () => {
    render(<App />)
    await selectImage()
    await selectImage('notes.txt', 'text/plain')
    expect(screen.getByRole('alert')).toHaveTextContent('File ảnh không hợp lệ.')
    expect(heroImage()).toHaveAttribute('src', 'blob:wedding.png-1')
    await selectImage('corrupt.png')
    expect(screen.getByRole('alert')).toHaveTextContent('File ảnh không hợp lệ.')
    expect(revoked).toContain('blob:corrupt.png-2')
    expect(heroImage()).toHaveAttribute('src', 'blob:wedding.png-1')
  })
  it('releases the owned object URL when unmounted', async () => {
    const { unmount } = render(<App />)
    await selectImage()
    unmount()
    expect(revoked).toContain('blob:wedding.png-1')
  })
  it('uses the last selected image even when an older decode finishes later', async () => {
    const pending: DecodingImage[] = []
    vi.stubGlobal('Image', class extends DecodingImage {
      set src(_value: string) { pending.push(this) }
    })
    render(<App />)
    const picker = screen.getByLabelText('Chọn ảnh Hero')
    fireEvent.change(picker, { target: { files: [new File(['a'], 'first.png', { type: 'image/png' })] } })
    fireEvent.change(picker, { target: { files: [new File(['b'], 'second.png', { type: 'image/png' })] } })
    await act(async () => { pending[1].onload?.() })
    expect(heroImage()).toHaveAttribute('src', 'blob:second.png-2')
    await act(async () => { pending[0].onload?.() })
    expect(heroImage()).toHaveAttribute('src', 'blob:second.png-2')
    expect(revoked.filter(src => src === 'blob:first.png-1')).toHaveLength(1)
  })
  it('releases a pending URL and ignores completion after unmount', async () => {
    let pending: DecodingImage | undefined
    vi.stubGlobal('Image', class extends DecodingImage {
      set src(_value: string) { pending = this }
    })
    const { unmount } = render(<App />)
    fireEvent.change(screen.getByLabelText('Chọn ảnh Hero'), { target: { files: [new File(['a'], 'pending.png', { type: 'image/png' })] } })
    unmount()
    await act(async () => { pending?.onload?.() })
    expect(revoked.filter(src => src === 'blob:pending.png-1')).toHaveLength(1)
  })
  it('does not apply an old drag when a replacement finishes loading', async () => {
    vi.stubGlobal('PointerEvent', class extends MouseEvent {
      pointerId = 1
      isPrimary = true
    })
    render(<App />)
    await selectImage()
    fireEvent.change(screen.getByRole('slider', { name: 'Zoom' }), { target: { value: '2' } })
    const cropImage = screen.getByAltText('Ảnh Hero đang chỉnh')
    Object.defineProperties(cropImage, { naturalWidth: { value: 1600 }, naturalHeight: { value: 1200 } })
    fireEvent.load(cropImage)
    let pending: DecodingImage | undefined
    vi.stubGlobal('Image', class extends DecodingImage {
      set src(_value: string) { pending = this }
    })
    fireEvent.change(screen.getByLabelText('Chọn ảnh Hero'), { target: { files: [new File(['b'], 'replacement.png', { type: 'image/png' })] } })
    const frame = screen.getByRole('group', { name: 'Điều chỉnh ảnh Hero' })
    frame.setPointerCapture = () => {}
    fireEvent.pointerDown(frame, { clientX: 100, clientY: 100, button: 0 })
    await act(async () => { pending?.onload?.() })
    fireEvent.pointerMove(frame, { clientX: 200, clientY: 200 })
    expect(screen.getByRole('slider', { name: 'Zoom' })).toHaveValue('1')
  })
})
