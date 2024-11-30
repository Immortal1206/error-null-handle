import { MaybeTag } from './Maybe'
import { ResultTag } from './Result'

export const JustTag = MaybeTag.Just
export const NothingTag = MaybeTag.Nothing
export const OkTag = ResultTag.Ok
export const ErrTag = ResultTag.Err
export {
  default as maybe,
  just,
  nothing,
  fromNullable,
  isMaybe,
  type Maybe,
  type JustObject,
  type NothingObject,
} from './Maybe'
export {
  default as result,
  ok,
  err,
  fromPromise,
  isResult,
  type Result,
  type OkObject,
  type ErrObject,
} from './Result'