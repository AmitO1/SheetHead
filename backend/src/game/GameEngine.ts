import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

// ------------ Types ------------
export type Suit = '♠' | '♥' | '♦' | '♣' | '🃏';
export type Value = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A' | 'JOKER';

export interface Card {
  suit: Suit;
  value: Value;
  id: string; // Unique ID
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  faceUp: Card[];
  faceDown: Card[];
  isOut: boolean;
}

export interface GameState {
  players: Player[];
  deck: Card[];
  pile: Card[];
  currentPlayerIndex: number;
  lastPlayedPlayerId: string;
  status: 'waiting' | 'playing' | 'finished';
  winnerId?: string;
  isAnotherTurn: boolean;
  lastPlayedCardValue?: string;
}

// ------------ Game Setup ------------

export function createDeck(): Card[] {
  const suits: Suit[] = ['♠', '♥', '♦', '♣'];
  const values: Value[] = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const value of values) {
      deck.push({ suit, value, id: uuidv4() });
    }
  }

  // Add 2 Jokers
  deck.push({ suit: '🃏', value: 'JOKER', id: uuidv4() });
  deck.push({ suit: '🃏', value: 'JOKER', id: uuidv4() });

  return shuffleDeck(deck);
}

export function shuffleDeck(deck: Card[]): Card[] {
  return [...deck].sort(() => Math.random() - 0.5);
}

export function startGame(playerNames: string[]): GameState {
  const deck = createDeck();
  const players: Player[] = playerNames.map(name => ({
    id: uuidv4(),
    name,
    hand: [],
    faceUp: [],
    faceDown: [],
    isOut: false,
  }));

  for (const player of players) {
    player.faceDown = deck.splice(0, 3);
    player.faceUp = deck.splice(0, 3);
    player.hand = deck.splice(0, 3);
  }

  return {
    players,
    deck,
    pile: [],
    currentPlayerIndex: Math.floor(Math.random() * players.length),
    status: 'playing',
    lastPlayedPlayerId: '',
    isAnotherTurn: false,
    lastPlayedCardValue: undefined,
  };
}

// ------------ Core Gameplay ------------

export function playCards(game: GameState, playerId: string, cardIds: string[]): boolean {
  // Reset isAnotherTurn at the start of each turn
  game.isAnotherTurn = false;
  
  const player = game.players.find(p => p.id === playerId);
  if (!player || player.isOut) {
    logger.error(`[PlayCards] Invalid player or player is out: ${playerId}`);
    throw new Error('Invalid player');
  }

  const cards = cardIds.map(cid => {
    const idx = player.hand.findIndex(c => c.id === cid);
    if (idx === -1) {
       logger.error(`[PlayCards] Card not in hand: ${cid} for player ${player.name}`);
       throw new Error('Card not in hand');
    }
    return player.hand[idx];
  });

  const cardValues = cards.map(c => c.value).join(', ');
  logger.info(`[PlayCards] Player ${player.name} attempting to play: [${cardValues}]`);

  const topCard = game.pile.at(-1);

  //then check if the move is valid - if move is invalid but player can play then he should choose another card to play
  const isAfterFive = game.lastPlayedCardValue === '5' && game.lastPlayedPlayerId === playerId;
  
  if (!isValidMove(cards, topCard, game, isAfterFive)) {
      logger.warn(`[PlayCards] Invalid move by ${player.name}. Attempted: [${cardValues}] on Top: ${topCard?.value || 'Empty'}`);
      return false; // Player can still play, but needs to choose different cards
    }
  
  // Play the cards
  for (const card of cards) {
    const idx = player.hand.findIndex(c => c.id === card.id);
    player.hand.splice(idx, 1);
    game.pile.push(card);
  }
  
  // Update last played player and card value
  game.lastPlayedPlayerId = playerId;
  game.lastPlayedCardValue = cards[0].value;
  
  logger.info(`[PlayCards] ${player.name} played [${cardValues}] successfully.`);

  // Check for special card effects
  const playedCard = cards[0]; // Assuming all cards have same value
  
  // If player played a 5, they get another turn
  if (playedCard.value === '5') {
    logger.info(`[SpecialRule] ${player.name} played 5 - Gets ANOTHER TURN`);
    game.isAnotherTurn = true;
    refillHand(player, game);
    return true; // player plays again, turn completed
  }
  
  // If player played a 10, burn the pile and they get another turn
  if (playedCard.value === '10') {
    logger.info(`[SpecialRule] ${player.name} played 10 - BURNING PILE and Gets ANOTHER TURN`);
    game.pile = []; // Burn the pile
    game.lastPlayedCardValue = undefined; // Reset when pile burns
    game.isAnotherTurn = true;
    refillHand(player, game);
    return true; // player plays again, turn completed
  }

  // BURN check
  if (shouldBurnPile(game.pile)) {
    logger.info(`[BurnCheck] 4-of-a-kind! BURNING PILE. ${player.name} gets ANOTHER TURN`);
    game.pile = [];
    game.isAnotherTurn = true;
    game.lastPlayedCardValue = undefined; // Reset when pile burns
    refillHand(player, game);
    return true; // player plays again, turn completed
  }

  refillHand(player, game);

  if (checkWinCondition(player)) {
    logger.info(`[GameEnd] Player ${player.name} HAS WON THE GAME!`);
    game.status = 'finished';
    game.winnerId = player.id;
    return true; // game finished, turn completed
  }
  
  // Normal turn completion - advance to next player
  advanceTurn(game);
  return true; // turn completed normally
}

