import { Maybe, just, nothing } from './Maybe'

const enum ResultTag {
  Ok = 'Ok',
  Err = 'Err',
}
export type Result<A, B> = Ok<A, B> | Err<A, B>
export const ok = <A, B>(value: A) => Ok.of<A, B>(value)
export const err = <A, B>(msg: B) => Err.of<A, B>(msg)
export interface OkObject<A> {
  _tag: ResultTag.Ok
  _value: A
}
export interface ErrObject<B> {
  _tag: ResultTag.Err,
  _msg: B
}
export const fromString = <A, B>(s: string): Result<Result<A, B>, string> => {
  try {
    const obj: OkObject<A> | ErrObject<B> = JSON.parse(s)
    return fromObject(obj)
  } catch (error) {
    return err((error as SyntaxError).message)
  }
}
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
export default {
  ok,
  err,
  fromString,
  fromObject
}



class Ok<A, B> implements ResultMethods<A, B> {
  private _value: A
  constructor(value: A) {
    this._value = value
  }

  static of<A, B>(value: A): Result<A, B> {
    return new Ok(value)
  }

  map<A1>(f: (v: A) => A1): Result<A1, B> {
    return ok(f(this.unwrap()))
  }
  mapErr<B1>(f: (v: B) => B1): Result<A, B1> {
    return ok(this.unwrap())
  }
  mapOr<A1>(f: (v: A) => A1, defaultValue: A1): A1 {
    return f(this.unwrap())
  }
  mapOrElse<A1>(f: (v: A) => A1, defaultValue: () => A1): A1 {
    return f(this.unwrap())
  }
  unwrap(): A {
    return this._value
  }
  unwrapErr(): B {
    throw new TypeError('Call unwrapErr on Ok!')
  }
  unwrapOr(defaultValue: A): A {
    return this.unwrap()
  }
  unwrapOrElse(f: () => A): A {
    return this.unwrap()
  }
  isOk(): this is Ok<A, B> {
    return true
  }
  isErr(): this is Err<A, B> {
    return false
  }
  ap<A1>(other: Result<A, B>): Result<A1, B> {
    return other.map(this.unwrap() as (v: A) => A1)
  }
  bind<A1>(f: (a: A) => Result<A1, B>): Result<A1, B> {
    return f(this.unwrap())
  }
  toMaybe(): Maybe<A> {
    return just(this.unwrap())
  }
  toJSON(): OkObject<A> {
    return {
      _tag: ResultTag.Ok,
      _value: this.unwrap()
    }
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
  unwrap(): A {
    throw new TypeError('Call unwrap on Err!')
  }
  unwrapErr(): B {
    return this._msg
  }
  unwrapOr(defaultValue: A): A {
    return defaultValue
  }
  unwrapOrElse(f: () => A): A {
    return f()
  }
  isOk(): this is Ok<A, B> {
    return false
  }
  isErr(): this is Err<A, B> {
    return true
  }
  map<A1>(f: (v: A) => A1): Result<A1, B> {
    return Err.of(this.unwrapErr())
  }
  mapErr<B1>(f: (v: B) => B1): Result<A, B1> {
    return Err.of(f(this._msg))
  }
  mapOr<A1>(f: (v: A) => A1, defaultValue: A1): A1 {
    return defaultValue
  }
  mapOrElse<A1>(f: (v: A) => A1, defaultValue: () => A1): A1 {
    return defaultValue()
  }
  ap<A1>(f: Result<A, B>): Result<A1, B> {
    return err(this.unwrapErr())
  }
  bind<A1>(f: (a: A) => Result<A1, B>): Result<A1, B> {
    return err(this.unwrapErr())
  }
  toMaybe(): Maybe<A> {
    return nothing()
  }
  toJSON(): ErrObject<B> {
    return {
      _tag: ResultTag.Err,
      _msg: this.unwrapErr()
    }
  }
}

interface ResultFunctor<A, B> {
  /**
   * @description maps a Result<A, B> to Result<A1, B> by applying a function to a contained Ok value,
   * leaving an Err value untouched.
   */
  map<A1>(f: (v: A) => A1): Result<A1, B>
}
interface ResultApplicative<A, B> {
  /**
   * @description apply a Result<(a: A) => A1, B> to a Result<A, B>,
   * note that the caller instance should be Result<(a: A) => A1, B>.
   */
  ap<A1>(other: Result<A, B>): Result<A1, B>
}
interface ResultMonad<A, B> {
  /**
   * @description apply a function to the Ok value without concerning about Err.
   * return Err if Err,
   */
  bind<A1>(f: (a: A) => Result<A1, B>): Result<A1, B>
}

interface ResultMethods<A, B> extends ResultFunctor<A, B>, ResultApplicative<A, B>, ResultMonad<A, B> {
  isOk: () => boolean
  isErr: () => boolean
  /**
   * @description returns the contained Ok value.
   */
  unwrap: () => A
  /**
   * @description returns the contained Err value.
   */
  unwrapErr: () => B
  /**
   * @description returns the contained Ok value or a provided default(if Err).
   */
  unwrapOr: (defaultValue: A) => A
  /**
   * @description returns the contained Ok value or computes it from the function(if Err).
   */
  unwrapOrElse: (f: () => A) => A
  /**
   * @description maps a Result<A, B> to Result<A, B1> by applying a function to a contained Err value,
   * leaving an Ok value untouched.
   */
  mapErr<B1>(f: (v: B) => B1): Result<A, B1>
  /**
   * @description returns the provided default (if Err), or applies a function to the contained value (if Ok).
   */
  mapOr: <A1>(f: (v: A) => A1, defaultValue: A1) => A1
  /**
   * @description maps a Result<A, B> to A1 by applying fallback function default to a contained Err value,
   * or function f to a contained Ok value.
   */
  mapOrElse: <A1>(f: (v: A) => A1, defaultValue: () => A1) => A1
  toMaybe: () => Maybe<A>
}

