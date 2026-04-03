/**
 * Exchange System Types
 * 
 * Defines types for the Codex Exchange System that enables users to
 * trade machines from their personal codex with community-shared machines.
 */

import { CodexEntry } from '../types';
import { CommunityMachine } from '../data/communityGalleryData';
import { FactionId } from './factions';
import { Rarity } from './index';

// Trade Proposal Status
export type TradeStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

// Trade Proposal - An offer to exchange machines
export interface TradeProposal {
  id: string;
  proposerMachineId: string;           // ID of machine from proposer's codex
  proposerMachine: CodexEntry;          // Machine data from proposer's codex
  targetMachineId: string;              // Community machine ID
  targetMachine: CommunityMachine;     // Community machine data
  status: TradeStatus;
  createdAt: number;
  respondedAt?: number;
}

// Trade Listing - A machine marked as available for trade
export interface TradeListing {
  codexEntryId: string;
  listedAt: number;
  tradePreference: string;  // e.g., "any", "faction:void", "rarity:legendary"
}

// Completed Trade - Record of a finished exchange
export interface TradeHistory {
  id: string;
  givenMachineId: string;
  givenMachine: CodexEntry;
  receivedMachineId: string;
  receivedMachine: CommunityMachine;
  completedAt: number;
}

// Trade Notification - For showing incoming proposals
export interface TradeNotification {
  id: string;
  proposalId: string;
  message: string;
  type: 'incoming' | 'accepted' | 'rejected';
  read: boolean;
  createdAt: number;
}

// Faction filter for browsing trades
export type TradeFactionFilter = 'all' | FactionId;

// Rarity filter for browsing trades
export type TradeRarityFilter = 'all' | Rarity;

// Exchange panel tab
export type ExchangeTab = 'my-listings' | 'incoming-offers' | 'browse-trades' | 'trade-history';
