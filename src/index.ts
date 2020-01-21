import * as vscode from 'vscode'
import * as path from 'path'
import jscodeshift, { Transform, Options } from 'jscodeshift'
import { ASTNode } from 'recast'
import resolve from 'resolve'

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
  if (!parser) {
    /* eslint-disable @typescript-eslint/no-var-requires */
    const cwd = path.dirname(file)
    const tsMatch = /\.(tsx?)$/.exec(file)
    if (tsMatch) {
      try {
        // if @babel/preset-typescript is found, try to parse with @babel/core instead of ts/x.
        resolve.sync('@babel/preset-typescript', { basedir: cwd })
      } catch (error) {
        parser = tsMatch[1]
      }
    }
    if (!parser) {
      try {
        const babel = require(resolve.sync('@babel/core', { basedir: cwd }))
        parser = {
          parse(code: string): ASTNode {
            return babel.parseSync(code, {
              cwd,
              filename: file,
              // without this, babel won't search upward for a config file
              rootMode: 'upward-optional',
              // without this, jscodeshift would try to use esprima to tokenize the file,
              // which may not work
              parserOpts: { tokens: true },
            })
          },
        }
      } catch (error) {
        // ignore
      }
    }
    /* eslint-enable @typescript-eslint/no-var-requires */
  }

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
