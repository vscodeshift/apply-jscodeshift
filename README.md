# @vscodeshift/apply-jscodeshift

[![CircleCI](https://circleci.com/gh/vscodeshift/apply-jscodeshift.svg?style=svg)](https://circleci.com/gh/vscodeshift/apply-jscodeshift)
[![Coverage Status](https://codecov.io/gh/vscodeshift/apply-jscodeshift/branch/master/graph/badge.svg)](https://codecov.io/gh/vscodeshift/apply-jscodeshift)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![npm version](https://badge.fury.io/js/%40vscodeshift%2Fapply-jscodeshift.svg)](https://badge.fury.io/js/%40vscodeshift%2Fapply-jscodeshift)

apply jscodeshift to active text editor, passing selected range as options.

Tries to intelligently determine the parser. If `@babel/core` is present in the project,
it will be used along with the project's babel config.

## `applyTransform(transform, [options])`

```ts
import applyTransform from '@vscodeshift/apply-jscodeshift'
```

Applies the given `jscodeshift` transform to the active text editor.

### Arguments

#### `transform` (`jscodeshift.Transform`, **required**)

The transform to apply.

#### `options` (`jscodeshift.Options`, _optional_)

Options to pass to the transform. By default, `selectionStart`
and `selectionEnd` will be passed to the transform.

### Returns (`Promise<string | void | null | undefined>`)

A promise that will resolve to the output of the transform
(which will have also been applied to the active text editor
if it returns a string)
