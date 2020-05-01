import * as vscode from 'vscode'
import jscodeshift, { Transform, Options } from 'jscodeshift'
import chooseJSCodeshiftParser from 'jscodeshift-choose-parser'

export type AsyncTransform = (
  ...args: Parameters<Transform>
) => Promise<ReturnType<Transform>>

export default async function applyTransform(
  transform: Transform | AsyncTransform,
  options?: Options
): Promise<string | void | null | undefined> {
  const { window } = vscode
  const { activeTextEditor: editor } = window
  if (!editor) return

  return await window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
    },
    async (
      progress: vscode.Progress<{ increment?: number; message?: string }>
    ): Promise<string | void | null | undefined> => {
      progress.report({ message: `Applying ${transform.name}...` })

      const code = editor.document.getText()
      const file = editor.document.fileName

      const selectionStart = editor.document.offsetAt(editor.selection.start)
      const selectionEnd = editor.document.offsetAt(editor.selection.end)

      let parser = options ? options.parser : null
      if (!parser) {
        switch (editor.document.languageId) {
          case 'typescript':
            parser = 'ts'
            break
          case 'typescriptreact':
            parser = 'tsx'
            break
          default:
            parser = chooseJSCodeshiftParser(file)
        }
      }

      const j = parser ? jscodeshift.withParser(parser) : jscodeshift

      // we can support both sync and async transforms this way, even though
      // jscodeshift doesn't
      const newCode = await transform(
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
  )
}
