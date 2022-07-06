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
  SIGNUP_EMAIL_EMPTY: { "isSuccess": false, "code": 2001, "message": "이메일을 입력해주세요." },
  SIGNUP_EMAIL_LENGTH: { "isSuccess": false, "code": 2002, "message": "이메일은 100자리 미만으로 입력해주세요." },
  SIGNUP_EMAIL_ERROR_TYPE: { "isSuccess": false, "code": 2003, "message": "이메일 형식을 정확하게 입력해주세요." },
  SIGNUP_PASSWORD_EMPTY: { "isSuccess": false, "code": 2004, "message": "비밀번호를 입력해주세요." },
  SIGNUP_PASSWORD_LENGTH: { "isSuccess": false, "code": 2005, "message": "비밀번호는 8자리 이상 20자리 이하로 입력해주세요." },
  SIGNUP_PASSWORD_ERROR_TYPE: { "isSuccess": false, "code": 2006, "message": "비밀번호 형식을 정확하게 입력해주세요." },
  SIGNUP_NICKNAME_EMPTY: { "isSuccess": false, "code": 2007, "message": "닉네임을 입력 해주세요." },
  SIGNUP_NICKNAME_LENGTH: { "isSuccess": false, "code": 2008, "message": "닉네임은 2-10자리를 입력해주세요." },
  SIGNUP_PHONE_EMPTY: { "isSuccess": false, "code": 2009, "message": "전화번호를 입력 해주세요." },
  SIGNUP_PHONE_ERROR_TYPE: { "isSuccess": false, "code": 2010, "message": "전화번호 형식을 정확하게 입력해주세요." },
  SIGNUP_BIRTH_EMPTY: { "isSuccess": false, "code": 2011, "message": "생일을 입력 해주세요." },
  SIGNUP_DATE_ERROR_TYPE: { "isSuccess": false, "code": 2012, "message": "날짜 형식을 정확하게 입력해주세요." },

  SIGNIN_EMAIL_EMPTY: { "isSuccess": false, "code": 2013, "message": "이메일을 입력해주세요" },
  SIGNIN_EMAIL_LENGTH: { "isSuccess": false, "code": 2014, "message": "이메일은 30자리 미만으로 입력해주세요." },
  SIGNIN_EMAIL_ERROR_TYPE: { "isSuccess": false, "code": 2015, "message": "이메일을 형식을 정확하게 입력해주세요." },
  SIGNIN_PASSWORD_EMPTY: { "isSuccess": false, "code": 2016, "message": "비밀번호를 입력 해주세요." },

  USER_USERIDX_EMPTY: { "isSuccess": false, "code": 2017, "message": "유저 인덱스를 입력해주세요." },
  USER_SHOPIDX_EMPTY: { "isSuccess": false, "code": 2018, "message": "가게 인덱스를 입력해주세요." },
  USER_LIKEIDX_EMPTY: { "isSuccess": false, "code": 2019, "message": "찜 인덱스를 입력해주세요." },
  USER_ORDERIDX_EMPTY: { "isSuccess": false, "code": 2020, "message": "주문 인덱스를 입력해주세요." },

  USER_USEREMAIL_EMPTY: { "isSuccess": false, "code": 2021, "message": "이메일을 입력해주세요." },
  USER_USERIDX_NOT_MATCH: { "isSuccess": false, "code": 2022, "message": "유저 인덱스를 확인해주세요" },
  USER_NICKNAME_EMPTY: { "isSuccess": false, "code": 2023, "message": "변경할 닉네임 값을 입력해주세요" },
  USER_STATUS_EMPTY: { "isSuccess": false, "code": 2024, "message": "회원 상태값을 입력해주세요" },
  USER_CURRENTPASSWORD_EMPTY: { "isSuccess": false, "code": 2025, "message": "현재 비밀번호를 입력해주세요" },
  USER_NEWPASSWORD_EMPTY: { "isSuccess": false, "code": 2026, "message": "새로운 비밀번호를 입력해주세요" },
  USER_PHONE_EMPTY: { "isSuccess": false, "code": 2027, "message": "전화번호를 입력해주세요" },
  USER_PROFILEIMAGEURL_EMPTY: { "isSuccess": false, "code": 2028, "message": "프로필사진URL을 입력해주세요" },
  USER_EMAILAGREE_EMPTY: { "isSuccess": false, "code": 2029, "message": "이메일 수신동의 여부를 입력해주세요" },
  USER_SMSAGREE_EMPTY: { "isSuccess": false, "code": 2030, "message": "문자 수신동의 여부를 입력해주세요" },

  USER_PASSWORD_LENGTH: { "isSuccess": false, "code": 2031, "message": "비밀번호는 8자리 이상 20자리 이하로 입력해주세요." },
  USER_NICKNAME_LENGTH: { "isSuccess": false, "code": 2032, "message": "닉네임은 2-10자리를 입력해주세요." },

  USER_PASSWORD_ERROR_TYPE: { "isSuccess": false, "code": 2033, "message": "비밀번호 형식을 정확하게 입력해주세요." },
  USER_PHONE_ERROR_TYPE: { "isSuccess": false, "code": 2034, "message": "전화번호 형식을 정확하게 입력해주세요." },
  USER_PROFILEIMAGEURL_ERROR_TYPE: { "isSuccess": false, "code": 2035, "message": "프로필사진URL 형식을 정확하게 입력해주세요." },
  USER_EMAILAGREE_ERROR_TYPE: { "isSuccess": false, "code": 2036, "message": "이메일 수신동의 여부 형식을 정확하게 입력해주세요." },
  USER_SMSAGREE_ERROR_TYPE: { "isSuccess": false, "code": 2037, "message": "문자 수신동의 여부 형식을 정확하게 입력해주세요." },


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

  CODE_VERIFICATION_FAILURE: { "isSuccess": false, "code": 3400, "message": "이메일 인증번호 검증 실패" },
  ACCESS_DENIED: { "isSuccess": false, "code": 3401, "message": "접근할 수 없는 권한입니다." },
  // SIGNIN_INACTIVE_ACCOUNT: { "isSuccess": false, "code": 3007, "message": "비활성화 된 계정입니다. 고객센터에 문의해주세요." },
  // SIGNIN_WITHDRAWAL_ACCOUNT: { "isSuccess": false, "code": 3008, "message": "탈퇴 된 계정입니다. 고객센터에 문의해주세요." },




  //Connection, Transaction 등의 서버 오류
  DB_ERROR: { "isSuccess": false, "code": 4000, "message": "데이터 베이스 에러" },
  SERVER_ERROR: { "isSuccess": false, "code": 4001, "message": "서버 에러" },
}
