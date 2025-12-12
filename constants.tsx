import React from 'react';

export const INTRO_SEQUENCE = [
  { delay: 1000, speaker: "奶奶", text: "（电话声）喂？是囡囡吗？你那边还好吗？" },
  { delay: 5000, speaker: "奶奶", text: "“最近马上要入冬了，我给你织件毛衣，过几天给你寄过去。你已经长大了，还照顾不好自己吗？不用惦记我，我老太婆不拖你后腿！”" },
  { delay: 11000, speaker: "奶奶", text: "“你忙你的就行，我老太婆有手有脚，还要给我请个保姆照顾我，真是浪费钱！”" },
  { delay: 17000, speaker: "独白", text: "（电话挂断了。保姆说奶奶现在身体不太好，但她从来不肯说。我的钱，都得花在她身上...）" }
];

export const ALBUM_CONTENT = [
  {
    title: "照片：幼儿园毕业",
    desc: "奶奶抱着穿着小西装的你，笑得特别开心。“她为了让我有体面，省吃俭用买了一件新衣服。”"
  },
  {
    title: "录音：第一次做饭",
    desc: "奶奶声音带着骄傲：“看看我的大孙子，都会给我做饭了！以后不愁娶媳妇儿！”"
  }
];

export const DAILY_CARE_COSTS = {
  basic: { name: '基础护理/基础药', cost: 1000, time: 10 },
  advanced: { name: '高级护理/高级药', cost: 2500, time: 15 }
};

export const CLOCK_IN_BONUS = 500;
export const CLOCK_IN_PENALTY = 200;
export const RENT_COST = 4000; 
export const MED_COST = 800;

// Time Constants (in minutes)
export const START_TIME = 8 * 60; // 8:00 AM
export const WORK_TIME_COST = 120; // 2 hours
export const CHECK_CAM_TIME_COST = 10;
export const CALL_GRAN_TIME_COST = 20;
export const CLOCK_IN_TIME_COST = 30;
export const SHOPPING_TIME_COST = 15;
export const SLEEP_THRESHOLD = 18 * 60; // 18:00
export const DAY_END_TIME = 24 * 60; // 24:00

// Work Logic
export const WORK_INCOME_MIN = 200;
export const WORK_INCOME_MAX = 500;
export const WORK_END_TIME_MIN = 21 * 60; // 21:00