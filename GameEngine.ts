import { v4 as uuidv4 } from 'uuid';

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
  };
}

// ------------ Core Gameplay ------------

export function playCards(game: GameState, playerId: string, cardIds: string[]): boolean {
  const player = game.players.find(p => p.id === playerId);
  if (!player || player.isOut) throw new Error('Invalid player');

  const cards = cardIds.map(cid => {
    const idx = player.hand.findIndex(c => c.id === cid);
    if (idx === -1) throw new Error('Card not in hand');
    return player.hand[idx];
  });

  const topCard = game.pile.at(-1);

  //first check if the player can play
  if (isPlayable(player.hand, topCard, game, playerId)) {
    //TODO - handle the 8 skip logic in case the player have 8/9 let him play else skip the turn

    //then check if the move is valid - if move is invalid but player can play then he should choose another card to play
    if (!isValidMove(cards, topCard, game.pile)) {
        return false; // Player can still play, but needs to choose different cards
      }
    
      // Play the cards
      for (const card of cards) {
        const idx = player.hand.findIndex(c => c.id === card.id);
        player.hand.splice(idx, 1);
        game.pile.push(card);
      }
      
      // Update last played player
      game.lastPlayedPlayerId = playerId;
    
      // BURN check
      if (shouldBurnPile(game.pile)) {
        console.log('BURNING PILE');
        game.pile = [];
        refillHand(player, game);
        return true; // player plays again, turn completed
      }
    
      refillHand(player, game);
    
      if (checkWinCondition(player)) {
        game.status = 'finished';
        game.winnerId = player.id;
        return true; // game finished, turn completed
      }
  }
  else {
    // Player can't play, so they take the pile
    console.log('PLAYER CANNOT PLAY, TAKING PILE');
    player.hand.push(...game.pile);
    refillHand(player, game);
    game.pile = []; 
    advanceTurn(game);
    return true; // turn completed (player took pile)
  }

  advanceTurn(game);
  return true; // turn completed normally
}

export function takePile(game: GameState, playerId: string): void {
  const player = game.players.find(p => p.id === playerId);
  if (!player || player.isOut) throw new Error('Invalid player');

  player.hand.push(...game.pile);
  game.pile = [];

  refillHand(player, game);
  advanceTurn(game);
}

function advanceTurn(game: GameState): void {
  const n = game.players.length;
  let next = (game.currentPlayerIndex + 1) % n;

  while (game.players[next].isOut) {
    next = (next + 1) % n;
  }

  game.currentPlayerIndex = next;
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
  pile: Card[]
): boolean {
  if (cards.length === 0) return false;

  // All cards must match
  const value = cards[0].value;
  if (!cards.every(c => c.value === value)) return false;

  // Custom rule: if pile is empty → allow any card
  if (!topCard) return true;

  // TODO: Add your custom rules (8s, skip, etc.) - these will override the basic rule below
  
  // Basic rule: card must be higher than the top card (lowest priority)
  return getCardValue(cards[0]) > getCardValue(topCard);
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

function isPlayable(hand: Card[], topCard: Card | undefined, game: GameState, currentPlayerId: string): boolean {
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
      return true;
    }
  }

  // If top card is not 7
  if (topCard.value !== '7') {
    // Check if player has a card bigger than top card or 2/10/5/3/joker
    return hand.some(card => {
      return card.value === 'JOKER' || 
             card.value === '2' || 
             card.value === '10' || 
             card.value === '5' || 
             card.value === '3' || 
             getCardValue(card) > getCardValue(topCard);
    });
  }
  
  // If top card is 7
  if (topCard.value === '7') {
    // Check if player has a card which is 7 or below or joker
    return hand.some(card => {
      return card.value === 'JOKER' || 
             getCardValue(card) <= 7;
    });
  }
  
  return false;
}

