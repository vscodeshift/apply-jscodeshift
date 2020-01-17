// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode'
import { expect } from 'chai'
import applyTransform from '../..'

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.')

  test('applyTransform .ts', async function() {
    const document = await vscode.workspace.openTextDocument(
      vscode.Uri.parse('untitled:test.ts')
    )
    const editor = await vscode.window.showTextDocument(document)
    await editor.edit(edit =>
      edit.insert(document.positionAt(0), `let foo = 2; let bar = foo;`)
    )
    editor.selection = new vscode.Selection(
      document.positionAt(2),
      document.positionAt(8)
    )
    await applyTransform(
      ({ path, source }, { j }, options) => {
        expect(options).to.deep.equal({
          selectionStart: 2,
          selectionEnd: 8,
          foo: 2,
        })
        expect(path).to.equal('test.ts')
        return j(source)
          .findVariableDeclarators('foo')
          .renameTo('baz')
          .toSource()
      },
      { foo: 2 }
    )
    expect(document.getText()).to.equal(`let baz = 2; let bar = baz;`)
  })
})
