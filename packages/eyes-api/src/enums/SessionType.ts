export enum SessionType {
  SEQUENTIAL = 'SEQUENTIAL',
  PROGRESSION = 'PROGRESSION',
}

export type SessionTypeLiteral = SessionType | `${SessionType}`
