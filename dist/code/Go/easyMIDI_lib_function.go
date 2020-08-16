package smf

import (
	"container/list"
)

type TrackIterator struct {
	trackRef   *Track
	elementRef *list.Element
}

func (iterator *TrackIterator) MoveNext() bool {

	if iterator.elementRef == nil {

		if iterator.trackRef.eventsList.Front() == nil {
			return false
		}

		iterator.elementRef = iterator.trackRef.eventsList.Front()
		return true
	}

	iterator.elementRef = iterator.elementRef.Next()
	return !(iterator.elementRef == nil)
}