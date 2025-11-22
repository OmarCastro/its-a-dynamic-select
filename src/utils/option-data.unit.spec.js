import { test } from '../../test-utils/unit/test.util.js'
import { dataObjectOfOption, optionElementOfData } from './option-data.js'

test('dataObjectOfOption - get base option data', async ({ expect, dom }) => {
  const { document } = dom
  document.body.innerHTML = `
    <select>
      <option value="value1">hello</option>
      <option value="value2">world</option>
    </select>
  `
  const options = document.querySelectorAll('option')
  const result = [...options].map(option => dataObjectOfOption(option))
  expect(result).toEqual([{
    origin: 'option',
    selected: true,
    text: 'hello',
    value: 'value1',
    data: {
      text: 'hello',
      value: 'value1',
    }
  }, {
    origin: 'option',
    selected: false,
    text: 'world',
    value: 'value2',
    data: {
      text: 'world',
      value: 'value2',
    }
  }])
})

test('dataObjectOfOption - custom option data', async ({ expect, dom }) => {
  const { document } = dom
  document.body.innerHTML = `
    <select>
      <option data-of-option='{"text": "hello", "value": "value1", "custom": {"number": 1, "array": [1,2,3], "object": {"hello": "world"}, "null": null}}' value="value1">hello</option>
      <option value="value2"></option>
    </select>
  `
  const options = document.querySelectorAll('option')
  const result = [...options].map(option => dataObjectOfOption(option))
  expect(result).toEqual([{
    origin: 'option',
    selected: true,
    text: 'hello',
    value: 'value1',
    data: {
      text: 'hello',
      value: 'value1',
      custom: {
        number: 1,
        array: [1, 2, 3],
        object: { hello: 'world' },
        null: null
      }
    }
  }, {
    origin: 'option',
    selected: false,
    text: '',
    value: 'value2',
    data: {
      text: '',
      value: 'value2',
    }
  }])
})

test('dataObjectOfOption - invalid custom option data will act as if it doesnt exist', async ({ expect, dom }) => {
  const { document } = dom
  document.body.innerHTML = `
    <select>
      <option data-of-option='  ' value="value1">hello</option>
      <option data-of-option='[1,2,3]' value="value2">world</option>
    </select>
  `
  const options = document.querySelectorAll('option')
  const result = [...options].map(option => dataObjectOfOption(option))
  expect(result).toEqual([{
    origin: 'option',
    selected: true,
    text: 'hello',
    value: 'value1',
    data: {
      text: 'hello',
      value: 'value1',
    }
  }, {
    origin: 'option',
    selected: false,
    text: 'world',
    value: 'value2',
    data: {
      text: 'world',
      value: 'value2',
    }
  }])
})

test('optionElementOfData - creates option from option data', async ({ expect, dom }) => {
  const optionData = {
    origin: 'option',
    selected: true,
    text: 'hello',
    value: 'value1',
    data: {
      text: 'hello',
      value: 'value1',
    }
  }
  const option = optionElementOfData(optionData)
  expect(JSON.parse(option.getAttribute('data-of-option'))).toEqual(optionData.data)
  expect(option.textContent).toEqual(optionData.text)
  expect(option.value).toEqual(optionData.value)
  expect(option.selected).toBe(true)
})

test('dataObjectOfOption & optionElementOfData - calling both should return similar result', async ({ expect, dom }) => {
  const optionData = {
    origin: 'option',
    selected: true,
    text: 'hello',
    value: 'value1',
    data: {
      text: 'hello',
      value: 'value1',
    }
  }
  expect(dataObjectOfOption(optionElementOfData(optionData))).toEqual(optionData)
})
