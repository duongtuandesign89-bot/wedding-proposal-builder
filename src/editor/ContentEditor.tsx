import type { Contact, Proposal } from '../types/proposal'
import type { ProposalEditorActions } from './useProposalEditor'
import { EditorGroup } from './EditorGroup'
import { EditorField } from './EditorField'
import { EditorTextarea } from './EditorTextarea'
import { ContentListEditor } from './ContentListEditor'

const contactFields: Array<[Exclude<keyof Contact, 'enabled' | 'address'>, string]> = [
  ['studioName', 'Studio Name'], ['phone', 'Phone'], ['secondaryPhone', 'Secondary Phone'],
  ['email', 'Email'], ['website', 'Website'], ['social', 'Social'],
]

export function ContentEditor({ proposal, actions }: { proposal: Proposal; actions: ProposalEditorActions }) {
  return <>
    <EditorGroup number="06" title="Lời giới thiệu">
      <label className="editor-toggle"><input type="checkbox" checked={proposal.introduction.enabled} onChange={e => actions.updateIntroduction({ enabled: e.target.checked })} /><span>Hiển thị lời giới thiệu</span></label>
      {proposal.introduction.enabled && <EditorTextarea label="Nội dung lời giới thiệu" value={proposal.introduction.text} onChange={e => actions.updateIntroduction({ text: e.target.value })} />}
    </EditorGroup>
    <ContentListEditor section="notes" content={proposal.notes} actions={actions} />
    <ContentListEditor section="terms" content={proposal.terms} actions={actions} />
    <EditorGroup number="09" title="Thông tin liên hệ">
      <label className="editor-toggle"><input type="checkbox" checked={proposal.contact.enabled} onChange={e => actions.updateContact({ enabled: e.target.checked })} /><span>Hiển thị thông tin liên hệ</span></label>
      {proposal.contact.enabled && <div className="editor-grid">
        {contactFields.map(([field, label]) => <EditorField key={field} label={label} value={proposal.contact[field] ?? ''} onChange={e => actions.updateContact({ [field]: e.target.value })} />)}
        <EditorTextarea label="Address" value={proposal.contact.address ?? ''} onChange={e => actions.updateContact({ address: e.target.value })} />
      </div>}
    </EditorGroup>
  </>
}
