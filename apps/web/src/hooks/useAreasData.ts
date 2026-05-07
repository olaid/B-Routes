import { useEffect, useState } from 'react'
import type { AreasData } from '../types/domain'
import { loadAreasData } from '../data/areasRepository'

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: AreasData }

export function useAreasData(): State {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    loadAreasData()
      .then((data) => {
        if (!cancelled) setState({ status: 'ready', data })
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : '読み込みに失敗しました'
          setState({ status: 'error', message })
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
