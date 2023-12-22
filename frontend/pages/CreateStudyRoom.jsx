import React, { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import Gnb from "../components/Gnb";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import Paper from "@mui/material/Paper";
import { styled as muistyled } from "@mui/material/styles";
import HomeIcon from "@mui/icons-material/Home";
import LockIcon from "@mui/icons-material/Lock";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import GroupsIcon from "@mui/icons-material/Groups";
import ForestIcon from "@mui/icons-material/Forest";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

import def from "../assets/dolphin.jpg";
import { Avatar, Grid, RadioGroup, Switch, Typography } from "@mui/material";
import MultipleSelectChip from "../components/StudyRoom/Tags";

import axios from "axios";

const Item = muistyled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

// const로 정의하면 재정의가 불가능해서 let으로 저장
let formData;
const CreateStudyRoom = () => {
  useEffect(() => {
    formData = new FormData();
  }, []);

  const [isExist, setIsExist] = useState(true);

  const [checkedStudyroomName, setCheckedStudyroomName] = useState("");

  const accessToken = JSON.parse(localStorage.getItem("accessToken"));

  const [studyroomDto, setStudyroomDto] = useState({
    name: "",
    isPublic: true,
    enterCode: "",
    maxUserNum: 1,
    userNum: 1,
    maxRestTime: 90 * 60,
    tags: [],
  });

  // const dispatch = useDispatch();
  // const studyroom = useSelector((state) => state.studyroom);

  const [imageSrc, setImage] = useState(def);

  const imageUp = useRef();

  const onClickImage = () => {
    imageUp.current.click();
  };

  // 이미지 파일 변경
  const handleFileChange = (fileUp) => {
    const file = fileUp.target.files[0];

    if (file) {
      // 일단 formData를 초기화함으로써 파일이 여러개 추가되지않는다.
      formData = new FormData();
      formData.append("file", file);
      formData.append("fileType", file.type);

      setImage(URL.createObjectURL(file));

      // formData를 보고싶으면 keys와 values 값을 봐야한다.
      for (const key of formData.keys()) {
        console.log(key);
      }
      for (const value of formData.values()) {
        console.log(value);
      }
    }
  };

  // name 입력란이 변경될 때마다 studyroomDto의 name 속성 업데이트
  const handleNameChange = (event) => {
    setStudyroomDto({
      ...studyroomDto,
      name: event.target.value, // 사용자가 입력한 값으로 업데이트
    });
  };

  // 스터디룸 이름 중복 확인 함수
  const checkStudyroomName = (event) => {
    // 여기에 스터디룸 이름 중복 확인 요청을 보내는 코드 작성
    console.log("스터디룸 이름 : " + studyroomDto.name);

    setCheckedStudyroomName(studyroomDto.name);

    axios
      .get(`${process.env.REACT_APP_BASE_URL}/api/studyrooms/exists`, {
        headers: {
          Authorization: accessToken,
        },
        params: {
          name: studyroomDto.name,
        },
      })
      .then((response) => {
        setIsExist(response.data);
        console.log(response.data);
        // isExist 값에 따라 중복 확인 로직을 수행
        if (response.data) {
          alert("중복된 스터디룸 이름입니다.");
        } else {
          alert("사용 가능한 스터디룸 이름입니다.");
        }
        console.log("중복 확인" + response.data);
      })
      .catch((error) => {
        // 오류 처리
        console.log(error);
        setIsExist(true);
        alert("스터디룸 제목은 빈칸이 될 수 없습니다.");
      });
  };

  // 공개 설정
  const handleIsPublicChange = (event) => {
    if (event.target.checked) {
      setStudyroomDto({
        ...studyroomDto,
        enterCode: "", // 암호를 NULL값으로 초기화
        isPublic: event.target.checked,
      });
    } else {
      setStudyroomDto({
        ...studyroomDto,
        isPublic: event.target.checked,
      });
    }
  };

  // enterCode 입력란이 변경될 때마다 studyroomDto의 enterCode 속성 업데이트
  const handleEnterCodeChange = (event) => {
    setStudyroomDto({
      ...studyroomDto,
      enterCode: event.target.value, // 사용자가 입력한 값으로 업데이트
    });
  };

  // maxUserNum 값 변경
  const handleMaxUserNumChange = (value) => {
    if (value >= 1 && value <= 9) {
      setStudyroomDto({
        ...studyroomDto,
        maxUserNum: value, // 인원 수 값으로 업데이트
      });
    }
  };

  // maxRestTime 값 변경
  const handleMaxRestTimeChange = (value) => {
    if (value >= 90 && value <= 240) {
      setStudyroomDto({
        ...studyroomDto,
        maxRestTime: value * 60, // 휴식 시간 값으로 업데이트
      });
    }
  };

  // tag값 변경
  const handleTagsChange = (selectedTags) => {
    setStudyroomDto({
      ...studyroomDto,
      tags: selectedTags,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // 스터디룸 제목 중복확인
    if (isExist || studyroomDto.name !== checkedStudyroomName) {
      alert("스터디룸 제목의 중복 확인이 필요합니다.");
      return;
    }

    // 코드 유효성 검사
    const codeValidationError = codeValidation();

    if (codeValidationError) {
      alert(codeValidationError); // 오류 메시지를 사용자에게 알려줌
      return;
    }

    console.log(accessToken);

    console.log("태그 : " + studyroomDto.tags);
    formData.append(
      "studyroomDto",
      new Blob([JSON.stringify(studyroomDto)], { type: "application/json" })
    );

    for (const key of formData.keys()) {
      console.log(key);
    }
    for (const value of formData.values()) {
      console.log(value);
    }

    // Axios 또는 Fetch API를 사용하여 formData를 서버로 전송
    // 예시로 Axios 사용
    axios
      .post(`${process.env.REACT_APP_BASE_URL}/api/studyrooms`, formData, {
        headers: {
          Authorization: accessToken,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        console.log(response.data);
        window.location.replace("/StudyRoom");
      })
      .catch((error) => {
        // 오류 처리
        alert("스터디방 개설이 되지 않았습니다.");
        console.log(Error);
      });
  };

  const CHARACTER_LIMIT = 8;

  const codeValidation = () => {
    let check = /[~!@#$%^&*()_+|<>?:{}.,/;='"ㄱ-ㅎ | ㅏ-ㅣ |가-힣]/;
    const comment = "알파벳,숫자 포함하여 8자리로 설정해주세요";

    if (check.size !== 8 && check.test(studyroomDto.enterCode)) {
      return comment;
    }
    return null;
  };

  return (
    <div>
      <Gnb />
      <ContainerWrap>
        <CreateWrap>
          <CreateContent>
            <Grid container justifyContent="center" alignItems="center">
              <ImageWrap>
                <input
                  type="file"
                  ref={imageUp}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                {imageSrc && (
                  <Avatar
                    onClick={onClickImage}
                    alt="Default Img"
                    src={imageSrc}
                    sx={{ width: 200, height: 200 }}
                  ></Avatar>
                )}
              </ImageWrap>
              <ContentWrap>
                <StudyRoomWrap>
                  <SubTitle>
                    <HomeIcon fontSize="large" />
                    스터디룸 이름
                  </SubTitle>
                  <SubContent>
                    <TextField
                      hiddenLabel
                      id="filled-hidden-label-normal"
                      defaultValue=""
                      variant="filled"
                      size="small"
                      placeholder={studyroomDto.name} // 상태값으로 설정
                      onChange={handleNameChange} // 값이 변경될 때 호출되는 핸들러 함수
                      inputProps={{ maxLength: 13 }}
                    />
                    <Button
                      sx={{ marginLeft: "10px", whiteSpace: "nowrap", minWidth: "auto" }}
                      variant="contained"
                      color="success"
                      onClick={checkStudyroomName}
                    >
                      중복확인
                    </Button>
                  </SubContent>
                </StudyRoomWrap>
                <StudyRoomWrap>
                  <SubTitle>
                    <LockIcon fontSize="large" />
                    공개 여부
                  </SubTitle>
                  <SubContent>
                    <RadioGroup row defaultValue="공개">
                      <Switch checked={studyroomDto.isPublic} onChange={handleIsPublicChange} />
                    </RadioGroup>
                  </SubContent>
                </StudyRoomWrap>
                <StudyRoomWrap>
                  <SubTitle>
                    <QrCode2Icon error={codeValidation()} fontSize="large" />
                    입장코드
                  </SubTitle>
                  <SubContent>
                    <TextField
                      disabled={studyroomDto.isPublic}
                      hiddenLabel
                      id="filled-hidden-label-normal"
                      variant="filled"
                      value={studyroomDto.enterCode}
                      size="small"
                      helperText={
                        codeValidation() ? "알파벳,숫자 포함하여 8자리로 설정해주세요" : ""
                      }
                      inputProps={{
                        maxLength: CHARACTER_LIMIT,
                      }}
                      onChange={handleEnterCodeChange} // 값이 변경될 때 호출되는 핸들러 함수
                    />
                    <Typography sx={{ marginLeft: "10px" }}>
                      {studyroomDto.enterCode !== "" ? studyroomDto.enterCode.length : 0}/
                      {CHARACTER_LIMIT}
                    </Typography>
                  </SubContent>
                </StudyRoomWrap>
                <StudyRoomWrap>
                  <SubTitle>
                    <GroupsIcon fontSize="large" />
                    최대 인원
                  </SubTitle>
                  <SubContent>
                    <IconButton
                      aria-label="minus"
                      onClick={() => handleMaxUserNumChange(studyroomDto.maxUserNum - 1)}
                    >
                      <RemoveCircleOutlineIcon />
                    </IconButton>
                    <Item>{studyroomDto.maxUserNum}</Item>
                    <IconButton
                      aria-label="plus"
                      onClick={() => handleMaxUserNumChange(studyroomDto.maxUserNum + 1)}
                    >
                      <AddCircleOutlineIcon />
                    </IconButton>
                  </SubContent>
                </StudyRoomWrap>
                <StudyRoomWrap>
                  <SubTitle>
                    <ForestIcon fontSize="large" />
                    일일 최대 휴식 시간
                  </SubTitle>
                  <SubContent>
                    <IconButton
                      aria-label="minus"
                      onClick={() => handleMaxRestTimeChange(studyroomDto.maxRestTime / 60 - 10)}
                    >
                      <RemoveCircleOutlineIcon />
                    </IconButton>
                    <Item>{studyroomDto.maxRestTime / 60}</Item>
                    <IconButton
                      aria-label="plus"
                      onClick={() => handleMaxRestTimeChange(studyroomDto.maxRestTime / 60 + 10)}
                    >
                      <AddCircleOutlineIcon />
                    </IconButton>
                  </SubContent>
                </StudyRoomWrap>
                <StudyRoomWrap>
                  <SubTitle>
                    <LocalOfferIcon fontSize="large" />
                    태그
                  </SubTitle>
                  <SubContent>
                    <MultipleSelectChip
                      selectedTags={studyroomDto.tags}
                      setSelectedTags={handleTagsChange}
                    />
                  </SubContent>
                </StudyRoomWrap>
                <CreateBtn style={{ marginTop: "10px" }}>
                  <Button variant="contained" color="success" onClick={handleSubmit}>
                    스터디 룸 생성하기
                  </Button>
                </CreateBtn>
              </ContentWrap>
            </Grid>
          </CreateContent>
        </CreateWrap>
      </ContainerWrap>
    </div>
  );
};

const ContainerWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-left: 10vw;
  width: 70%;
  height: 65vh;
`;
const CreateWrap = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
`;
const CreateContent = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  border: 1px solid black;
  border-radius: 10px;
  height: 450px;
`;
const ImageWrap = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px;
  margin-right: 30px;
`;
const ContentWrap = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
`;

const StudyRoomWrap = styled.div`
  display: flex;
  width: 100%;
  height: 33.3%;
  margin-bottom: 10px;
`;

const SubTitle = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 45px;
  font-size: 20px;
  gap: 1vw;
`;
const SubContent = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
`;
const CreateBtn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 20%;
`;
export default CreateStudyRoom;