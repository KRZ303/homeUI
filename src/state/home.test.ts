import { beforeEach, describe, expect, it } from 'vitest'
import { createInitialState } from '../data/home'
import { useHome } from './home'

const { state, update, reset, compose, iconAction } = useHome()

beforeEach(() => reset())

describe('Elastic Home state', () => {
  it('loads all 45 devices across five lanes from the approved specification', () => {
    const fresh = createInitialState()
    expect(Object.keys(fresh.entities)).toHaveLength(45)
    expect(fresh.lanes).toHaveLength(5)
    expect(fresh.lanes.map((lane) => lane.entityIds.length)).toEqual([12, 16, 6, 7, 4])
  })

  it('preserves a wide target when grouping simple tiles', () => {
    update('light_salon', { span: { c: 3, r: 2 } })
    expect(compose('scene_sen', 'light_salon')).toBe('choice')
    expect(compose('scene_sen', 'light_salon', 'group')).toBe('done')
    expect(state.entities.light_salon.span).toEqual({ c: 3, r: 2 })
    expect(state.lanes[0].entityIds).not.toContain('scene_sen')
  })

  it('combines sensor series into an analytical 3×3 graph', () => {
    expect(compose('sensor_co2_1x1', 'sensor_salon_2x2')).toBe('done')
    expect(state.entities.sensor_salon_2x2.span).toEqual({ c: 3, r: 3 })
    expect(state.entities.sensor_salon_2x2.series).toHaveLength(3)
    expect(state.lanes[1].entityIds).not.toContain('sensor_co2_1x1')
  })

  it('uses asymmetric group master switching', () => {
    state.entities.group_roslinki.members![0].active = false
    iconAction('group_roslinki')
    expect(state.entities.group_roslinki.members!.every((member) => !member.active)).toBe(true)
    iconAction('group_roslinki')
    expect(state.entities.group_roslinki.members!.every((member) => member.active)).toBe(true)
  })
})
