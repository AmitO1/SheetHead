import { startGame, playCards, takePile } from './GameEngine';

const game = startGame(['Alice', 'Bob', 'Charlie']);
game.currentPlayerIndex = 0; // Alice plays first
game.lastPlayedPlayerId = game.players[2].id;
console.log('STARTING PLAYER:', game.players[game.currentPlayerIndex].name);

// Mock: force one player to have 4s
const player = game.players[0];
player.hand = [
  { suit: '♠', value: '4', id: 'a' },
  { suit: '♠', value: '4', id: 'b' },
];

game.pile = [
  { suit: '♦', value: '4', id: 'c' },
  { suit: '♦', value: '9', id: 'e' },
  { suit: '♣', value: '4', id: 'd' },
];
console.log('top card:', game.pile[game.pile.length - 1]);
let result = playCards(game, player.id, ['b']); 

console.log('RESULT:', result);
console.log('PILE AFTER:', game.pile);
console.log('Next turn:', game.players[game.currentPlayerIndex].name);
// Get last played player info
const lastPlayedPlayer = game.players.find(p => p.id === game.lastPlayedPlayerId);
console.log('last played player name:', lastPlayedPlayer?.name || 'None');

console.log('alice hand:', game.players[0].hand);
console.log('cards left in deck:', game.deck.length);
