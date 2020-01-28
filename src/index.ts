import * as vscode from 'vscode'
import jscodeshift, { Transform, Options } from 'jscodeshift'
import chooseJSCodeshiftParser from 'jscodeshift-choose-parser'

export default async function applyTransform(
  transform: Transform,
  options?: Options
): Promise<string | void | null | undefined> {
  const { window } = vscode
  const { activeTextEditor: editor } = window
  if (!editor) return
  const code = editor.document.getText()
  const file = editor.document.fileName

  const selectionStart = editor.document.offsetAt(editor.selection.start)
  const selectionEnd = editor.document.offsetAt(editor.selection.end)

  let parser = options ? options.parser : null
  if (!parser) parser = chooseJSCodeshiftParser(file)

  const j = parser ? jscodeshift.withParser(parser) : jscodeshift

  const newCode = transform(
    { path: file, source: code },
    {
      j,
      jscodeshift: j,
      stats: (): void => {
        // noop
      },
      report: (): void => {
        // noop
      },
    },
    {
      selectionStart,
      selectionEnd,
      ...options,
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
