import type { TextListSection } from '../types/proposal'
import type { ProposalEditorActions } from './useProposalEditor'
import { EditorGroup } from './EditorGroup'
import { EditorTextarea } from './EditorTextarea'

export function ContentListEditor({ section, content, actions }: {
  section: 'notes' | 'terms'; content: TextListSection; actions: ProposalEditorActions
}) {
  const label = section === 'notes' ? 'Ghi chú' : 'Điều khoản'
  const action = label.toLocaleLowerCase('vi-VN')
  return <EditorGroup number={section === 'notes' ? '07' : '08'} title={label}>
    <label className="editor-toggle"><input type="checkbox" checked={content.enabled} onChange={e => actions.setTextSectionEnabled(section, e.target.checked)} /><span>Hiển thị {action}</span></label>
    {content.enabled && <div className="content-item-editors">
      {content.items.map((text, index) => <div className="content-item-editor" key={index}>
        <EditorTextarea label={`${label} ${index + 1}`} value={text} onChange={e => actions.updateTextItem(section, index, e.target.value)} />
        <div className="content-item-actions">
          <button type="button" className="editor-action editor-action--arrow" aria-label={`Di chuyển lên ${action} ${index + 1}`} disabled={index === 0} onClick={() => actions.moveTextItem(section, index, -1)}>↑</button>
          <button type="button" className="editor-action editor-action--arrow" aria-label={`Di chuyển xuống ${action} ${index + 1}`} disabled={index === content.items.length - 1} onClick={() => actions.moveTextItem(section, index, 1)}>↓</button>
          <button type="button" className="editor-action" aria-label={`Xóa ${action} ${index + 1}`} onClick={() => actions.removeTextItem(section, index)}>Xóa</button>
        </div>
      </div>)}
      <button type="button" className="editor-add" aria-label={`Thêm ${action}`} onClick={() => actions.addTextItem(section)}>+ Thêm {action}</button>
    </div>}
  </EditorGroup>
}
