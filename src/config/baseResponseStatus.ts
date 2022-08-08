import { BaseResponse } from './response';

/*eslint-disable*/
// prettier-ignore
export const baseResponse: {[k:string]:BaseResponse} = {

  // Success
  SUCCESS: { "isSuccess": true, "code": 1000, "message": "성공" },
  SIGNUP_EMAIL_OK :{ "isSuccess": true, "code": 1001, "message": '사용가능한 이메일입니다.' },
  SIGNUP_ID_OK :{ "isSuccess": true, "code": 1002, "message": '사용가능한 아이디입니다.' },
  SIGNUP_NICKNAME_OK :{ "isSuccess": true, "code": 1003, "message": '사용가능한 닉네임입니다.' },

  // Common
  TOKEN_EMPTY: { "isSuccess": false, "code": 2000, "message": "JWT 토큰을 입력해주세요." },
  TOKEN_VERIFICATION_FAILURE: { "isSuccess": false, "code": 3000, "message": "JWT 토큰 검증 실패" },
  TOKEN_VERIFICATION_SUCCESS: { "isSuccess": true, "code": 1001, "message": "JWT 토큰 검증 성공" }, // ?

  //Request error
  CHECK_PARAM_EMPTY: { "isSuccess": false, "code": 2001, "message": "검사 파라미터가 없습니다." },
  SEARCH_KEYWORD_EMPTY: { "isSuccess": false, "code": 2100, "message": "검색어가 없습니다." },
  
  // Response error
  REDUNDANT_EMAIL: { "isSuccess": false, "code": 3001, "message": "중복된 이메일입니다." },
  REDUNDANT_ID: { "isSuccess": false, "code": 3002, "message": "중복된 아이디입니다." },
  REDUNDANT_NICKNAME: { "isSuccess": false, "code": 3003, "message": "중복된 닉네임입니다." },
  NOT_EXIST_UNIV: { "isSuccess": false, "code": 3004, "message": "존재하지 않는 학교입니다." },
  NOT_EXIST_USER: { "isSuccess": false, "code": 3005, "message": "존재하지 않는 회원입니다." },
  WITHDRAWAL_USER: { "isSuccess": false, "code": 3006, "message": "탈퇴된 회원입니다." },
  DEACTIVATED_USER: { "isSuccess": false, "code": 3007, "message": "비활성된 회원입니다." },

  SIGNIN_PASSWORD_WRONG: { "isSuccess": false, "code": 3008, "message": "비밀번호가 잘못 되었습니다." },

  NOT_EXIST_MEMBER: { "isSuccess": false, "code": 3009, "message": "존재하지 않는 멤버입니다." },

  NOT_EXIST_TEAM: { "isSuccess": false, "code": 3010, "message": "존재하지 않는 팀입니다." },

  NOT_EXIST_LECTURE: { "isSuccess": false, "code": 3011, "message": "존재하지 않는 수업입니다." },
  NOT_EXIST_LECTURE_POST: { "isSuccess": false, "code": 3012, "message": "존재하지 않는 수업게시글 입니다." },
  NOT_EXIST_LECTURE_POST_COMMENT: { "isSuccess": false, "code": 3013, "message": "존재하지 않는 댓글입니다." },
  WRONG_TYPE_LECTURE_POST:{ "isSuccess": false, "code": 3014, "message": "잘못된 유형의 게시글입니다." },
  
  NOT_EXIST_STUDY: { "isSuccess": false, "code": 3015, "message": "존재하지 않는 스터디입니다." },
  NOT_EXIST_STUDY_COMMENT: { "isSuccess": false, "code": 3016, "message": "존재하지 않는 댓글입니다." },

  NOT_TEAM_MEMBER: { "isSuccess": false, "code": 3017, "message": "해당 팀의 멤버가 아닙니다." },
  
  CODE_VERIFICATION_FAILURE: { "isSuccess": false, "code": 3400, "message": "이메일 인증번호 검증 실패" },
  ACCESS_DENIED: { "isSuccess": false, "code": 3401, "message": "접근할 수 없는 권한입니다." },
  // SIGNIN_INACTIVE_ACCOUNT: { "isSuccess": false, "code": 3007, "message": "비활성화 된 계정입니다. 고객센터에 문의해주세요." },
  // SIGNIN_WITHDRAWAL_ACCOUNT: { "isSuccess": false, "code": 3008, "message": "탈퇴 된 계정입니다. 고객센터에 문의해주세요." },




  //Connection, Transaction 등의 서버 오류
  DB_ERROR: { "isSuccess": false, "code": 4000, "message": "데이터 베이스 에러" },
  SERVER_ERROR: { "isSuccess": false, "code": 4001, "message": "서버 에러" },
}
