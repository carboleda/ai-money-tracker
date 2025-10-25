"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Webcam from "react-webcam";
import { BankAccounDropdown } from "@/components/BankAccounsDropdown";
import { Switch } from "@heroui/switch";
import { HiLightBulb, HiOutlineLightBulb } from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import { LocaleNamespace } from "@/i18n/namespace";

const CAMARE_WIDTH = 400;
const CAMERA_HEIGHT = 300;
const videoConstraints: MediaStreamConstraints["video"] = {
  width: CAMARE_WIDTH,
  height: CAMERA_HEIGHT,
  facingMode: "environment",
};

export interface CameraModeProps {
  setPicture: (picture?: string) => void;
  setSelectedAccount: (account: string) => void;
}

export const CameraMode: React.FC<CameraModeProps> = ({
  setSelectedAccount,
  setPicture,
}) => {
  const { t } = useTranslation(LocaleNamespace.Transactions);
  const webcamRef = useRef<Webcam>(null);
  const trackRef = useRef<MediaStreamTrack>(null);
  const [imgSrc, setImgSrc] = useState<string>();
  const [isFlashEnabled, setIsFlashEnabled] = useState<boolean>(false);

  const onCapture = () => {
    const imageSrc = webcamRef.current?.getScreenshot() ?? undefined;
    setImgSrc(imageSrc);
    setPicture(imageSrc);
  };

  const onRetake = () => {
    setImgSrc(undefined);
  };

  const onFlashChange = (isFlashEnabled: boolean) => {
    setIsFlashEnabled(isFlashEnabled);

    // let there be light!
    trackRef.current?.applyConstraints({
      advanced: [{ torch: isFlashEnabled }],
    });
  };

  return (
    <>
      <div className="flex gap-2 self-start w-full">
        <BankAccounDropdown
          label={t("sourceAccount")}
          className="w-full"
          isRequired
          skipDisabled
          showLabel
          onChange={setSelectedAccount}
        />
        <Switch
          size="md"
          color="warning"
          isSelected={isFlashEnabled}
          onValueChange={onFlashChange}
          thumbIcon={({ isSelected, className }) =>
            isSelected ? (
              <HiOutlineLightBulb className={className} />
            ) : (
              <HiLightBulb className={className} />
            )
          }
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
            onUserMedia={(stream: MediaStream) => {
              const track = stream.getVideoTracks()[0];

              //Create image capture object and get camera capabilities
              const imageCapture = new ImageCapture(track);
              imageCapture
                .getPhotoCapabilities()
                .then((photoCapabilities: PhotoCapabilities) => {
                  //todo: check if camera has a torch
                  console.log("photoCapabilities", { photoCapabilities });
                  const fillLightModeCount =
                    photoCapabilities?.fillLightMode?.length ?? 0;
                  if (fillLightModeCount > 0) {
                    trackRef.current = track;
                  }
                });
            }}
          />
        </div>
      )}
    </>
  );
};
