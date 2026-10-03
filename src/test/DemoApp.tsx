import { EditorWorkspace } from '../editor/EditorWorkspace'
import { demoProposal } from '../data/demoProposal'

// Approved editor regression fixture; real App launches the Library, never seeds demo data.
export default function DemoApp() { return <EditorWorkspace initialProposal={demoProposal} /> }
