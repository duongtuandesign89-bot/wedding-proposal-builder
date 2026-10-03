import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../test/DemoApp'

const preview = () => within(screen.getByRole('article', { name: 'Wedding proposal' }))
const intro = 'Cảm ơn Ngọc & Huy đã tin tưởng Solis Studio.'

describe('optional proposal content editing', () => {
  it('shows introduction live when enabled, hides it without losing text', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(preview().queryByRole('region', { name: 'Lời giới thiệu' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('checkbox', { name: 'Hiển thị lời giới thiệu' }))
    fireEvent.change(screen.getByLabelText('Nội dung lời giới thiệu'), { target: { value: intro } })
    expect(preview().getByText(intro)).toBeInTheDocument()
    await user.click(screen.getByRole('checkbox', { name: 'Hiển thị lời giới thiệu' }))
    expect(preview().queryByText(intro)).not.toBeInTheDocument()
    await user.click(screen.getByRole('checkbox', { name: 'Hiển thị lời giới thiệu' }))
    expect(screen.getByLabelText('Nội dung lời giới thiệu')).toHaveValue(intro)
  })

  it.each([
    ['ghi chú', 'Ghi chú', 'Chi phí di chuyển ngoài khu vực Trà Vinh được tính riêng.'],
    ['điều khoản', 'Điều khoản', 'Thời gian bàn giao ảnh dự kiến 30 ngày.'],
  ])('adds/edits/reorders/deletes %s and hides without losing items', async (action, label, text) => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: `Thêm ${action}` }))
    fireEvent.change(screen.getByLabelText(`${label} 3`), { target: { value: text } })
    const region = preview().getByRole('region', { name: label })
    expect(within(region).getAllByRole('listitem')).toHaveLength(3)
    expect(screen.getByRole('button', { name: `Di chuyển lên ${action} 1` })).toBeDisabled()
    expect(screen.getByRole('button', { name: `Di chuyển xuống ${action} 3` })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: `Di chuyển lên ${action} 3` }))
    expect(within(region).getAllByRole('listitem')[1]).toHaveTextContent(text)
    await user.click(screen.getByRole('button', { name: `Xóa ${action} 2` }))
    expect(within(region).getAllByRole('listitem')).toHaveLength(2)
    await user.click(screen.getByRole('checkbox', { name: `Hiển thị ${action}` }))
    expect(preview().queryByRole('region', { name: label })).not.toBeInTheDocument()
    await user.click(screen.getByRole('checkbox', { name: `Hiển thị ${action}` }))
    expect(within(preview().getByRole('region', { name: label })).getAllByRole('listitem')).toHaveLength(2)
  })

  it('updates optional contact fields, omits blank values and disables contact', async () => {
    const user = userEvent.setup()
    render(<App />)
    fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '0900 000 000' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'hello@example.com' } })
    fireEvent.change(screen.getByLabelText('Address'), { target: { value: 'Trà Vinh\nViệt Nam' } })
    const footer = preview().getByRole('contentinfo', { name: 'Liên hệ' })
    expect(within(footer).getByText('0900 000 000')).toBeInTheDocument()
    expect(within(footer).getByText('hello@example.com')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: '' } })
    expect(within(footer).queryByText('hello@example.com')).not.toBeInTheDocument()
    await user.click(screen.getByRole('checkbox', { name: 'Hiển thị thông tin liên hệ' }))
    expect(preview().queryByRole('contentinfo')).not.toBeInTheDocument()
    expect(preview().getByTestId('total-investment')).toHaveTextContent('22.000.000 VND')
  })
})
