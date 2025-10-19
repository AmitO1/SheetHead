import { startGame, playCards, takePile } from './GameEngine';

const game = startGame(['Alice', 'Bob', 'Charlie']);
game.currentPlayerIndex = 0; // Alice plays first
game.lastPlayedPlayerId = game.players[2].id;
console.log('STARTING PLAYER:', game.players[game.currentPlayerIndex].name);

// Mock: force one player to have 4s
const player = game.players[0];
player.hand = [
  { suit: '♠', value: '4', id: 'a' },
  { suit: '♥', value: '4', id: 'b' },
];

game.pile = [
  { suit: '♦', value: '8', id: 'c' },
  { suit: '♣', value: '8', id: 'd' },
];

let result = playCards(game, player.id, ['a']); // Should burn pile and let Alice play again

console.log('RESULT:', result);
console.log('PILE AFTER:', game.pile);
console.log('Next turn:', game.players[game.currentPlayerIndex].name);
