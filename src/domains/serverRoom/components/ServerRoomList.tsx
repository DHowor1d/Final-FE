
/**
 * @author 최산하
 */
import type { DataCenterGroup, ServerRoom } from '../types';
import ServerRoomCard from './ServerRoomCard';
import '../css/serverRoomList.css';

interface Props {
  dataCenters: DataCenterGroup[];
  onEditClick: (serverRoom: ServerRoom) => void;
  onDeleteClick: (serverRoom: ServerRoom) => void;
}

function ServerRoomList({ dataCenters, onEditClick, onDeleteClick }: Props) {
  return (
    <div className="server-room-list-container">
      {dataCenters.map((dataCenter) => (
        <div key={dataCenter.dataCenterId} className="datacenter-group">
          {/* 서버실 카드 목록 */}
          <div className="server-room-list">
            {dataCenter.serverRooms.map((room) => (
              <ServerRoomCard 
                key={room.id} 
                room={room}
                dataCenterId={dataCenter.dataCenterId}
                dataCenterAddress={dataCenter.dataCenterAddress}
                onEditClick={onEditClick}
                onDeleteClick={onDeleteClick}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ServerRoomList;