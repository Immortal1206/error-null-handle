import { type Maybe, just, nothing } from './Maybe'

class Ok<A, B> implements ResultMethods<A, B> {
  private _value: A
  constructor(value: A) {
    this._value = value
  }

  static of<A, B>(value: A): Result<A, B> {
    return new Ok(value)
  }

  expect(msg: string) {
    return this._value
  }
  expectErr(msg: string): B {
    throw new Error(`${msg}: ${this._value}`)
  }
  map<A1>(f: (v: A) => A1): Result<A1, B> {
    return ok(f(this._value))
  }
  mapErr<B1>(f: (v: B) => B1): Result<A, B1> {
    return ok(this._value)
  }
  mapOr<A1>(f: (v: A) => A1, defaultValue: A1): A1 {
    return f(this._value)
  }
  mapOrElse<A1>(f: (a: A) => A1, defaultValue: (b: B) => A1): A1 {
    return f(this._value)
  }
  unwrap(): A {
    return this._value
  }
  unwrapErr(): B {
    throw new TypeError('Call unwrapErr on Ok!')
  }
  unwrapOr(defaultValue: A): A {
    return this._value
  }
  unwrapOrElse(f: (b: B) => A): A {
    return this._value
  }
  isOk(): this is Ok<A, B> {
    return true
  }
  isErr(): this is Err<A, B> {
    return false
  }
  ap<A1, A2>(other: Result<A1, B>): Result<A2, B> {
    return other.map(this._value as (v: A1) => A2)
  }
  andThen<A1>(f: (a: A) => Result<A1, B>): Result<A1, B> {
    return f(this._value)
  }
  match<T>(onOk: (a: A) => T, onErr: (b: B) => T): T {
    return onOk(this._value)
  }
  do<T, U>(onOk: (a: A) => T, onErr: (e: B) => U): T | U {
    return onOk(this._value)
  }
  toMaybe(): Maybe<A> {
    return just(this._value)
  }
  private toJSON(): OkObject<A> {
    return {
      _tag: ResultTag.Ok,
      _value: this._value
    }
  }
  get [Symbol.toStringTag](): string {
    return ResultTag.Ok
  }
}

class Err<A, B> implements ResultMethods<A, B> {
  private _msg: B
  constructor(value: B) {
    this._msg = value
  }
  static of<A, B>(msg: B): Result<A, B> {
    return new Err(msg)
  }
  expect(msg: string): A {
    throw new Error(`${msg}: ${this._msg}`)
  }
  expectErr(msg: string): B {
    return this._msg
  }
  unwrap(): A {
    throw new TypeError('Call unwrap on Err!')
  }
  unwrapErr(): B {
    return this._msg
  }
  unwrapOr(defaultValue: A): A {
    return defaultValue
  }
  unwrapOrElse(f: (b: B) => A): A {
    return f(this._msg)
  }
  isOk(): this is Ok<A, B> {
    return false
  }
  isErr(): this is Err<A, B> {
    return true
  }
  map<A1>(f: (v: A) => A1): Result<A1, B> {
    return Err.of(this._msg)
  }
  mapErr<B1>(f: (v: B) => B1): Result<A, B1> {
    return Err.of(f(this._msg))
  }
  mapOr<A1>(f: (v: A) => A1, defaultValue: A1): A1 {
    return defaultValue
  }
  mapOrElse<A1>(f: (a: A) => A1, defaultValue: (b: B) => A1): A1 {
    return defaultValue(this._msg)
  }
  ap<A1, A2>(other: Result<A1, B>): Result<A2, B> {
    return err(this._msg)
  }
  andThen<A1>(f: (a: A) => Result<A1, B>): Result<A1, B> {
    return err(this._msg)
  }
  match<T>(onOk: (a: A) => T, onErr: (b: B) => T): T {
    return onErr(this._msg)
  }
  do<T, U>(onOk: (a: A) => T, onErr: (e: B) => U): T | U {
    return onErr(this._msg)
  }
  toMaybe(): Maybe<A> {
    return nothing()
  }
  private toJSON(): ErrObject<B> {
    return {
      _tag: ResultTag.Err,
      _msg: this._msg
    }
  }
  get [Symbol.toStringTag](): string {
    return ResultTag.Err
  }
}

export const enum ResultTag {
  Ok = 'Ok',
  Err = 'Err',
}
export type Result<A, B> = Ok<A, B> | Err<A, B>
/**
 * @description create a Ok<A> from value
 * @param value the ok value A of Result<A, B>
 * @returns Resule<A, B>
 */
export const ok = Ok.of
/**
 * @description create a Err<B> from value
 * @param value the err value B of Result<A, B>
 * @returns Resule<A, B>
 */