export function takePile(game: GameState, playerId: string): void {
  const player = game.players.find(p => p.id === playerId);
  if (!player || player.isOut) throw new Error('Invalid player');

  // Check for 8 constraint exception: If active, player SKIPS instead of taking pile
  const topCard = game.pile.at(-1);
  if (topCard?.value === '8') {
    const currentPlayerIndex = game.players.findIndex(p => p.id === playerId);
    const previousPlayerIndex = (currentPlayerIndex - 1 + game.players.length) % game.players.length;
    const previousPlayerId = game.players[previousPlayerIndex].id;
    
    if (game.lastPlayedPlayerId === previousPlayerId) {
       logger.info(`[8-Constraint] Active for ${player.name}. Skipping turn instead of taking pile.`);
       advanceTurn(game);
       return;
    }
  }

  if (topCard?.value === '3'){
    game.pile.pop();
  }

  logger.info(`[TakePile] Player ${player.name} took the pile (${game.pile.length} cards).`);
  player.hand.push(...game.pile);
  game.pile = [];
  game.lastPlayedCardValue = undefined;

  refillHand(player, game);
  advanceTurn(game);
}

function advanceTurn(game: GameState): void {
  // Only advance turn if player doesn't get another turn
  if (!game.isAnotherTurn) {
    const n = game.players.length;
    let next = (game.currentPlayerIndex + 1) % n;

    while (game.players[next].isOut) {
      next = (next + 1) % n;
    }

    game.currentPlayerIndex = next;
  }
}

function refillHand(player: Player, game: GameState): void {
  while (player.hand.length < 3 && game.deck.length > 0) {
    const drawn = game.deck.shift();
    if (drawn) player.hand.push(drawn);
  }

  if (player.hand.length === 0 && player.faceUp.length > 0) {
    player.hand = player.faceUp.splice(0);
  }

  if (player.hand.length === 0 && player.faceDown.length > 0) {
    const next = player.faceDown.shift();
    if (next) player.hand.push(next);
  }

  if (
    player.hand.length === 0 &&
    player.faceUp.length === 0 &&
    player.faceDown.length === 0
  ) {
    player.isOut = true;
  }
}

function checkWinCondition(player: Player): boolean {
  return (
    player.hand.length === 0 &&
    player.faceUp.length === 0 &&
    player.faceDown.length === 0
  );
}

// ------------ Rules You Should Fill ------------

