import Peer from 'simple-peer';

export interface PeerConnection {
  peer: Peer.Instance;
  id: string;
}

export const createPeer = (initiator: boolean, stream?: MediaStream): Peer.Instance => {
  return new Peer({
    initiator,
    trickle: false,
    stream,
  });
};

export const webrtcService = {
  // Logic for managing multiple peers and data channels will go here
};

export default webrtcService;
