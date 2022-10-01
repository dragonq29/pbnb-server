const functions = require("firebase-functions");
const axios = require("axios");

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.menu = functions
  .region("asia-northeast1") // asia-northeast1:Tokyo(=Tire1 / cheaper than Seoul=Tire2)
  .https.onRequest((request, response) => {
    response.set("Access-Control-Allow-Origin", "https://dragonq29.github.io");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    axios
      .post(
        "https://sfv.hyundaigreenfood.com/smartfood/todaymenuGf/todayMenu_nList_pro.do",
        request.body
      )
      .then((res) => response.send({ ...res.data }))
      .catch((err) => response.send({ ...err.message }));
  });

exports.health = functions
  .region("asia-northeast1") // asia-northeast1:Tokyo(=Tire1 / cheaper than Seoul=Tire2)
  .https.onRequest((_, response) => {
    response.send({ status: "fully functional" });
  });

// menu API 2.0.0
// 1. meald_fg_cd(조식,중식,석식) 별로 나눔
// 2. coner_fg_cd(서브식) 별로 나누고, coner_fg_nm(한식, 간편식A, B)를 이름으로 씀
// 3. main_dish_yn(메인메뉴Y)를 그 서브식의 이름으로 씀// 단, Y가 없을 경우 seq가 가장 빠른 것 하나를 찝어서 씀
// 4. 그림은 3번에서 정한 아이템의 file_path와 save_file_nm을 갖다 씀 // 없을 경우 없다고 표시할것
exports.menu_v_2_0_0 = functions
  .region("asia-northeast1") // asia-northeast1:Tokyo(=Tire1 / cheaper than Seoul=Tire2)
  .https.onRequest((requestFromClient, responseToClient) => {
    responseToClient.set(
      "Access-Control-Allow-Origin",
      "https://dragonq29.github.io"
    );
    responseToClient.set("Access-Control-Allow-Headers", "Content-Type");
    axios
      .post(
        "https://sfv.hyundaigreenfood.com/smartfood/todaymenuGf/todayMenu_nList_pro.do",
        requestFromClient.body
      )
      .then((res) => {
        const receivedData = {
          ...res.data,
        };
        if (receivedData.todayList === undefined) {
          responseToClient.send({
            msg: "데이터 불러오기 실패",
            error: true,
          });
          return;
        }

        const data = meald_fg_cd_arrange(receivedData.todayList);
        const breakfirstData = coner_fg_cd_arrange(data.get("0001"));
        const lunchData = coner_fg_cd_arrange(data.get("0002"));
        const dinnerData = coner_fg_cd_arrange(data.get("0003"));

        const breakfirstList = createMealList(breakfirstData);
        const lunchList = createMealList(lunchData);
        const dinnerList = createMealList(dinnerData);

        // responseToClient.send(result);
        responseToClient.send({
          breakfirstList,
          lunchList,
          dinnerList,
        });
      })
      .catch((err) => responseToClient.send({ ...err.message }));
  });

// 1. meald_fg_cd(조식,중식,석식) 별로 나눔
const meald_fg_cd_arrange = (data) => {
  if (data == undefined) {
    return undefined;
  }
  return data.reduce((initVal, curVal) => {
    if (!initVal.has(curVal.meald_fg_cd)) {
      initVal.set(curVal.meald_fg_cd, []);
    }
    initVal.get(curVal.meald_fg_cd).push(curVal);
    return initVal;
  }, new Map());
};

// 2. coner_fg_cd(서브식) 별로 나누고,coner_fg_nm(한식, 간편식A, B)를 이름으로 씀
const coner_fg_cd_arrange = (data) => {
  if (data == undefined) {
    return undefined;
  }
  return data.reduce((initVal, curVal) => {
    if (!initVal.has(curVal.coner_fg_cd)) {
      initVal.set(curVal.coner_fg_cd, []);
    }
    initVal.get(curVal.coner_fg_cd).push(curVal);
    return initVal;
  }, new Map());
};

// 3. main_dish_yn(메인메뉴Y)를 그 서브식의 이름으로 씀// 단, Y가 없을 경우 seq가 가장 빠른 것 하나를 찝어서 씀
const createMealList = (data) => {
  if (data == undefined) {
    return undefined;
  }
  let resultArray = [];

  for (let [key, value] of data) {
    const mainMenu = getMainMenu(value);
    const mealName = mainMenu.coner_fg_nm;
    const mainMenuName = mainMenu.disp_nm;
    const list = value.map((m) => {
      return m.disp_nm;
    });
    const image =
      mainMenu.save_file_nm != null
        ? mainMenu.file_path + mainMenu.save_file_nm
        : null;
    const result = {
      mealName: mealName,
      mainMenuName: mainMenuName,
      image: image,
      list: list,
    };
    resultArray.push(result);
  }

  console.log(resultArray);
  return resultArray;
};

const getMainMenu = (data) => {
  const filteredData = data.filter((n) => {
    return n.main_dish_yn === "Y";
  });
  if (filteredData === undefined || filteredData.length === 0) {
    return data.filter((n) => {
      return n.seq === "1";
    })[0];
  }
  return filteredData[0];
};

const getCurrentDateTime = () => {
  // 1. 현재 시간(Locale)
  const curr = new Date();

  // 2. UTC 시간 계산
  const utc = 
        curr.getTime() + 
        (curr.getTimezoneOffset() * 60 * 1000);

  // 3. UTC to KST (UTC + 9시간)
  const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
  const date = 
        new Date(utc + (KR_TIME_DIFF));

  var year = date.getFullYear();
  var month = ("0" + (1 + date.getMonth())).slice(-2);
  var day = ("0" + date.getDate()).slice(-2);

  return year + month + day;  
}


exports.menu_for_beme = functions
  .region("asia-northeast1") // asia-northeast1:Tokyo(=Tire1 / cheaper than Seoul=Tire2)
  .https.onRequest((requestFromClient, responseToClient) => {
    responseToClient.set(
      "Access-Control-Allow-Origin",
      "https://dragonq29.github.io"
    );
    responseToClient.set("Access-Control-Allow-Headers", "Content-Type");
    const currentYYYYMMDD = getCurrentDateTime();
    let postData = {
      st_dt: currentYYYYMMDD,
      end_dt: currentYYYYMMDD,
      bizplc_cd: "10095"
    }
    if (Object.keys(requestFromClient.query).length !== 0) {
      postData = {
        st_dt: requestFromClient.query.date,
        end_dt: requestFromClient.query.date,
        bizplc_cd: "10095"
      }
    }
    axios
      .post(
        "https://sfv.hyundaigreenfood.com/smartfood/todaymenuGf/todayMenu_nList_pro.do",
        postData
      )
      .then((res) => {
        const receivedData = {
          ...res.data,
        };
        if (receivedData.todayList === undefined) {
          responseToClient.send({
            msg: "데이터 불러오기 실패",
            error: true,
          });
          return;
        }

        const data = meald_fg_cd_arrange(receivedData.todayList);
        const breakfirstData = coner_fg_cd_arrange(data.get("0001"));
        const lunchData = coner_fg_cd_arrange(data.get("0002"));
        const dinnerData = coner_fg_cd_arrange(data.get("0003"));

        const breakfirstList = createMealList(breakfirstData);
        const lunchList = createMealList(lunchData);
        const dinnerList = createMealList(dinnerData);

        // responseToClient.send(result);
        responseToClient.send({
          breakfirstList,
          lunchList,
          dinnerList,
        });
      })
      .catch((err) => responseToClient.send({ ...err.message }));
  });