export type ExportStage = 'MOUNT' | 'PREPARE' | 'MEASURE' | 'FONTS' | 'CONTEXT' | 'CAPTURE' | 'VALIDATE' | 'ENCODE' | 'DOWNLOAD'

/** The UI displays only this bounded code, never the underlying asset URL/data. */
export class ExportDiagnosticError extends Error {
  readonly code: string
  constructor(stage: ExportStage, cause: unknown) {
    super(cause instanceof Error ? cause.message : 'Export failed', { cause })
    this.name = 'ExportDiagnosticError'
    const detail = this.message === 'Export canvas unavailable or incomplete on this browser' ? 'ALPHA'
      : this.message === 'Export render is blank or incomplete' ? 'BLANK'
      : this.message === 'Export canvas dimensions do not match the full document' ? 'SIZE'
      : this.message === 'Export render has invalid logo bounds' ? 'LOGO'
      : cause instanceof Error && cause.name === 'SecurityError' ? 'SECURITY'
      : /timed out/i.test(this.message) ? 'TIMEOUT'
      : /^Export font/i.test(this.message) ? 'FONT'
      : /^Export image/i.test(this.message) ? 'IMAGE'
      : 'ERROR'
    this.code = `${stage}-${detail}`
  }
}
