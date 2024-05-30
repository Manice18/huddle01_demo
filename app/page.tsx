"use client";

import { useEffect, useRef, useState } from "react";

import {
  useRoom,
  useLocalScreenShare,
  useLocalVideo,
  usePeerIds,
  useLocalAudio,
} from "@huddle01/react/hooks";
import { Role } from "@huddle01/server-sdk/auth";

import ShowPeers from "@/components/ShowPeers";
import { createRoom } from "@/actions/createRoom";
import { getAccessToken } from "@/actions/getAccessToken";

const Page = () => {
  const [roomId, setRoomId] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);

  const { joinRoom, leaveRoom } = useRoom({
    onJoin: () => {
      console.log("Joined the room");
    },
    onLeave: () => {
      setRoomId("");
      console.log("Left the room");
    },
    onPeerJoin: (peer) => {
      console.log("peer joined: ", peer);
    },
  });
  const { stream, enableVideo, disableVideo, isVideoOn } = useLocalVideo();
  const { enableAudio, disableAudio, isAudioOn } = useLocalAudio();
  const { startScreenShare, stopScreenShare, shareStream } =
    useLocalScreenShare();
  const { peerIds } = usePeerIds();

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (shareStream && screenRef.current) {
      screenRef.current.srcObject = shareStream;
    }
  }, [shareStream]);

  const getRoomId = async () => {
    const roomIdentifier = await createRoom();
    setRoomId(roomIdentifier as string);
  };

  const getAccessTokenData = async ({
    roomId,
    role,
  }: {
    roomId: string;
    role: Role;
  }) => {
    const tokenData = await getAccessToken({ roomId, role });
    return tokenData;
  };
  return (
    <div className="flex items-center justify-center mt-10">
      <div className="flex flex-col w-1/4 items-center space-y-6 mx-10">
        <input
          onChange={(e) => {
            setRoomId(e.target.value);
          }}
          value={roomId}
          className="text-black mx-auto w-[300px] rounded-md p-2"
        />
        <div className="flex space-x-4 items-center">
          <button
            onClick={getRoomId}
            type="button"
            className="bg-blue-500 p-2 rounded-md"
          >
            Get room id
          </button>
          <div className="bg-red-100 w-52 rounded-md">
            <p className="text-center text-black p-2">Room id: {roomId}</p>
          </div>
        </div>
        <div className="flex space-x-4 items-center">
          <button
            onClick={async () => {
              const tokenData = await getAccessTokenData({
                roomId,
                role: Role.HOST,
              });
              joinRoom({
                roomId: roomId,
                token: tokenData,
              });
              console.log("Joined as Host");
            }}
            type="button"
            className="bg-blue-500 p-2 rounded-md"
          >
            Join as Host
          </button>
          <button
            onClick={async () => {
              const tokenData = await getAccessTokenData({
                roomId,
                role: Role.GUEST,
              });
              joinRoom({
                roomId: roomId,
                token: tokenData,
              });
            }}
            type="button"
            className="bg-blue-500 p-2 rounded-md"
          >
            Join as Guest
          </button>
        </div>
        <div className="flex space-x-4">
          <button
            type="button"
            className="bg-blue-500 p-2 rounded-lg"
            onClick={async () => {
              isAudioOn ? await disableAudio() : await enableAudio();
            }}
          >
            {isAudioOn ? "Disable" : "Enable"} Audio
          </button>
          <button
            type="button"
            className="bg-blue-500 p-2 rounded-md"
            onClick={() => {
              isVideoOn ? disableVideo() : enableVideo();
            }}
          >
            Video {isVideoOn ? "Off" : "On"}
          </button>
          <button
            type="button"
            className="bg-blue-500 p-2 rounded-md"
            onClick={() => {
              shareStream ? stopScreenShare() : startScreenShare();
            }}
          >
            Screen Share {shareStream ? "Off" : "On"}
          </button>
        </div>
        <button
          onClick={leaveRoom}
          type="button"
          className="bg-red-500 p-2 rounded-md"
        >
          Leave Room
        </button>
      </div>
      <div className="w-full flex gap-4 justify-between items-stretch">
        <div className="flex-1 justify-between items-center flex flex-col">
          <div className="relative flex place-items-center before:absolute before:size-80 before:-translate-x-1/2  before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3  after:content-[''] before:lg:h-[360px]">
            <div className="relative flex gap-2">
              {isVideoOn ? (
                <div className="w-1/2 mx-auto border-2 rounded-xl border-blue-400">
                  <video
                    ref={videoRef}
                    className="aspect-video rounded-xl"
                    autoPlay
                    muted
                  />
                </div>
              ) : (
                <div className="size-[300px] flex items-center justify-center mx-auto border-2 rounded-xl border-blue-400">
                  No videos turned on
                </div>
              )}
              {shareStream && (
                <div className="w-1/2 mx-auto border-2 rounded-xl border-blue-400">
                  <video
                    ref={screenRef}
                    className="aspect-video rounded-xl"
                    autoPlay
                    muted
                  />
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 mb-10 grid gap-2 text-center">
            {peerIds.map((peerId) =>
              peerId ? <ShowPeers key={peerId} peerId={peerId} /> : null
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
