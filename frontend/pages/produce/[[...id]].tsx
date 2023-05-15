import React, { useEffect, useState } from "react";
import NewTracks from "../../components/produce/newTracks";
import Sequencers from "../../components/sequencers";
import TrackAdder from "../../components/produce/trackAdder";
import CoverGens from "../../components/coverGens";
import { atom, useRecoilState, useRecoilValue } from "recoil";
import {
  CoverGenHeightState,
  blobAudioState,
  producingMusicState,
  selectedCoverPromptState,
  selectedCoverState,
  trackAtomFamily,
} from "../../store/atoms";
import NewChat from "../../components/produce/newChat";
import axios from "axios";
import serverApi from "../../services/serverApi";
import Riffusions from "../../components/riffusions";

function Produce() {
  const [isRiffusion, setIsRiffusion] = useState(false);
  const [producingOpacity, setProducingOpacity] = useState("opacity-100");
  const [trackIds, setTrackIds] = useState([] as object[][]);
  // const firstTrack = useRecoilValue(trackAtomFamily(0));

  //components\sequencers\chat.tsx에서 변경되는 클래스명 상태입니다.
  const CoverGenHeight = useRecoilValue(CoverGenHeightState);
  const [heightClassName, setHeightClassName] = useState("h-0 opacity-0");
  const [producingMusic, setProducingMusic] =
    useRecoilState(producingMusicState);
  const [canSubmit, setCanSubmit] = useState(false);
  const [buttonMessage, setButtonMessage] = useState("");

  useEffect(() => {
    if (!trackIds.length) return;
    if (!trackIds.at(-1).length) return setHeightClassName("h-0 opacity-0");
    setHeightClassName("h-72 opacity-100");
  }, [trackIds]);

  // if (!firstTrack.request_description) {
  //   return <Sequencers trackIds={trackIds} />;
  // }

  const audioBlob = useRecoilValue(blobAudioState);
  const selectedImgURL = useRecoilValue(selectedCoverState);
  const selectedImgPrompt = useRecoilValue(selectedCoverPromptState);

  useEffect(() => {
    if (!canSubmit) {
      if (!audioBlob) {
        setButtonMessage("음악을 녹음해주세요");
      } else if (!selectedImgURL) {
        setButtonMessage("앨범 커버를 선택해주세요");
      }
    }
    if (!canSubmit && audioBlob && selectedImgURL) {
      setCanSubmit(true);
      setButtonMessage("다음으로");
    } else if (canSubmit && (!audioBlob || !selectedImgURL)) {
      setCanSubmit(false);
    }
  });

  const getImageBlob = async () => {
    // blob 객체 가져오기
    const response = await axios.get(selectedImgURL, { responseType: "blob" });
    const blob = response.data;
    // 파일 객체 생성하기
    const file = new File([blob], "image.png");
    return file;
  };

  const handleSubmit = async () => {
    // console.log(audioBlob);
    // console.log(selectedImgURL);
    // return;
    const formData = new FormData();
    const imageFile = await getImageBlob();
    formData.append("file", imageFile);

    await serverApi
      .post("/produce/musics/cover", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        setProducingMusic((prev) => {
          return {
            ...prev,
            cover_source: res.data.source,
            cover_request: selectedImgPrompt,
            beat: 100,
            created_at: Date.now(),
          };
        });
      })
      .catch((err) => {
        if (selectedImgURL.startsWith("/")) {
          setProducingMusic((prev) => {
            return {
              ...prev,
              cover_source: selectedImgURL,
              cover_request: selectedImgPrompt,
            };
          });
        }
      });

    //다음 페이지로 이동시키기
    // setProducingOpacity("opacity-0");
    // setTimeout(() => setIsRiffusion(true), 300);
  };

  if (!trackIds.length) return <NewTracks setTrackIds={setTrackIds} />;
  if (isRiffusion) return <Riffusions />;

  //폴더구조 - 시퀀서스 -> 시퀀서 -> 악기선택/채팅/음악재생
  return (
    <div className={`${producingOpacity} transition-all duration-300`}>
      <div className="text-white">{JSON.stringify(producingMusic)}</div>
      <button
        type="button"
        onClick={handleSubmit}
        // disabled={!canSubmit}
        className={`${
          !canSubmit ? "opacity-25" : "opacity-95"
        } bg-slate-700 text-white`}
      >
        {buttonMessage}
      </button>
      <div className={`${CoverGenHeight}`}>
        <CoverGens />
      </div>
      <Sequencers trackIds={trackIds} setTrackIds={setTrackIds} />
      <div className={`${heightClassName}`}>
        <TrackAdder setTrackIds={setTrackIds} trackIds={trackIds} />
      </div>
    </div>
  );
}

export default Produce;

//음악 제작 페이지 비즈니스 로직

/*
 * 트랙 배열을 만들고 트랙 갯수에 따른 
 * 장르, 감정 태그, 길이 선택
 * 최초에 만들어지는 트랙의 악기는 '피아노', [Genre : Classical Music / Keywords : Rainy Day, Sad / Length : over 20 notations / Instrument: Piano] Please make a classical music good to listen when it rains
 * 트랙을 만든 결과에 따라 '유저가 보낸 프롬프트', 전체 프롬프트 저장
 * UI에는 유저가 보낸 프롬프트를 저장, 새로운 프롬프트를 생성할 떄에는 전체 프롬프트를 발송
 * (가령 피아노, 베이스, 기타 순으로 만든 경우 '피아노', '피아노, 베이스', '피아노, 베이스, 기타'를 만든 프롬프트가 저장되어있음.)
 * 



*/

export async function getServerSideProps(context) {
  const { id } = context.params;
  // id를 이용하여 데이터를 가져오거나 API 호출 등의 로직을 수행할 수 있습니다.
  // 예를 들어, `/music/${id}`에 대한 데이터를 가져오는 경우:

  // const res = await fetch(`https://api.example.com/music/${id}`);
  // const data = await res.json();

  // 가져온 데이터를 props로 전달합니다.
  return {
    props: {
      // id,
    },
  };
}
