import React, { useState, useEffect } from 'react';
import { GameState } from '../types';
import { DAILY_CARE_COSTS, CLOCK_IN_BONUS, CLOCK_IN_PENALTY, ALBUM_CONTENT, RENT_COST, MED_COST, WORK_TIME_COST, CLOCK_IN_TIME_COST, SHOPPING_TIME_COST, DAY_END_TIME, WORK_INCOME_MIN, WORK_INCOME_MAX } from '../constants';
import { MessageCircle, Video, Clapperboard, Calendar, X, CheckCircle, AlertTriangle, Image as ImageIcon, HeartHandshake, Pill, ShoppingCart, Clock, Mail } from 'lucide-react';

interface ComputerScreenProps {
  state: GameState;
  onClose: () => void;
  onUpdateState: (updates: Partial<GameState>) => void;
  onOpenExternalCamera: () => void;
  onTriggerDialogue: (speaker: string, text: string) => void;
}

type WindowType = 'none' | 'wechat' | 'clockin' | 'work' | 'album' | 'help' | 'meds';
type ChatContact = 'Babysitter' | 'Friend' | 'Grandma' | 'Boss';

const ComputerScreen: React.FC<ComputerScreenProps> = ({ state, onClose, onUpdateState, onOpenExternalCamera, onTriggerDialogue }) => {
  const [activeWindow, setActiveWindow] = useState<WindowType>('none');
  const [activeChat, setActiveChat] = useState<ChatContact>('Babysitter');
  const [wechatMessages, setWechatMessages] = useState<any[]>([]);
  
  // Auto-open logic
  useEffect(() => {
    if (state.firstLogin) {
      setTimeout(() => {
        setActiveWindow('wechat');
        setActiveChat('Babysitter');
        onUpdateState({ firstLogin: false });
      }, 500);
    } else if (state.day === 2 && !state.clockedIn && activeWindow === 'none') {
       setActiveWindow('clockin');
    }
  }, [state.day]);

  // Handle Clock In
  const handleClockIn = (success: boolean) => {
    const timeCost = CLOCK_IN_TIME_COST;
    if (success) {
      const updates: Partial<GameState> = { 
        clockedIn: true, 
        money: state.money + CLOCK_IN_BONUS,
        time: state.time + timeCost
      };

      if (state.day === 2) {
         updates.wechatUnread = 3; // Babysitter + Friend + System(Rent)
         setTimeout(() => {
            alert(`📨 收到房东邮件：\n房租水电账单 ${state.rentDueIn} 天后到期。\n总计：${RENT_COST} 元。`);
            setTimeout(() => {
                onTriggerDialogue("上司 (语音消息)", "你昨晚的任务表现远低于我的预期，你是不是根本不想做了？这种质量，不如辞职算了！");
                onUpdateState({ ...updates, pressure: state.pressure + 15 });
            }, 2000);
         }, 500);
      }
      
      onUpdateState(updates);
      alert(`✅ 打卡成功！\n收到打卡奖金：+${CLOCK_IN_BONUS} 元\n时间流逝: +${timeCost}分钟`);
    } else {
      onUpdateState({ 
        money: state.money - CLOCK_IN_PENALTY,
        time: state.time + timeCost
      }); 
      alert(`❌ 打卡失败/迟到！\n罚款：-${CLOCK_IN_PENALTY} 元\n时间流逝: +${timeCost}分钟`);
    }
    setActiveWindow('none');
  };

  // Handle Care Payment
  const handlePayment = () => {
    const cost = DAILY_CARE_COSTS.basic.cost;
    const timeCost = DAILY_CARE_COSTS.basic.time;
    if (state.money < cost) {
      alert(`资金不足！支付 ${cost} 元失败。\n您目前卡里只有 ${state.money} 元。`);
      return;
    }
    
    onUpdateState({
      money: state.money - cost,
      carePaid: true,
      time: state.time + timeCost
    });
    
    setWechatMessages(prev => [...prev, {
      sender: 'me',
      text: `已支付今日护理费用 ${cost} 元，辛苦了。`
    }]);
    
    alert(`✅ 支付成功！已支付护理费。\n时间流逝: +${timeCost}分钟`);
    
    if (state.day === 2) {
       setTimeout(() => onTriggerDialogue("奶奶 (来电)", "你把保姆辞退吧，我自己一个人很好，不要再浪费钱了！你那么忙，不要再为我操心了。"), 1000);
    } else {
       setTimeout(() => onTriggerDialogue("奶奶 (来电)", "喂？是囡囡吗？听说你昨天给我买药了？怎么这么乱花钱！"), 1000);
    }
  };

  const handleBuyMeds = () => {
    if (state.money >= MED_COST) {
        onUpdateState({
            money: state.money - MED_COST,
            meds: state.meds + 1,
            time: state.time + SHOPPING_TIME_COST
        });
        alert(`🛒 购买成功！已购买一份特效维持素。\n时间流逝: +${SHOPPING_TIME_COST}分钟`);
        setActiveWindow('none');
    } else {
        alert("❌ 余额不足！请继续工作赚取报酬。");
    }
  };

  // Handle Work
  const finishWork = () => {
    if (state.time + WORK_TIME_COST > DAY_END_TIME) {
        alert("时间不足，无法开始工作！请休息。");
        return;
    }
    if (state.energy < 30) {
      alert("精力不足，无法完成高效剪辑和发布。");
      return;
    }

    // New Income Logic: 200 - 500
    const baseIncome = Math.floor(Math.random() * (WORK_INCOME_MAX - WORK_INCOME_MIN + 1)) + WORK_INCOME_MIN;
    
    onUpdateState({
      money: state.money + baseIncome,
      energy: state.energy - 30,
      workCompleted: true,
      time: state.time + WORK_TIME_COST
    });

    alert(`🎉 工作完成！\n本次收入：+${baseIncome} 元。\n精力消耗：-30\n时间流逝: +${WORK_TIME_COST}分钟`);
    setActiveWindow('none');
  };

  // Handle Side Quests (Day 2)
  const handleSideQuest = (path: 'A' | 'B' | 'C') => {
    setActiveWindow('none');
    if (path === 'A') { // Boss
        onTriggerDialogue("独白", "（联系上司... 电话被敷衍地挂断了。）");
        onUpdateState({ pressure: state.pressure + 5, time: state.time + 30 });
        setTimeout(() => {
            alert("叮咚！收到上司转账 1000 元，附言：'下个月扣。'");
            onUpdateState({ money: state.money + 1000, medPathTaken: true });
            onTriggerDialogue("系统", "已获得预支工资。记得买药！");
        }, 3000);
    } else if (path === 'B') { // Colleague
        onTriggerDialogue("独白", "（联系同事... '兄弟，我最近手头也紧，实在没办法...'）");
        onUpdateState({ pressure: state.pressure + 10, time: state.time + 30 });
        setTimeout(() => alert("❌ 借钱失败。无法购买药物。"), 3000);
    } else if (path === 'C') { // Gig
        onTriggerDialogue("独白", "（接受线上小时工任务，今天决定不吃饭，节省开支。）");
        onUpdateState({ energy: Math.max(0, state.energy - 10), pressure: Math.max(0, state.pressure - 5), time: state.time + 60 });
        setTimeout(() => {
            alert("✅ 兼职完成！获得 900 元收入。");
            onUpdateState({ money: state.money + 900, medPathTaken: true });
        }, 3000);
    }
  };

  // Switch Chat
  const switchChat = (contact: ChatContact) => {
    setActiveChat(contact);
    setWechatMessages([]); // Clear local session state
  };
  
  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60) % 24;
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  // Vitals Logic
  const heartRate = state.lowBloodPressure ? '95 (偏高)' : '75 (平稳)';
  const bloodPressure = state.lowBloodPressure ? '90/60 (低血压!)' : '120/80 (正常)';
  const bpColor = state.lowBloodPressure ? 'text-red-500 animate-pulse' : 'text-green-400';

  return (
    <div className="absolute inset-[5%] bg-[#0a0a0a] border-4 border-[#444] rounded-lg p-6 font-sans text-gray-200 shadow-[0_0_30px_rgba(51,255,51,0.05)] z-40 flex flex-col overflow-hidden select-none">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-green-800 pb-2 mb-4">
        <h2 className="text-xl font-bold tracking-widest text-green-400 font-mono">营销工作站 V1.0</h2>
        <button onClick={onClose} className="bg-red-900 text-white px-3 py-1 text-xs hover:bg-red-700 transition border border-red-700">
          退出系统 [U]
        </button>
      </div>

      <div className="flex-1 relative">
        {/* Desktop Icons */}
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-4 p-4">
          
          <button onClick={() => setActiveWindow('wechat')} className="col-span-1 row-span-1 flex flex-col items-center justify-center text-center p-3 hover:bg-gray-800 rounded transition relative group">
            <div className="text-4xl mb-2 text-green-500 group-hover:scale-110 transition-transform"><MessageCircle size={40} /></div>
            <span className="text-sm mt-1 text-gray-200">微信 ({state.wechatUnread})</span>
            {state.wechatUnread > 0 && <div className="absolute top-2 right-8 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>}
          </button>
          
          {/* Boss Shortcut for WeChat */}
           <button onClick={() => { setActiveWindow('wechat'); setActiveChat('Boss'); }} className="col-span-1 row-span-1 flex flex-col items-center justify-center text-center p-3 hover:bg-gray-800 rounded transition relative group">
            <div className="text-4xl mb-2 text-blue-300 group-hover:scale-110 transition-transform"><Mail size={40} /></div>
            <span className="text-sm mt-1 text-gray-200">上司指令</span>
          </button>

          <button onClick={() => setActiveWindow('work')} disabled={!state.clockedIn || state.workCompleted} className={`col-span-1 row-span-1 flex flex-col items-center justify-center text-center p-3 rounded transition group ${(!state.clockedIn || state.workCompleted) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800 cursor-pointer'}`}>
            <div className="text-4xl mb-2 text-blue-400 group-hover:scale-110 transition-transform"><ImageIcon size={40} /></div>
            <span className="text-sm mt-1 text-gray-200">{state.workCompleted ? '今日已完成' : '主题匹配'}</span>
          </button>

          <button onClick={onOpenExternalCamera} className="col-span-1 row-span-1 flex flex-col items-center justify-center text-center p-3 hover:bg-gray-800 rounded transition group">
            <div className="text-4xl mb-2 text-red-400 group-hover:scale-110 transition-transform"><Video size={40} /></div>
            <span className="text-sm mt-1 text-gray-200">家中监控</span>
          </button>

          <button onClick={() => setActiveWindow('meds')} className="col-span-1 row-span-1 flex flex-col items-center justify-center text-center p-3 hover:bg-gray-800 rounded transition group">
            <div className="text-4xl mb-2 text-rose-500 group-hover:scale-110 transition-transform"><Pill size={40} /></div>
            <span className="text-sm mt-1 text-gray-200">医药商城</span>
          </button>

          {state.day >= 2 && (
              <button onClick={() => setActiveWindow('album')} className="col-span-1 row-span-1 flex flex-col items-center justify-center text-center p-3 hover:bg-gray-800 rounded transition group">
                <div className="text-4xl mb-2 text-yellow-500 group-hover:scale-110 transition-transform"><ImageIcon size={40} /></div>
                <span className="text-sm mt-1 text-gray-200">回忆相册</span>
              </button>
          )}

          {state.day >= 2 && !state.medPathTaken && state.meds < 1 && (
             <button onClick={() => setActiveWindow('help')} className="col-span-1 row-span-1 flex flex-col items-center justify-center text-center p-3 hover:bg-gray-800 rounded transition border border-yellow-700 bg-yellow-900/20 group">
              <div className="text-4xl mb-2 text-yellow-400 group-hover:scale-110 transition-transform"><HeartHandshake size={40} /></div>
              <span className="text-sm mt-1 text-yellow-200 font-bold">紧急求助</span>
            </button>
          )}

          {/* Schedule Widget */}
          <div className="col-span-2 row-span-2 border border-gray-700 p-4 rounded bg-gray-900/80 overflow-y-auto font-mono text-sm">
            <h3 className="text-lg font-bold mb-3 text-blue-400 flex items-center gap-2"><Calendar size={18}/> 今日日程 (Day {state.day})</h3>
            <p className="mb-2 text-gray-400"><strong>职业：</strong>市场营销策划</p>
            <div className={`flex items-center gap-2 mb-1 ${state.clockedIn ? 'text-green-400 line-through' : 'text-yellow-400'}`}>
               {state.clockedIn ? <CheckCircle size={14}/> : <AlertTriangle size={14}/>} 8:00 - 9:00 完成打卡
            </div>
            <div className={`flex items-center gap-2 mb-1 ${state.workCompleted ? 'text-green-400 line-through' : 'text-gray-300'}`}>
               {state.workCompleted ? <CheckCircle size={14}/> : <div className="w-3.5 h-3.5 border border-gray-500 rounded-sm"></div>} 完成 [主题匹配] 任务
            </div>
            
            <p className="mt-4 text-red-500 font-bold text-xs">
              {state.meds < 1 ? `💊 紧急：需要购买特效药! (${MED_COST}元)` : `💊 药物充足 (库存: ${state.meds})`}
            </p>
            <div className="mt-2 pt-2 border-t border-gray-700 text-yellow-400 font-bold">
                ⚠️ 明日待办: 支付房租 ({RENT_COST} 元)
            </div>
          </div>
        </div>

        {/* Vitals Widget */}
        <div className="absolute bottom-4 right-4 bg-gray-900 border border-red-600 p-3 rounded-lg w-56 text-xs z-10 font-mono shadow-lg">
          <p className="font-bold text-red-400 mb-1 flex items-center gap-1"><AlertTriangle size={12}/> 生命体征监控 (实时)</p>
          <div className="flex justify-between border-b border-gray-800 py-1">
            <span>心率 (bpm):</span>
            <span className={bpColor}>{heartRate}</span>
          </div>
          <div className="flex justify-between border-b border-gray-800 py-1">
            <span>血压 (mmHg):</span>
            <span className={bpColor}>{bloodPressure}</span>
          </div>
          <div className="flex justify-between py-1">
            <span>血氧 (%):</span>
            <span className="text-green-400 font-bold">98%</span>
          </div>
        </div>

        {/* --- Windows --- */}

        {/* Clock In */}
        {activeWindow === 'clockin' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50">
            <div className="w-96 bg-gray-800 p-6 rounded-lg shadow-2xl text-center border-t-4 border-yellow-500 animate-[fadeIn_0.2s]">
              <h3 className="text-2xl font-bold mb-4 text-yellow-400">⏰ 工作打卡</h3>
              <p className="mb-6 text-gray-300">请在 9:00 前完成打卡，否则将面临迟到罚款。</p>
              <button onClick={() => handleClockIn(true)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition w-full">
                打卡 (8:00)
              </button>
            </div>
          </div>
        )}

        {/* Med Shop */}
        {activeWindow === 'meds' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50">
            <div className="w-96 bg-gray-800 p-6 rounded-lg shadow-2xl text-center border-t-4 border-red-500 animate-[fadeIn_0.2s] relative">
              <button onClick={() => setActiveWindow('none')} className="absolute top-2 right-2 text-gray-400"><X size={20}/></button>
              <h3 className="text-2xl font-bold mb-4 text-red-400">💊 医药商城</h3>
              <p className="mb-4 text-gray-400">维持奶奶健康的关键药物。</p>
              <button onClick={handleBuyMeds} className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-6 rounded transition flex items-center justify-center gap-2">
                 <ShoppingCart size={16}/> 购买 特效维持素 ({MED_COST} 元)
              </button>
            </div>
          </div>
        )}

        {/* WeChat */}
        {activeWindow === 'wechat' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50">
             <div className="bg-[#333] w-3/4 max-w-lg h-5/6 flex flex-col rounded-lg border border-[#555] shadow-2xl animate-[fadeIn_0.2s]">
                {/* WeChat Header */}
                <div className="flex justify-between items-center p-3 border-b border-[#444] bg-[#222] rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-bold text-white">微信</h4>
                    <span className="text-xs text-gray-400">({activeChat})</span>
                  </div>
                  <button onClick={() => setActiveWindow('none')}><X size={20} className="text-gray-400 hover:text-white"/></button>
                </div>
                
                {/* Contact List */}
                <div className="flex border-b border-[#444] bg-[#2a2a2a] overflow-x-auto">
                   <button onClick={() => switchChat('Babysitter')} className={`flex-1 min-w-[80px] p-2 text-sm ${activeChat === 'Babysitter' ? 'bg-[#333] text-white font-bold' : 'text-gray-400 hover:bg-[#333]'}`}>王阿姨</button>
                   <button onClick={() => switchChat('Boss')} className={`flex-1 min-w-[80px] p-2 text-sm ${activeChat === 'Boss' ? 'bg-[#333] text-white font-bold' : 'text-gray-400 hover:bg-[#333]'}`}>上司</button>
                   {state.day >= 2 && <button onClick={() => switchChat('Friend')} className={`flex-1 min-w-[80px] p-2 text-sm ${activeChat === 'Friend' ? 'bg-[#333] text-white font-bold' : 'text-gray-400 hover:bg-[#333]'}`}>朋友</button>}
                   {state.day >= 2 && <button onClick={() => switchChat('Grandma')} className={`flex-1 min-w-[80px] p-2 text-sm ${activeChat === 'Grandma' ? 'bg-[#333] text-white font-bold' : 'text-gray-400 hover:bg-[#333]'}`}>奶奶</button>}
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#333]">
                   
                   {/* Babysitter Logic */}
                   {activeChat === 'Babysitter' && (
                       <>
                        {state.day === 1 && (
                            <div className="bg-[#444] p-2 rounded-lg max-w-[85%] self-start text-sm text-gray-200">
                                王阿姨：您好，奶奶今天精神不错。这是本周的护理费用。
                            </div>
                        )}
                        {state.day === 2 && (
                            <>
                                <div className="text-center text-xs text-gray-500 my-2">-- 今日 08:30 --</div>
                                <div className="bg-[#444] p-2 rounded-lg max-w-[85%] self-start text-sm text-gray-200">
                                    王阿姨：您好，奶奶今天走动时说有点心慌（低血压症状）。
                                </div>
                                <div className="bg-[#444] p-2 rounded-lg max-w-[85%] self-start text-sm text-gray-200">
                                    王阿姨：血压药已经完全用完了，需要尽快补药。今日护理费 1000 元。
                                </div>
                            </>
                        )}
                       </>
                   )}

                   {/* Boss Logic */}
                   {activeChat === 'Boss' && (
                       <>
                        <div className="text-center text-xs text-gray-500 my-2">-- 今日 {formatTime(state.time - 5)} --</div>
                        <div className="bg-[#444] p-2 rounded-lg max-w-[85%] self-start text-sm text-gray-200">
                            张总：今天你的任务是“**怀旧主题**”的图片匹配。
                        </div>
                        <div className="bg-[#444] p-2 rounded-lg max-w-[85%] self-start text-sm text-gray-200">
                            张总：进入工作站，根据主题从图片库里选出最相符的图片。这是新玩法，选得越好，越接近热点，收入就越高。
                        </div>
                        <div className="bg-[#444] p-2 rounded-lg max-w-[85%] self-start text-sm text-gray-200">
                            张总：本次工作预计收入在 **{WORK_INCOME_MIN}-{WORK_INCOME_MAX} 元** 之间。祝顺利！
                        </div>
                        <div className="bg-[#1e873b] p-2 rounded-lg max-w-[85%] self-end ml-auto text-sm text-white">
                            我：收到，立即处理。
                        </div>
                       </>
                   )}

                   {/* Friend Logic */}
                   {activeChat === 'Friend' && (
                       <>
                        <div className="text-center text-xs text-gray-500 my-2">-- 今日 10:00 --</div>
                        <div className="bg-[#444] p-2 rounded-lg max-w-[85%] self-start text-sm text-gray-200">
                            小李：最近忙啥呢？我最近在搞个兼职，这个XX保健品对老人特别好，要不要给你奶奶试试？给个内部价！
                        </div>
                        <div className="bg-[#1e873b] p-2 rounded-lg max-w-[85%] self-end ml-auto text-sm text-white">
                            我：不用了，谢谢，我只相信医生开的药。
                        </div>
                       </>
                   )}

                   {/* Grandma Logic */}
                   {activeChat === 'Grandma' && (
                       <div className="bg-[#444] p-2 rounded-lg max-w-[85%] self-start text-sm text-gray-200">
                            奶奶：囡囡，你最近过得如何？别太累了，你已经是奶奶的骄傲了。
                       </div>
                   )}

                   {/* Dynamic Messages (Receipts etc) */}
                   {activeChat === 'Babysitter' && wechatMessages.map((msg, i) => (
                    <div key={i} className={`p-2 rounded-lg max-w-[85%] text-sm ${msg.sender === 'me' ? 'bg-[#1e873b] self-end ml-auto text-white' : 'bg-[#444] text-gray-200'}`}>
                      {msg.text}
                    </div>
                  ))}
                </div>

                {/* Footer / Actions */}
                {activeChat === 'Babysitter' && (
                    <div className="p-4 border-t border-[#444] bg-[#222] rounded-b-lg">
                    {!state.carePaid ? (
                        <div className="space-y-2">
                        <p className="text-red-400 text-xs mb-1 font-bold">⚠ 待支付订单</p>
                        <button onClick={handlePayment} className="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded flex justify-between items-center transition">
                            <span className="text-sm">今日护理费用</span>
                            <span className="font-bold text-yellow-400 text-sm">1000 元</span>
                            <span className="text-xs text-gray-500">-10 min</span>
                        </button>
                        </div>
                    ) : (
                        <div className="text-center text-green-500 text-sm font-bold py-2">✅ 费用已结清</div>
                    )}
                    </div>
                )}
                
                {activeChat === 'Boss' && (
                    <div className="p-4 border-t border-[#444] bg-[#222] rounded-b-lg text-center text-gray-400 text-sm">
                        请前往电脑工作站完成任务。
                    </div>
                )}
             </div>
          </div>
        )}

        {/* Side Quest Help */}
        {activeWindow === 'help' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50">
                <div className="w-full max-w-lg bg-gray-800 p-6 rounded-lg shadow-2xl text-center border-t-4 border-yellow-600 animate-[fadeIn_0.2s]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-yellow-400">💡 紧急筹款渠道</h3>
                        <button onClick={() => setActiveWindow('none')}><X size={24} className="text-gray-400 hover:text-white"/></button>
                    </div>
                    <p className="text-gray-300 mb-4 text-left">奶奶急需购买特效药，你打算如何凑钱？</p>
                    <div className="space-y-3">
                        <button onClick={() => handleSideQuest('A')} className="w-full text-left bg-blue-900/50 hover:bg-blue-800 p-3 rounded border border-blue-700">路径 A：找上司预支工资 (压力 +5, 30 min)</button>
                        <button onClick={() => handleSideQuest('B')} className="w-full text-left bg-red-900/50 hover:bg-red-800 p-3 rounded border border-red-700">路径 B：找同事借钱 (压力 +10, 30 min)</button>
                        <button onClick={() => handleSideQuest('C')} className="w-full text-left bg-yellow-900/50 hover:bg-yellow-800 p-3 rounded border border-yellow-700">路径 C：接线上兼职 (精力 -10, 60 min)</button>
                    </div>
                </div>
            </div>
        )}

        {/* Work Window */}
        {activeWindow === 'work' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50">
            <div className="w-full max-w-xl bg-gray-800 p-6 rounded-lg shadow-2xl text-center border-t-4 border-blue-500 animate-[fadeIn_0.2s]">
              <div className="flex justify-between mb-4">
                 <h3 className="text-2xl font-bold text-blue-400">🖼️ 主题匹配任务 (工作小游戏)</h3>
                 <button onClick={() => setActiveWindow('none')}><X size={24} className="text-gray-400 hover:text-white"/></button>
              </div>
              <div className="w-full h-48 bg-gray-700 border border-gray-600 flex items-center justify-center text-gray-500 mb-6 rounded flex-col p-4">
                  <div className="text-lg font-bold text-white mb-2">任务目标：根据当前主题，从素材库中匹配最符合的图片组合。</div>
                  <div className="text-sm text-gray-400 text-center max-w-sm">需根据上司在微信中发布的具体主题要求（如“怀旧”、“科技”等），筛选出匹配度最高的视觉素材。</div>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mt-4">
                    <Clock size={20} className=""/> 耗时: 120 分钟
                  </div>
              </div>
              <button onClick={finishWork} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded transition w-full flex items-center justify-center gap-2">
                <CheckCircle size={18}/> 完成并发布 (消耗 30 精力)
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ComputerScreen;