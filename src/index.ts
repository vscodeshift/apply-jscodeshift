import * as vscode from 'vscode'
import jscodeshift, { Transform } from 'jscodeshift'

export default async function applyTransform(
  transform: Transform
): Promise<string | void | null | undefined> {
  const { window } = vscode
  const { activeTextEditor: editor } = window
  if (!editor) return
  const code = editor.document.getText()
  const file = editor.document.fileName

  const selectionStart = editor.document.offsetAt(editor.selection.start)
  const selectionEnd = editor.document.offsetAt(editor.selection.end)

  const newCode = transform(
    { path: file, source: code },
    {
      j: jscodeshift,
      jscodeshift,
      stats: (name: string, quantity?: number | undefined): void => {
        // noop
      },
      report: (msg: string): void => {
        // noop
      },
    },
    {
      selectionStart,
      selectionEnd,
    }
  )

  if (newCode && newCode !== code) {
    await editor.edit(edit =>
      edit.replace(
        new vscode.Range(
          editor.document.positionAt(0),
          editor.document.positionAt(code.length)
        ),
        newCode
      )
    )
  }

  return newCode
}
