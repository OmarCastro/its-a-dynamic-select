import { test } from '#unit-test'
import { applyTemplate } from './templater.js'

test('applyTemplate - should convert a string to a path', async ({ dom, expect }) => {
  const { document } = dom
  document.body.innerHTML = `
<template id="test1">
  <div title="$.prop1">
    <slot name="$.prop2"/>
  </div>
</template>
`

  const data = {
    prop1: 'hello',
    prop2: 'world'
  }

  const template = document.body.querySelector('#test1')

  const result = applyTemplate(template, data)
  const div = document.createElement('div')
  div.append(result)
  expect(div.innerHTML).toBe(`
  <div title="hello">
    world</div>
`)
})

test('applyTemplate - should escape the result', async ({ dom, expect }) => {
  const { document } = dom
  document.body.innerHTML = `
<template id="test1">
  <div title="$.prop1">
    <slot name="$.prop2"/>
  </div>
</template>
`

  const data = {
    prop1: 'hello "world"',
    prop2: '<script>alert("RedAlert!!")<script>'
  }

  const template = document.body.querySelector('#test1')

  const result = applyTemplate(template, data)
  const div = document.createElement('div')
  div.append(result)
  expect(div.innerHTML).toBe(`
  <div title="hello &quot;world&quot;">
    &lt;script&gt;alert("RedAlert!!")&lt;script&gt;</div>
`)
})

test('applyTemplate - attributes that do not start with "$." or "$?." are not applied', async ({ dom, expect }) => {
  const { document } = dom
  document.body.innerHTML = `
<template id="test1">
  <div title="prop1">
    <slot name="$.prop2"/>
  </div>
</template>
`

  const data = {
    prop1: 'hello world',
    prop2: 'lorem ipsum'
  }

  const template = document.body.querySelector('#test1')

  const result = applyTemplate(template, data)
  const div = document.createElement('div')
  div.append(result)
  expect(div.innerHTML).toBe(`
  <div title="prop1">
    lorem ipsum</div>
`)
})

test('applyTemplate - slots with name that do not start with "$." or "$?." are not applied', async ({ dom, expect }) => {
  const { document } = dom
  document.body.innerHTML = `
<template id="test1">
  <div title="$.prop1">
    <slot name="prop2"/>
  </div>
</template>
`

  const data = {
    prop1: 'dig dig',
    prop2: 'lorem ipsum'
  }

  const template = document.body.querySelector('#test1')

  const result = applyTemplate(template, data)
  const div = document.createElement('div')
  div.append(result)
  expect(div.innerHTML).toBe(`
  <div title="dig dig">
    <slot name="prop2">
  </slot></div>
`)
})

test('applyTemplate - "$$" token is used to escape initial "$" on slot name and attributes', async ({ dom, expect }) => {
  const { document } = dom
  document.body.innerHTML = `
<template id="test1">
  <div title="$$.prop1">
    <slot name="$$.prop2"/>
  </div>
</template>
`

  const data = {
    prop1: 'dig dig',
    prop2: 'lorem ipsum'
  }

  const template = document.body.querySelector('#test1')

  const result = applyTemplate(template, data)
  const div = document.createElement('div')
  div.append(result)
  expect(div.innerHTML).toBe(`
  <div title="$.prop1">
    <slot name="$.prop2">
  </slot></div>
`)
})

test('applyTemplate - attributes starting with "$?." that results in falsy value removes the attribute', async ({ dom, expect }) => {
  const { document } = dom
  document.body.innerHTML = `
<template id="test1">
  <div title="prop1" data-flagged="$?.prop3">
    <slot name="$.prop2"/>
  </div>
</template>
`

  const data = {
    prop1: 'hello world',
    prop2: 'lorem ipsum',
    prop3: false
  }

  const template = document.body.querySelector('#test1')

  const result = applyTemplate(template, data)
  const div = document.createElement('div')
  div.append(result)
  expect(div.innerHTML).toBe(`
  <div title="prop1">
    lorem ipsum</div>
`)
})

test('applyTemplate - attributes starting with "$?." that results in truthy value makes attribute present but empty', async ({ dom, expect }) => {
  const { document } = dom
  document.body.innerHTML = `
<template id="test1">
  <div title="prop1" data-flagged="$?.prop3">
    <slot name="$.prop2"/>
  </div>
</template>
`

  const data = {
    prop1: 'hello world',
    prop2: 'lorem ipsum',
    prop3: true
  }

  const template = document.body.querySelector('#test1')

  const result = applyTemplate(template, data)
  const div = document.createElement('div')
  div.append(result)
  expect(div.innerHTML).toBe(`
  <div title="prop1" data-flagged="">
    lorem ipsum</div>
`)
})

test('applyTemplate - template loop with string', async ({ dom, expect }) => {
  const { document } = dom
  document.body.innerHTML = `
<template id="test1">
  <div title="$.prop2">
    <template data-each="$.prop1">
      <div title="$."><slot name="$."/></div>
    </template>
  </div>
</template>
`

  const data = {
    prop1: ['aa', 'bb'],
    prop2: 'lorem ipsum'
  }

  const template = document.body.querySelector('#test1')

  const result = applyTemplate(template, data)
  const div = document.createElement('div')
  div.append(result)
  expect(div.innerHTML).toBe(`
  <div title="lorem ipsum">

      <div title="aa">aa</div>

      <div title="bb">bb</div>

  </div>
`)
})
