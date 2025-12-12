import React from 'react';

export interface GameState {
  money: number;
  time: number; // Minutes from midnight (e.g., 480 = 8:00 AM)
  energy: number;
  meds: number; // Used for inventory tracking
  grandmaHealth: number;
  
  // Game Cycle & Status
  day: number;
  clockedIn: boolean;
  workCompleted: boolean;
  carePaid: boolean;
  firstLogin: boolean;
  alarmTriggered: boolean; // 9 PM Alarm

  // Day 2 Specifics
  rentDueIn: number;
  pressure: number; // 0-100
  lowBloodPressure: boolean;
  wechatUnread: number;
  friendMessaged: boolean;
  medPathTaken: boolean;
}

export type UIState = 'none' | 'computer' | 'phone' | 'camera';

export interface DialogueState {
  speaker: string;
  text: string;
  visible: boolean;
}

export interface DesktopItemProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  badge?: boolean;
  disabled?: boolean;
}

export interface ModalButton {
  text: string;
  onClick: () => void;
  variant: 'primary' | 'success' | 'danger' | 'neutral';
}

export interface ModalConfig {
  title: string;
  content: React.ReactNode;
  hideCloseButton?: boolean;
  buttons?: ModalButton[];
}