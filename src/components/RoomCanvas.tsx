import { forwardRef } from 'react';
import type { Dispatch } from 'react';
import type { Device, HomeAction, Room } from '../types';
import { Widget } from './Widget';

interface RoomCanvasProps {
  room: Room;
  devices: Record<string, Device>;
  dispatch: Dispatch<HomeAction>;
  onOpen: (deviceId: string) => void;
  arrange: boolean;
}

export const RoomCanvas = forwardRef<HTMLElement, RoomCanvasProps>(function RoomCanvas(
  { room, devices, dispatch, onOpen, arrange },
  ref,
) {
  return (
    <section className="room" id={`room-${room.id}`} aria-labelledby={`title-${room.id}`} ref={ref} data-room={room.id}>
      <div className="room__inner">
        <header className="room__header">
          <div>
            <p className="room__kicker">{room.note}</p>
            <h1 id={`title-${room.id}`}>{room.name}</h1>
          </div>
          <div className="room__environment" aria-label={`${room.temperature} degrees, ${room.humidity} percent humidity`}>
            <span>{room.temperature}°</span>
            <span>{room.humidity}% <small>humidity</small></span>
          </div>
        </header>
        <div className="widget-grid">
          {room.deviceIds.map((deviceId) => (
            <Widget
              key={deviceId}
              device={devices[deviceId]}
              devices={devices}
              dispatch={dispatch}
              onOpen={onOpen}
              arrange={arrange}
            />
          ))}
        </div>
      </div>
    </section>
  );
});
