import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { LayoutGrid, X } from 'lucide-react';
import { useEffect, useReducer, useRef, useState } from 'react';
import { DetailsDialog } from './components/DetailsDialog';
import { DeviceIcon } from './components/DeviceIcon';
import { RoomCanvas } from './components/RoomCanvas';
import { initialHomeState } from './data/home';
import { homeReducer } from './state/homeReducer';

export default function App() {
  const [state, dispatch] = useReducer(homeReducer, initialHomeState);
  const [activeRoom, setActiveRoom] = useState(0);
  const [arrange, setArrange] = useState(false);
  const [selectedId, setSelectedId] = useState<string>();
  const [draggedId, setDraggedId] = useState<string>();
  const [notice, setNotice] = useState('');
  const trackRef = useRef<HTMLDivElement>(null);
  const roomRefs = useRef<Record<string, HTMLElement | null>>({});
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 7 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  );

  useEffect(() => {
    const timer = window.setInterval(() => dispatch({ type: 'tick-dishwashers' }), 4000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  function notify(message: string) {
    setNotice(message);
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(''), 3200);
  }

  function navigateRoom(index: number) {
    const track = trackRef.current;
    const room = roomRefs.current[state.rooms[index].id];
    if (!track || !room) return;
    const portrait = window.matchMedia('(orientation: portrait)').matches;
    track.scrollTo({
      left: portrait ? room.offsetLeft : 0,
      top: portrait ? 0 : room.offsetTop,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
    setActiveRoom(index);
  }

  function updateActiveRoom() {
    const track = trackRef.current;
    if (!track) return;
    const portrait = window.matchMedia('(orientation: portrait)').matches;
    const position = portrait ? track.scrollLeft / track.clientWidth : track.scrollTop / track.clientHeight;
    setActiveRoom(Math.max(0, Math.min(state.rooms.length - 1, Math.round(position))));
  }

  function onDragStart(event: DragStartEvent) {
    setDraggedId(String(event.active.id));
  }

  function onDragEnd(event: DragEndEvent) {
    setDraggedId(undefined);
    if (!event.over || event.active.id === event.over.id) return;
    const sourceId = String(event.active.id);
    const targetId = String(event.over.id);
    const source = state.devices[sourceId];
    const target = state.devices[targetId];
    if (!target?.acceptsChildren) {
      notify('Drop a light onto a lighting group.');
      return;
    }
    dispatch({ type: 'group-device', sourceId, targetId });
    setArrange(false);
    notify(`${source.name} is now grouped with ${target.name}.`);
  }

  const draggedDevice = draggedId ? state.devices[draggedId] : undefined;

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setDraggedId(undefined)}>
      <div className="app-shell">
        <header className="app-bar">
          <a className="wordmark" href={`#room-${state.rooms[activeRoom].id}`} onClick={(event) => { event.preventDefault(); navigateRoom(activeRoom); }} aria-label="Elastic Home">
            <span className="wordmark__mark" aria-hidden="true"><i /><i /><i /></span>
            Elastic
          </a>
          <button type="button" className={`arrange-button ${arrange ? 'is-active' : ''}`} aria-pressed={arrange} onClick={() => { setArrange((value) => !value); setSelectedId(undefined); }}>
            {arrange ? <X size={17} /> : <LayoutGrid size={17} />}
            {arrange ? 'Done' : 'Arrange'}
          </button>
        </header>

        <main className="room-track" ref={trackRef} onScroll={updateActiveRoom} aria-label="Home rooms">
          {state.rooms.map((room) => (
            <RoomCanvas
              key={room.id}
              room={room}
              devices={state.devices}
              dispatch={dispatch}
              onOpen={setSelectedId}
              arrange={arrange}
              ref={(node) => { roomRefs.current[room.id] = node; }}
            />
          ))}
        </main>

        <nav className="room-pagination" aria-label="Choose a room">
          {state.rooms.map((room, index) => (
            <button key={room.id} type="button" className={activeRoom === index ? 'is-active' : ''} aria-label={`Go to ${room.name}`} aria-current={activeRoom === index ? 'page' : undefined} onClick={() => navigateRoom(index)}><span /></button>
          ))}
        </nav>

        {arrange && <div className="arrange-hint" role="status">Drag a small light onto a lighting group</div>}
        {notice && <div className="toast" role="status">{notice}</div>}

        <DetailsDialog device={selectedId ? state.devices[selectedId] : undefined} dispatch={dispatch} onClose={() => setSelectedId(undefined)} />
        <DragOverlay dropAnimation={{ duration: 220, easing: 'ease-out' }} style={{ pointerEvents: 'none' }}>
          {draggedDevice && <div className="drag-preview"><DeviceIcon device={draggedDevice} /><span>{draggedDevice.name}</span></div>}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