export const err = <A, B>(msg: B) => Err.of<A, B>(msg)
export interface OkObject<A> {
  _tag: ResultTag.Ok
  _value: A
}
export interface ErrObject<B> {
  _tag: ResultTag.Err,
  _msg: B
}
/**
 * @description convert a string generated by stringify the Result<A, B> to a Result<A, B>
 */
export const fromString = <A, B>(s: string): Result<Result<A, B>, string> => {
  try {
    const obj: OkObject<A> | ErrObject<B> = JSON.parse(s)
    return fromObject(obj)
  } catch (error) {
    return err((error as SyntaxError).message)
  }
}
/**
 * @description convert a OkObject<A> or a ErrObject<B> to Result<A, B>
 */
export const fromObject = <A, B>(obj: OkObject<A> | ErrObject<B>): Result<Result<A, B>, string> => {
  try {
    if (!obj || !obj._tag || (obj._tag !== ResultTag.Ok && obj._tag !== ResultTag.Err)) {
      throw new SyntaxError('Cannot parse to a Result!')
    }
    if (obj._tag === ResultTag.Ok) {
      return ok(ok(obj._value))
    } else {
      return ok(err(obj._msg))
    }
  } catch (error) {
    return err((error as SyntaxError).message)
  }
}

/**
 * @description convert a Promise<A> to a Promise<Result<A, B>>, handle the error by to function
 */
export const fromPromise = async <A, B = unknown>(promise: Promise<A>): Promise<Result<A, B>> => {
  try {
    const res = await promise
    return ok<A, B>(res)
  } catch (e) {
    return err<A, B>(e as B)
  }
}

export const isResult = <A, B>(a: unknown): a is Result<A, B> => a instanceof Ok || a instanceof Err

export default {
  ok,
  err,
  OkTag: ResultTag.Ok,
  ErrTag: ResultTag.Err,
  fromPromise,
  fromString,
  fromObject,
  isResult,
}

interface ResultFunctor<A, B> {
  /**
   * @description maps a Result<A, B> to Result<A1, B> by applying a function to a contained Ok value,
   * leaving an Err value untouched.
   */
  map: <A1>(f: (v: A) => A1) => Result<A1, B>
}
interface ResultApplicative<A, B> {
  /**
   * @description apply a Result<(a: A1) => A2, B> to a Result<A1, B>,
   * note that the caller instance should be Result<(a: A1) => A2, B>.
   */
  ap: <A1, A2>(other: Result<A1, B>) => Result<A2, B>
}
interface ResultMonad<A, B> {
  /**
   * @description apply a function to the Ok value without concerning about Err.
   * return Err if Err.
   */
  andThen: <A1>(f: (a: A) => Result<A1, B>) => Result<A1, B>
}

interface ResultMethods<A, B> extends ResultFunctor<A, B>, ResultApplicative<A, B>, ResultMonad<A, B> {
  isOk: () => boolean
  isErr: () => boolean
  /**
   * Returns the contained `Ok` value.
   * Panics if the value is an `Err`, with a panic message including the passed message,
   * and the content(converted to string) of the `Err`.
   */
  expect: (msg: string) => A
  /**
   * Returns the contained `Err` value.
   * Panics if the value is an `Ok`, with a panic message including the passed message,
   * and the content of(convert to string) the `Ok`.
   */
  expectErr: (msg: string) => B
  /**
   * @description returns the contained Ok value, panic on Err.
   */
  unwrap: () => A
  /**
   * @description returns the contained Err value, panic on Ok.
   */
  unwrapErr: () => B
  /**
   * @description returns the contained Ok value or a provided default(if Err).
   */
  unwrapOr: (defaultValue: A) => A
  /**
   * @description returns the contained Ok value or computes it from the function(if Err).
   */
  unwrapOrElse: (f: (b: B) => A) => A
  /**
   * @description maps a Result<A, B> to Result<A, B1> by applying a function to a contained Err value,
   * leaving an Ok value untouched.
   */
  mapErr: <B1>(f: (v: B) => B1) => Result<A, B1>
  /**
   * @description returns the provided default (if Err), or applies a function to the contained value (if Ok) and return it.
   */
  mapOr: <A1>(f: (v: A) => A1, defaultValue: A1) => A1
  /**
   * @description maps a Result<A, B> to A1 by applying fallback function default to a contained Err value,
   * or function f to a contained Ok value.
   */
  mapOrElse: <A1>(f: (a: A) => A1, defaultValue: (b: B) => A1) => A1
  toMaybe: () => Maybe<A>
  /**
   * @description do something on Result<A, B>, note that you should handle the two cases: Ok<A, B> and Err<A, B>
   * if you want to return different type, use do instead.
   * @returns if return some value, the two handlers should return the same type.
   */
  match: <T>(f: (v: A) => T, g: (v: B) => T) => T
  /**
   * @description do something on Result<A, B>, note that you should handle the two cases: Ok<A, B> and Err<A, B>
   */
  do: <T, U>(f: (v: A) => T, g: (v: B) => U) => T | U
}