export function isValidMove(
  cards: Card[],
  topCard: Card | undefined,
  game: GameState,
  isAfterFive: boolean = false
): boolean {
  if (cards.length === 0) return false;

  // All cards must match
  const value = cards[0].value;
  if (!cards.every(c => c.value === value)) return false;

  // Special case 1: After playing a 5, player can put as many cards of same value as they have 
  if (isAfterFive) {
    return true; 
  }

  // Custom rule: if pile is empty
  if (!topCard) {
     // Allow 1 card (normal play)
     if (cards.length === 1) return true;
     // Allow 4 cards (instant burn)
     if (cards.length === 4) return true;
     // Disallow 2 or 3 cards on empty pile (unless isAfterFive, handled above)
     return false;
  }

  // Special case 2: Burning the pile with 4 cards
  if (cards.length > 1) {
    logger.info(`[PlayCards] Player ${game.players[game.currentPlayerIndex].name} attempting to play multiple cards: [${cards}] on Top: ${topCard.value}`);
    // Check if this would complete a burn (4 consecutive of same value)
    const pileValue = topCard.value;
    
    // Count consecutive cards of the same value from the top
    let consecutiveCount = 0;
    for (let i = game.pile.length - 1; i >= 0; i--) {
      if (game.pile[i].value === pileValue) {
        consecutiveCount++;
      } else {
        break; // Stop counting when we hit a different value
      }
    }
    
    const neededForBurn = 4 - consecutiveCount;
    
    if (cards.length === neededForBurn && cards[0].value === pileValue) {
      return true; // Allow multiple cards to complete burn
    }
    
    // If not a burn completion, only allow single cards
    return false;
  }
  if (topCard.value === '8'){
    const currentPlayerIndex = game.currentPlayerIndex;
    const previousPlayerIndex = (currentPlayerIndex - 1 + game.players.length) % game.players.length;
    const previousPlayerId = game.players[previousPlayerIndex].id;
    
    if (game.lastPlayedPlayerId === previousPlayerId) { // TODO - validate
       logger.info(`[8-Constraint] Active for ${game.players[currentPlayerIndex].name}. player must play 8 or 9`);
       // Check if the played cards are 8 or 9
       return cards.some(card => card.value === '8' || card.value === '9');
    }
  }
  if (topCard.value === '7') {
    return cards.some(card => card.value === 'JOKER' || getCardValue(card) <= 7);
  }
  if (topCard.value === '3') {
    return cards.some(card => card.value === 'JOKER');
  }
  
  //if value is 2,5,10,3,joker then player can play
  if (cards.some(card => card.value === 'JOKER' || card.value === '2' || card.value === '5' || card.value === '10' || card.value === '3')) {
    return true;
  }
  if (topCard.value === 'JOKER') { // TODO - validate
    return true;
  }
  // Basic rule: card must be higher than the top card (lowest priority)
  return getCardValue(cards[0]) >= getCardValue(topCard);
}

export function shouldBurnPile(pile: Card[]): boolean {
  if (pile.length < 4) return false;
  const last4 = pile.slice(-4);
  return last4.every(c => c.value === last4[0].value);
}
// Helper function to get card value for comparison
function getCardValue(card: Card): number {
  const valueMap: { [key: string]: number } = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14, 'JOKER': 15
  };
  return valueMap[card.value] || 0;
}

export function checkPlayable(hand: Card[], topCard: Card | undefined, game: GameState, currentPlayerId: string): boolean {
  // If no top card, any card is playable
  if (!topCard) return true;
  
  // If top card is 3
  if (topCard.value === '3') {
    // Player can only play if they have a joker, and they must play the joker
    return hand.some(card => card.value === 'JOKER');
  }

  // If top card is 8 and the previous player put it, current player can play anycase either skip turn or put 8/9
  if (topCard.value === '8') {
    const currentPlayerIndex = game.players.findIndex(p => p.id === currentPlayerId);
    const previousPlayerIndex = (currentPlayerIndex - 1 + game.players.length) % game.players.length;
    const previousPlayerId = game.players[previousPlayerIndex].id;
    
    if (game.lastPlayedPlayerId === previousPlayerId) {
      // Must check if player HAS 8/9. 
      // If yes -> return true (allow interaction). 
      // If no -> return false (frontend will auto-take pile -> backend will SKIP).
      logger.info(`[8-Constraint] checking if Player ${game.players[currentPlayerIndex].name} has 8/9`);
      return hand.some(card => card.value === '8' || card.value === '9');
    }
  }  

  //if player have either 2,3,5,joker then he can play
  if (hand.some(card => card.value === 'JOKER' || card.value === '2' || card.value === '3' || card.value === '5')) {
    return true;
  }
  //if top card is 7, then player can play only with 2,4,6,5,7,joker
  if (topCard.value === '7') {
    return hand.some(card => card.value === 'JOKER' || card.value === '2' || card.value === '4' || card.value === '6' || card.value === '5' || card.value === '7');
  }

  // If top card is joker, any card is playable
  if (topCard.value === 'JOKER') {
    return true;
  }

  // For all other cases (not 3, not 7, not 8), check if player has a card bigger than top card or 2/10/5/3/joker
  return hand.some(card => {
    return card.value === 'JOKER' || 
           card.value === '2' || 
           card.value === '10' || 
           card.value === '5' || 
           card.value === '3' || 
           getCardValue(card) >= getCardValue(topCard);
  });
  
}

