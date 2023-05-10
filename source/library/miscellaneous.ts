import {
  RhythmGroupStructure,
  getRhythmGroup,
  getRhythmMap,
  getRhythmSlotWeights,
} from 'clumsy-math'

export function rhythmSlotWeights(
  someRhythmGroupStructure: RhythmGroupStructure
) {
  return getRhythmSlotWeights(rhythmGroupMaps(someRhythmGroupStructure))
}

export function rhythmGroupMaps(
  someRhythmGroupStructure: RhythmGroupStructure
) {
  return getRhythmGroup(someRhythmGroupStructure).map(getRhythmMap)
}

export function throwInvalidPathError(errorPath: string): never {
  throw new Error(`invalid path reached: ${errorPath}`)
}
