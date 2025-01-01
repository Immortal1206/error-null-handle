import {
  ErrTag,
  err,
  OkTag,
  ok,
  type OkObject,
  just,
  nothing,
} from '../src'
import { fromObject, fromPromise, fromString } from '../src/Result'

type Fn = (num: number) => string

test('Result unwrap', () => {
  expect(ok(1).unwrap()).toEqual(1)
  expect(() => err(1).unwrap()).toThrow('Call unwrap on Err!')
})

test('Result unwrapOr', () => {
  expect(ok(1).unwrapOr(2)).toEqual(1)
  expect(err(1).unwrapOr(2)).toEqual(2)
})

test('Result unwrapOrElse', () => {
  expect(ok(1).unwrapOrElse(() => 2)).toEqual(1)
  expect(err(1).unwrapOrElse(() => 2)).toEqual(2)
})

test('Result unwrapErr', () => {
  expect(() => ok(1).unwrapErr()).toThrow('Call unwrapErr on Ok!')
  expect(err(1).unwrapErr()).toEqual(1)
})

test('Result isOk', () => {
  expect(ok(1).isOk()).toBe(true)
  expect(err(1).isOk()).toBe(false)
})

test('Result isErr', () => {
  expect(ok(1).isErr()).toBe(false)
  expect(err(1).isErr()).toBe(true)
})

test('Result map', () => {
  expect(ok(1).map((v) => v + 1).unwrap()).toEqual(2)
  expect(err<number, number>(1).map((v) => v + 1).unwrapErr()).toEqual(1)
})

test('Result mapOr', () => {
  expect(ok(1).mapOr((v) => v + 1, 3)).toEqual(2)
  expect(err<number, number>(1).mapOr((v) => v + 1, 3)).toEqual(3)
})

test('Result mapOrElse', () => {
  expect(ok(1).mapOrElse((v) => v + 1, () => 3)).toEqual(2)
  expect(err<number, number>(1).mapOrElse((v) => v + 1, () => 3)).toEqual(3)
})

test('Result mapErr', () => {
  expect(ok<number, number>(1).mapErr((v) => v + 1).unwrap()).toEqual(1)
  expect(err(1).mapErr((v) => v + 1).unwrapErr()).toEqual(2)
})

test('Result match', () => {
  expect(ok(1).match(() => 1, () => 2)).toEqual(1)
  expect(err(1).match(() => 1, () => 2)).toEqual(2)
})

test('Result do', () => {
  expect(ok(1).do(() => 1, () => 2)).toEqual(1)
  expect(err(1).do(() => 1, () => 2)).toEqual(2)
})

test('Result bind', () => {
  expect(ok<number, number>(1).bind((v) => ok(v + 1)).unwrap()).toEqual(2)
  expect(err<number, number>(1).bind((v) => ok(v + 1)).unwrapErr()).toEqual(1)
})

test('Result ap', () => {
  expect(ok<Fn, number>(num => num.toString()).ap<number, string>(ok(1)).unwrap()).toEqual('1')
  expect(err<Fn, number>(1).ap<number, string>(ok(2)).unwrapErr()).toEqual(1)
})

test('Result toMaybe', () => {
  expect(ok(1).toMaybe()).toEqual(just(1))
  expect(err(1).toMaybe()).toEqual(nothing())
})

test('json stringify', () => {
  expect(JSON.stringify(ok(1))).toEqual('{"_tag":"Ok","_value":1}')
  expect(JSON.stringify(err(1))).toEqual('{"_tag":"Err","_msg":1}')
})

test('Symbol.toStringTag', () => {
  expect(Object.prototype.toString.call(ok(1))).toEqual('[object Ok]')
  expect(Object.prototype.toString.call(err(1))).toEqual('[object Err]')
})

test('fromString', () => {
  expect(fromString('{"_tag":"Ok","_value":1}').unwrap().isOk()).toBe(true)
  expect(fromString('{"_tag":"Err","_msg":1}').unwrap().isErr()).toBe(true)
  expect(fromString('{"_tag":"aaa","_value":1}').isErr()).toBe(true)
})

test('fromObject', () => {
  expect(fromObject({ _tag: OkTag, _value: 1 }).unwrap().isOk()).toBe(true)
  expect(fromObject({ _tag: ErrTag, _msg: 1 }).unwrap().isErr()).toBe(true)
  expect(fromObject({ _tag: 'aaa', _value: 1 } as unknown as OkObject<number>).isErr()).toBe(true)
})

test('fromPromise', async () => {
  const ok = await fromPromise(Promise.resolve(1))
  const err = await fromPromise(Promise.reject(1))
  expect(ok.isOk()).toBe(true)
  expect(err.isErr()).toBe(true)
  expect(ok.unwrap()).toEqual(1)
  expect(err.unwrapErr()).toEqual(1)
})