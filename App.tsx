import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { GameState, UIState, DialogueState } from './types';
import { INTRO_SEQUENCE, RENT_COST, START_TIME, CHECK_CAM_TIME_COST, CALL_GRAN_TIME_COST, SLEEP_THRESHOLD, DAY_END_TIME, WORK_END_TIME_MIN } from './constants';
import HUD from './components/HUD';
import ComputerScreen from './components/ComputerScreen';
import PhoneScreen from './components/PhoneScreen';
import CameraOverlay from './components/CameraOverlay';
import DialogueBox from './components/DialogueBox';

const INITIAL_STATE: GameState = {
  money: 2500,
  time: START_TIME,
  energy: 100,
  meds: 0,
  grandmaHealth: 90,
  clockedIn: false,
  workCompleted: false,
  carePaid: false,
  firstLogin: true,
  alarmTriggered: false,
  // Day 2 Defaults
  day: 1,
  rentDueIn: 3,
  pressure: 50,
  lowBloodPressure: false,
  wechatUnread: 0,
  friendMessaged: false,
  medPathTaken: false
};

const App: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Game Logic State
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [uiState, setUiState] = useState<UIState>('none');
  const [dialogue, setDialogue] = useState<DialogueState>({ visible: false, speaker: '', text: '' });
  const [interactionHint, setInteractionHint] = useState<string | null>(null);
  const [crosshairColor, setCrosshairColor] = useState<string>('rgba(255, 255, 255, 0.8)');

  // References to communicate with Three.js loop
  const sceneRef = useRef<{
    camera: THREE.PerspectiveCamera;
    toggleFocus: (target: 'computer' | 'phone' | 'none') => void;
  } | null>(null);

  // --- Three.js Setup ---
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene Init
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.035);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.25, 1);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    const deskLamp = new THREE.PointLight(0xffaa00, 1.2, 10);
    deskLamp.position.set(0, 2, -2);
    scene.add(deskLamp);
    const screenLight = new THREE.PointLight(0x3333ff, 0.5, 5);
    screenLight.position.set(0, 1.3, -2.4);
    scene.add(screenLight);

    // Photo Wall Texture
    const createPhotoWallTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.MeshBasicMaterial({ color: 0x333333 });

      ctx.fillStyle = '#333';
      ctx.fillRect(0, 0, 512, 512);

      const photos = [
        { text: '少年与奶奶', color: '#ADD8E6', offset: 0 },
        { text: '窗前绿植', color: '#90EE90', offset: 150 },
        { text: '深海摄影', color: '#4682B4', offset: 300 }
      ];
      
      const texture = new THREE.CanvasTexture(canvas);
      
      const animateTexture = () => {
        const time = Date.now() * 0.05;
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, 512, 512);

        photos.forEach(p => {
          const y = (p.offset + time) % 512;
          ctx.fillStyle = p.color;
          ctx.fillRect(20, y - 100, 472, 120);
          ctx.fillStyle = '#111';
          ctx.font = 'bold 24px Arial';
          ctx.fillText(p.text, 40, y - 40);
        });
        texture.needsUpdate = true;
        requestAnimationFrame(animateTexture);
      };
      animateTexture();

      return new THREE.MeshBasicMaterial({ map: texture });
    };

    // Objects
    const matDesk = new THREE.MeshLambertMaterial({ color: 0x3e2723 });
    const desk = new THREE.Mesh(new THREE.BoxGeometry(6, 0.2, 3), matDesk);
    desk.position.set(0, 0, -2);
    scene.add(desk);

    const matWall = new THREE.MeshLambertMaterial({ color: 0x212121 });
    const wall = new THREE.Mesh(new THREE.BoxGeometry(12, 10, 0.1), matWall);
    wall.position.set(0, 2, -4);
    scene.add(wall);

    const matScreen = new THREE.MeshLambertMaterial({ color: 0x000000, emissive: 0x0d47a1 });
    const matPhotos = createPhotoWallTexture();
    const matCase = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const monitorMaterials = [matCase, matCase, matCase, matCase, matScreen, matPhotos];

    const monitor = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.6, 0.1), monitorMaterials);
    monitor.position.set(0, 1.3, -2.5);
    monitor.name = "Computer";
    scene.add(monitor);
    
    const monitorStand = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1, 0.2), matCase);
    monitorStand.position.set(0, 0.6, -2.5);
    scene.add(monitorStand);

    const phone = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.8), new THREE.MeshLambertMaterial({ color: 0x424242 }));
    phone.position.set(1.5, 0.15, -1.5);
    phone.rotation.y = -0.4;
    phone.name = "Phone";
    scene.add(phone);

    const photoFrame = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.05), new THREE.MeshLambertMaterial({color: 0x5d4037}));
    photoFrame.position.set(-2, 0.5, -2.5);
    photoFrame.rotation.y = 0.4;
    photoFrame.name = "Photo";
    scene.add(photoFrame);
    const photoFace = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.65), new THREE.MeshBasicMaterial({color: 0xeeeeee})); 
    photoFace.position.z = 0.03;
    photoFrame.add(photoFace);

    // Raycasting & Interaction Logic
    const raycaster = new THREE.Raycaster();
    let targetRotationX = 0;
    let targetRotationY = 0;
    let inFocusMode = false;

    const onMouseMove = (event: MouseEvent) => {
      if (inFocusMode) return;
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      targetRotationY = x * -0.4;
      targetRotationX = y * 0.25;

      raycaster.setFromCamera({x, y}, camera);
      const intersects = raycaster.intersectObjects(scene.children);
      
      let hovered = false;
      if (intersects.length > 0) {
        const obj = intersects[0].object;
        if (obj.name === "Computer") {
          setInteractionHint("[U] / 点击 使用电脑");
          setCrosshairColor("#00ff00");
          document.body.style.cursor = "pointer";
          hovered = true;
        } else if (obj.name === "Phone") {
          setInteractionHint("[E] / 点击 使用手机");
          setCrosshairColor("#00ff00");
          document.body.style.cursor = "pointer";
          hovered = true;
        } else if (obj.name === "Photo") {
          setInteractionHint("查看相框");
          setCrosshairColor("#ffff00");
          document.body.style.cursor = "help";
          hovered = true;
        }
      }
      
      if (!hovered) {
          setInteractionHint(null);
          setCrosshairColor("rgba(255, 255, 255, 0.8)");
          document.body.style.cursor = "default";
      }
    };

    const onClick = (event: MouseEvent) => {
      if (inFocusMode) return;
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera({x, y}, camera);
      const intersects = raycaster.intersectObjects(scene.children);
      
      if (intersects.length > 0) {
        const obj = intersects[0].object;
        if (obj.name === "Computer") handleToggleFocus('computer');
        else if (obj.name === "Phone") handleToggleFocus('phone');
        else if (obj.name === "Photo") handlePhotoClick();
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);

    // Animation Loop
    let animationId: number;
    const animate = (time: number) => {
      animationId = requestAnimationFrame(animate);
      TWEEN.update(time);
      
      if (!inFocusMode) {
        camera.rotation.x += (targetRotationX - camera.rotation.x) * 0.08;
        camera.rotation.y += (targetRotationY - camera.rotation.y) * 0.08;
      }
      
      renderer.render(scene, camera);
    };
    animate(0);

    sceneRef.current = {
      camera,
      toggleFocus: (target) => {
        if (target === 'none') {
            inFocusMode = false;
            new TWEEN.Tween(camera.position).to({ x: 0, y: 1.25, z: 1 }, 800).easing(TWEEN.Easing.Cubic.Out).start();
        } else if (target === 'computer') {
            inFocusMode = true;
            new TWEEN.Tween(camera.position).to({ x: 0, y: 1.3, z: -1.6 }, 1000).easing(TWEEN.Easing.Cubic.Out).start();
            new TWEEN.Tween(camera.rotation).to({ x: 0, y: 0, z: 0 }, 1000).start();
        } else if (target === 'phone') {
            inFocusMode = true;
            new TWEEN.Tween(camera.position).to({ x: 1.5, y: 0.35, z: -1.2 }, 800).easing(TWEEN.Easing.Cubic.Out).start();
            new TWEEN.Tween(camera.rotation).to({ x: -0.5, y: 0, z: 0 }, 800).start();
        }
      }
    };

    const handleResize = () => {
       camera.aspect = window.innerWidth / window.innerHeight;
       camera.updateProjectionMatrix();
       renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, []);

  // --- React Event Handlers ---

  const handleToggleFocus = (target: 'computer' | 'phone' | 'none') => {
    if (uiState === target) {
        setUiState('none');
        sceneRef.current?.toggleFocus('none');
    } else {
        setUiState(target);
        sceneRef.current?.toggleFocus(target);
    }
  };

  const handleCameraOpen = () => {
    if (gameState.time + CHECK_CAM_TIME_COST > DAY_END_TIME) {
        showDialogue("系统", "时间已晚，无法集中注意力查看监控。");
        return;
    }
    setGameState(prev => ({ 
        ...prev, 
        energy: Math.max(0, prev.energy - 5),
        time: prev.time + CHECK_CAM_TIME_COST
    }));
    setUiState('camera');
  };

  const handlePhoneCallGrandma = () => {
    if (gameState.time + CALL_GRAN_TIME_COST > DAY_END_TIME) {
        showDialogue("系统", "时间太晚了，现在打电话可能会吵到奶奶休息。");
        return;
    }

    setGameState(prev => ({ ...prev, time: prev.time + CALL_GRAN_TIME_COST }));
    setUiState('none'); // Hide phone UI to show dialogue
    sceneRef.current?.toggleFocus('phone'); // Keep camera on phone

    const dialogues = [
        { speaker: "系统", text: `[消耗 ${CALL_GRAN_TIME_COST} 分钟]` },
        { speaker: "奶奶 (电话)", text: "喂？囡囡啊，怎么突然想起给奶奶打电话了？你那边是不是又加班了？" },
        { speaker: "我 (内心)", text: "（电话声听起来有点疲惫，但她总是不肯承认。）" },
        { speaker: "奶奶 (电话)", text: "不用担心我，我好得很！等你把工作做完了，就早点休息，别像奶奶一样熬夜织毛衣..." },
        { speaker: "系统", text: "（对话结束。按 [空格键] 返回桌面。）" }
    ];

    let index = 0;
    const playDialogue = () => {
        if (index < dialogues.length) {
            showDialogue(dialogues[index].speaker, dialogues[index].text);
            index++;
            if (index < dialogues.length) {
                setTimeout(playDialogue, 4000);
            } else {
                 setTimeout(() => {
                    setUiState('phone');
                 }, 2000);
            }
        }
    };
    playDialogue();
  };

  const handlePhotoClick = () => {
    showDialogue("独白", "（那是去年春节回家时拍的。她非要做一桌子菜，笑着说自己身体硬朗得很。）");
  };

  const handleSleep = (forced = false) => {
    if (!forced) {
        if (gameState.time < SLEEP_THRESHOLD) {
            alert("现在还太早，无法入睡。请在 18:00 后休息。");
            return;
        }
        if (!gameState.workCompleted && !window.confirm("你还没有完成今天的工作！现在睡觉可能会影响明天的绩效，确定要休息吗？")) {
            return;
        }
    }

    // Process Day Change
    let newMoney = gameState.money;
    let message = "⭐ 新的一天开始了。精力已恢复。";

    if (forced) {
        message = "⚠️ 时间到达 00:00，你因过度疲劳强制休息。未完成工作导致绩效下降。";
        newMoney -= 500; // Penalty
    }

    // Check Rent logic (Day 1 -> Day 2 transition)
    if (gameState.day === 1) {
       newMoney -= RENT_COST;
       alert(`🏠 房租到期提醒！\n新的一天 (第 2 天) 房租 ${RENT_COST} 元已自动扣除。`);
    }

    setGameState(prev => ({
      ...prev,
      money: newMoney,
      day: prev.day + 1,
      energy: 100,
      time: START_TIME,
      clockedIn: false,
      workCompleted: false,
      carePaid: false,
      alarmTriggered: false,
      rentDueIn: 30, // Reset rent timer
      grandmaHealth: prev.grandmaHealth - (prev.carePaid ? 0 : 10),
      lowBloodPressure: true, 
      firstLogin: true 
    }));
    
    // Reset View
    setUiState('none');
    sceneRef.current?.toggleFocus('none');
    
    alert(message);
  };
  
  // Auto-sleep check and Alarm
  useEffect(() => {
    if (gameState.time >= DAY_END_TIME) {
        handleSleep(true);
    } else if (gameState.time >= WORK_END_TIME_MIN && !gameState.alarmTriggered) {
        setGameState(prev => ({ ...prev, alarmTriggered: true }));
        let alarmMessage = "🔕 闹钟响起：已经晚上 9 点了，该休息了。";
        if (gameState.workCompleted) {
             alarmMessage += "\n今天的工作已完成，表现不错！";
        } else {
             alarmMessage += "\n⚠️ 注意：工作尚未完成，继续熬夜会影响健康。";
        }
        alert(alarmMessage);
    }
  }, [gameState.time, gameState.workCompleted, gameState.alarmTriggered]);

  const showDialogue = (speaker: string, text: string) => {
    setDialogue({ visible: true, speaker, text });
  };

  const handleKeyInteraction = (e: KeyboardEvent) => {
    if (e.code === 'Space' && dialogue.visible) {
      setDialogue(prev => ({ ...prev, visible: false }));
    }
    
    // U key for Computer
    if (e.key.toLowerCase() === 'u') {
      if (uiState === 'none') handleToggleFocus('computer');
      else if (uiState === 'computer') handleToggleFocus('none');
    }

    // E key for Phone
    if (e.key.toLowerCase() === 'e') {
        if (uiState === 'none') handleToggleFocus('phone');
        else if (uiState === 'phone') handleToggleFocus('none');
    }

    // Esc key
    if (e.key === 'Escape') {
      setUiState('none');
      sceneRef.current?.toggleFocus('none');
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyInteraction);
    return () => window.removeEventListener('keydown', handleKeyInteraction);
  }, [uiState, dialogue.visible]);

  // Initial Narrative Sequence (Only Day 1)
  useEffect(() => {
    if (gameState.day === 1 && gameState.time === START_TIME && gameState.firstLogin) {
        let timeouts: ReturnType<typeof setTimeout>[] = [];
        INTRO_SEQUENCE.forEach(({ delay, speaker, text }) => {
        const t = setTimeout(() => showDialogue(speaker, text), delay);
        timeouts.push(t);
        });

        const tEnd = setTimeout(() => {
        setInteractionHint("按 [U] 电脑 / [E] 手机 开始");
        setTimeout(() => setInteractionHint(null), 5000);
        }, 22000);
        timeouts.push(tEnd);

        return () => timeouts.forEach(clearTimeout);
    }
  }, [gameState.day]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
      <div ref={mountRef} className="absolute inset-0 z-0" />

      <div 
        className={`absolute top-1/2 left-1/2 w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 transition-opacity duration-200 ${uiState !== 'none' ? 'opacity-0' : 'opacity-100'}`} 
        style={{ backgroundColor: crosshairColor, boxShadow: `0 0 4px ${crosshairColor}` }}
      />

      <div className={`absolute bottom-[20%] left-1/2 transform -translate-x-1/2 text-white text-base font-bold text-shadow pointer-events-none transition-opacity duration-300 z-10 bg-black/50 px-3 py-1 rounded ${interactionHint && uiState === 'none' ? 'opacity-100' : 'opacity-0'}`}>
        {interactionHint}
      </div>
      
      {/* Sleep Button */}
      {uiState === 'none' && (
        <button 
          onClick={() => handleSleep(false)}
          className={`absolute bottom-6 right-6 z-20 font-bold py-3 px-6 rounded-full shadow-lg border transition-all hover:scale-105 ${gameState.time >= SLEEP_THRESHOLD ? 'bg-red-900/80 hover:bg-red-700 text-white border-red-500' : 'bg-gray-800/50 text-gray-500 border-gray-700 cursor-not-allowed'}`}
          disabled={gameState.time < SLEEP_THRESHOLD}
        >
          {gameState.time >= SLEEP_THRESHOLD ? '🛌 休息 / 结束一天' : '等待 18:00 后休息'}
        </button>
      )}

      {uiState === 'none' && <HUD state={gameState} />}

      {uiState === 'computer' && (
        <ComputerScreen 
          state={gameState} 
          onClose={() => handleToggleFocus('none')} 
          onUpdateState={(updates) => setGameState(prev => ({ ...prev, ...updates }))} 
          onOpenExternalCamera={handleCameraOpen}
          onTriggerDialogue={showDialogue}
        />
      )}

      {uiState === 'phone' && (
        <PhoneScreen 
          state={gameState} 
          onClose={() => handleToggleFocus('none')}
          onCallGrandma={handlePhoneCallGrandma}
          onCheckWeChat={() => {
              handleToggleFocus('computer');
          }}
          onCheckCamera={handleCameraOpen}
        />
      )}

      {uiState === 'camera' && (
        <CameraOverlay 
          grandmaHealth={gameState.grandmaHealth} 
          onClose={() => handleToggleFocus(uiState === 'camera' ? 'none' : uiState)} 
        />
      )}

      <DialogueBox dialogue={dialogue} />
    </div>
  );
};

export default App;