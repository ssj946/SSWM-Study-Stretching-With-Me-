import React, { useState, useEffect } from "react";
import axios from "axios";

import styled from "styled-components";
import Gnb from "../components/Gnb";
import { Link } from "react-router-dom";

import StudyRoomMembers from "../components/StudyRoom/StudyRoomMembers";
import StudyRoomMemberScore from "../components/StudyRoom/StudyRoomMemberScore";
import StudyRoomMemberTime from "../components/StudyRoom/StudyRoomMemberTime";
import StudyRoomMemberBoard from "../components/StudyRoom/StudyRoomMemberBoard";

import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import SettingsIcon from "@mui/icons-material/Settings";
import CustomModal from "../components/StudyRoom/deleteModal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Snackbar } from "@mui/material";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

const StudyRoomMember = () => {
  const navigate = useNavigate();

  const { studyroomId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studyroom, setStudyroom] = useState([]);
  const [studyAvgTime, setStudyAvgTime] = useState("");
  const [maxRestTime, setMaxRestTime] = useState("");
  const [isHost, setIsHost] = useState(false);

  const accessToken = JSON.parse(localStorage.getItem("accessToken"));

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Snackbar
  const [isSnackBarOpen, setIsSnackBarOpen] = useState(false);

  const closeSnackBar = () => setIsSnackBarOpen(false);

  const closeModalEvent = () => {
    setIsModalOpen(false);
    axios
      .put(
        `${process.env.REACT_APP_BASE_URL}/api/studyrooms/${studyroomId}/leave`,
        {},
        {
          headers: {
            Authorization: accessToken,
          },
        }
      )
      .then((response) => {
        console.log(response);
        navigate("/StudyRoom");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleenterAdmin = () => {
    window.location.href = `/StudyroomAdmin/${studyroomId}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 가입된 회원인지 확인
        const message = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/studyrooms/${studyroomId}/is-member`, {
          headers: {
            Authorization: accessToken,
          },
        });
        
        if (message.data === false) {
          alert("잘못된 접근입니다.");
          window.location.href = `/`;
        }
        else {
          // dailylog 생성
          await axios.post(`${process.env.REACT_APP_BASE_URL}/api/user-logs/${studyroomId}`, {}, {
            headers: {
              Authorization: accessToken,
            },
          });
          // 스터디룸 조회
          const studyroomResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/studyrooms/${studyroomId}`, {
            headers: {
              Authorization: accessToken,
            },
          });
          console.log("studyroomResponse", studyroomResponse);
          setStudyroom(studyroomResponse.data);
          setStudyAvgTime(formatTime(studyroomResponse.data.studyAvgTime));
          setMaxRestTime(formatTime(studyroomResponse.data.maxRestTime));
  
          axios.get(`${process.env.REACT_APP_BASE_URL}/api/studyrooms/${studyroomId}/isHost`, {
            headers: {
              Authorization: accessToken,
            },
          })
          .then((response) => {
            setIsHost(response.data);
          })
        }
      } catch (error) {
        console.log(error);
        navigate("/NOTFOUND");
      }
    };    
    fetchData();
    // eslint-disable-next-line
  }, [studyroomId, accessToken]);

  return (
    <div>
      <Gnb />
      <ContainerWrap>
        <HeaderWrap>
          <HeaderTitle>
            <Background>{studyroom.name}</Background>
            {isHost && (
              <HeaderBtnWrap>
                <IconButton onClick={handleenterAdmin} aria-label="setting" size="large">
                  <SettingsIcon fontSize="inherit" />
                </IconButton>
              </HeaderBtnWrap>
            )}
          </HeaderTitle>
        </HeaderWrap>
        <ContentWrap>
          {/* 스터디원 */}
          <StudyMemberWrap>
            <StudyRoomMembers studyroomId={studyroomId} />
          </StudyMemberWrap>
        </ContentWrap>
        <ContentWrap>
          <div style={{ flexDirection: "column" }}>
            {/* 공지사항 */}
            <StudyRoomBoardWrap>
              <StudyRoomMemberBoard notice={studyroom.notice} />
            </StudyRoomBoardWrap>

            <StudyScoreWrap>
              {/*일일 공부왕, 7월 출석왕*/}
              <StudyRoomMemberScore studyroomId={studyroomId} />
            </StudyScoreWrap>
          </div>
        </ContentWrap>
        <ContentWrap>
          {/* 공부,휴식 시간 */}
          <SideBanner>
            <Link to={`/LiveRoom/${studyroomId}`} style={{ textDecoration: "none" }}>
              <Button
                variant="contained"
                sx={{
                  m: 1,
                  backgroundColor: "#87C159",
                  ":hover": { backgroundColor: "#FA990E" },
                }}
              >
                라이브 입장
              </Button>
            </Link>
            <StudyRoomTimeWrap>
              <StudyRoomMemberTime studyAvgTime={studyAvgTime} maxAvgTime={maxRestTime} />
            </StudyRoomTimeWrap>
          </SideBanner>

          {/* 스터디룸 탈퇴하기 */}
          {!isHost && (
            <Button
              style={{ width: "150px", marginTop: "50vh", marginLeft: "5%", marginBottom: "5%" }}
              variant="contained"
              color="success"
              onClick={openModal}
            >
              스터디룸 탈퇴하기
            </Button>
          )}
          <CustomModal isOpen={isModalOpen} closeModal={closeModal}>
            <Box>
              <Typography variant="h6" component="h2">
                탈퇴 시 더 이상 해당 스터디룸을 이용하지 못합니다.
                <br />
                정말 삭제하시겠습니까?
              </Typography>
              <Button onClick={() => closeModalEvent()}>확인</Button>
              <Button onClick={() => setIsModalOpen(false)}>취소</Button>
            </Box>
          </CustomModal>

          <Snackbar
            open={isSnackBarOpen}
            autoHideDuration={3000}
            onClose={closeSnackBar}
            message="정상적으로 탈퇴되었습니다."
          />
        </ContentWrap>
      </ContainerWrap>
    </div>
  );
};
const Background = styled.span`
  padding: 7px;
  border-radius: 10px;
  font-weight: bold;
`;
const ContainerWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 150vh;
`;
const HeaderWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 10vh;
  margin-top: 5vw;
`;
const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  border-radius: 15px;
  font-size: 30px;
`;
const HeaderBtnWrap = styled.span`
  display: flex;
`;

const ContentWrap = styled.div`
  display: flex;
  width: 80%;
  height: 60vh;
  margin-top: 2vw;
  flex-direction: column;
`;

const StudyMemberWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 90%;
  margin-left: 5%;
  height: 20vh;
  gap: 1vw;
`;
const StudyScoreWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 40vh;
`;

const StudyRoomTimeWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;
const StudyRoomBoardWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 90%;
  height: 40vh;
  margin-left: 5%;
`;
const SideBanner = styled.div`
  position: fixed;
  right: 0;
  top: 40%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border: 1px solid #5b8d27;
  border-radius: 15px;
  padding: 0.5rem;
  margin: 0 5rem 0 0;
  background: white;
`;
export default StudyRoomMember;
