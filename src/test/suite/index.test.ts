// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode'
import * as os from 'os'
import * as path from 'path'
import * as fs from 'fs-extra'
import { spawn } from 'promisify-child-process'
import { expect } from 'chai'
import applyTransform from '../..'

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.')
  const temp = path.join(os.tmpdir(), 'apply-jscodeshift')

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

  test('applyTransform .js', async function() {
    const document = await vscode.workspace.openTextDocument(
      vscode.Uri.parse('untitled:test.js')
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
        expect(path).to.equal('test.js')
        return j(source)
          .findVariableDeclarators('foo')
          .renameTo('baz')
          .toSource()
      },
      { foo: 2 }
    )
    expect(document.getText()).to.equal(`let baz = 2; let bar = baz;`)
  })

  test('applyTransform .js with babel', async function() {
    this.timeout(60000)

    vscode.window.showInformationMessage('creating temp project')

    const dir = path.join(temp, 'babel-js')
    await fs.mkdirs(dir)
    await fs.writeJSON(path.join(dir, 'package.json'), {
      name: 'babel-js',
      version: '0.0.0-development',
      devDependencies: {
        '@babel/core': '^7.1.6',
        '@babel/preset-env': '^7.1.6',
        '@babel/preset-flow': '^7.1.6',
      },
    })
    await fs.writeJSON(path.join(dir, '.babelrc'), {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-flow',
      ],
    })
    await fs.writeFile(
      path.join(dir, 'test.js'),
      'let foo = (2: number); let bar = foo;',
      'utf8'
    )
    await spawn('npm', ['install'], { cwd: dir, stdio: 'inherit' })
    vscode.window.showInformationMessage('temp project created!')
    const document = await vscode.workspace.openTextDocument(
      vscode.Uri.file(path.join(dir, 'test.js'))
    )
    await vscode.window.showTextDocument(document)
    await applyTransform(
      ({ source }, { j }) => {
        return j(source)
          .findVariableDeclarators('foo')
          .renameTo('baz')
          .toSource()
      },
      { foo: 2 }
    )
    expect(document.getText()).to.equal(`let baz = (2: number); let bar = baz;`)
  })

  test('applyTransform .ts without babel', async function() {
    this.timeout(60000)

    vscode.window.showInformationMessage('creating temp project')

    const dir = path.join(temp, 'plain-tsx')
    await fs.mkdirs(dir)
    await fs.writeJSON(path.join(dir, 'package.json'), {
      name: 'plain-tsx',
      version: '0.0.0-development',
    })
    await fs.writeFile(
      path.join(dir, 'test.tsx'),
      'let foo = 2 as number; let bar = foo;',
      'utf8'
    )
    await spawn('npm', ['install'], { cwd: dir, stdio: 'inherit' })
    vscode.window.showInformationMessage('temp project created!')
    const document = await vscode.workspace.openTextDocument(
      vscode.Uri.file(path.join(dir, 'test.tsx'))
    )
    await vscode.window.showTextDocument(document)
    await applyTransform(
      ({ source }, { j }) => {
        return j(source)
          .findVariableDeclarators('foo')
          .renameTo('baz')
          .toSource()
      },
      { foo: 2 }
    )
    expect(document.getText()).to.equal(`let baz = 2 as number; let bar = baz;`)
  })

  test('applyTransform .ts with babel', async function() {
    this.timeout(60000)

    vscode.window.showInformationMessage('creating temp project')

    const dir = path.join(temp, 'babel-ts')
    await fs.mkdirs(dir)
    await fs.writeJSON(path.join(dir, 'package.json'), {
      name: 'babel-ts',
      version: '0.0.0-development',
      devDependencies: {
        '@babel/core': '^7.1.6',
        '@babel/preset-env': '^7.1.6',
        '@babel/preset-typescript': '^7.7.2',
      },
    })
    await fs.writeJSON(path.join(dir, '.babelrc'), {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-typescript',
      ],
    })
    await fs.writeFile(
      path.join(dir, 'test.ts'),
      'let foo = 2 as number; let bar = foo;',
      'utf8'
    )
    await spawn('npm', ['install'], { cwd: dir, stdio: 'inherit' })
    vscode.window.showInformationMessage('temp project created!')
    const document = await vscode.workspace.openTextDocument(
      vscode.Uri.file(path.join(dir, 'test.ts'))
    )
    await vscode.window.showTextDocument(document)
    await applyTransform(
      ({ source }, { j }) => {
        return j(source)
          .findVariableDeclarators('foo')
          .renameTo('baz')
          .toSource()
      },
      { foo: 2 }
    )
    expect(document.getText()).to.equal(`let baz = 2 as number; let bar = baz;`)
  })
})
