"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Webcam from "react-webcam";
import { BankAccounDropdown } from "@/components/BankAccounsDropdown";

const CAMARE_WIDTH = 400;
const CAMERA_HEIGHT = 300;
const videoConstraints: MediaStreamConstraints["video"] = {
  width: CAMARE_WIDTH,
  height: CAMERA_HEIGHT,
  facingMode: "environment",
};

export interface CameraModeProps {
  accounts?: { [key: string]: string };
  setPicture: (picture?: string) => void;
  setSelectedAccount: (account: string) => void;
}

export const CameraMode: React.FC<CameraModeProps> = ({
  accounts,
  setSelectedAccount,
  setPicture,
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string>();

  const onCapture = () => {
    const imageSrc = webcamRef.current?.getScreenshot() ?? undefined;
    setImgSrc(imageSrc);
    setPicture(imageSrc);
  };

  const onRetake = () => {
    setImgSrc(undefined);
  };

  return (
    <>
      <div className="self-start w-full">
        <BankAccounDropdown
          label="Bank account"
          isRequired
          accounts={accounts}
          onChange={setSelectedAccount}
        />
      </div>
      {imgSrc ? (
        <Image
          src={imgSrc}
          alt="webcam"
          className="mb-4 rounded-lg"
          width={CAMARE_WIDTH}
          height={CAMERA_HEIGHT}
          onClick={onRetake}
        />
      ) : (
        <div style={{ minHeight: CAMERA_HEIGHT }} className="w-full">
          <Webcam
            ref={webcamRef}
            className="mb-4 rounded-lg"
            screenshotFormat="image/jpeg"
            width={CAMARE_WIDTH}
            height={CAMERA_HEIGHT}
            audio={false}
            forceScreenshotSourceSize={true}
            videoConstraints={videoConstraints}
            onClick={onCapture}
          />
        </div>
      )}
    </>
  );
};
