import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { demoProposal } from '../data/demoProposal'
import { ProposalDocument } from '../proposal/ProposalDocument'
import { ExportProposalRenderer } from './ExportProposalRenderer'

afterEach(cleanup)
it('shares the full document tree but has a distinct clean canonical export root', () => {
  render(<><ProposalDocument proposal={demoProposal} /><ExportProposalRenderer proposal={demoProposal} /></>)
  const preview = document.getElementById('proposal-document')!
  const exported = document.getElementById('proposal-export-document')!
  expect(exported).not.toBeNull()
  expect(exported).toHaveAttribute('data-export-mode', 'true')
  expect(exported.textContent).toBe(preview.textContent)
  expect(exported.querySelector('button')).toBeNull()
  expect(exported.querySelector('.preview-toolbar')).toBeNull()
  expect(screen.getAllByText('Đặt cọc 30% để xác nhận lịch.')).toHaveLength(2)
  expect(exported.querySelector('.document-footer')).not.toBeNull()
})
